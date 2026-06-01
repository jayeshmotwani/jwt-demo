import { useState } from "react";
import LoginForm from "./components/LoginForm";
import TokenViewer from "./components/TokenViewer";
import ProtectedDemo from "./components/ProtectedDemo";
import TamperDemo from "./components/TamperDemo";
import RefreshDemo from "./components/RefreshDemo";
import RevocationDemo from "./components/RevocationDemo";

const styles = {
  root: {
    minHeight: "100vh",
    background: "#f1f5f9",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    color: "#1e293b",
  },
  header: {
    background: "#0f172a",
    color: "#fff",
    padding: "1.25rem 2rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "0.75rem",
  },
  headerLeft: { display: "flex", alignItems: "baseline", gap: "0.75rem" },
  headerTitle: { margin: 0, fontSize: "1.25rem", fontWeight: 700 },
  headerSub: { fontSize: 13, color: "#94a3b8" },
  logoutBtn: {
    background: "transparent",
    border: "1px solid #475569",
    borderRadius: 6,
    padding: "0.4rem 1rem",
    fontSize: 13,
    cursor: "pointer",
    color: "#94a3b8",
  },
  main: { maxWidth: 760, margin: "0 auto", padding: "2rem 1rem" },
  resetBtn: {
    background: "transparent",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    padding: "0.4rem 1rem",
    fontSize: 13,
    cursor: "pointer",
    marginBottom: "1.5rem",
    color: "#64748b",
  },
};

export default function App() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);

  function handleToken({ access_token, refresh_token }) {
    setToken(access_token);
    setRefreshToken(refresh_token);
  }

  function handleSignOut() {
    setToken(null);
    setRefreshToken(null);
  }

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.headerTitle}>JWT Authentication</h1>
          <span style={styles.headerSub}>codecrumbs.in — interactive demo</span>
        </div>
        {token && (
          <button style={styles.logoutBtn} onClick={handleSignOut}>
            ← Start over
          </button>
        )}
      </header>

      <main style={styles.main}>
        {!token ? (
          <LoginForm onToken={handleToken} />
        ) : (
          <>
            <TokenViewer token={token} />
            <ProtectedDemo token={token} />
            <TamperDemo token={token} />
            <RefreshDemo
              token={token}
              refreshToken={refreshToken}
              onNewToken={setToken}
            />
            <RevocationDemo token={token} />
          </>
        )}
      </main>
    </div>
  );
}
