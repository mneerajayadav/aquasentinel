import { useState } from "react";

const USERS_KEY = "aqua_users_db";

export default function PremiumPage({ user, onUpgrade, onBack }) {
  const [step, setStep] = useState("info");
  const [upi, setUpi] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePay = () => {
    setError("");
    if (!upi || !upi.includes("@")) {
      setError("Please enter a valid UPI ID (e.g. name@upi)"); return;
    }
    setLoading(true);
    setTimeout(() => {
      const raw = localStorage.getItem(USERS_KEY);
      const users = raw ? JSON.parse(raw) : {};
      if (users[user.email]) {
        users[user.email].isPremium = true;
        users[user.email].premiumSince = new Date().toISOString();
        users[user.email].premiumUpi = upi;
        localStorage.setItem(USERS_KEY, JSON.stringify(users));
      }
      setLoading(false);
      setStep("success");
      setTimeout(() => onUpgrade(), 2000);
    }, 1800);
  };

  const box = (title, items) => (
    <div style={{ background: "#040d04", border: "1px solid #1a3a1a", padding: "20px", marginBottom: "12px" }}>
      <div style={{ color: "#00ff41", fontSize: "11px", letterSpacing: "3px", marginBottom: "12px" }}>{title}</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "8px" }}>
          <span style={{ color: "#00ff41", marginTop: "1px", flexShrink: 0 }}>+</span>
          <span style={{ color: "#8ab88a", fontSize: "13px" }}>{item}</span>
        </div>
      ))}
    </div>
  );

  if (step === "success") return (
    <div style={{
      minHeight: "100vh", background: "#030a03", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace"
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "48px", color: "#00ff41", marginBottom: "16px" }}>✓</div>
        <div style={{ color: "#00ff41", fontSize: "20px", fontWeight: "900", letterSpacing: "2px" }}>PREMIUM ACTIVATED</div>
        <div style={{ color: "#4a7a4a", fontSize: "12px", marginTop: "8px" }}>Redirecting to your dashboard...</div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#030a03", fontFamily: "'Courier New', monospace", padding: "40px 20px" }}>
      <div style={{ maxWidth: "560px", margin: "0 auto" }}>
        <button onClick={onBack} style={{
          background: "none", border: "1px solid #1a3a1a", color: "#4a7a4a",
          padding: "6px 16px", fontSize: "11px", letterSpacing: "2px",
          cursor: "pointer", fontFamily: "'Courier New', monospace", marginBottom: "32px"
        }}>&lt; BACK</button>

        <div style={{ marginBottom: "28px" }}>
          <div style={{ color: "#00ff41", fontSize: "10px", letterSpacing: "4px", marginBottom: "8px" }}>UPGRADE PLAN</div>
          <h1 style={{ color: "#fff", fontSize: "32px", fontWeight: "900", margin: 0 }}>
            AquaSentinel <span style={{ color: "#00ff41" }}>Premium</span>
          </h1>
          <p style={{ color: "#4a7a4a", fontSize: "13px", marginTop: "8px" }}>Early warnings and crop advice tailored to your land</p>
        </div>

        <div style={{
          background: "#040d04", border: "1px solid #00ff41", padding: "20px 24px",
          marginBottom: "20px", display: "flex", alignItems: "center", justifyContent: "space-between"
        }}>
          <div>
            <div style={{ color: "#4a7a4a", fontSize: "10px", letterSpacing: "2px" }}>ANNUAL PLAN</div>
            <div style={{ color: "#fff", fontSize: "28px", fontWeight: "900", marginTop: "4px" }}>
              <span style={{ color: "#00ff41" }}>Rs.50</span>
              <span style={{ color: "#4a7a4a", fontSize: "13px" }}> / year</span>
            </div>
          </div>
          <div style={{ background: "#00ff41", color: "#000", padding: "4px 12px", fontSize: "10px", fontWeight: "900", letterSpacing: "2px" }}>
            BEST VALUE
          </div>
        </div>

        {box("WHAT YOU GET WITH PREMIUM", [
          "6-month advance warning before groundwater depletes in your area",
          "AI-powered crop recommendations based on your local water table",
          "Monthly rainfall and irrigation reports for your state",
          "SMS alerts when water level drops below safe threshold",
          "Priority contamination alerts for fluoride, arsenic and iron",
        ])}

        {box("FREE PLAN INCLUDES", [
          "Live groundwater stress map for all Indian states",
          "Current water table depth and depletion rate",
          "Basic contamination risk status",
        ])}

        {step === "info" && (
          <button onClick={() => setStep("payment")} style={{
            width: "100%", padding: "16px", background: "#00ff41", border: "none",
            color: "#000", fontSize: "13px", letterSpacing: "3px", fontWeight: "900",
            cursor: "pointer", fontFamily: "'Courier New', monospace", marginTop: "8px"
          }}>UPGRADE FOR Rs.50 / YEAR</button>
        )}

        {step === "payment" && (
          <div style={{ background: "#040d04", border: "1px solid #1a3a1a", padding: "24px", marginTop: "8px" }}>
            <div style={{ color: "#00ff41", fontSize: "11px", letterSpacing: "3px", marginBottom: "20px" }}>ENTER UPI DETAILS</div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ color: "#4a7a4a", fontSize: "10px", letterSpacing: "2px", display: "block", marginBottom: "6px" }}>UPI ID</label>
              <input value={upi} onChange={e => setUpi(e.target.value)} placeholder="yourname@upi"
                style={{
                  width: "100%", background: "#080f08", border: "1px solid #1a3a1a",
                  color: "#c8e6c8", padding: "10px 12px", fontSize: "13px",
                  fontFamily: "'Courier New', monospace", outline: "none", boxSizing: "border-box"
                }} />
            </div>

            <div style={{
              background: "#080f08", border: "1px solid #1a3a1a", padding: "12px",
              marginBottom: "16px", display: "flex", justifyContent: "space-between"
            }}>
              <span style={{ color: "#4a7a4a", fontSize: "12px" }}>Amount to pay</span>
              <span style={{ color: "#00ff41", fontSize: "14px", fontWeight: "900" }}>Rs.50.00</span>
            </div>

            {error && (
              <div style={{ padding: "10px", background: "#1a0505", border: "1px solid #ff3333", color: "#ff6666", fontSize: "12px", marginBottom: "14px" }}>{error}</div>
            )}

            <div style={{ display: "flex", gap: "10px" }}>
              <button onClick={() => setStep("info")} style={{
                flex: 1, padding: "12px", background: "none", border: "1px solid #1a3a1a",
                color: "#4a7a4a", fontSize: "11px", letterSpacing: "2px",
                cursor: "pointer", fontFamily: "'Courier New', monospace"
              }}>CANCEL</button>
              <button onClick={handlePay} disabled={loading} style={{
                flex: 2, padding: "12px", background: loading ? "#0a1f0a" : "#00ff41",
                border: "none", color: loading ? "#4a7a4a" : "#000",
                fontSize: "11px", letterSpacing: "2px", fontWeight: "900",
                cursor: loading ? "not-allowed" : "pointer", fontFamily: "'Courier New', monospace"
              }}>{loading ? "PROCESSING..." : "PAY Rs.50"}</button>
            </div>

            <p style={{ color: "#1a3a1a", fontSize: "10px", textAlign: "center", marginTop: "12px" }}>
              Demo mode — no real transaction will occur
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
