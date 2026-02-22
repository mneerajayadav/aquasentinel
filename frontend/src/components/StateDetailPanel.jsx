/**
 * AquaSentinel — State Detail Panel
 * Person 3 owns this file.
 * Shows groundwater + contamination detail when a state is clicked on the map.
 */

import { useEffect, useState } from "react";
import { getStateData } from "../services/api";

const RISK_COLOR  = { critical: "#ff2d55", high: "#ff6b35", moderate: "#ffcc00", low: "#00c8ff" };
const RISK_CHIP   = { critical: "bg-red-900/30 text-red-400 border-red-800", high: "bg-orange-900/30 text-orange-400 border-orange-800", moderate: "bg-yellow-900/20 text-yellow-400 border-yellow-800", low: "bg-cyan-900/20 text-cyan-400 border-cyan-800" };

function Bar({ value, max, color }) {
  const [w, setW] = useState(0);
  useEffect(() => { setTimeout(() => setW(Math.min(value / max * 100, 100)), 50); }, [value]);
  return (
    <div className="h-1 bg-[#0e3a5c] overflow-hidden mt-0.5 mb-2">
      <div className="h-full transition-all duration-700" style={{ width: `${w}%`, background: color }} />
    </div>
  );
}

export default function StateDetailPanel({ state }) {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state) return;
    setLoading(true);
    setData(null);
    getStateData(state)
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [state]);

  if (!state) return (
    <div className="bg-[#061525] border border-[#0e3a5c] p-4 text-[#5a8aaa] text-sm">
      ← Click any state on the map to view its groundwater intelligence report.
    </div>
  );

  if (loading) return (
    <div className="bg-[#061525] border border-[#0e3a5c] p-4 text-[#00c8ff] text-sm animate-pulse">
      Loading {state} data...
    </div>
  );

  if (!data) return null;

  const col = RISK_COLOR[data.risk_level];
  const c   = data.contamination;

  return (
    <div className="bg-[#061525] border border-[#0e3a5c] p-4">
      {/* Header */}
      <div className="text-lg font-black mb-1" style={{ color: col }}>{data.state}</div>
      <span className={`text-[10px] font-bold uppercase tracking-wider border px-2 py-0.5 ${RISK_CHIP[data.risk_level]}`}>
        {data.risk_level}
      </span>

      {/* Depth + Depletion */}
      <div className="mt-3 flex flex-col gap-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-[#5a8aaa]">Water Table Depth</span>
          <span style={{ color: col }} className="font-bold">-{data.depth_m}m</span>
        </div>
        <Bar value={data.depth_m} max={60} color={col} />

        <div className="flex justify-between text-[11px]">
          <span className="text-[#5a8aaa]">Annual Depletion Rate</span>
          <span style={{ color: col }} className="font-bold">{data.depletion_per_year} m/yr</span>
        </div>
        <Bar value={data.depletion_per_year} max={10} color={col} />
      </div>

      {/* Contamination */}
      <div className="mt-3 border-t border-[#0e3a5c] pt-3">
        <div className="text-[10px] tracking-wider text-[#00c8ff] uppercase mb-2">Contamination</div>
        {[
          { label: "Fluoride",  val: c.fluoride_mgl, safe: c.fluoride_safe, times: c.fluoride_times_limit, limit: "1.5 mg/L" },
          { label: "Arsenic",   val: c.arsenic_mgl,  safe: c.arsenic_safe,  times: c.arsenic_times_limit,  limit: "0.01 mg/L" },
          { label: "Iron",      val: c.iron_mgl,     safe: c.iron_safe,     times: c.iron_times_limit,     limit: "0.3 mg/L" },
        ].map(({ label, val, safe, times, limit }) => (
          <div key={label} className="flex justify-between text-[11px] py-1 border-b border-[#0e3a5c]">
            <span className="text-[#5a8aaa]">{label}</span>
            <span>
              <span className={safe ? "text-[#00ff9d]" : "text-[#ff6b35]"} style={{ fontWeight: 700 }}>
                {val} mg/L
              </span>
              {!safe && <span className="text-[#ff2d55] ml-1 text-[10px]">({times}x limit)</span>}
              {safe && <span className="text-[#00ff9d] ml-1 text-[10px]">✓ safe</span>}
            </span>
          </div>
        ))}
      </div>

      {/* Risk Score */}
      <div className="mt-3 flex justify-between text-[11px]">
        <span className="text-[#5a8aaa]">XGBoost Risk Score</span>
        <span style={{ color: col }} className="font-black text-base">{data.risk_score}/100</span>
      </div>
    </div>
  );
}
