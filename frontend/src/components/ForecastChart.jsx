/**
 * AquaSentinel — LSTM Forecast Chart
 * Person 3 owns this file.
 * Displays historical + 6-month forecast from Person 2's LSTM model.
 * Uses Recharts LineChart.
 */

import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { getStateForecast } from "../services/api";

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function ForecastChart({ state }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) return;
    setLoading(true);
    getStateForecast(state)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [state]);

  if (!state) return (
    <div className="bg-[#061525] border border-[#0e3a5c] p-6 text-center text-[#5a8aaa] text-sm">
      ← Select a state on the map to see the LSTM forecast
    </div>
  );

  if (loading) return (
    <div className="bg-[#061525] border border-[#0e3a5c] p-6 text-center text-[#00c8ff] text-sm animate-pulse">
      Running LSTM model for {state}...
    </div>
  );

  if (!data) return null;

  // Merge historical + forecast into one chart series
  const chartData = [];
  const now = new Date();

  data.historical_12m.forEach((depth, i) => {
    const monthIdx = (now.getMonth() - 11 + i + 12) % 12;
    chartData.push({ label: MONTH_LABELS[monthIdx], actual: depth, forecast: null });
  });
  data.forecast_6m.forEach((pt, i) => {
    const monthIdx = (now.getMonth() + i + 1) % 12;
    chartData.push({
      label:    MONTH_LABELS[monthIdx] + " (F)",
      actual:   null,
      forecast: pt.predicted_depth,
      upper:    pt.upper_bound,
      lower:    pt.lower_bound,
    });
  });

  return (
    <div className="bg-[#061525] border border-[#0e3a5c] p-4">
      <div className="text-[10px] tracking-widest text-[#00c8ff] uppercase mb-1">LSTM Forecast</div>
      <div className="text-base font-black mb-1">{state} — Water Table Depth (m)</div>
      <div className="text-[11px] text-[#5a8aaa] mb-3">
        Model: {data.model} · Confidence: {(data.confidence * 100).toFixed(0)}%
        {data.months_to_crisis && (
          <span className="text-[#ff2d55] ml-2 font-bold">
            ⚠ Crisis in ~{data.months_to_crisis} months without intervention
          </span>
        )}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#0e3a5c" />
          <XAxis dataKey="label" tick={{ fill: "#5a8aaa", fontSize: 10 }} />
          <YAxis tick={{ fill: "#5a8aaa", fontSize: 10 }} domain={["auto", "auto"]}
                 tickFormatter={(v) => `-${v}m`} />
          <Tooltip
            contentStyle={{ background: "#020b18", border: "1px solid #0e3a5c", fontSize: 11 }}
            formatter={(v, name) => [`-${v}m`, name]}
          />
          <Legend wrapperStyle={{ fontSize: 11, color: "#5a8aaa" }} />
          <Line dataKey="actual"   name="Actual (12m)"     stroke="#00c8ff" dot={false} strokeWidth={2} connectNulls={false} />
          <Line dataKey="forecast" name="LSTM Forecast (6m)" stroke="#ff2d55" dot={false} strokeWidth={2} strokeDasharray="5 3" connectNulls={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
