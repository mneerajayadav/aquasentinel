/**
 * AquaSentinel — XGBoost Risk Score Bars
 * Person 3 owns this file.
 * Animated bar chart showing contamination risk scores per state.
 */

import { useEffect, useState, useRef } from "react";
import { getAllReadings } from "../services/api";

const RISK_COLOR = { critical: "#ff2d55", high: "#ff6b35", moderate: "#ffcc00", low: "#00c8ff" };

export default function RiskBars() {
  const [states, setStates] = useState([]);
  const [animated, setAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    getAllReadings()
      .then((res) => {
        const sorted = res.data
          .sort((a, b) => b.risk_score - a.risk_score)
          .slice(0, 10);
        setStates(sorted);
      })
      .catch(() => {
        // Static fallback
        setStates([
          { state: "Rajasthan",      risk_score: 94, risk_level: "critical" },
          { state: "Delhi",          risk_score: 91, risk_level: "critical" },
          { state: "Gujarat",        risk_score: 89, risk_level: "critical" },
          { state: "Andhra Pradesh", risk_score: 86, risk_level: "critical" },
          { state: "Tamil Nadu",     risk_score: 82, risk_level: "critical" },
          { state: "Punjab",         risk_score: 78, risk_level: "high" },
          { state: "Haryana",        risk_score: 75, risk_level: "high" },
          { state: "Uttar Pradesh",  risk_score: 72, risk_level: "high" },
          { state: "Maharashtra",    risk_score: 68, risk_level: "high" },
          { state: "Karnataka",      risk_score: 65, risk_level: "high" },
        ]);
      });
  }, []);

  // Animate bars on mount
  useEffect(() => {
    if (states.length > 0) setTimeout(() => setAnimated(true), 100);
  }, [states]);

  return (
    <div className="bg-[#061525] border border-[#0e3a5c] p-4">
      <div className="text-[10px] tracking-widest text-[#00c8ff] uppercase mb-1">XGBoost Model</div>
      <div className="text-base font-black mb-3">Contamination Risk Score — Top States</div>
      <div className="flex flex-col gap-2" ref={ref}>
        {states.map((s) => (
          <div key={s.state}>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-[#d0eaf7]">{s.state}</span>
              <span style={{ color: RISK_COLOR[s.risk_level] }} className="font-bold">
                {s.risk_score}/100
              </span>
            </div>
            <div className="h-1.5 bg-[#0e3a5c] overflow-hidden">
              <div
                className="h-full transition-all duration-700 ease-out"
                style={{
                  width: animated ? `${s.risk_score}%` : "0%",
                  background: RISK_COLOR[s.risk_level],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
