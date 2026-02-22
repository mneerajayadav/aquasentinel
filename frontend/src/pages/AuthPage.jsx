import { useState } from "react";
import { TRANSLATIONS, LANG_NAMES } from "../i18n";

const USERS_KEY = "aqua_users_db";

function getUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : {};
}
function saveUser(email, data) {
  const users = getUsers();
  users[email] = data;
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

const STATES = [
  "Andhra Pradesh","Assam","Bihar","Chhattisgarh","Delhi","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jammu & Kashmir","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Uttar Pradesh","Uttarakhand","West Bengal"
];

export default function AuthPage({ onLogin }) {
  const [lang, setLang]   = useState("en");
  const [mode, setMode]   = useState("login");
  const [form, setForm]   = useState({ name:"", email:"", password:"", state:"", phone:"", language:"en" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const T = TRANSLATIONS[lang];

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = () => {
    setError(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const users = getUsers();
      if (mode === "signup") {
        if (!form.name || !form.email || !form.password || !form.state) { setError(T.allFieldsRequired); return; }
        if (form.password.length < 6) { setError(T.passwordMin); return; }
        if (users[form.email]) { setError(T.accountExists); return; }
        const userData = { ...form, isPremium: false, createdAt: new Date().toISOString() };
        saveUser(form.email, userData);
        onLogin(userData);
      } else {
        if (!form.email || !form.password) { setError(T.allFieldsRequired); return; }
        const user = users[form.email];
        if (!user || user.password !== form.password) { setError(T.invalidLogin); return; }
        onLogin(user);
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: "100vh", position: "relative", overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "'Courier New', monospace"
    }}>
      {/* Animated gradient background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, #010a01 0%, #001a0d 25%, #020c1a 50%, #0a0a01 75%, #010a01 100%)",
        backgroundSize: "400% 400%",
        animation: "gradientShift 12s ease infinite"
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(0,255,65,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,65,0.03) 1px, transparent 1px)`,
        backgroundSize: "50px 50px"
      }} />

      {/* Glowing orbs */}
      <div style={{ position:"absolute", top:"10%", left:"5%", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle, rgba(0,255,65,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", bottom:"15%", right:"8%", width:"250px", height:"250px", borderRadius:"50%", background:"radial-gradient(circle, rgba(0,150,255,0.10) 0%, transparent 70%)", pointerEvents:"none" }} />
      <div style={{ position:"absolute", top:"50%", right:"20%", width:"200px", height:"200px", borderRadius:"50%", background:"radial-gradient(circle, rgba(255,200,0,0.06) 0%, transparent 70%)", pointerEvents:"none" }} />

      {/* Water wave decoration */}
      <svg style={{ position:"absolute", bottom:0, left:0, right:0, opacity:0.15 }} viewBox="0 0 1440 120" preserveAspectRatio="none" height="120">
        <path d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z" fill="#00ff41" />
      </svg>
      <svg style={{ position:"absolute", bottom:0, left:0, right:0, opacity:0.08 }} viewBox="0 0 1440 120" preserveAspectRatio="none" height="80">
        <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,30 1440,40 L1440,120 L0,120 Z" fill="#00aaff" />
      </svg>

      <style>{`
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .auth-card { animation: fadeUp 0.6s ease forwards; }
        .glow-btn:hover { box-shadow: 0 0 20px rgba(0,255,65,0.4); transform: translateY(-1px); }
        .glow-btn { transition: all 0.2s; }
      `}</style>

      {/* Language switcher top right */}
      <div style={{ position:"absolute", top:"16px", right:"20px", display:"flex", gap:"8px" }}>
        {Object.entries(LANG_NAMES).map(([code, name]) => (
          <button key={code} onClick={() => { setLang(code); setForm(f=>({...f, language:code})); }}
            style={{
              background: lang===code ? "#00ff41" : "rgba(0,255,65,0.08)",
              border: `1px solid ${lang===code ? "#00ff41" : "#1a3a1a"}`,
              color: lang===code ? "#000" : "#4a7a4a",
              padding:"4px 10px", fontSize:"10px", letterSpacing:"1px",
              cursor:"pointer", fontFamily:"'Courier New', monospace",
              fontWeight: lang===code ? "900" : "400"
            }}>{name}</button>
        ))}
      </div>

      <div className="auth-card" style={{ position:"relative", width:"100%", maxWidth:"460px", padding:"0 20px" }}>

        {/* Logo area */}
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          {/* Water drop icon made with CSS */}
          <div style={{ marginBottom:"12px" }}>
            <div style={{
              display:"inline-block", width:"48px", height:"56px", position:"relative"
            }}>
              <div style={{
                width:"48px", height:"48px", borderRadius:"50% 50% 50% 0",
                transform:"rotate(-45deg)", background:"linear-gradient(135deg, #00ff41, #00aaff)",
                boxShadow:"0 0 30px rgba(0,255,65,0.5)"
              }} />
            </div>
          </div>
          <h1 style={{ fontSize:"40px", fontWeight:"900", color:"#fff", letterSpacing:"-1px", margin:0, lineHeight:1 }}>
            AQUA<span style={{ color:"#00ff41", textShadow:"0 0 20px rgba(0,255,65,0.5)" }}>SENTINEL</span>
          </h1>
          <p style={{ color:"#4a7a4a", fontSize:"12px", marginTop:"8px", letterSpacing:"1px" }}>{T.tagline}</p>

          {/* Decorative line */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", margin:"16px auto", maxWidth:"300px" }}>
            <div style={{ flex:1, height:"1px", background:"linear-gradient(to right, transparent, #1a3a1a)" }} />
            <div style={{ width:"4px", height:"4px", background:"#00ff41", borderRadius:"50%" }} />
            <div style={{ flex:1, height:"1px", background:"linear-gradient(to left, transparent, #1a3a1a)" }} />
          </div>
        </div>

        {/* Card */}
        <div style={{
          background:"rgba(4,13,4,0.92)", backdropFilter:"blur(10px)",
          border:"1px solid #1a3a1a", padding:"32px",
          boxShadow:"0 0 40px rgba(0,0,0,0.8), 0 0 80px rgba(0,255,65,0.05)",
          position:"relative"
        }}>
          {/* Corner accents */}
          {[
            {top:-1,left:-1,borderTop:"2px solid #00ff41",borderLeft:"2px solid #00ff41"},
            {top:-1,right:-1,borderTop:"2px solid #00ff41",borderRight:"2px solid #00ff41"},
            {bottom:-1,left:-1,borderBottom:"2px solid #00ff41",borderLeft:"2px solid #00ff41"},
            {bottom:-1,right:-1,borderBottom:"2px solid #00ff41",borderRight:"2px solid #00ff41"},
          ].map((s,i) => <div key={i} style={{ position:"absolute", width:"16px", height:"16px", ...s }} />)}

          {/* Tabs */}
          <div style={{ display:"flex", marginBottom:"24px" }}>
            {[["login",T.signIn],["signup",T.createAccount]].map(([m,label]) => (
              <button key={m} onClick={() => { setMode(m); setError(""); }}
                style={{
                  flex:1, padding:"10px", background:"none", border:"none",
                  borderBottom: mode===m ? "2px solid #00ff41" : "2px solid #1a3a1a",
                  color: mode===m ? "#00ff41" : "#4a7a4a",
                  fontSize:"11px", letterSpacing:"2px", cursor:"pointer",
                  fontFamily:"'Courier New', monospace", transition:"all 0.2s"
                }}>{label}</button>
            ))}
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {mode === "signup" && <Field label={T.fullName} name="name" value={form.name} onChange={handle} placeholder="Raju Kumar" />}
            <Field label={T.email} name="email" type="email" value={form.email} onChange={handle} placeholder="you@example.com" />
            <Field label={T.password} name="password" type="password" value={form.password} onChange={handle} placeholder="Min. 6 characters" />
            {mode === "signup" && (<>
              <SelectField label={T.yourState} name="state" value={form.state} onChange={handle} placeholder={T.selectState} options={STATES.map(s=>({value:s,label:s}))} />
              <SelectField label={T.language} name="language" value={form.language} onChange={e=>{handle(e);setLang(e.target.value);}} placeholder={T.selectLang}
                options={Object.entries(LANG_NAMES).map(([v,l])=>({value:v,label:l}))} />
              <Field label={T.phone} name="phone" value={form.phone} onChange={handle} placeholder="+91 98765 43210" />
            </>)}
          </div>

          {error && (
            <div style={{ marginTop:"12px", padding:"10px 12px", background:"#1a0505", border:"1px solid #ff3333", color:"#ff6666", fontSize:"12px" }}>{error}</div>
          )}

          <button onClick={submit} disabled={loading} className="glow-btn"
            style={{
              width:"100%", marginTop:"20px", padding:"14px",
              background: loading ? "#0a1f0a" : "linear-gradient(135deg, #00ff41, #00cc33)",
              border:"none", color: loading ? "#4a7a4a" : "#000",
              fontSize:"12px", letterSpacing:"3px", fontWeight:"900",
              cursor: loading ? "not-allowed" : "pointer", fontFamily:"'Courier New', monospace"
            }}>
            {loading ? T.verifying : mode==="login" ? T.accessSystem : T.createAccount}
          </button>

          {mode === "login" && (
            <p style={{ textAlign:"center", marginTop:"14px", color:"#4a7a4a", fontSize:"11px" }}>
              {T.noAccount}{" "}
              <span onClick={()=>setMode("signup")} style={{ color:"#00ff41", cursor:"pointer", textDecoration:"underline" }}>{T.registerHere}</span>
            </p>
          )}
        </div>

        <p style={{ textAlign:"center", marginTop:"20px", color:"#1a3a1a", fontSize:"10px", letterSpacing:"2px" }}>
          FOOBAR HACKATHON 2026 · TEAM A.N.T.S
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type="text", value, onChange, placeholder }) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <label style={{ color:"#4a7a4a", fontSize:"10px", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>{label}</label>
      <input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{
          width:"100%", background:"#080f08",
          border:`1px solid ${focused?"#00ff41":"#1a3a1a"}`,
          color:"#c8e6c8", padding:"9px 12px", fontSize:"13px",
          fontFamily:"'Courier New', monospace", outline:"none",
          boxSizing:"border-box", transition:"border-color 0.2s"
        }} />
    </div>
  );
}

function SelectField({ label, name, value, onChange, placeholder, options }) {
  return (
    <div>
      <label style={{ color:"#4a7a4a", fontSize:"10px", letterSpacing:"2px", display:"block", marginBottom:"5px" }}>{label}</label>
      <select name={name} value={value} onChange={onChange}
        style={{
          width:"100%", background:"#080f08", border:"1px solid #1a3a1a",
          color: value ? "#c8e6c8" : "#4a7a4a", padding:"9px 12px",
          fontSize:"13px", fontFamily:"'Courier New', monospace",
          outline:"none", cursor:"pointer", boxSizing:"border-box"
        }}>
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
