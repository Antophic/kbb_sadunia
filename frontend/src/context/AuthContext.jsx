import { createContext, useState, useContext, useEffect, useRef } from 'react';
import { apiGetMe, apiLogout } from '../services/api';

const AuthContext = createContext();
const AUTH_HINT_KEY = "kbb_auth_session";

function hasAuthHint() {
  try {
    return localStorage.getItem(AUTH_HINT_KEY) === "1";
  } catch {
    return false;
  }
}

function setAuthHint(enabled) {
  try {
    if (enabled) {
      localStorage.setItem(AUTH_HINT_KEY, "1");
    } else {
      localStorage.removeItem(AUTH_HINT_KEY);
    }
  } catch {
    // Ignore storage errors in private browsing modes.
  }
}

function shouldCheckSessionOnLoad() {
  if (typeof window === "undefined") return false;
  return window.location.pathname.startsWith("/admin") || hasAuthHint();
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => shouldCheckSessionOnLoad());
  const verificationAttempted = useRef(false);

  // Fungsi untuk verifikasi session dari server
  const verifySession = async () => {
    try {
      const res = await apiGetMe();
      if (res.user) {
        setUser(res.user);
        return true;
      }
    } catch (err) {
      if (err.message === "Unauthorized") {
        setAuthHint(false);
      }
      if (err.message !== "Unauthorized") {
        console.warn("Session verification failed:", err.message);
      }
    }
    return false;
  };

  useEffect(() => {
    // Check session on app load - hanya sekali
    if (!verificationAttempted.current) {
      verificationAttempted.current = true;
      const runVerification = () => verifySession().finally(() => {
        setLoading(false);
      });
      const isAdminRoute = shouldCheckSessionOnLoad() && window.location.pathname.startsWith("/admin");
      if (!shouldCheckSessionOnLoad()) return undefined;
      if (isAdminRoute) {
        runVerification();
        return undefined;
      }
      if ("requestIdleCallback" in window) {
        const idleId = window.requestIdleCallback(runVerification, { timeout: 1500 });
        return () => window.cancelIdleCallback(idleId);
      }
      const timeoutId = window.setTimeout(runVerification, 300);
      return () => window.clearTimeout(timeoutId);
    }
  }, []);

  const login = (userData) => {
    setAuthHint(true);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (err) {
      console.error("Logout error", err);
    }
    setAuthHint(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
