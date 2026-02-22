"""
AquaSentinel — LSTM Depletion Forecasting Model
Person 2 owns this file.

What it does:
  Takes 12 months of groundwater depth readings → predicts next 6 months
  Architecture: LSTM(64) → Dropout(0.2) → LSTM(32) → Dense(1)

Run AFTER generate_mock.py:
  python train.py

Output:
  model.h5    — trained Keras model
  scaler.pkl  — MinMaxScaler (must be used for inference too)
"""

import numpy as np
import pandas as pd
import pickle
import os
import tensorflow as tf
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split

# ── Config ────────────────────────────────────────────────────────────
LOOKBACK  = 12    # months of history fed into LSTM
FORECAST  = 6     # months to predict ahead
EPOCHS    = 60
BATCH     = 32
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/depletion_series.csv")
MODEL_OUT = os.path.join(os.path.dirname(__file__), "model.h5")
SCALER_OUT= os.path.join(os.path.dirname(__file__), "scaler.pkl")


def load_data():
    df = pd.read_csv(DATA_PATH)
    all_series = []
    for state in df["state"].unique():
        series = df[df["state"] == state].sort_values("month")["depth_m"].values
        all_series.append(series)
    return all_series


def make_sequences(series_list, lookback=LOOKBACK):
    """Create (X, y) pairs from all state time series."""
    X, y = [], []
    for series in series_list:
        scaled = scaler.transform(series.reshape(-1, 1))
        for i in range(len(scaled) - lookback):
            X.append(scaled[i:i + lookback])
            y.append(scaled[i + lookback])
    return np.array(X), np.array(y)


def build_model():
    model = tf.keras.Sequential([
        tf.keras.layers.LSTM(64, return_sequences=True, input_shape=(LOOKBACK, 1)),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.LSTM(32),
        tf.keras.layers.Dropout(0.1),
        tf.keras.layers.Dense(1),
    ])
    model.compile(optimizer="adam", loss="mse", metrics=["mae"])
    return model


if __name__ == "__main__":
    print("Loading data...")
    all_series = load_data()
    all_values = np.concatenate(all_series).reshape(-1, 1)

    print("Fitting scaler...")
    scaler = MinMaxScaler()
    scaler.fit(all_values)
    with open(SCALER_OUT, "wb") as f:
        pickle.dump(scaler, f)
    print(f"Scaler saved → {SCALER_OUT}")

    print("Building sequences...")
    X, y = make_sequences(all_series)
    X_train, X_val, y_train, y_val = train_test_split(X, y, test_size=0.15, random_state=42)
    print(f"  Training samples: {len(X_train)} | Validation: {len(X_val)}")

    print("Training LSTM...")
    model = build_model()
    model.summary()

    callbacks = [
        tf.keras.callbacks.EarlyStopping(patience=8, restore_best_weights=True),
        tf.keras.callbacks.ReduceLROnPlateau(patience=4, factor=0.5),
    ]
    history = model.fit(
        X_train, y_train,
        validation_data=(X_val, y_val),
        epochs=EPOCHS,
        batch_size=BATCH,
        callbacks=callbacks,
        verbose=1,
    )

    model.save(MODEL_OUT)
    print(f"\nModel saved → {MODEL_OUT}")

    val_loss = min(history.history["val_loss"])
    print(f"Best validation MSE: {val_loss:.6f}")
    print("Training complete!")
