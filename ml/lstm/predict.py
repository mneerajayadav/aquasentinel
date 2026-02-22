"""
AquaSentinel — LSTM Inference
Person 2 owns this file.
Called by backend/routes/forecast.py

Usage:
  from ml.lstm.predict import forecast_depletion
  predictions = forecast_depletion(last_12_months=[...], steps=6)
"""

import numpy as np
import pickle
import os

MODEL_PATH  = os.path.join(os.path.dirname(__file__), "model.h5")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

# Lazy-load so import doesn't fail if model not yet trained
_model  = None
_scaler = None


def _load():
    global _model, _scaler
    if _model is None:
        import tensorflow as tf
        _model = tf.keras.models.load_model(MODEL_PATH)
    if _scaler is None:
        with open(SCALER_PATH, "rb") as f:
            _scaler = pickle.load(f)


def forecast_depletion(last_12_months: list, steps: int = 6) -> list:
    """
    Takes 12 monthly depth readings (floats, metres).
    Returns a list of `steps` predicted future depth values.

    Example:
      forecast_depletion([30.1, 30.8, 31.2, ...], steps=6)
      → [36.4, 37.1, 37.8, 38.5, 39.1, 39.7]
    """
    _load()

    data   = np.array(last_12_months).reshape(-1, 1)
    scaled = _scaler.transform(data)

    predictions = []
    window = scaled[-12:].copy()

    for _ in range(steps):
        x    = window.reshape(1, 12, 1)
        pred = _model.predict(x, verbose=0)[0][0]
        predictions.append(pred)
        window = np.roll(window, -1)
        window[-1] = pred

    raw = np.array(predictions).reshape(-1, 1)
    return _scaler.inverse_transform(raw).flatten().tolist()
