"""Thin async wrappers around the Open-Meteo public APIs (no key required)."""
import time
import httpx

_CACHE = {}
_TTL = 600  # seconds
_HEADERS = {"User-Agent": "VayuScope/1.0 (personal project)"}

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search"

CURRENT_FIELDS = ",".join([
    "temperature_2m", "relative_humidity_2m", "apparent_temperature", "is_day",
    "precipitation", "rain", "weather_code", "cloud_cover", "pressure_msl",
    "wind_speed_10m", "wind_direction_10m", "wind_gusts_10m",
])
DAILY_FIELDS = ",".join([
    "weather_code", "temperature_2m_max", "temperature_2m_min",
    "precipitation_sum", "precipitation_probability_max",
    "wind_speed_10m_max", "sunrise", "sunset",
])
HOURLY_FIELDS = ",".join([
    "temperature_2m", "precipitation_probability", "weather_code",
])


async def fetch_weather(lat: float, lon: float) -> dict:
    params = {
        "latitude": lat,
        "longitude": lon,
        "current": CURRENT_FIELDS,
        "daily": DAILY_FIELDS,
        "hourly": HOURLY_FIELDS,
        "timezone": "auto",
        "forecast_days": 7,
        "wind_speed_unit": "kmh",
    }
    key = f"{round(lat,3)},{round(lon,3)}"
    hit = _CACHE.get(key)
    if hit and (time.time() - hit[0]) < _TTL:
        return hit[1]

    last_error = None
    for _ in range(2):
        try:
            async with httpx.AsyncClient(timeout=40, headers=_HEADERS) as client:
                r = await client.get(FORECAST_URL, params=params)
                r.raise_for_status()
                data = r.json()
                _CACHE[key] = (time.time(), data)
                return data
        except httpx.HTTPError as e:
            last_error = e
    # If the API is rate-limiting us but we have any old cached copy, use it.
    if hit:
        return hit[1]
    raise last_error


async def geocode(query: str) -> list:
    params = {"name": query, "count": 8, "language": "en", "format": "json"}
    async with httpx.AsyncClient(timeout=15) as client:
        r = await client.get(GEOCODE_URL, params=params)
        r.raise_for_status()
        data = r.json()

    results = data.get("results") or []
    # Prefer Indian locations, but fall back to all if none match.
    india = [x for x in results if x.get("country_code") == "IN"]
    return india or results
