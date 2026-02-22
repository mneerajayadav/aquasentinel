import { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, Legend, ResponsiveContainer } from "recharts";
import "leaflet/dist/leaflet.css";
import { getAllReadings, getStateForecast, getActiveAlerts } from "../services/api";
import PremiumPage from "./PremiumPage";
import { TRANSLATIONS, LANG_NAMES } from "../i18n";

const USERS_KEY = "aqua_users_db";
const RISK_COLOR = { critical:"#ff3333", high:"#ff8800", moderate:"#ffcc00", low:"#00ff41" };
const RISK_BG    = { critical:"#1a0505", high:"#1a0d00", moderate:"#1a1500", low:"#041a04" };
const RISK_GRAD  = { critical:"linear-gradient(135deg,#2a0505,#1a0000)", high:"linear-gradient(135deg,#1f0d00,#150800)", moderate:"linear-gradient(135deg,#1a1500,#100e00)", low:"linear-gradient(135deg,#041a04,#021002)" };

function RiskBadge({ level, T }) {
  const labels = { critical: T.critical, high: T.high, moderate: T.moderate, low: T.low };
  return (
    <span style={{
      background: RISK_BG[level], border:`1px solid ${RISK_COLOR[level]}`,
      color: RISK_COLOR[level], padding:"2px 8px", fontSize:"10px",
      letterSpacing:"1px", textTransform:"uppercase"
    }}>{labels[level] || level}</span>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#040d04", border:"1px solid #1a3a1a", padding:"10px 14px", fontFamily:"'Courier New', monospace", fontSize:"11px" }}>
      <div style={{ color:"#4a7a4a", marginBottom:"6px" }}>{label}</div>
      {payload.map((p,i) => p.value != null && <div key={i} style={{ color:p.color }}>{p.name}: {p.value}m</div>)}
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const [page, setPage]             = useState("home");
  const [readings, setReadings]     = useState([]);
  const [alerts, setAlerts]         = useState([]);
  const [forecast, setForecast]     = useState(null);
  const [selected, setSelected]     = useState(null);
  const [expanded, setExpanded]     = useState(null);
  const [loadingF, setLoadingF]     = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const [lang, setLang]             = useState(user.language || "en");

  const T = TRANSLATIONS[lang] || TRANSLATIONS.en;
  const myState = currentUser.state;

  useEffect(() => {
    getAllReadings().then(r => setReadings(r.data)).catch(() => {});
    getActiveAlerts().then(r => setAlerts(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const target = selected?.state || myState;
    if (!target) return;
    setLoadingF(true);
    getStateForecast(target)
      .then(r => { setForecast(r.data); setLoadingF(false); })
      .catch(() => setLoadingF(false));
  }, [selected, myState]);

  const handleUpgrade = () => {
    const raw = localStorage.getItem(USERS_KEY);
    const users = raw ? JSON.parse(raw) : {};
    const updated = { ...currentUser, isPremium: true };
    if (users[currentUser.email]) users[currentUser.email] = updated;
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem("aqua_user", JSON.stringify(updated));
    setCurrentUser(updated);
    setPage("home");
  };

  const myData = readings.find(r => r.state === myState);
  const focus  = selected || myData;

  const chartData = forecast ? [
    ...(forecast.historical_12m||[]).map((v,i)=>({ name:`M-${12-i}`, actual:parseFloat(v.toFixed(1)), forecast:null })).reverse(),
    ...(forecast.forecast_6m||[]).map(f=>({ name:`M+${f.month}`, actual:null, forecast:f.predicted_depth }))
  ] : [];

  const getCropAdvice = () => {
    const d = focus;
    if (!d) return [];
    if (d.depth_m > 40 || d.depletion_per_year > 6) return [
      lang==="kn" ? "ಬರ-ನಿರೋಧಕ ಬೆಳೆಗಳು: ಸಜ್ಜೆ, ಜೋಳ" : lang==="hi" ? "सूखा-प्रतिरोधी फसलें: बाजरा, ज्वार" : "Drought-resistant crops: pearl millet (bajra), sorghum (jowar)",
      lang==="kn" ? "ಭತ್ತ ಬೆಳೆಯಬೇಡಿ — 5 ಪಟ್ಟು ಹೆಚ್ಚು ನೀರು ಬೇಕು" : lang==="hi" ? "धान से बचें — 5 गुना अधिक पानी चाहिए" : "Avoid paddy — uses 5x more water than needed",
      lang==="kn" ? "ತೊಟ್ಟು ನೀರಾವರಿ ಬಳಸಿ" : lang==="hi" ? "ड्रिप सिंचाई का प्रयोग करें" : "Use drip irrigation for vegetable cultivation",
      lang==="kn" ? "ಮೂಂಗ್, ಚನ ಬೆಳೆಯಿರಿ — ಕಡಿಮೆ ನೀರು ಬೇಕು" : lang==="hi" ? "मूंग, चना बोएं — कम पानी चाहिए" : "Plant pulses like moong, chana — very low water need",
    ];
    if (d.depth_m > 25) return [
      lang==="kn" ? "ಗೋಧಿ ಮತ್ತು ಸಾಸಿವೆ ಸುರಕ್ಷಿತ" : lang==="hi" ? "गेहूं और सरसों सुरक्षित हैं" : "Wheat and mustard safe for next 2 seasons",
      lang==="kn" ? "ಕಬ್ಬು ಬೆಳೆಯಬೇಡಿ" : lang==="hi" ? "गन्ने से बचें" : "Avoid sugarcane — very high water consumption",
      lang==="kn" ? "ಹತ್ತಿ ತೊಟ್ಟು ನೀರಾವರಿಯೊಂದಿಗೆ ಸೂಕ್ತ" : lang==="hi" ? "कपास ड्रिप सिंचाई के साथ संभव" : "Cotton with drip irrigation is viable",
    ];
    return [
      lang==="kn" ? "ನಿಮ್ಮ ಪ್ರದೇಶದ ಜಲ ಮಟ್ಟ ಸ್ಥಿರವಾಗಿದೆ" : lang==="hi" ? "आपके क्षेत्र का जल स्तर स्थिर है" : "Water levels relatively stable for your region",
      lang==="kn" ? "ಎಲ್ಲಾ ಪ್ರಮುಖ ಬೆಳೆಗಳು ಸೂಕ್ತ" : lang==="hi" ? "सभी प्रमुख फसलें उपयुक्त हैं" : "All major kharif and rabi crops are viable",
      lang==="kn" ? "ಮಳೆ ನೀರು ಸಂಗ್ರಹ ಶಿಫಾರಸು" : lang==="hi" ? "वर्षा जल संचयन की सिफारिश" : "Rainwater harvesting recommended",
    ];
  };

  const getPremiumAlerts = () => {
    if (!forecast || !focus) return [];
    const out = [];
    const last = forecast.forecast_6m?.[forecast.forecast_6m.length-1];
    if (last && last.predicted_depth > 40) out.push({ level:"critical", msg: `${lang==="hi"?"जल स्तर":lang==="kn"?"ಜಲ ಮಟ್ಟ":"Water table"} ${last.predicted_depth.toFixed(1)}m ${lang==="hi"?"महीने 6 तक पहुंचने का अनुमान":lang==="kn"?"ತಿಂಗಳ 6 ಕ್ಕೆ ತಲುಪುವ ನಿರೀಕ್ಷೆ":"projected by month 6 — critical threshold approaching"}` });
    if (focus.depletion_per_year > 5) out.push({ level:"high", msg: `${lang==="hi"?"कमी दर":lang==="kn"?"ಕಡಿತ ದರ":"Depletion rate"} ${focus.depletion_per_year}m/yr — ${lang==="hi"?"अभी निष्कर्षण कम करें":lang==="kn"?"ಈಗ ತೆಗೆಯುವಿಕೆ ಕಡಿಮೆ ಮಾಡಿ":"reduce extraction now"}` });
    if (forecast.months_to_crisis) out.push({ level:"high", msg: `${lang==="hi"?"संकट बिंदु अनुमानित":lang==="kn"?"ಬಿಕ್ಕಟ್ಟು ಅಂದಾಜು":" Crisis point estimated in"} ${forecast.months_to_crisis} ${lang==="hi"?"महीनों में":lang==="kn"?"ತಿಂಗಳಲ್ಲಿ":"months"}` });
    if (out.length === 0) out.push({ level:"low", msg: lang==="hi"?"अगले 6 महीनों के लिए जल स्तर स्थिर है":lang==="kn"?"ಮುಂದಿನ 6 ತಿಂಗಳು ಜಲ ಮಟ್ಟ ಸ್ಥಿರ":"Water table stable for next 6 months" });
    return out;
  };

  if (page === "premium_page")
    return <PremiumPage user={currentUser} onUpgrade={handleUpgrade} onBack={() => setPage("home")} lang={lang} T={T} />;

  return (
    <div style={{ minHeight:"100vh", background:"#030a03", color:"#c8e6c8", fontFamily:"'Courier New', monospace" }}>
      <style>{`
        .leaflet-container{background:#030a03!important}
        .leaflet-tile{filter:invert(1) hue-rotate(180deg) brightness(0.65) saturate(0.4)}
        .leaflet-control-attribution{display:none}
        .leaflet-control-zoom a{background:#040d04!important;color:#00ff41!important;border-color:#1a3a1a!important}
        .state-card:hover{border-color:#00ff41!important;transform:translateY(-2px)}
        .state-card{transition:all 0.2s;cursor:pointer}
        .nav-btn:hover{color:#00ff41!important}
        .nav-btn{transition:color 0.2s}
      `}</style>

      {/* NAV */}
      <nav style={{
        background:"#040d04", borderBottom:"1px solid #1a3a1a",
        padding:"0 24px", display:"flex", alignItems:"center",
        justifyContent:"space-between", height:"56px",
        position:"sticky", top:0, zIndex:1000
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"20px" }}>
          <div style={{ fontWeight:"900", fontSize:"16px" }}>
            AQUA<span style={{ color:"#00ff41", textShadow:"0 0 10px rgba(0,255,65,0.4)" }}>SENTINEL</span>
          </div>
          {[["home",T.home],["alerts",T.alerts]].map(([k,label]) => (
            <button key={k} className="nav-btn" onClick={() => setPage(k)} style={{
              background:"none", border:"none",
              color: page===k ? "#00ff41" : "#4a7a4a",
              fontSize:"11px", letterSpacing:"2px", cursor:"pointer",
              fontFamily:"'Courier New', monospace",
              borderBottom: page===k ? "2px solid #00ff41" : "2px solid transparent",
              padding:"4px 0"
            }}>{label}</button>
          ))}
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          {/* Language switcher */}
          {Object.entries(LANG_NAMES).map(([code,name]) => (
            <button key={code} onClick={() => setLang(code)} style={{
              background: lang===code ? "rgba(0,255,65,0.15)" : "none",
              border:`1px solid ${lang===code?"#00ff41":"#1a3a1a"}`,
              color: lang===code ? "#00ff41" : "#4a7a4a",
              padding:"3px 8px", fontSize:"10px", cursor:"pointer",
              fontFamily:"'Courier New', monospace"
            }}>{name}</button>
          ))}

          {currentUser.isPremium ? (
            <span style={{ background:"#041a04", border:"1px solid #00ff41", color:"#00ff41", padding:"3px 10px", fontSize:"10px", letterSpacing:"2px" }}>{T.premium}</span>
          ) : (
            <button onClick={() => setPage("premium_page")} style={{
              background:"linear-gradient(135deg,#00ff41,#00cc33)", border:"none", color:"#000",
              padding:"6px 14px", fontSize:"10px", letterSpacing:"2px",
              fontWeight:"900", cursor:"pointer", fontFamily:"'Courier New', monospace"
            }}>{T.upgrade}</button>
          )}
          <span style={{ color:"#4a7a4a", fontSize:"11px" }}>{currentUser.name?.split(" ")[0]}</span>
          <button onClick={onLogout} style={{
            background:"none", border:"1px solid #1a3a1a", color:"#4a7a4a",
            padding:"5px 12px", fontSize:"10px", letterSpacing:"2px",
            cursor:"pointer", fontFamily:"'Courier New', monospace"
          }}>{T.logout}</button>
        </div>
      </nav>

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"28px 20px" }}>

        {/* ── HOME ── */}
        {page === "home" && (<>

          {/* Welcome */}
          <div style={{ marginBottom:"24px" }}>
            <div style={{ color:"#4a7a4a", fontSize:"10px", letterSpacing:"3px", marginBottom:"4px" }}>
              {new Date().getHours() < 12 ? T.goodMorning : T.goodAfternoon}
            </div>
            <h1 style={{ color:"#fff", fontSize:"26px", fontWeight:"900", margin:0 }}>
              {currentUser.name}
              <span style={{ color:"#4a7a4a", fontSize:"14px", fontWeight:"400", marginLeft:"12px" }}>— {myState}</span>
            </h1>
          </div>

          {/* Stats */}
          {myData && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"10px", marginBottom:"24px" }}>
              {[
                [T.waterTableDepth, `${myData.depth_m}m`, T.belowGround, RISK_COLOR[myData.risk_level]],
                [T.yearlyDepletion, `-${myData.depletion_per_year}m`, T.perYear, "#ff8800"],
                [T.riskLevel, myData.risk_level?.toUpperCase(), `${myData.risk_score}/100`, RISK_COLOR[myData.risk_level]],
              ].map(([label,val,sub,col]) => (
                <div key={label} style={{
                  background:`linear-gradient(135deg, #040d04, #061506)`,
                  border:`1px solid ${col}33`, padding:"18px 20px",
                  boxShadow:`0 4px 20px ${col}11`
                }}>
                  <div style={{ color:"#4a7a4a", fontSize:"10px", letterSpacing:"2px", marginBottom:"6px" }}>{label}</div>
                  <div style={{ color:col, fontSize:"26px", fontWeight:"900", textShadow:`0 0 15px ${col}66` }}>{val}</div>
                  <div style={{ color:"#4a7a4a", fontSize:"11px", marginTop:"4px" }}>{sub}</div>
                </div>
              ))}
            </div>
          )}

          {/* MAP section */}
          <div style={{ color:"#00ff41", fontSize:"10px", letterSpacing:"3px", marginBottom:"10px" }}>
            {T.liveMap} <span style={{ color:"#4a7a4a" }}>— {T.clickHover}</span>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:"12px", marginBottom:"24px" }}>
            <div style={{ border:"1px solid #1a3a1a", overflow:"hidden", height:"440px" }}>
              {readings.length > 0 ? (
                <MapContainer center={[22.5,82.5]} zoom={5} style={{ height:"100%", width:"100%" }} scrollWheelZoom={true}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  {readings.map(r => (
                    <CircleMarker key={r.state} center={[r.latitude, r.longitude]}
                      radius={r.state===myState ? 14 : 10}
                      pathOptions={{
                        fillColor: RISK_COLOR[r.risk_level],
                        color: r.state===myState ? "#ffffff" : RISK_COLOR[r.risk_level],
                        weight: r.state===myState ? 2.5 : 1, fillOpacity:0.85
                      }}
                      eventHandlers={{ click: () => { setSelected(r); setExpanded(null); } }}>
                      <Tooltip direction="top" offset={[0,-8]} opacity={1}>
                        <div style={{ fontFamily:"'Courier New', monospace", fontSize:"11px", background:"#040d04", padding:"6px 10px", border:"1px solid #1a3a1a", color:"#c8e6c8", minWidth:"140px" }}>
                          <div style={{ fontWeight:"900", color:"#fff", marginBottom:"4px" }}>{r.state}</div>
                          <div>{T.depth}: <span style={{ color:RISK_COLOR[r.risk_level] }}>{r.depth_m}m</span></div>
                          <div>{T.depletion}: <span style={{ color:"#ff8800" }}>-{r.depletion_per_year}m/yr</span></div>
                          <div>{T.riskLevel}: <span style={{ color:RISK_COLOR[r.risk_level], textTransform:"uppercase" }}>{r.risk_level}</span></div>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              ) : (
                <div style={{ height:"100%", display:"flex", alignItems:"center", justifyContent:"center", color:"#4a7a4a", fontSize:"12px" }}>{T.loadingMap}</div>
              )}
            </div>

            {/* Detail panel */}
            <div style={{ background:"#040d04", border:`1px solid ${focus ? RISK_COLOR[focus.risk_level]+"44" : "#1a3a1a"}`, padding:"20px", overflowY:"auto" }}>
              {focus ? (<>
                <div style={{ color:"#00ff41", fontSize:"10px", letterSpacing:"3px", marginBottom:"12px" }}>
                  {selected ? T.selectedState : T.yourArea}
                </div>
                <div style={{ color:"#fff", fontSize:"18px", fontWeight:"900", marginBottom:"16px" }}>{focus.state}</div>
                {[
                  [T.waterTableDepth, `${focus.depth_m}m`, RISK_COLOR[focus.risk_level]],
                  [T.yearlyDepletion, `-${focus.depletion_per_year}m/yr`, "#ff8800"],
                  [T.score, `${focus.risk_score}/100`, RISK_COLOR[focus.risk_level]],
                ].map(([label,val,col]) => (
                  <div key={label} style={{ marginBottom:"12px", paddingBottom:"12px", borderBottom:"1px solid #0a1a0a" }}>
                    <div style={{ color:"#4a7a4a", fontSize:"10px", marginBottom:"2px" }}>{label}</div>
                    <div style={{ color:col, fontSize:"14px", fontWeight:"900" }}>{val}</div>
                  </div>
                ))}
                <RiskBadge level={focus.risk_level} T={T} />
                {!currentUser.isPremium && (
                  <button onClick={() => setPage("premium_page")} style={{
                    width:"100%", marginTop:"16px", padding:"10px",
                    background:"linear-gradient(135deg,#00ff41,#00cc33)",
                    border:"none", color:"#000", fontSize:"10px", letterSpacing:"2px",
                    fontWeight:"900", cursor:"pointer", fontFamily:"'Courier New', monospace"
                  }}>{T.getForecast}</button>
                )}
              </>) : (
                <div style={{ color:"#4a7a4a", fontSize:"12px", marginTop:"20px", lineHeight:"1.8" }}>{T.clickState}</div>
              )}
            </div>
          </div>

          {/* FORECAST GRAPH */}
          <div style={{ color:"#00ff41", fontSize:"10px", letterSpacing:"3px", marginBottom:"10px" }}>
            {T.forecastGraph}{focus && <span style={{ color:"#4a7a4a" }}> — {focus.state}</span>}
          </div>
          <div style={{
            background:"linear-gradient(135deg,#040d04,#060f06)",
            border:"1px solid #1a3a1a", padding:"20px", marginBottom:"24px",
            boxShadow:"0 4px 30px rgba(0,255,65,0.05)"
          }}>
            {loadingF ? (
              <div style={{ color:"#4a7a4a", fontSize:"12px", textAlign:"center", padding:"40px" }}>{T.loadingForecast}</div>
            ) : chartData.length > 0 ? (<>
              <div style={{ color:"#4a7a4a", fontSize:"11px", marginBottom:"16px" }}>{T.past12}</div>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={chartData} margin={{ top:5, right:20, left:0, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#0a1a0a" />
                  <XAxis dataKey="name" stroke="#4a7a4a" tick={{ fontSize:10, fontFamily:"'Courier New', monospace" }} />
                  <YAxis stroke="#4a7a4a" tick={{ fontSize:10, fontFamily:"'Courier New', monospace" }} unit="m" />
                  <RTooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontFamily:"'Courier New', monospace", fontSize:"11px" }} />
                  <Line type="monotone" dataKey="actual" name={T.actualLabel} stroke="#00ff41" strokeWidth={2.5} dot={false} connectNulls={false} />
                  <Line type="monotone" dataKey="forecast" name={T.forecastLabel} stroke="#ff8800" strokeWidth={2} strokeDasharray="5 5" dot={{ fill:"#ff8800", r:3 }} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            </>) : (
              <div style={{ color:"#4a7a4a", fontSize:"12px", textAlign:"center", padding:"40px" }}>{T.clickState}</div>
            )}
          </div>

          {/* PREMIUM CONTENT */}
          {currentUser.isPremium && focus && (<>
            <div style={{ background:"#040d04", border:"1px solid #00ff4144", padding:"20px", marginBottom:"16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
                <span style={{ color:"#00ff41", fontSize:"11px", letterSpacing:"3px" }}>{T.sixMonthAlerts}</span>
                <span style={{ background:"#00ff41", color:"#000", padding:"2px 8px", fontSize:"9px", fontWeight:"900" }}>PREMIUM</span>
              </div>
              {getPremiumAlerts().map((a,i) => (
                <div key={i} style={{ display:"flex", gap:"12px", padding:"10px 14px", marginBottom:"8px", background:RISK_BG[a.level], border:`1px solid ${RISK_COLOR[a.level]}33` }}>
                  <span style={{ color:RISK_COLOR[a.level], fontWeight:"900", flexShrink:0 }}>!</span>
                  <span style={{ color:"#c8e6c8", fontSize:"12px" }}>{a.msg}</span>
                </div>
              ))}
            </div>
            <div style={{ background:"#040d04", border:"1px solid #1a3a1a", padding:"20px", marginBottom:"24px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
                <span style={{ color:"#00ff41", fontSize:"11px", letterSpacing:"3px" }}>{T.cropRec}</span>
                <span style={{ background:"#00ff41", color:"#000", padding:"2px 8px", fontSize:"9px", fontWeight:"900" }}>PREMIUM</span>
              </div>
              <p style={{ color:"#4a7a4a", fontSize:"11px", marginBottom:"12px" }}>{T.basedOn} ({focus.depth_m}m), {focus.depletion_per_year}m/yr:</p>
              {getCropAdvice().map((a,i) => (
                <div key={i} style={{ display:"flex", gap:"10px", padding:"8px 0", borderBottom:"1px solid #0a1a0a" }}>
                  <span style={{ color:"#00ff41", flexShrink:0 }}>+</span>
                  <span style={{ color:"#8ab88a", fontSize:"13px" }}>{a}</span>
                </div>
              ))}
            </div>
          </>)}

          {/* Upgrade CTA */}
          {!currentUser.isPremium && (
            <div style={{
              background:"linear-gradient(135deg,#040d04,#061506)",
              border:"1px solid #00ff4122", padding:"28px", textAlign:"center", marginBottom:"24px",
              boxShadow:"0 4px 30px rgba(0,255,65,0.05)"
            }}>
              <div style={{ color:"#00ff41", fontSize:"11px", letterSpacing:"3px", marginBottom:"8px" }}>{T.unlockPremium}</div>
              <p style={{ color:"#4a7a4a", fontSize:"13px", marginBottom:"16px" }}>{T.unlockDesc}</p>
              <button onClick={() => setPage("premium_page")} style={{
                background:"linear-gradient(135deg,#00ff41,#00cc33)", border:"none", color:"#000",
                padding:"12px 32px", fontSize:"11px", letterSpacing:"3px",
                fontWeight:"900", cursor:"pointer", fontFamily:"'Courier New', monospace",
                boxShadow:"0 4px 20px rgba(0,255,65,0.3)"
              }}>{T.viewPremium}</button>
            </div>
          )}

          {/* ── ALL STATES GRID ── */}
          <div style={{ color:"#00ff41", fontSize:"10px", letterSpacing:"3px", marginBottom:"12px" }}>{T.allStates}</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:"10px", marginBottom:"12px" }}>
            {readings.sort((a,b)=>b.risk_score-a.risk_score).map(r => (
              <div key={r.state} className="state-card"
                onClick={() => { setExpanded(expanded===r.state ? null : r.state); setSelected(r); }}
                style={{
                  background: expanded===r.state ? RISK_GRAD[r.risk_level] : r.state===myState ? "#061a06" : "#040d04",
                  border:`1px solid ${expanded===r.state ? RISK_COLOR[r.risk_level] : r.state===myState ? "#00ff41" : "#1a3a1a"}`,
                  padding:"14px 16px", boxShadow: expanded===r.state ? `0 4px 20px ${RISK_COLOR[r.risk_level]}22` : "none"
                }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"6px" }}>
                  <div>
                    {r.state===myState && <div style={{ color:"#00ff41", fontSize:"8px", letterSpacing:"1px", marginBottom:"2px" }}>YOUR STATE</div>}
                    <div style={{ color:"#fff", fontSize:"13px", fontWeight: r.state===myState?"900":"600" }}>{r.state}</div>
                  </div>
                  <RiskBadge level={r.risk_level} T={T} />
                </div>

                {/* Always visible mini stats */}
                <div style={{ color:"#4a7a4a", fontSize:"10px", marginTop:"6px" }}>
                  {r.depth_m}m · -{r.depletion_per_year}m/yr
                </div>

                {/* Expanded detail */}
                {expanded === r.state && (
                  <div style={{ marginTop:"12px", paddingTop:"12px", borderTop:`1px solid ${RISK_COLOR[r.risk_level]}33` }}>
                    <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px", marginBottom:"8px" }}>
                      {[
                        [T.waterTableDepth, `${r.depth_m}m`, RISK_COLOR[r.risk_level]],
                        [T.yearlyDepletion, `-${r.depletion_per_year}m`, "#ff8800"],
                        [T.score, `${r.risk_score}/100`, RISK_COLOR[r.risk_level]],
                      ].map(([label,val,col]) => (
                        <div key={label}>
                          <div style={{ color:"#4a7a4a", fontSize:"9px", marginBottom:"1px" }}>{label}</div>
                          <div style={{ color:col, fontSize:"13px", fontWeight:"900" }}>{val}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ color:"#4a7a4a", fontSize:"10px", marginTop:"6px", textAlign:"center" }}>
                      ▲ {lang==="hi"?"बंद करने के लिए क्लिक करें":lang==="kn"?"ಮುಚ್ಚಲು ಕ್ಲಿಕ್ ಮಾಡಿ":"Click to collapse"}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>)}

        {/* ── ALERTS ── */}
        {page === "alerts" && (<>
          <div style={{ marginBottom:"24px" }}>
            <div style={{ color:"#00ff41", fontSize:"10px", letterSpacing:"3px", marginBottom:"6px" }}>{T.systemAlerts}</div>
            <h2 style={{ color:"#fff", fontSize:"24px", fontWeight:"900", margin:0 }}>{T.activeWarnings}</h2>
          </div>
          {alerts.length===0 ? (
            <div style={{ color:"#4a7a4a" }}>{T.loadingAlerts}</div>
          ) : (
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {alerts.map((a,i) => (
                <div key={i} style={{ background:RISK_GRAD[a.risk_level]||"#040d04", border:`1px solid ${RISK_COLOR[a.risk_level]||"#1a3a1a"}33`, padding:"16px 20px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                    <span style={{ color:"#fff", fontWeight:"900", fontSize:"14px" }}>{a.state}</span>
                    <RiskBadge level={a.risk_level} T={T} />
                  </div>
                  <div style={{ display:"flex", gap:"20px", marginBottom: a.contamination_alerts?.length?"10px":0 }}>
                    <span style={{ color:"#4a7a4a", fontSize:"11px" }}>{T.depth}: {a.depth_m}m</span>
                    <span style={{ color:"#4a7a4a", fontSize:"11px" }}>{T.depletion}: {a.depletion_m_per_year}m/yr</span>
                    <span style={{ color:"#4a7a4a", fontSize:"11px" }}>{T.score}: {a.risk_score}/100</span>
                  </div>
                  {a.contamination_alerts?.map((c,j) => (
                    <div key={j} style={{ display:"flex", gap:"8px", color:"#ff8800", fontSize:"11px", marginTop:"4px" }}>
                      <span>!</span><span>{c}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>

      {/* ── FOOTER ── */}
      <footer style={{
        marginTop:"60px", background:"#040d04", borderTop:"1px solid #1a3a1a",
        padding:"48px 20px 24px"
      }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto" }}>

          {/* Top footer grid */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr", gap:"40px", marginBottom:"40px" }}>

            {/* About */}
            <div>
              <div style={{ fontWeight:"900", fontSize:"18px", marginBottom:"12px" }}>
                AQUA<span style={{ color:"#00ff41" }}>SENTINEL</span>
              </div>
              <p style={{ color:"#4a7a4a", fontSize:"12px", lineHeight:"1.8", marginBottom:"16px" }}>
                {T.footerDesc}
              </p>
              <div style={{ color:"#4a7a4a", fontSize:"11px", fontWeight:"900", letterSpacing:"2px", marginBottom:"8px" }}>{T.footerMission}</div>
              <p style={{ color:"#4a7a4a", fontSize:"12px", lineHeight:"1.7" }}>{T.footerMissionDesc}</p>
            </div>

            {/* SDG */}
            <div>
              <div style={{ color:"#00ff41", fontSize:"10px", letterSpacing:"3px", marginBottom:"16px" }}>{T.footerSDG}</div>
              {[
                ["#00aaff", T.sdg6],
                ["#00ff41", T.sdg2],
                ["#ffcc00", T.sdg13],
                ["#ff6633", T.sdg11],
              ].map(([col, label]) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"10px" }}>
                  <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:col, flexShrink:0, boxShadow:`0 0 6px ${col}` }} />
                  <span style={{ color:"#4a7a4a", fontSize:"11px" }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div>
              <div style={{ color:"#00ff41", fontSize:"10px", letterSpacing:"3px", marginBottom:"16px" }}>IMPACT</div>
              {[
                ["700M+", "Farmers in India"],
                ["6,500+", "Gram Panchayats"],
                ["21", "Cities at Risk"],
                ["25%", "of Global GW Use"],
              ].map(([num, label]) => (
                <div key={label} style={{ marginBottom:"12px" }}>
                  <div style={{ color:"#00ff41", fontSize:"18px", fontWeight:"900" }}>{num}</div>
                  <div style={{ color:"#4a7a4a", fontSize:"10px" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height:"1px", background:"linear-gradient(to right, transparent, #1a3a1a, transparent)", marginBottom:"20px" }} />

          {/* Bottom bar */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"10px" }}>
            <div style={{ color:"#1a3a1a", fontSize:"11px" }}>
              {T.footerTeam} · {T.footerHackathon}
            </div>
            <div style={{ color:"#1a3a1a", fontSize:"11px" }}>
              Built for India's farmers · Open source · Zero proprietary data
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
