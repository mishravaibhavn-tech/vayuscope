from datetime import datetime, timezone

import httpx
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

import weather_service as ws
from database import SessionLocal, init_db
from models import WeatherLog

app = FastAPI(title="VayuScope API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def _startup():
    init_db()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/search")
async def search(q: str = Query(..., min_length=1)):
    """Look up a city / state / town and return matching coordinates."""
    try:
        results = await ws.geocode(q)
    except httpx.HTTPError:
        raise HTTPException(status_code=502, detail="Geocoding service unavailable")
    return {"results": results}


@app.get("/api/weather")
async def weather(lat: float, lon: float, name: str = "Selected location"):
    """Return live conditions + 7-day forecast for a coordinate and log the lookup."""
    try:
        data = await ws.fetch_weather(lat, lon)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather error: {type(e).__name__}: {e}")

    current = data.get("current", {})
    db = SessionLocal()
    try:
        db.add(WeatherLog(
            name=name,
            latitude=lat,
            longitude=lon,
            temperature=current.get("temperature_2m"),
            weather_code=current.get("weather_code"),
            wind_speed=current.get("wind_speed_10m"),
            queried_at=datetime.now(timezone.utc),
        ))
        db.commit()
    finally:
        db.close()

    data["place_name"] = name
    return data


@app.get("/api/history")
def history():
    """Return the last 12 lookups stored locally."""
    db = SessionLocal()
    try:
        rows = (
            db.query(WeatherLog)
            .order_by(WeatherLog.id.desc())
            .limit(12)
            .all()
        )
        return {
            "history": [
                {
                    "name": r.name,
                    "lat": r.latitude,
                    "lon": r.longitude,
                    "temperature": r.temperature,
                    "weather_code": r.weather_code,
                    "queried_at": r.queried_at.isoformat() if r.queried_at else None,
                }
                for r in rows
            ]
        }
    finally:
        db.close()
