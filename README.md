# 💧 AquaSentinel
### AI-Powered Groundwater Crisis Intelligence for India
**FOOBAR Hackathon 2026 · Sustainability Domain · Team A.N.T.S**

---

> *"Groundwater is invisible. That's why the crisis is invisible. AquaSentinel makes it visible — before the last well runs dry."*

---

## 🚨 The Problem

India consumes **25% of the world's groundwater** — more than the USA and China combined.

| Stat | Reality |
|------|---------|
| 🏙 **21 major cities** | Projected to run dry by 2030 |
| 🌾 **700M+ farmers** | Drilling blind with no depletion data |
| 💀 **450 km³** | Groundwater lost between 2002–2021 |
| ☠️ **Fluoride (9%)** | Wells exceeding safe limits |
| ☠️ **Arsenic (3.35%)** | Wells exceeding safe limits |

NASA satellites, CGWB bore wells, and IMD rainfall data all exist — scattered in government PDFs. Nobody connected them. **We did.**

---

## 🛰️ The Solution — 3 Layers

```
SENSE  →  ANALYZE  →  ACT
```

| Layer | What it does |
|-------|-------------|
| **SENSE** | Ingests NASA GRACE satellite + CGWB bore wells + IMD rainfall via Apache Kafka |
| **ANALYZE** | LSTM forecasts depletion 6–12 months ahead · XGBoost scores contamination risk per district |
| **ACT** | Voice alerts in 10 languages for farmers · Dashboards for panchayats · Policy simulator for district collectors |

---

## 🏗️ Architecture

```
NASA GRACE API ─┐
CGWB Bore Wells ┼─► Apache Kafka ─► FastAPI (Python) ─► React Dashboard
IMD Rainfall ───┘                        │
                              PostgreSQL + PostGIS
                                   Redis Cache
                              ┌────────────────────┐
                              │  LSTM (TensorFlow) │  ← depletion forecast
                              │  XGBoost           │  ← contamination risk
                              └────────────────────┘
```

---

## 🧑‍💻 Tech Stack

| Layer | Technology |
|-------|------------|
| **Data Ingestion** | Apache Kafka, NASA GRACE API, CGWB, IMD |
| **Backend** | FastAPI (Python), PostgreSQL + PostGIS, Redis |
| **AI / ML** | TensorFlow LSTM, XGBoost, Scikit-learn |
| **Frontend** | React.js, Leaflet.js, Chart.js (Recharts), Tailwind CSS |
| **Last Mile** | IVR Voice Alerts (10 languages), Offline PWA, SMS |
| **DevOps** | Docker, GitHub Actions, Render (backend), Vercel (frontend) |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Docker Desktop

### Option A — Docker (recommended, runs everything)
```bash
git clone https://github.com/YOUR_USERNAME/aquasentinel.git
cd aquasentinel
cp .env.example .env
docker compose up --build
```
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option B — Manual

**Backend (Person 1)**
```bash
cd backend
python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**ML Models (Person 2) — run once to train**
```bash
cd ml
python data/generate_mock.py      # generate training data
python lstm/train.py               # train LSTM (~5 min)
python xgboost/train.py            # train XGBoost (~1 min)
```

**Frontend (Person 3)**
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## 📁 Project Structure

```
aquasentinel/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── routes/
│   │   ├── groundwater.py       # /api/groundwater
│   │   ├── alerts.py            # /api/alerts
│   │   ├── forecast.py          # /api/forecast (calls ML)
│   │   └── simulator.py         # /api/simulator
│   ├── models/schemas.py        # Pydantic models
│   ├── db/
│   │   ├── database.py          # PostgreSQL connection
│   │   └── seed.py              # State groundwater data
│   ├── cache/redis_client.py    # Redis caching
│   ├── requirements.txt
│   └── Dockerfile
├── ml/
│   ├── lstm/
│   │   ├── train.py             # LSTM training
│   │   └── predict.py           # Inference function
│   ├── xgboost/
│   │   ├── train.py             # XGBoost training
│   │   └── predict.py           # Inference function
│   └── data/generate_mock.py    # Synthetic training data
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── IndiaMap.jsx          # Interactive SVG map
│       │   ├── AlertsTicker.jsx      # Live alerts bar
│       │   ├── ForecastChart.jsx     # LSTM chart
│       │   ├── RiskBars.jsx          # XGBoost risk scores
│       │   ├── PolicySimulator.jsx   # What-if sliders
│       │   └── StateDetailPanel.jsx  # State detail card
│       ├── pages/Dashboard.jsx       # Main layout
│       └── services/api.js           # All API calls
├── docker-compose.yml
├── .env.example
└── .github/workflows/deploy.yml
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groundwater/all` | All state readings |
| GET | `/api/groundwater/{state}` | Single state detail + contamination |
| GET | `/api/groundwater/stats` | National statistics |
| GET | `/api/alerts/active` | Active critical + high alerts |
| GET | `/api/alerts/contamination` | Contamination-specific alerts |
| GET | `/api/forecast/{state}` | LSTM 6-month depletion forecast |
| POST | `/api/simulator/run` | Policy intervention simulation |

Full interactive docs: `http://localhost:8000/docs`

---

## 🌍 Impact

| Audience | How AquaSentinel helps |
|----------|----------------------|
| 🌾 **700M+ Farmers** | Voice alerts in 10 languages, offline-capable PWA |
| 🏘 **6,500+ Panchayats** | Live groundwater budget + contamination maps |
| 🏙 **21 At-Risk Cities** | Real-time depletion tracking to prevent Day Zero |
| 🏛 **District Collectors** | Policy simulator: "Build 3 check dams → +2yr delay" |

### SDG Alignment
- **SDG 6** — Clean Water: real-time contamination alerts
- **SDG 2** — Zero Hunger: smarter crop-water decisions
- **SDG 13** — Climate Action: quantifies aquifer depletion
- **SDG 11** — Sustainable Cities: prevents urban Day Zero

---

## 👥 Team A.N.T.S

| Person | Role | Owns |
|--------|------|------|
| **Person 1** | Backend | FastAPI · PostgreSQL · Redis · Kafka |
| **Person 2** | AI / ML | LSTM · XGBoost · Scikit-learn |
| **Person 3** | Frontend | React · Leaflet · Chart.js · Tailwind |
| **Person 4** | DevOps | Docker · GitHub Actions · Vercel · Render |

---

## 📄 License
MIT License — built entirely on open government APIs. Zero proprietary data dependencies.
