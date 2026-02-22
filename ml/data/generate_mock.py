"""
AquaSentinel — Synthetic Training Data Generator
Person 2 owns this file.
Run this FIRST before training either model.
Generates realistic synthetic groundwater time-series + contamination data.

Run: python generate_mock.py
"""

import numpy as np
import pandas as pd
import os

np.random.seed(42)
OUT = os.path.join(os.path.dirname(__file__))


def generate_depletion_series(n_states=23, n_months=120):
    """
    120 months (10 years) of monthly groundwater depth readings per state.
    Each state has a unique base depth, depletion rate, and seasonal amplitude.
    """
    rows = []
    state_params = [
        ("Rajasthan", 30, 0.68, 2.0),
        ("Delhi", 28, 0.61, 1.5),
        ("Gujarat", 26, 0.65, 1.8),
        ("Andhra Pradesh", 22, 0.57, 2.5),
        ("Tamil Nadu", 20, 0.52, 2.2),
        ("Punjab", 18, 0.48, 1.8),
        ("Haryana", 16, 0.43, 1.5),
        ("Uttar Pradesh", 18, 0.41, 1.6),
        ("Madhya Pradesh", 14, 0.39, 1.3),
        ("Maharashtra", 12, 0.35, 1.4),
        ("Karnataka", 14, 0.37, 1.5),
        ("Bihar", 12, 0.36, 1.2),
        ("West Bengal", 8, 0.27, 1.0),
        ("Odisha", 6, 0.22, 1.1),
        ("Jharkhand", 7, 0.23, 1.0),
        ("Chhattisgarh", 5, 0.20, 0.9),
        ("Uttarakhand", 6, 0.24, 1.2),
        ("Assam", 4, 0.15, 0.8),
        ("Kerala", 5, 0.17, 1.0),
        ("Himachal Pradesh", 3, 0.12, 0.6),
        ("Jammu & Kashmir", 5, 0.17, 0.8),
        ("Goa", 3, 0.10, 0.7),
        ("Sikkim", 2, 0.04, 0.4),
    ]

    for state, base, rate, amp in state_params:
        for t in range(n_months):
            seasonal = amp * np.sin(2 * np.pi * t / 12)
            noise    = np.random.normal(0, 0.3)
            depth    = base + rate * t + seasonal + noise
            rows.append({"state": state, "month": t, "depth_m": round(depth, 3)})

    df = pd.DataFrame(rows)
    out_path = os.path.join(OUT, "depletion_series.csv")
    df.to_csv(out_path, index=False)
    print(f"Saved depletion series: {out_path} ({len(df)} rows)")
    return df


def generate_contamination_records(n=3000):
    """
    Tabular records for XGBoost contamination risk classification.
    Features: depth, extraction_rate, geology_score, rainfall, fluoride_hist, arsenic_hist, iron_hist
    Label: risk (0=low, 1=moderate, 2=high, 3=critical)
    """
    df = pd.DataFrame({
        "depth_m":           np.random.uniform(5,  60,   n),
        "extraction_rate":   np.random.uniform(0.5, 10,  n),
        "geology_score":     np.random.uniform(0,   1,   n),
        "rainfall_mm":       np.random.uniform(200, 2000, n),
        "fluoride_hist":     np.random.uniform(0,   12,  n),
        "arsenic_hist":      np.random.uniform(0,   0.5, n),
        "iron_hist":         np.random.uniform(0,   6,   n),
    })

    def label(row):
        score = (row.depth_m * 0.30 +
                 row.extraction_rate * 5 +
                 row.fluoride_hist * 8 +
                 row.arsenic_hist * 60)
        if score > 55:  return 3   # critical
        if score > 32:  return 2   # high
        if score > 16:  return 1   # moderate
        return 0                   # low

    df["risk"] = df.apply(label, axis=1)

    out_path = os.path.join(OUT, "contamination_records.csv")
    df.to_csv(out_path, index=False)
    print(f"Saved contamination records: {out_path} ({len(df)} rows)")
    print(f"Class distribution:\n{df['risk'].value_counts().sort_index()}")
    return df


if __name__ == "__main__":
    generate_depletion_series()
    generate_contamination_records()
    print("\nAll training data generated. Now run:")
    print("  python ../lstm/train.py")
    print("  python ../xgboost_model/train.py")
