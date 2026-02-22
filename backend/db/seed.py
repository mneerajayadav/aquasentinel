"""
AquaSentinel — Mock Data Store
Person 1 owns this file.
Single source of truth for all state groundwater data.
Used by all route handlers as the data source (replaces DB for hackathon demo).
"""

# Safe limits (BIS / WHO standards)
SAFE_LIMITS = {
    "fluoride": 1.5,   # mg/L
    "arsenic":  0.01,  # mg/L
    "iron":     0.3,   # mg/L
}

# All Indian states with realistic groundwater data
# depth = water table depth in metres | dep = annual depletion m/yr
# score = XGBoost contamination risk score (0–100)
STATES = {
    "Rajasthan":        {"depth":48.0,"dep":8.1,"risk":"critical","score":94,"lat":27.0,"lng":74.2,"fluoride":3.2,"arsenic":0.02,"iron":0.40},
    "Delhi":            {"depth":42.0,"dep":7.3,"risk":"critical","score":91,"lat":28.6,"lng":77.2,"fluoride":0.8,"arsenic":0.18,"iron":0.60},
    "Gujarat":          {"depth":45.0,"dep":7.8,"risk":"critical","score":89,"lat":22.3,"lng":71.2,"fluoride":4.1,"arsenic":0.01,"iron":0.30},
    "Andhra Pradesh":   {"depth":40.0,"dep":6.8,"risk":"critical","score":86,"lat":15.9,"lng":79.7,"fluoride":9.2,"arsenic":0.02,"iron":0.50},
    "Tamil Nadu":       {"depth":38.0,"dep":6.2,"risk":"critical","score":82,"lat":11.1,"lng":78.7,"fluoride":2.8,"arsenic":0.03,"iron":0.70},
    "Punjab":           {"depth":38.0,"dep":5.8,"risk":"high",    "score":78,"lat":31.1,"lng":75.3,"fluoride":0.6,"arsenic":0.18,"iron":0.40},
    "Haryana":          {"depth":34.0,"dep":5.2,"risk":"high",    "score":75,"lat":29.1,"lng":76.1,"fluoride":1.8,"arsenic":0.04,"iron":0.30},
    "Uttar Pradesh":    {"depth":36.0,"dep":4.9,"risk":"high",    "score":72,"lat":26.8,"lng":80.9,"fluoride":0.5,"arsenic":0.12,"iron":0.90},
    "Madhya Pradesh":   {"depth":32.0,"dep":4.7,"risk":"high",    "score":70,"lat":23.5,"lng":77.4,"fluoride":2.4,"arsenic":0.02,"iron":0.60},
    "Maharashtra":      {"depth":30.0,"dep":4.2,"risk":"high",    "score":68,"lat":19.7,"lng":75.7,"fluoride":1.9,"arsenic":0.01,"iron":0.40},
    "Karnataka":        {"depth":33.0,"dep":4.5,"risk":"high",    "score":65,"lat":15.3,"lng":75.7,"fluoride":2.1,"arsenic":0.02,"iron":0.50},
    "Bihar":            {"depth":31.0,"dep":4.3,"risk":"high",    "score":62,"lat":25.9,"lng":85.1,"fluoride":0.4,"arsenic":0.22,"iron":2.10},
    "West Bengal":      {"depth":25.0,"dep":3.2,"risk":"moderate","score":50,"lat":22.9,"lng":87.8,"fluoride":0.3,"arsenic":0.14,"iron":3.80},
    "Odisha":           {"depth":22.0,"dep":2.6,"risk":"moderate","score":44,"lat":20.5,"lng":84.7,"fluoride":0.4,"arsenic":0.03,"iron":2.90},
    "Jharkhand":        {"depth":24.0,"dep":2.8,"risk":"moderate","score":46,"lat":23.6,"lng":85.3,"fluoride":0.3,"arsenic":0.04,"iron":3.80},
    "Chhattisgarh":     {"depth":21.0,"dep":2.4,"risk":"moderate","score":40,"lat":21.3,"lng":81.6,"fluoride":0.5,"arsenic":0.02,"iron":2.20},
    "Uttarakhand":      {"depth":22.0,"dep":2.9,"risk":"moderate","score":38,"lat":30.1,"lng":79.3,"fluoride":0.4,"arsenic":0.01,"iron":1.40},
    "Assam":            {"depth":16.0,"dep":1.8,"risk":"moderate","score":35,"lat":26.2,"lng":92.9,"fluoride":0.3,"arsenic":0.06,"iron":2.80},
    "Kerala":           {"depth":18.0,"dep":2.0,"risk":"moderate","score":32,"lat":10.8,"lng":76.3,"fluoride":0.4,"arsenic":0.01,"iron":1.80},
    "Himachal Pradesh": {"depth":12.0,"dep":1.4,"risk":"low",     "score":18,"lat":31.9,"lng":77.1,"fluoride":0.2,"arsenic":0.00,"iron":0.40},
    "Jammu & Kashmir":  {"depth":18.0,"dep":2.1,"risk":"low",     "score":22,"lat":33.7,"lng":76.7,"fluoride":0.3,"arsenic":0.00,"iron":0.50},
    "Goa":              {"depth":14.0,"dep":1.2,"risk":"low",     "score":15,"lat":15.3,"lng":74.0,"fluoride":0.2,"arsenic":0.00,"iron":0.30},
    "Sikkim":           {"depth": 8.0,"dep":0.5,"risk":"low",     "score":10,"lat":27.5,"lng":88.5,"fluoride":0.1,"arsenic":0.00,"iron":0.20},
}


def get_all_states():
    return STATES


def get_state(name: str):
    return STATES.get(name)


def get_states_by_risk(level: str):
    return {k: v for k, v in STATES.items() if v["risk"] == level}


def contam_exceeds(state_data: dict, chemical: str) -> bool:
    return state_data[chemical] > SAFE_LIMITS[chemical]


def national_stats():
    total = len(STATES)
    return {
        "total_states": total,
        "critical": sum(1 for d in STATES.values() if d["risk"] == "critical"),
        "high":     sum(1 for d in STATES.values() if d["risk"] == "high"),
        "moderate": sum(1 for d in STATES.values() if d["risk"] == "moderate"),
        "low":      sum(1 for d in STATES.values() if d["risk"] == "low"),
        "fluoride_exceed_pct": round(sum(1 for d in STATES.values() if d["fluoride"] > SAFE_LIMITS["fluoride"]) / total * 100, 1),
        "arsenic_exceed_pct":  round(sum(1 for d in STATES.values() if d["arsenic"]  > SAFE_LIMITS["arsenic"])  / total * 100, 1),
        "iron_exceed_pct":     round(sum(1 for d in STATES.values() if d["iron"]     > SAFE_LIMITS["iron"])     / total * 100, 1),
        "cities_at_risk": 21,
        "farmers_covered_million": 700,
        "panchayats": 6500,
        "groundwater_lost_km3": 450,
        "india_global_usage_pct": 25,
    }
