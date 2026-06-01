import { useState, useEffect, useRef } from "react";

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  countdown: (urgent) => ({
    display: "inline-block",
    fontFamily: "monospace",
    fontSize: 28,
    fontWeight: 700,
    color: urgent ? "#b91c1c" : "#0369a1",
    background: urgent ? "#fef2f2" : "#eff6ff",
    border: `2px solid ${urgent ? "#fca5a5" : "#bfdbfe"}`,
    borderRadius: 8,
    padding: "0.5rem 1.25rem",
    marginBottom: "1rem",
  }),
  countdownLabel: { fontSize: 12, color: "#64748b", marginBottom: "0.25rem", display: "block" },
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
  buttonDisabled: { opacity: 0.6, cursor: "not-allowed" },
  banner: (variant) => ({
    marginTop: "1rem",
    padding: "0.75rem 1rem",
    borderRadius: 6,
    fontSize: 14,
    ...(variant === "success"
      ? { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534" }
      : { background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c" }),
  }),
  comparison: {
    marginTop: "1.25rem",
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
  },
  compPanel: (color) => ({
    flex: "1 1 200px",
    border: `2px solid ${color}`,
    borderRadius: 6,
    overflow: "hidden",
  }),
  compHeader: (color) => ({
    background: color,
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    padding: "0.35rem 0.75rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  }),
  compPre: {
    margin: 0,
    padding: "0.75rem",
    fontSize: 12,
    fontFamily: "monospace",
    background: "#f8fafc",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
};

function decodeBase64(str) {
  try {
    const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
    return JSON.parse(atob(padded.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function getPayload(token) {
  const parts = token.split(".");
  return parts[1] ? decodeBase64(parts[1]) : null;
}

function formatClaims(payload) {
  if (!payload) return "—";
  return [
    `iat: ${payload.iat}`,
    `    (${new Date(payload.iat * 1000).toISOString()})`,
    `exp: ${payload.exp}`,
    `    (${new Date(payload.exp * 1000).toISOString()})`,
    `jti: ${payload.jti || "—"}`,
  ].join("\n");
}

export default function RefreshDemo({ token, refreshToken, onNewToken }) {
  const [secondsLeft, setSecondsLeft] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [oldClaims, setOldClaims] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const payload = getPayload(token);
    if (!payload) return;

    setResult(null);
    setOldClaims(null);

    function tick() {
      const now = Math.floor(Date.now() / 1000);
      setSecondsLeft(Math.max(0, payload.exp - now));
    }

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => clearInterval(intervalRef.current);
  }, [token]);

  async function handleRefresh() {
    setLoading(true);
    const prevPayload = getPayload(token);
    setOldClaims(prevPayload);
    try {
      const res = await fetch("/api/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Refresh failed");
      onNewToken(data.access_token);
      setResult({ ok: true, newPayload: getPayload(data.access_token) });
    } catch (err) {
      setResult({ ok: false, error: err.message });
    } finally {
      setLoading(false);
    }
  }

  const expired = secondsLeft === 0;
  const urgent = secondsLeft !== null && secondsLeft <= 30;

  return (
    <div style={styles.card}>
      <h2 style={{ margin: "0 0 0.25rem" }}>Stage 4 — Refresh Token Flow</h2>
      <p style={{ margin: "0 0 1.25rem", color: "#64748b", fontSize: 14 }}>
        Access tokens are intentionally short-lived (2 minutes here). When one expires, a
        long-lived <strong>refresh token</strong> lets the client silently get a new access
        token — no re-login required.
      </p>

      {secondsLeft !== null && (
        <div>
          <span style={styles.countdownLabel}>Access token expires in</span>
          <div style={styles.countdown(urgent)}>
            {expired ? "EXPIRED" : `${secondsLeft}s`}
          </div>
        </div>
      )}

      {expired && (
        <div style={{ ...styles.banner("error"), marginTop: 0, marginBottom: "1rem" }}>
          The access token has expired. "Call Protected Route" in Stage 2 will now return
          401 TokenExpiredError. Use the button below to get a new one.
        </div>
      )}

      <button
        style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
        onClick={handleRefresh}
        disabled={loading || !refreshToken}
      >
        {loading ? "Refreshing…" : "Refresh Access Token"}
      </button>

      {result && result.ok && (
        <>
          <div style={styles.banner("success")}>
            ✅ New access token issued — you were never logged out.
          </div>

          <div style={styles.comparison}>
            <div style={styles.compPanel("#94a3b8")}>
              <div style={styles.compHeader("#94a3b8")}>Old Token Claims</div>
              <pre style={styles.compPre}>{formatClaims(oldClaims)}</pre>
            </div>
            <div style={styles.compPanel("#4f46e5")}>
              <div style={styles.compHeader("#4f46e5")}>New Token Claims</div>
              <pre style={styles.compPre}>{formatClaims(result.newPayload)}</pre>
            </div>
          </div>
        </>
      )}

      {result && !result.ok && (
        <div style={styles.banner("error")}>❌ {result.error}</div>
      )}
    </div>
  );
}
