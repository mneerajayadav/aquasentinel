"""
AquaSentinel — XGBoost Contamination Risk Classifier
Person 2 owns this file.

What it does:
  Classifies contamination risk per district: 0=low 1=moderate 2=high 3=critical
  Features: depth, extraction rate, geology, rainfall, fluoride, arsenic, iron

Run AFTER generate_mock.py:
  python train.py

Output:
  model.pkl     — trained XGBoost classifier
  features.txt  — feature order required for inference
"""

import numpy as np
import pandas as pd
import pickle
import os
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
from sklearn.preprocessing import LabelEncoder

DATA_PATH   = os.path.join(os.path.dirname(__file__), "../data/contamination_records.csv")
MODEL_OUT   = os.path.join(os.path.dirname(__file__), "model.pkl")
FEATURES_OUT= os.path.join(os.path.dirname(__file__), "features.txt")

FEATURES = [
    "depth_m",
    "extraction_rate",
    "geology_score",
    "rainfall_mm",
    "fluoride_hist",
    "arsenic_hist",
    "iron_hist",
]
LABEL_NAMES = ["low", "moderate", "high", "critical"]


if __name__ == "__main__":
    print("Loading training data...")
    df = pd.read_csv(DATA_PATH)
    print(f"  {len(df)} records | Class distribution:\n{df['risk'].value_counts().sort_index()}\n")

    X = df[FEATURES]
    y = df["risk"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    print("Training XGBoost classifier...")
    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        use_label_encoder=False,
        eval_metric="mlogloss",
        random_state=42,
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=20,
    )

    y_pred = model.predict(X_test)
    print(f"\nTest Accuracy: {accuracy_score(y_test, y_pred):.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=LABEL_NAMES))

    # Feature importance
    importance = dict(zip(FEATURES, model.feature_importances_))
    print("\nFeature Importances:")
    for feat, imp in sorted(importance.items(), key=lambda x: -x[1]):
        print(f"  {feat}: {imp:.3f}")

    # Save
    with open(MODEL_OUT, "wb") as f:
        pickle.dump(model, f)
    with open(FEATURES_OUT, "w") as f:
        f.write("\n".join(FEATURES))

    print(f"\nModel saved → {MODEL_OUT}")
    print("Training complete!")
