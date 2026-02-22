"""
AquaSentinel — Alerts Routes
Person 1 owns this file.
Endpoints:
  GET /api/alerts/active    — all active critical + high alerts
  GET /api/alerts/critical  — critical only
  GET /api/alerts/contamination — contamination-specific alerts
"""

from fastapi import APIRouter
from db.seed import get_all_states, SAFE_LIMITS
from cache.redis_client import cache_get, cache_set

router = APIRouter()


def _build_alerts(risk_filter=None):
    alerts = []
    for state, d in get_all_states().items():
        if risk_filter and d["risk"] != risk_filter:
            continue
        if d["risk"] not in ("critical", "high"):
            continue

        contam_alerts = []
        if d["fluoride"] > SAFE_LIMITS["fluoride"]:
            contam_alerts.append(
                f"Fluoride {d['fluoride']} mg/L ({round(d['fluoride']/SAFE_LIMITS['fluoride'],1)}x limit)"
            )
        if d["arsenic"] > SAFE_LIMITS["arsenic"]:
            contam_alerts.append(
                f"Arsenic {d['arsenic']} mg/L ({round(d['arsenic']/SAFE_LIMITS['arsenic'],1)}x limit)"
            )
        if d["iron"] > SAFE_LIMITS["iron"]:
            contam_alerts.append(
                f"Iron {d['iron']} mg/L ({round(d['iron']/SAFE_LIMITS['iron'],1)}x limit)"
            )

        alerts.append({
            "state":                state,
            "risk_level":           d["risk"],
            "depth_m":              d["depth"],
            "depletion_m_per_year": d["dep"],
            "risk_score":           d["score"],
            "contamination_alerts": contam_alerts,
        })

    # Sort: critical first, then by score descending
    alerts.sort(key=lambda x: (x["risk_level"] != "critical", -x["risk_score"]))
    return alerts


@router.get("/active")
def get_active_alerts():
    cached = cache_get("alerts:active")
    if cached:
        return cached
    result = _build_alerts()
    cache_set("alerts:active", result, ttl=120)
    return result


@router.get("/critical")
def get_critical_alerts():
    return _build_alerts(risk_filter="critical")


@router.get("/contamination")
def get_contamination_alerts():
    alerts = []
    for state, d in get_all_states().items():
        issues = []
        if d["fluoride"] > SAFE_LIMITS["fluoride"]:
            issues.append({"type": "fluoride", "value": d["fluoride"],
                           "limit": SAFE_LIMITS["fluoride"],
                           "times_over": round(d["fluoride"] / SAFE_LIMITS["fluoride"], 1)})
        if d["arsenic"] > SAFE_LIMITS["arsenic"]:
            issues.append({"type": "arsenic", "value": d["arsenic"],
                           "limit": SAFE_LIMITS["arsenic"],
                           "times_over": round(d["arsenic"] / SAFE_LIMITS["arsenic"], 1)})
        if d["iron"] > SAFE_LIMITS["iron"]:
            issues.append({"type": "iron", "value": d["iron"],
                           "limit": SAFE_LIMITS["iron"],
                           "times_over": round(d["iron"] / SAFE_LIMITS["iron"], 1)})
        if issues:
            alerts.append({"state": state, "issues": issues})
    return alerts
