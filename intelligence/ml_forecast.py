# ═══════════════════════════════════════════════════════════════════
#  Veda — XGBoost Demand Forecast Endpoint
#  File: intelligence/ml_forecast.py
#
#  Register in app.py:
#    from intelligence.ml_forecast import ml_bp
#    app.register_blueprint(ml_bp)
#
#  Model features (11 total, log1p-transformed input):
#    lag_1, lag_2, lag_7, lag_week, lag_month,
#    rolling_mean_3, rolling_mean_7, rolling_std_7,
#    weekly_usage, weekly_ratio, weekly_monthly_ratio
#  Output: log1p scale → expm1 back-transform → units/day
# ═══════════════════════════════════════════════════════════════════

import os
import pickle
import numpy as np
from datetime import datetime
from flask import Blueprint, request, jsonify

ml_bp = Blueprint("ml", __name__)

# ── Load model once at import time ───────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "final_pharma_model.pkl")
_model = None
_model_error = None

FEATURE_COLS = [
    "lag_1", "lag_2", "lag_7",
    "lag_week", "lag_month",
    "rolling_mean_3", "rolling_mean_7", "rolling_std_7",
    "weekly_usage", "weekly_ratio", "weekly_monthly_ratio",
]

def _load_model():
    global _model, _model_error
    if _model is not None:
        return _model
    if _model_error:
        return None
    try:
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
        print(f"[Veda ML] Model loaded: {type(_model).__name__} from {MODEL_PATH}")
        return _model
    except FileNotFoundError:
        _model_error = f"Model file not found at {MODEL_PATH}"
        print(f"[Veda ML] ✗ {_model_error}")
        return None
    except Exception as e:
        _model_error = str(e)
        print(f"[Veda ML] ✗ Failed to load model: {e}")
        return None


def _predict_single(features: dict) -> dict:
    """
    Run one prediction.

    Pipeline:
      1. Apply log1p to each feature (same transform used during training)
      2. Build ordered numpy array
      3. model.predict() → raw log1p prediction
      4. np.expm1() → units/day (original scale)
    """
    model = _load_model()
    if model is None:
        raise RuntimeError(_model_error or "Model not loaded")

    # 1. Log-transform features (stabilises variance — matches training pipeline)
    log_vals = [
        np.log1p(max(0.0, float(features.get(col, 0))))
        for col in FEATURE_COLS
    ]

    # 2. Build array
    X = np.array([log_vals])

    # 3. Predict (returns log1p scale)
    try:
        import pandas as pd
        X_df = pd.DataFrame(X, columns=FEATURE_COLS)
        raw_pred = float(model.predict(X_df)[0])
    except Exception:
        # fallback — plain numpy (may warn on feature names)
        raw_pred = float(model.predict(X)[0])

    # 4. Back-transform
    units_per_day = float(np.expm1(max(0.0, raw_pred)))

    return {
        "rawLogPred":      round(raw_pred, 6),
        "forecastedDemand": round(units_per_day, 2),      # units/day
        "forecastedWeekly": round(units_per_day * 7, 1),  # units/week
    }


def _classify_confidence(rolling_std: float, rolling_mean: float) -> str:
    """Confidence based on coefficient of variation."""
    if rolling_mean <= 0:
        return "low"
    cv = rolling_std / rolling_mean
    if cv < 0.2:
        return "high"
    if cv < 0.5:
        return "medium"
    return "low"


def _classify_trend(forecasted: float, rolling_mean_7: float) -> tuple[str, float]:
    """Compare forecast to recent rolling average."""
    if rolling_mean_7 <= 0:
        return "stable", 0.0
    pct = ((forecasted - rolling_mean_7) / rolling_mean_7) * 100
    if pct > 10:
        return "up", pct
    if pct < -10:
        return "down", abs(pct)
    return "stable", abs(pct)


# ── Endpoint ─────────────────────────────────────────────────────
@ml_bp.route("/api/ml/demand-forecast", methods=["POST"])
def demand_forecast():
    """
    POST /api/ml/demand-forecast

    Body:
    {
      "medicines": [
        {
          "medicineId": "abc123",
          "medicineName": "Paracetamol 500mg",
          "features": {
            "lag_1": 12, "lag_2": 10, "lag_7": 9,
            "lag_week": 65, "lag_month": 280,
            "rolling_mean_3": 11, "rolling_mean_7": 10.5, "rolling_std_7": 1.2,
            "weekly_usage": 72, "weekly_ratio": 1.14, "weekly_monthly_ratio": 1.03
          }
        }
      ]
    }

    Response:
    {
      "status": "ok",
      "model_version": "XGBRegressor",
      "generated_at": "...",
      "results": [ { ...forecast fields... } ]
    }
    """
    # Ensure model is loadable
    model = _load_model()
    if model is None:
        return jsonify({
            "status": "error",
            "error": _model_error or "Model could not be loaded",
            "hint": "Ensure final_pharma_model.pkl is in the project root folder"
        }), 503

    data = request.get_json(force=True) or {}
    medicines = data.get("medicines", [])

    if not medicines:
        return jsonify({"status": "error", "error": "No medicines provided"}), 400

    results = []
    errors  = []

    for item in medicines:
        med_id   = str(item.get("medicineId", ""))
        med_name = str(item.get("medicineName", med_id))
        features = item.get("features", {})

        # Validate all required features present
        missing = [c for c in FEATURE_COLS if c not in features]
        if missing:
            errors.append({"medicineId": med_id, "error": f"Missing features: {missing}"})
            continue

        try:
            pred = _predict_single(features)

            trend, trend_pct = _classify_trend(
                pred["forecastedDemand"],
                float(features.get("rolling_mean_7", 0))
            )
            confidence = _classify_confidence(
                float(features.get("rolling_std_7", 0)),
                float(features.get("rolling_mean_7", 1))
            )

            results.append({
                "medicineId":       med_id,
                "medicineName":     med_name,
                "forecastedDemand": pred["forecastedDemand"],
                "forecastedWeekly": pred["forecastedWeekly"],
                "rawLogPred":       pred["rawLogPred"],
                "trend":            trend,
                "trendPct":         round(trend_pct, 2),
                "confidence":       confidence,
                "features":         {k: round(float(features[k]), 4) for k in FEATURE_COLS},
            })

        except Exception as e:
            errors.append({"medicineId": med_id, "error": str(e)})

    return jsonify({
        "status":        "ok" if results else "partial_error",
        "model_version": type(model).__name__,
        "generated_at":  datetime.utcnow().isoformat() + "Z",
        "results":       results,
        "errors":        errors,
        "feature_order": FEATURE_COLS,
        "pipeline":      "log1p(features) → XGBRegressor → expm1(pred) = units/day",
    })


# ── Model info endpoint ───────────────────────────────────────────
@ml_bp.route("/api/ml/info", methods=["GET"])
def model_info():
    model = _load_model()
    info = {
        "loaded":        model is not None,
        "error":         _model_error,
        "model_path":    MODEL_PATH,
        "model_type":    type(model).__name__ if model else None,
        "features":      FEATURE_COLS,
        "n_features":    len(FEATURE_COLS),
        "pipeline":      "log1p(input) → XGBRegressor → expm1(output)",
        "output_unit":   "units/day (demand forecast)",
    }
    if model and hasattr(model, "n_estimators"):
        info["n_estimators"] = model.n_estimators
    if model and hasattr(model, "max_depth"):
        info["max_depth"] = model.max_depth
    return jsonify(info)
