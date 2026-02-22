"""
AquaSentinel — Backend Entry Point
Person 1 owns this file.
Run: uvicorn main:app --reload --port 8000
Docs: http://localhost:8000/docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import groundwater, alerts, forecast, simulator

app = FastAPI(
    title="AquaSentinel API",
    description="AI-Powered Groundwater Crisis Intelligence for India — FOOBAR Hackathon 2026",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(groundwater.router, prefix="/api/groundwater", tags=["Groundwater"])
app.include_router(alerts.router,      prefix="/api/alerts",      tags=["Alerts"])
app.include_router(forecast.router,    prefix="/api/forecast",    tags=["Forecast"])
app.include_router(simulator.router,   prefix="/api/simulator",   tags=["Policy Simulator"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "running", "version": "1.0.0", "docs": "/docs"}
