"""
AquaSentinel — Pydantic Data Models (Schemas)
Person 1 owns this file.
These define the shape of all API request/response data.
"""

from pydantic import BaseModel
from typing import Optional, List


class GroundwaterReading(BaseModel):
    state: str
    district: Optional[str] = None
    depth_m: float
    depletion_per_year: float
    risk_level: str          # critical | high | moderate | low
    risk_score: float        # 0–100 from XGBoost
    latitude: float
    longitude: float


class ContaminationReading(BaseModel):
    state: str
    district: Optional[str] = None
    fluoride_mgl: float
    arsenic_mgl: float
    iron_mgl: float
    fluoride_safe: bool
    arsenic_safe: bool
    iron_safe: bool


class Alert(BaseModel):
    state: str
    risk_level: str
    depth_m: float
    depletion: float
    contamination_alerts: List[str]


class ForecastPoint(BaseModel):
    month: int
    predicted_depth: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    state: str
    current_depth: float
    annual_depletion_rate: float
    model: str
    confidence: float
    historical_12m: List[float]
    forecast_6m: List[ForecastPoint]
    will_reach_critical: bool
    months_to_crisis: Optional[int]


class SimulatorInput(BaseModel):
    dams: int = 3
    drip_pct: int = 30
    rwh_units: int = 100
    crop_diversification: int = 20


class SimulatorResult(BaseModel):
    annual_recovery_m: float
    crisis_delay_years: int
    farmers_benefited_thousands: int
    extraction_reduction_pct: int
    intervention_score: int
    verdict: str
