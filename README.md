# AquaSentinel
**AI-Powered Groundwater Crisis Intelligence for India**  
FOOBAR Hackathon 2026 — Sustainability Domain

> "Groundwater is invisible. That is why the crisis is invisible. AquaSentinel makes it visible — before the last well runs dry."

---

## The Problem

India consumes 25% of the world's groundwater — more than the USA and China combined.

| Statistic | Reality |
|---|---|
| 21 major cities | Projected to run dry by 2030 |
| 700M+ farmers | Drilling blind with no depletion data |
| 450 km3 | Groundwater lost between 2002 and 2021 |
| Fluoride (9%) | Wells exceeding safe limits |
| Arsenic (3.35%) | Wells exceeding safe limits |

NASA satellites, CGWB bore wells, and IMD rainfall data all exist — scattered across government PDFs. Nobody connected them. AquaSentinel does.

---

## The Solution

AquaSentinel operates across three layers:

**SENSE → ANALYZE → ACT**

| Layer | Function |
|---|---|
| SENSE | Ingests groundwater data for all Indian states |
| ANALYZE | LSTM model forecasts depletion 6 months ahead. XGBoost scores contamination risk per state |
| ACT | Alerts for farmers, dashboards for panchayats, policy simulator for district collectors |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python), SQLite |
| AI / ML | TensorFlow LSTM, XGBoost, Scikit-learn |
| Frontend | React.js, Leaflet.js, Recharts, Tailwind CSS |
| Authentication | JWT-based login and signup with premium user support |
| Internationalisation | English, Hindi, Kannada |
| DevOps | Docker, Render (backend), Render Static Site (frontend) |

---

## Live Deployment

- Frontend: https://aquasentinel.onrender.com  
- Backend API: https://aquasentinel-api.onrender.com  
- API Documentation: https://aquasentinel-api.onrender.com/docs

Note: The free-tier backend may take up to 50 seconds to respond on the first request after a period of inactivity. Subsequent requests will be fast.

---

## Running Locally

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker Desktop

### Option A — Docker (Recommended)

```bash
git clone https://github.com/mneerajayadav/aquasentinel.git
cd aquasentinel
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:5173  
- Backend API: http://localhost:8000  
- API Docs: http://localhost:8000/docs

### Option B — Manual

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Project Structure

```
aquasentinel/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── routes/
│   │   ├── groundwater.py       # /api/groundwater
│   │   ├── alerts.py            # /api/alerts
│   │   ├── forecast.py          # /api/forecast
│   │   └── simulator.py         # /api/simulator
│   ├── models/schemas.py        # Pydantic models
│   ├── db/
│   │   ├── database.py          # Database connection
│   │   └── seed.py              # State groundwater data
│   ├── cache/redis_client.py    # Cache layer
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── AuthPage.jsx          # Login and signup
│       │   ├── Dashboard.jsx         # Main dashboard
│       │   └── PremiumPage.jsx       # Premium subscription page
│       ├── components/
│       │   ├── IndiaMap.jsx          # Interactive India map
│       │   ├── ForecastChart.jsx     # 6-month forecast graph
│       │   ├── AlertsTicker.jsx      # Live alerts bar
│       │   └── StateDetailPanel.jsx  # State detail view
│       └── services/api.js           # API calls
└── docker-compose.yml
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/groundwater/all | All state readings |
| GET | /api/groundwater/{state} | Single state detail and contamination data |
| GET | /api/groundwater/stats | National statistics |
| GET | /api/alerts/active | Active critical and high alerts |
| GET | /api/alerts/contamination | Contamination-specific alerts |
| GET | /api/forecast/{state} | 6-month depletion forecast |
| POST | /api/simulator/run | Policy intervention simulation |

---

## Features

- Secure user authentication with login, signup, and logout
- Premium subscription tier with early depletion alerts (6 months prior) and crop advisory
- Interactive India map with per-state groundwater depth, depletion rate, and risk level
- 6-month AI forecast graph with historical water level trends
- Contamination tracking for fluoride, arsenic, and iron
- Policy simulator: quantifies the impact of interventions such as check dams and drip irrigation
- Multi-language support: English, Hindi, and Kannada
- Fully responsive design

---

## Impact

| Audience | How AquaSentinel Helps |
|---|---|
| 700M+ Farmers | Early depletion alerts and crop advisory via premium tier |
| 6,500+ Panchayats | Live groundwater budget and contamination maps |
| 21 At-Risk Cities | Real-time depletion tracking to prevent Day Zero |
| District Collectors | Policy simulator with quantified intervention outcomes |

### SDG Alignment

- SDG 6 — Clean Water: real-time contamination alerts
- SDG 2 — Zero Hunger: smarter crop-water decisions
- SDG 13 — Climate Action: quantifies aquifer depletion
- SDG 11 — Sustainable Cities: prevents urban Day Zero

---

## License

Copyright (c) 2026. All rights reserved.  
This repository is made publicly visible for hackathon judging purposes only. Unauthorised copying, forking, or redistribution of this code is strictly prohibited.
