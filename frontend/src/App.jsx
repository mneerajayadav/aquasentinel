import { useState, useEffect } from "react";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("aqua_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("aqua_user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("aqua_user");
    setUser(null);
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
