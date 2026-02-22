"""
AquaSentinel — Groundwater Routes
Person 1 owns this file.
Endpoints:
  GET /api/groundwater/all          — all state readings
  GET /api/groundwater/stats        — national statistics
  GET /api/groundwater/{state}      — single state detail
  GET /api/groundwater/risk/{level} — filter by risk level
"""

from fastapi import APIRouter, HTTPException
from db.seed import get_all_states, get_state, get_states_by_risk, national_stats, contam_exceeds, SAFE_LIMITS
from cache.redis_client import cache_get, cache_set

router = APIRouter()


@router.get("/all")
def get_all():
    cached = cache_get("gw:all")
    if cached:
        return cached

    result = []
    for state, d in get_all_states().items():
        result.append({
            "state":              state,
            "depth_m":            d["depth"],
            "depletion_per_year": d["dep"],
            "risk_level":         d["risk"],
            "risk_score":         d["score"],
            "latitude":           d["lat"],
            "longitude":          d["lng"],
        })

    cache_set("gw:all", result, ttl=300)
    return result


@router.get("/stats")
def get_stats():
    cached = cache_get("gw:stats")
    if cached:
        return cached
    result = national_stats()
    cache_set("gw:stats", result, ttl=600)
    return result


@router.get("/risk/{level}")
def get_by_risk(level: str):
    valid = {"critical", "high", "moderate", "low"}
    if level not in valid:
        raise HTTPException(status_code=400, detail=f"level must be one of {valid}")
    states = get_states_by_risk(level)
    return [{"state": k, **v} for k, v in states.items()]


@router.get("/{state_name}")
def get_single_state(state_name: str):
    data = get_state(state_name)
    if not data:
        raise HTTPException(status_code=404, detail=f"State '{state_name}' not found")

    return {
        "state":              state_name,
        "depth_m":            data["depth"],
        "depletion_per_year": data["dep"],
        "risk_level":         data["risk"],
        "risk_score":         data["score"],
        "latitude":           data["lat"],
        "longitude":          data["lng"],
        "contamination": {
            "fluoride_mgl":  data["fluoride"],
            "arsenic_mgl":   data["arsenic"],
            "iron_mgl":      data["iron"],
            "fluoride_safe": not contam_exceeds(data, "fluoride"),
            "arsenic_safe":  not contam_exceeds(data, "arsenic"),
            "iron_safe":     not contam_exceeds(data, "iron"),
            "fluoride_times_limit": round(data["fluoride"] / SAFE_LIMITS["fluoride"], 1),
            "arsenic_times_limit":  round(data["arsenic"]  / SAFE_LIMITS["arsenic"],  1) if data["arsenic"] > 0 else 0,
            "iron_times_limit":     round(data["iron"]     / SAFE_LIMITS["iron"],     1),
        },
    }
