/**
 * AquaSentinel — Live Alerts Ticker
 * Person 3 owns this file.
 * Scrolling marquee of active groundwater alerts fetched from API.
 */

import { useEffect, useState } from "react";
import { getActiveAlerts } from "../services/api";

const RISK_COLOR = { critical: "#ff2d55", high: "#ff6b35", moderate: "#ffcc00", low: "#00ff9d" };

export default function AlertsTicker() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    getActiveAlerts()
      .then((res) => setAlerts(res.data))
      .catch(() => {
        // Fallback static alerts if API not running
        setAlerts([
          { state: "Rajasthan (Barmer)", risk_level: "critical", depth_m: 48, depletion_m_per_year: 8.1, contamination_alerts: ["Fluoride 3.2mg/L (2.1x limit)"] },
          { state: "Delhi NCR",          risk_level: "critical", depth_m: 42, depletion_m_per_year: 7.3, contamination_alerts: ["Arsenic 0.18mg/L (18x limit)"] },
          { state: "Nalgonda, Telangana",risk_level: "critical", depth_m: 40, depletion_m_per_year: 6.8, contamination_alerts: ["Fluoride 9.2mg/L (6.1x limit)"] },
          { state: "Punjab (Ludhiana)",  risk_level: "high",     depth_m: 38, depletion_m_per_year: 5.8, contamination_alerts: ["Arsenic rising in 3 blocks"] },
          { state: "Gujarat (Saurashtra)",risk_level:"critical", depth_m: 45, depletion_m_per_year: 7.8, contamination_alerts: [] },
        ]);
      });
  }, []);

  const items = [...alerts, ...alerts]; // duplicate for seamless loop

  return (
    <div className="flex items-center gap-3 bg-[#0a1f32] border-y border-[#0e3a5c] px-4 py-2 overflow-hidden">
      <span className="text-[10px] tracking-widest text-[#ff2d55] uppercase whitespace-nowrap font-bold shrink-0">
        ⚠ LIVE ALERTS
      </span>
      <div className="overflow-hidden flex-1">
        <div
          className="flex gap-16 whitespace-nowrap text-[11px] text-[#5a8aaa]"
          style={{ animation: "ticker 40s linear infinite" }}
        >
          {items.map((a, i) => (
            <span key={i}>
              <span style={{ color: RISK_COLOR[a.risk_level] }} className="font-bold uppercase">
                {a.risk_level === "critical" ? "🔴" : "🟠"} {a.risk_level.toUpperCase()}:
              </span>{" "}
              {a.state} — depth -{a.depth_m}m · depletion {a.depletion_m_per_year}m/yr
              {a.contamination_alerts?.length > 0 && ` · ${a.contamination_alerts[0]}`}
              &nbsp;·&nbsp;
            </span>
          ))}
        </div>
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
