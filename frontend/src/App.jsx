import { useState } from "react";
import LoginForm from "./components/LoginForm";
import TokenViewer from "./components/TokenViewer";
import ProtectedDemo from "./components/ProtectedDemo";
import TamperDemo from "./components/TamperDemo";

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
    alignItems: "baseline",
    gap: "0.75rem",
  },
  headerTitle: { margin: 0, fontSize: "1.25rem", fontWeight: 700 },
  headerSub: { fontSize: 13, color: "#94a3b8" },
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

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <h1 style={styles.headerTitle}>JWT Authentication</h1>
        <span style={styles.headerSub}>codecrumbs.in — interactive demo</span>
      </header>

      <main style={styles.main}>
        {!token ? (
          <LoginForm onToken={setToken} />
        ) : (
          <>
            <button style={styles.resetBtn} onClick={() => setToken(null)}>
              ← Sign out / start over
            </button>
            <TokenViewer token={token} />
            <ProtectedDemo token={token} />
            <TamperDemo token={token} />
          </>
        )}
      </main>
    </div>
  );
}
