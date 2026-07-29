# VayuScope — Live Weather Across India

An interactive weather explorer for India. Click anywhere on the map — or search
any city, state, or town — to see live conditions and a 7-day forecast: temperature,
"feels like", humidity, wind speed & direction, gusts, cloud cover, precipitation,
pressure, and local time.

- **Frontend:** React + Vite + Leaflet (interactive map)
- **Backend:** Python + FastAPI
- **Storage:** SQLite (logs every lookup)
- **Data:** Open-Meteo live API (free, no key required)

## Project structure

```
vayuscope/
├── backend/
│   ├── main.py              # FastAPI app + routes
│   ├── weather_service.py   # Calls to the Open-Meteo API
│   ├── database.py          # SQLite engine + session
│   ├── models.py            # Lookup-log table
│   └── requirements.txt
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── public/logo.svg
    └── src/
        ├── App.jsx
        ├── api.js
        ├── weatherCodes.js
        ├── styles.css
        └── components/
            ├── MapView.jsx
            ├── SearchBar.jsx
            ├── CurrentWeather.jsx
            └── Forecast.jsx
```

## Run it locally

You need two terminals.

### 1. Backend (port 8000)

```bash
cd backend
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend (port 5173)

```bash
cd frontend
npm install
npm run dev
```

Open (https://vayuscope.vercel.app/)

The frontend proxies `/api` calls to the backend automatically, so start the
backend first.

## API reference

| Method | Route          | Purpose                              |
|--------|----------------|--------------------------------------|
| GET    | `/api/weather` | Live conditions + 7-day forecast     |
| GET    | `/api/search`  | Find a place by name (geocoding)     |
| GET    | `/api/history` | Last 12 lookups from SQLite          |
| GET    | `/api/health`  | Health check                         |
