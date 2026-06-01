import { useState } from "react";

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  label: { display: "block", fontWeight: 600, marginBottom: "0.25rem", fontSize: 14 },
  input: {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #cbd5e1",
    borderRadius: 6,
    fontSize: 14,
    boxSizing: "border-box",
    marginBottom: "0.75rem",
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
  buttonDisabled: { opacity: 0.6, cursor: "not-allowed" },
  error: {
    marginTop: "0.75rem",
    padding: "0.6rem 0.75rem",
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    borderRadius: 6,
    color: "#b91c1c",
    fontSize: 14,
  },
  hint: { fontSize: 12, color: "#64748b", marginBottom: "1rem" },
};

export default function LoginForm({ onToken }) {
  const [username, setUsername] = useState("demo");
  const [password, setPassword] = useState("secret");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Login failed");
      onToken({ access_token: data.access_token, refresh_token: data.refresh_token });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={styles.card}>
      <h2 style={{ margin: "0 0 0.25rem" }}>Stage 1 — Sign In</h2>
      <p style={{ margin: "0 0 1rem", color: "#64748b", fontSize: 14 }}>
        Log in with the demo credentials to receive a JWT access token.
      </p>
      <p style={styles.hint}>Demo credentials are pre-filled: <code>demo / secret</code></p>
      <form onSubmit={handleSubmit}>
        <label style={styles.label} htmlFor="username">Username</label>
        <input
          id="username"
          style={styles.input}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label style={styles.label} htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          style={styles.input}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>
      {error && <div style={styles.error}>{error}</div>}
    </div>
  );
}
