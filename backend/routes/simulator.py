"""
AquaSentinel — Policy Simulator Routes
Person 1 owns this file.
"What happens if we build 3 check dams?" — quantified answer.

Endpoints:
  POST /api/simulator/run  — run simulation with given parameters
  GET  /api/simulator/presets — example intervention scenarios
"""

from fastapi import APIRouter
from models.schemas import SimulatorInput

router = APIRouter()

PRESETS = {
    "minimal": {"dams": 2,  "drip_pct": 15, "rwh_units": 50,  "crop_diversification": 10},
    "moderate": {"dams": 7,  "drip_pct": 45, "rwh_units": 200, "crop_diversification": 35},
    "aggressive": {"dams": 15, "drip_pct": 80, "rwh_units": 400, "crop_diversification": 70},
}


def _compute(dams: int, drip_pct: int, rwh_units: int, crop_div: int) -> dict:
    recovery   = round(dams * 0.09 + drip_pct * 0.014 + rwh_units * 0.004 + crop_div * 0.012, 2)
    delay_yrs  = round(dams * 0.45 + drip_pct * 0.07  + rwh_units * 0.018 + crop_div * 0.06)
    farmers_k  = round((dams * 850 + drip_pct * 180 + rwh_units * 5 + crop_div * 120) / 1000)
    extraction = min(round(drip_pct * 0.25 + rwh_units * 0.04 + crop_div * 0.18), 65)
    score      = dams * 5 + drip_pct * 0.5 + rwh_units * 0.1 + crop_div * 0.5

    if score > 150:
        verdict = "Strong intervention. Significant recovery projected. Recommend immediate policy adoption."
    elif score > 80:
        verdict = "Moderate intervention. Meaningful impact but insufficient alone. Increase targets."
    else:
        verdict = "Insufficient. Crisis timeline largely unchanged. Scale up all measures significantly."

    return {
        "annual_recovery_m":             recovery,
        "crisis_delay_years":            delay_yrs,
        "farmers_benefited_thousands":   farmers_k,
        "extraction_reduction_pct":      extraction,
        "intervention_score":            round(score),
        "verdict":                       verdict,
    }


@router.post("/run")
def run_simulation(params: SimulatorInput):
    return {
        "inputs": params.dict(),
        "results": _compute(params.dams, params.drip_pct, params.rwh_units, params.crop_diversification),
    }


@router.get("/presets")
def get_presets():
    return {
        name: {"inputs": p, "results": _compute(**p)}
        for name, p in PRESETS.items()
    }
