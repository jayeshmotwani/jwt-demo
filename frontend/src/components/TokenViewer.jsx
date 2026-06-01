const COLORS = { header: "#e11d48", payload: "#0369a1", signature: "#059669" };

const styles = {
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    padding: "1.5rem",
    marginBottom: "1.5rem",
  },
  tokenBox: {
    fontFamily: "monospace",
    fontSize: 12,
    wordBreak: "break-all",
    padding: "0.75rem",
    background: "#0f172a",
    borderRadius: 6,
    lineHeight: 1.6,
    marginBottom: "1.25rem",
  },
  panels: { display: "flex", gap: "1rem", flexWrap: "wrap" },
  panel: (color) => ({
    flex: "1 1 200px",
    border: `2px solid ${color}`,
    borderRadius: 6,
    overflow: "hidden",
  }),
  panelHeader: (color) => ({
    background: color,
    color: "#fff",
    fontWeight: 700,
    fontSize: 12,
    padding: "0.35rem 0.6rem",
    letterSpacing: "0.05em",
    textTransform: "uppercase",
  }),
  pre: {
    margin: 0,
    padding: "0.75rem",
    fontSize: 12,
    fontFamily: "monospace",
    background: "#f8fafc",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
  },
  sigPre: {
    margin: 0,
    padding: "0.75rem",
    fontSize: 11,
    fontFamily: "monospace",
    background: "#f8fafc",
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    color: "#64748b",
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

export default function TokenViewer({ token }) {
  const parts = token.split(".");
  const [rawHeader, rawPayload, rawSignature] = parts;

  const header = decodeBase64(rawHeader);
  const payload = decodeBase64(rawPayload);

  return (
    <div style={styles.card}>
      <h3 style={{ margin: "0 0 0.75rem" }}>Your JWT Token</h3>
      <div style={styles.tokenBox}>
        <span style={{ color: COLORS.header }}>{rawHeader}</span>
        <span style={{ color: "#94a3b8" }}>.</span>
        <span style={{ color: COLORS.payload }}>{rawPayload}</span>
        <span style={{ color: "#94a3b8" }}>.</span>
        <span style={{ color: COLORS.signature }}>{rawSignature}</span>
      </div>

      <div style={styles.panels}>
        <div style={styles.panel(COLORS.header)}>
          <div style={styles.panelHeader(COLORS.header)}>Header</div>
          <pre style={styles.pre}>
            {header ? JSON.stringify(header, null, 2) : rawHeader}
          </pre>
        </div>

        <div style={styles.panel(COLORS.payload)}>
          <div style={styles.panelHeader(COLORS.payload)}>Payload</div>
          <pre style={styles.pre}>
            {payload
              ? JSON.stringify(
                  {
                    ...payload,
                    iat: payload.iat
                      ? `${payload.iat} (${new Date(payload.iat * 1000).toISOString()})`
                      : payload.iat,
                    exp: payload.exp
                      ? `${payload.exp} (${new Date(payload.exp * 1000).toISOString()})`
                      : payload.exp,
                  },
                  null,
                  2
                )
              : rawPayload}
          </pre>
        </div>

        <div style={styles.panel(COLORS.signature)}>
          <div style={styles.panelHeader(COLORS.signature)}>Signature</div>
          <pre style={styles.sigPre}>{rawSignature}</pre>
        </div>
      </div>
    </div>
  );
}
