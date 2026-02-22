/**
 * AquaSentinel — Interactive India Map
 * Person 3 owns this file.
 * SVG map of India coloured by groundwater risk level.
 * Click a state to emit onSelect(stateName).
 */

import { useState } from "react";

const RISK_FILL = {
  critical: "#3a0b16",
  high:     "#2a1505",
  moderate: "#0d2518",
  low:      "#082030",
};
const RISK_STROKE_HOVER = "#00c8ff";

// Map state names → SVG path IDs
const STATE_PATHS = {
  jk: { name: "Jammu & Kashmir", d: "M130,12 L185,10 L205,32 L200,62 L172,72 L148,68 L126,52 Z" },
  hp: { name: "Himachal Pradesh", d: "M150,68 L192,64 L200,92 L172,98 L148,90 Z" },
  pb: { name: "Punjab",           d: "M108,80 L150,74 L154,104 L122,110 L104,98 Z" },
  hr: { name: "Haryana",          d: "M126,104 L164,100 L170,130 L140,136 L120,124 Z" },
  uk: { name: "Uttarakhand",      d: "M168,90 L210,86 L215,116 L190,120 L168,114 Z" },
  dl: { name: "Delhi",            d: "M148,120 L166,118 L168,134 L150,136 Z" },
  rj: { name: "Rajasthan",        d: "M76,112 L122,108 L140,138 L132,202 L80,218 L46,188 L42,144 Z" },
  up: { name: "Uttar Pradesh",    d: "M164,120 L250,116 L258,176 L196,188 L144,180 L132,152 Z" },
  br: { name: "Bihar",            d: "M248,150 L298,146 L304,188 L260,194 L246,182 Z" },
  wb: { name: "West Bengal",      d: "M296,150 L324,146 L330,208 L304,222 L280,202 L282,174 Z" },
  sk: { name: "Sikkim",           d: "M318,142 L332,140 L336,154 L320,156 Z" },
  as: { name: "Assam",            d: "M330,146 L400,138 L408,175 L360,188 L322,172 Z" },
  jh: { name: "Jharkhand",        d: "M254,192 L296,188 L300,228 L262,234 L246,218 Z" },
  od: { name: "Odisha",           d: "M260,230 L320,222 L326,278 L280,292 L252,268 Z" },
  mp: { name: "Madhya Pradesh",   d: "M132,202 L252,190 L262,252 L200,262 L134,250 Z" },
  cg: { name: "Chhattisgarh",     d: "M254,248 L296,228 L304,280 L264,292 L244,270 Z" },
  gj: { name: "Gujarat",          d: "M42,188 L80,218 L88,268 L72,308 L36,312 L18,278 L22,228 Z" },
  mh: { name: "Maharashtra",      d: "M84,256 L198,252 L206,318 L160,340 L98,322 L72,296 Z" },
  ga: { name: "Goa",              d: "M108,330 L130,326 L132,346 L110,348 Z" },
  ka: { name: "Karnataka",        d: "M106,342 L196,322 L204,392 L160,410 L104,396 L86,368 Z" },
  ap: { name: "Andhra Pradesh",   d: "M198,258 L308,264 L312,334 L246,360 L200,348 Z" },
  tn: { name: "Tamil Nadu",       d: "M160,404 L246,360 L256,430 L214,448 L164,442 Z" },
  kl: { name: "Kerala",           d: "M138,400 L160,396 L166,446 L148,452 L130,434 Z" },
};

export default function IndiaMap({ readings = [], onSelect }) {
  const [hovered, setHovered] = useState(null);

  // Build a lookup: state name → risk level from API data
  const riskMap = {};
  readings.forEach((r) => { riskMap[r.state] = r.risk_level; });

  const getRisk = (stateName) => riskMap[stateName] || "low";

  return (
    <div className="relative w-full bg-[#0a1f32] border border-[#0e3a5c] p-4">
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-bold text-[#d0eaf7]">Click any state for analysis</span>
        <span className="text-xs text-[#00ff9d] border border-[#00ff9d33] px-2 py-0.5 animate-pulse">
          ● LIVE
        </span>
      </div>

      <svg viewBox="0 0 420 480" className="w-full h-auto">
        {Object.entries(STATE_PATHS).map(([id, { name, d }]) => {
          const risk = getRisk(name);
          const isHovered = hovered === id;
          return (
            <path
              key={id}
              d={d}
              fill={RISK_FILL[risk] || RISK_FILL.low}
              stroke={isHovered ? RISK_STROKE_HOVER : "#174060"}
              strokeWidth={isHovered ? 1.2 : 0.6}
              style={{ filter: isHovered ? "brightness(1.6)" : "none", cursor: "pointer", transition: "all 0.2s" }}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect && onSelect(name)}
            />
          );
        })}

        {/* City dots */}
        {[
          { x: 156, y: 127, label: "Delhi" },
          { x: 160, y: 368, label: "Bengaluru" },
          { x: 305, y: 295, label: "Chennai" },
          { x: 85,  y: 274, label: "Mumbai" },
          { x: 200, y: 295, label: "Hyderabad" },
        ].map(({ x, y, label }) => (
          <g key={label} style={{ pointerEvents: "none" }}>
            <circle cx={x} cy={y} r={3.5} fill="#ff2d55" opacity={0.9} />
            <text x={x + 5} y={y + 3} fontSize={7.5} fill="#d0eaf7" fontFamily="monospace">{label}</text>
          </g>
        ))}
      </svg>

      {/* Legend */}
      <div className="flex gap-4 mt-2 text-xs text-[#5a8aaa]">
        {[["#ff2d55","Critical"],["#ff6b35","High"],["#ffcc00","Moderate"],["#0090cc","Low"]].map(([c,l]) => (
          <div key={l} className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full" style={{ background: c }} />
            {l}
          </div>
        ))}
      </div>

      {/* Hover tooltip */}
      {hovered && (
        <div className="absolute top-14 right-4 bg-[#020b18] border border-[#0e3a5c] p-2 text-xs pointer-events-none">
          <div className="font-bold text-[#00c8ff]">{STATE_PATHS[hovered]?.name}</div>
          <div className="text-[#5a8aaa]">Risk: {getRisk(STATE_PATHS[hovered]?.name)}</div>
        </div>
      )}
    </div>
  );
}
