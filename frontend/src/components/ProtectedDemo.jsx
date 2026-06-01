import { useState } from "react";

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  button: {
    background: "#4f46e5",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "0.6rem 1.5rem",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  section: { marginTop: "1rem" },
  label: { fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: "0.25rem", display: "block" },
  pre: {
    fontFamily: "monospace",
    fontSize: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "0.75rem",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    margin: 0,
  },
  successBadge: {
    display: "inline-block",
    background: "#dcfce7",
    color: "#166534",
    border: "1px solid #86efac",
    borderRadius: 4,
    padding: "0.2rem 0.6rem",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: "0.75rem",
  },
  errorBadge: {
    display: "inline-block",
    background: "#fef2f2",
    color: "#b91c1c",
    border: "1px solid #fca5a5",
    borderRadius: 4,
    padding: "0.2rem 0.6rem",
    fontSize: 13,
    fontWeight: 600,
    marginBottom: "0.75rem",
  },
};

export default function ProtectedDemo({ token }) {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  async function callProtected() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/protected", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setResult({ ok: res.ok, status: res.status, data });
    } catch (err) {
      setResult({ ok: false, status: 0, data: { detail: err.message } });
    } finally {
      setLoading(false);
    }
  }

  const requestSnippet = `GET /api/protected HTTP/1.1
Authorization: Bearer ${token.slice(0, 40)}…`;

  return (
    <div style={styles.card}>
      <h2 style={{ margin: "0 0 0.25rem" }}>Stage 2 — Use the Token</h2>
      <p style={{ margin: "0 0 1rem", color: "#64748b", fontSize: 14 }}>
        Send the token in an <code>Authorization: Bearer</code> header to access a protected route.
      </p>

      <button style={styles.button} onClick={callProtected} disabled={loading}>
        {loading ? "Calling…" : "Call Protected Route"}
      </button>

      <div style={styles.section}>
        <span style={styles.label}>Request sent</span>
        <pre style={styles.pre}>{requestSnippet}</pre>
      </div>

      {result && (
        <div style={styles.section}>
          <div>
            {result.ok ? (
              <span style={styles.successBadge}>✅ {result.status} OK</span>
            ) : (
              <span style={styles.errorBadge}>❌ {result.status} Error</span>
            )}
          </div>
          <span style={styles.label}>Response</span>
          <pre style={styles.pre}>{JSON.stringify(result.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
