import { useState, useEffect } from "react";

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  textarea: (hasError) => ({
    width: "100%",
    fontFamily: "monospace",
    fontSize: 12,
    padding: "0.6rem 0.75rem",
    border: `1.5px solid ${hasError ? "#f87171" : "#cbd5e1"}`,
    borderRadius: 6,
    boxSizing: "border-box",
    resize: "vertical",
    minHeight: 80,
    lineHeight: 1.5,
    marginBottom: "0.75rem",
  }),
  button: {
    background: "#0f172a",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "0.6rem 1.5rem",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
  },
  result: (valid) => ({
    marginTop: "1rem",
    padding: "1rem",
    background: valid ? "#f0fdf4" : "#fef2f2",
    border: `1px solid ${valid ? "#86efac" : "#fca5a5"}`,
    borderRadius: 6,
  }),
  badge: (valid) => ({
    fontWeight: 700,
    fontSize: 15,
    color: valid ? "#166534" : "#b91c1c",
    marginBottom: "0.5rem",
    display: "block",
  }),
  errorType: {
    fontFamily: "monospace",
    fontSize: 13,
    fontWeight: 600,
    color: "#7c3aed",
    display: "block",
    marginBottom: "0.4rem",
  },
  explanation: { fontSize: 13, color: "#374151" },
  pre: {
    fontFamily: "monospace",
    fontSize: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 6,
    padding: "0.75rem",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    margin: "0.5rem 0 0",
  },
};

export default function TamperDemo({ token }) {
  const [editedToken, setEditedToken] = useState(token);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setEditedToken(token);
    setResult(null);
  }, [token]);

  async function verify() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: editedToken }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ valid: false, error_type: "NetworkError", error_message: err.message });
    } finally {
      setLoading(false);
    }
  }

  const isDirty = editedToken !== token;

  return (
    <div style={styles.card}>
      <h2 style={{ margin: "0 0 0.25rem" }}>Stage 3 — Tamper &amp; Break</h2>
      <p style={{ margin: "0 0 1rem", color: "#64748b", fontSize: 14 }}>
        Edit the token below — change a character, remove a segment, or paste anything — then verify it.
      </p>
      {isDirty && (
        <p style={{ fontSize: 12, color: "#92400e", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 4, padding: "0.3rem 0.6rem", marginBottom: "0.75rem" }}>
          Token has been modified.
        </p>
      )}
      <textarea
        style={styles.textarea(result && !result.valid)}
        value={editedToken}
        onChange={(e) => setEditedToken(e.target.value)}
        spellCheck={false}
      />
      <button style={styles.button} onClick={verify} disabled={loading || !editedToken}>
        {loading ? "Verifying…" : "Verify Token"}
      </button>

      {result && (
        <div style={styles.result(result.valid)}>
          <span style={styles.badge(result.valid)}>
            {result.valid ? "✅ Valid Token" : "❌ Invalid Token"}
          </span>
          {!result.valid && (
            <>
              <span style={styles.errorType}>{result.error_type}</span>
              <span style={styles.explanation}>{result.error_message}</span>
            </>
          )}
          {result.valid && result.payload && (
            <pre style={styles.pre}>{JSON.stringify(result.payload, null, 2)}</pre>
          )}
        </div>
      )}
    </div>
  );
}
