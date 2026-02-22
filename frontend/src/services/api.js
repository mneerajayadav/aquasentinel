/**
 * AquaSentinel — API Service Layer
 * Person 3 owns this file.
 * All HTTP calls to the FastAPI backend live here.
 * Change BASE_URL when deploying.
 */

import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// ── Groundwater ───────────────────────────────────────────────────────
export const getAllReadings  = ()      => api.get("/api/groundwater/all");
export const getNationalStats = ()    => api.get("/api/groundwater/stats");
export const getStateData   = (state) => api.get(`/api/groundwater/${encodeURIComponent(state)}`);
export const getByRisk      = (level) => api.get(`/api/groundwater/risk/${level}`);

// ── Alerts ────────────────────────────────────────────────────────────
export const getActiveAlerts        = () => api.get("/api/alerts/active");
export const getContaminationAlerts = () => api.get("/api/alerts/contamination");

// ── Forecast (ML models) ──────────────────────────────────────────────
export const getStateForecast       = (state) => api.get(`/api/forecast/${encodeURIComponent(state)}`);
export const getContaminationRisk   = (state) => api.get(`/api/forecast/contamination/${encodeURIComponent(state)}`);

// ── Policy Simulator ──────────────────────────────────────────────────
export const runSimulator = (params) =>
  api.post("/api/simulator/run", params);

export const getSimulatorPresets = () => api.get("/api/simulator/presets");

export default api;
