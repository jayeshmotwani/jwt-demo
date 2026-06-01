import { useState } from "react";

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  button: (variant) => ({
    border: "none",
    borderRadius: 6,
    padding: "0.6rem 1.5rem",
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    marginRight: "0.75rem",
    marginTop: "0.5rem",
    ...(variant === "danger"
      ? { background: "#dc2626", color: "#fff" }
      : variant === "ghost"
      ? { background: "transparent", border: "1px solid #cbd5e1", color: "#475569" }
      : { background: "#0f172a", color: "#fff" }),
  }),
  buttonDisabled: { opacity: 0.6, cursor: "not-allowed" },
  banner: (variant) => ({
    marginTop: "1rem",
    padding: "0.75rem 1rem",
    borderRadius: 6,
    fontSize: 14,
    ...(variant === "success"
      ? { background: "#f0fdf4", border: "1px solid #86efac", color: "#166534" }
      : variant === "warning"
      ? { background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" }
      : { background: "#fef2f2", border: "1px solid #fca5a5", color: "#b91c1c" }),
  }),
  tokenField: {
    width: "100%",
    fontFamily: "monospace",
    fontSize: 11,
    padding: "0.6rem 0.75rem",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    boxSizing: "border-box",
    background: "#f8fafc",
    color: "#475569",
    resize: "vertical",
    minHeight: 64,
    marginTop: "0.5rem",
  },
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
  label: { fontWeight: 600, fontSize: 13, color: "#475569", marginBottom: "0.25rem", display: "block", marginTop: "1rem" },
  divider: { border: "none", borderTop: "1px dashed #e2e8f0", margin: "1.25rem 0" },
  hint: { fontSize: 12, color: "#64748b", marginTop: "0.5rem" },
};

export default function RevocationDemo({ token }) {
  const [naiveLoggedOut, setNaiveLoggedOut] = useState(false);
  const [revoked, setRevoked] = useState(false);
  const [proveResult, setProveResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [revokeLoading, setRevokeLoading] = useState(false);

  function handleNaiveLogout() {
    setNaiveLoggedOut(true);
    setRevoked(false);
    setProveResult(null);
  }

  async function handleProveIt() {
    setLoading(true);
    setProveResult(null);
    try {
      const res = await fetch("/api/protected", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setProveResult({ status: res.status, ok: res.ok, data });
    } catch (err) {
      setProveResult({ status: 0, ok: false, data: { detail: err.message } });
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke() {
    setRevokeLoading(true);
    try {
      const res = await fetch("/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setRevoked(true);
        setProveResult(null);
      }
    } catch {
      // ignore
    } finally {
      setRevokeLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      <h2 style={{ margin: "0 0 0.25rem" }}>Stage 5 — Token Revocation: The JWT Tradeoff</h2>
      <p style={{ margin: "0 0 1.25rem", color: "#64748b", fontSize: 14 }}>
        JWTs are stateless — the server issues them but doesn't track them. That creates a
        subtle problem when you want to invalidate a token before it naturally expires.
      </p>

      {/* Part A */}
      <strong style={{ fontSize: 14 }}>Part A — The naive logout (spot the flaw)</strong>

      {!naiveLoggedOut ? (
        <div style={{ marginTop: "0.75rem" }}>
          <button
            style={styles.button("danger")}
            onClick={handleNaiveLogout}
          >
            Logout (client-side only)
          </button>
        </div>
      ) : (
        <>
          <div style={styles.banner("warning")}>
            ⚠️ You've been logged out — but your access token is still technically valid
            until it expires. If someone copied it, they can still use it for up to 2
            minutes. This is the JWT stateless tradeoff.
          </div>

          <span style={styles.label}>The token that was "deleted" from state</span>
          <textarea
            style={styles.tokenField}
            readOnly
            value={token}
          />

          <div style={{ marginTop: "0.75rem" }}>
            <button
              style={{
                ...styles.button("ghost"),
                ...(loading ? styles.buttonDisabled : {}),
              }}
              onClick={handleProveIt}
              disabled={loading}
            >
              {loading ? "Calling…" : "Prove it — use the token anyway"}
            </button>
          </div>

          {proveResult && (
            <div style={{ marginTop: "0.75rem" }}>
              {proveResult.ok ? (
                <div style={styles.banner("warning")}>
                  ⚠️ Got <strong>{proveResult.status} OK</strong> — the server accepted it.
                  "Logging out" on the client alone doesn't invalidate the token.
                </div>
              ) : (
                <div style={styles.banner("success")}>
                  ✅ Got <strong>{proveResult.status}</strong> —{" "}
                  {proveResult.data?.detail?.error_type === "RevokedToken"
                    ? "Token is now dead server-side."
                    : "Token rejected."}
                </div>
              )}
              <pre style={styles.pre}>{JSON.stringify(proveResult.data, null, 2)}</pre>
            </div>
          )}

          {/* Part B */}
          {!revoked && (
            <>
              <hr style={styles.divider} />
              <strong style={{ fontSize: 14 }}>Part B — The blocklist fix (the real solution)</strong>
              <p style={{ fontSize: 14, color: "#64748b", margin: "0.5rem 0 0.75rem" }}>
                The backend stores a unique <code>jti</code> (JWT ID) in every token. A
                proper logout sends that ID to a server-side denylist.
              </p>
              <button
                style={{
                  ...styles.button("default"),
                  ...(revokeLoading ? styles.buttonDisabled : {}),
                }}
                onClick={handleRevoke}
                disabled={revokeLoading}
              >
                {revokeLoading ? "Revoking…" : "Now revoke it properly"}
              </button>
            </>
          )}

          {revoked && (
            <>
              <hr style={styles.divider} />
              <div style={styles.banner("success")}>
                ✅ Token is now dead server-side — even if someone copied it, it won't work.
              </div>
              <p style={styles.hint}>
                The server checked the token's unique ID (<code>jti</code>) against a
                blocklist. Real apps use Redis for this.
              </p>
              <div style={{ marginTop: "0.75rem" }}>
                <button
                  style={{
                    ...styles.button("ghost"),
                    ...(loading ? styles.buttonDisabled : {}),
                  }}
                  onClick={handleProveIt}
                  disabled={loading}
                >
                  {loading ? "Calling…" : "Prove it — use the token anyway"}
                </button>
              </div>

              {proveResult && (
                <div style={{ marginTop: "0.75rem" }}>
                  {proveResult.ok ? (
                    <div style={styles.banner("error")}>
                      ❌ Got {proveResult.status} — this shouldn't happen if revocation worked.
                    </div>
                  ) : (
                    <div style={styles.banner("success")}>
                      ✅ Got <strong>{proveResult.status}</strong> —{" "}
                      {proveResult.data?.detail?.error_type === "RevokedToken"
                        ? "RevokedToken. The jti blocklist stopped it cold."
                        : "Token rejected."}
                    </div>
                  )}
                  <pre style={styles.pre}>{JSON.stringify(proveResult.data, null, 2)}</pre>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
