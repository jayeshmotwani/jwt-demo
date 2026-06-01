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
  githubLink: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    color: "#e2e8f0",
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 500,
    padding: "0.4rem 0.75rem",
    borderRadius: 6,
    border: "1px solid #334155",
    background: "#1e293b",
    transition: "border-color 0.15s",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
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
        <div style={styles.headerRight}>
          <a
            href="https://github.com/jayeshmotwani/jwt-demo"
            target="_blank"
            rel="noopener noreferrer"
            style={styles.githubLink}
          >
            <svg height="16" width="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38
                0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13
                -.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87
                2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95
                0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21
                2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04
                2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82
                2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0
                1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            View on GitHub
          </a>
          {token && (
            <button style={styles.logoutBtn} onClick={handleSignOut}>
              ← Start over
            </button>
          )}
        </div>
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
