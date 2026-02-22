/**
 * AquaSentinel — Policy Simulator
 * Person 3 owns this file.
 * Sliders → POST to backend → shows projected outcomes.
 */

import { useState, useEffect, useCallback } from "react";
import { runSimulator } from "../services/api";

const SLIDERS = [
  { key: "dams",               label: "Check Dams Constructed",      min: 0, max: 20,  unit: "dams",  step: 1   },
  { key: "drip_pct",           label: "Drip Irrigation Coverage",    min: 0, max: 100, unit: "%",     step: 1   },
  { key: "rwh_units",          label: "Rainwater Harvesting Units",  min: 0, max: 500, unit: "units", step: 10  },
  { key: "crop_diversification",label: "Crop Diversification",       min: 0, max: 100, unit: "%",     step: 1   },
];

const OUTCOME_COLOR = { annual_recovery_m: "#00ff9d", crisis_delay_years: "#00c8ff", farmers_benefited_thousands: "#ff6b35", extraction_reduction_pct: "#00ff9d" };

export default function PolicySimulator() {
  const [params, setParams] = useState({ dams: 3, drip_pct: 30, rwh_units: 100, crop_diversification: 20 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const run = useCallback(() => {
    setLoading(true);
    runSimulator(params)
      .then((res) => setResult(res.data.results))
      .catch(() => {
        // Client-side fallback calculation
        const { dams, drip_pct, rwh_units, crop_diversification: cd } = params;
        setResult({
          annual_recovery_m:            parseFloat((dams*0.09 + drip_pct*0.014 + rwh_units*0.004 + cd*0.012).toFixed(2)),
          crisis_delay_years:           Math.round(dams*0.45 + drip_pct*0.07 + rwh_units*0.018 + cd*0.06),
          farmers_benefited_thousands:  Math.round((dams*850 + drip_pct*180 + rwh_units*5 + cd*120)/1000),
          extraction_reduction_pct:     Math.min(Math.round(drip_pct*0.25 + rwh_units*0.04 + cd*0.18), 65),
          verdict: "Simulation running offline — backend not connected.",
        });
      })
      .finally(() => setLoading(false));
  }, [params]);

  useEffect(() => { run(); }, [run]);

  return (
    <div className="bg-[#061525] border border-[#0e3a5c] p-4">
      <div className="text-[10px] tracking-widest text-[#00c8ff] uppercase mb-1">Policy Simulator</div>
      <div className="text-base font-black mb-1">What-If Intervention Modelling</div>
      <p className="text-[11px] text-[#5a8aaa] mb-4">
        "What happens if we build 3 check dams here?" — adjust parameters to see quantified outcomes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sliders */}
        <div className="flex flex-col gap-4">
          {SLIDERS.map(({ key, label, min, max, unit, step }) => (
            <div key={key}>
              <div className="flex justify-between text-[11px] mb-1">
                <span className="text-[#00c8ff] tracking-wider uppercase">{label}</span>
                <span className="text-[#00c8ff] font-bold">{params[key]} {unit}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={params[key]}
                onChange={(e) => setParams((p) => ({ ...p, [key]: Number(e.target.value) }))}
                className="w-full accent-[#00c8ff] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#5a8aaa]">
                <span>{min}</span><span>{max}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Outcomes */}
        <div className="flex flex-col gap-3">
          {result && (
            <>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: "annual_recovery_m",           label: "Annual Recovery",       fmt: (v) => `+${v}m`   },
                  { key: "crisis_delay_years",           label: "Crisis Delay",          fmt: (v) => `+${v} yrs`},
                  { key: "farmers_benefited_thousands",  label: "Farmers Benefited",     fmt: (v) => `${v}K`    },
                  { key: "extraction_reduction_pct",     label: "Extraction Reduction",  fmt: (v) => `-${v}%`   },
                ].map(({ key, label, fmt }) => (
                  <div key={key} className="bg-[#020b18] border border-[#0e3a5c] p-3">
                    <div className="text-xl font-black" style={{ color: OUTCOME_COLOR[key] }}>
                      {fmt(result[key])}
                    </div>
                    <div className="text-[10px] text-[#5a8aaa] mt-0.5">{label}</div>
                  </div>
                ))}
              </div>
              <div className="bg-[#020b18] border border-[#0e3a5c] p-3 text-[11px] text-[#5a8aaa] leading-relaxed">
                {loading ? "Computing..." : result.verdict}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
