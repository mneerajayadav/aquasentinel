"""
AquaSentinel — XGBoost Inference
Person 2 owns this file.
Called by backend/routes/forecast.py

Usage:
  from ml.xgboost_model.predict import predict_risk_score
  score = predict_risk_score({"depth_m": 42, "extraction_rate": 7.3, ...})
"""

import pickle
import os
import numpy as np

MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
FEATURES   = [
    "depth_m", "extraction_rate", "geology_score",
    "rainfall_mm", "fluoride_hist", "arsenic_hist", "iron_hist"
]
LABEL_NAMES = {0: "low", 1: "moderate", 2: "high", 3: "critical"}
SCORE_MAP   = {"low": 20, "moderate": 45, "high": 72, "critical": 90}

_model = None


def _load():
    global _model
    if _model is None:
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)


def predict_risk_score(features: dict) -> float:
    """
    Takes a dict of feature values, returns a 0–100 risk score.

    features dict keys (all optional — defaults to median values):
      depth_m, extraction_rate, geology_score, rainfall_mm,
      fluoride_hist, arsenic_hist, iron_hist

    Returns float 0–100 (higher = worse contamination risk)
    """
    _load()

    defaults = {
        "depth_m":         20.0,
        "extraction_rate":  3.0,
        "geology_score":    0.5,
        "rainfall_mm":     800.0,
        "fluoride_hist":    0.5,
        "arsenic_hist":     0.01,
        "iron_hist":        0.3,
    }
    defaults.update(features)

    X = np.array([[defaults[f] for f in FEATURES]])
    class_idx  = int(_model.predict(X)[0])
    proba      = _model.predict_proba(X)[0]
    label      = LABEL_NAMES[class_idx]
    base_score = SCORE_MAP[label]

    # Blend with max class probability for finer granularity
    score = base_score * 0.7 + max(proba) * 30
    return round(min(score, 100), 1)


def predict_risk_label(features: dict) -> str:
    """Returns 'low' | 'moderate' | 'high' | 'critical'"""
    _load()
    defaults = {
        "depth_m": 20.0, "extraction_rate": 3.0, "geology_score": 0.5,
        "rainfall_mm": 800.0, "fluoride_hist": 0.5, "arsenic_hist": 0.01, "iron_hist": 0.3,
    }
    defaults.update(features)
    X = np.array([[defaults[f] for f in FEATURES]])
    return LABEL_NAMES[int(_model.predict(X)[0])]
