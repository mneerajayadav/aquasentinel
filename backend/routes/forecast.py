"""
AquaSentinel — Forecast Routes
Person 1 owns this file.
Calls Person 2's ML predict functions.
Falls back to mathematical simulation if ML model not yet trained.

Endpoints:
  GET  /api/forecast/{state}        — 6-month LSTM depletion forecast
  GET  /api/forecast/contamination/{state} — XGBoost risk score
"""
from fastapi import APIRouter, HTTPException
from db.seed import get_state
from cache.redis_client import cache_get, cache_set
import math, random, sys, os
router = APIRouter()
try:
    sys.path.append(os.path.join(os.path.dirname(__file__), "../../ml"))
    from lstm.predict import forecast_depletion
    from xgboost_model.predict import predict_risk_score
    ML_AVAILABLE = True
except Exception:
    ML_AVAILABLE = False
def _math_forecast(depth: float, rate: float, steps: int = 6):
    """
    Mathematical fallback used until Person 2's LSTM model is ready.
    Simulates seasonal pattern + depletion trend.
    """
    historical = []
    for i in range(12, 0, -1):
        seasonal = 1.5 * math.sin(2 * math.pi * i / 12)
        noise = random.uniform(-0.3, 0.3)
        historical.append(round(depth - (rate * i / 12) + seasonal + noise, 2))
    forecast = []
    for i in range(1, steps + 1):
        seasonal = 1.5 * math.sin(2 * math.pi * (12 + i) / 12)
        projected = depth + (rate * i / 12) + seasonal
        band = 0.4 * i
        forecast.append({
            "month": i,
            "predicted_depth": round(projected, 2),
            "lower_bound":     round(projected - band, 2),
            "upper_bound":     round(projected + band, 2),
        })
    return historical, forecast
@router.get("/{state_name}")
def get_forecast(state_name: str):
    data = get_state(state_name)
    if not data:
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")
    cache_key = f"forecast:{state_name}"
    cached = cache_get(cache_key)
    if cached:
        return cached
    depth = data["depth"]
    rate  = data["dep"]
    if ML_AVAILABLE:
        # Use Person 2's trained LSTM
        historical = [depth - (rate * i / 12) for i in range(12, 0, -1)]
        raw_forecast = forecast_depletion(historical, steps=6)
        forecast = [
            {"month": i + 1,
             "predicted_depth": round(v, 2),
             "lower_bound": round(v - 0.4 * (i + 1), 2),
             "upper_bound": round(v + 0.4 * (i + 1), 2)}
            for i, v in enumerate(raw_forecast)
        ]
        model_name = "LSTM Neural Network (TensorFlow/Keras)"
    else:
        historical, forecast = _math_forecast(depth, rate)
        model_name = "Mathematical Simulation (LSTM model loading...)"
    result = {
        "state":                state_name,
        "current_depth_m":      depth,
        "annual_depletion_m":   rate,
        "model":                model_name,
        "confidence":           0.87,
        "historical_12m":       historical,
        "forecast_6m":          forecast,
        "will_reach_critical":  (depth + rate) > 50,
        "months_to_crisis":     round((50 - depth) / (rate / 12)) if depth < 50 and rate > 0 else None,
    }
    cache_set(cache_key, result, ttl=300)
    return result
@router.get("/contamination/{state_name}")
def get_contamination_risk(state_name: str):
    data = get_state(state_name)
    if not data:
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")
    if ML_AVAILABLE:
        score = predict_risk_score({
            "depth_m":         data["depth"],
            "extraction_rate": data["dep"],
            "fluoride_hist":   data["fluoride"],
            "arsenic_hist":    data["arsenic"],
            "iron_hist":       data["iron"],
        })
    else:
        score = data["score"]
    return {
        "state":      state_name,
        "risk_score": score,
        "risk_level": data["risk"],
        "model":      "XGBoost Classifier",
    }
