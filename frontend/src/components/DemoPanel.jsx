import { useState } from "react";

// TODO: Rename and restyle this component to match your concept
export default function DemoPanel({ onSubmit }) {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setLoading(true);
    try {
      const result = await onSubmit(input);
      setResponse(result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ fontFamily: "sans-serif", maxWidth: 480, margin: "2rem auto" }}>
      {/* TODO: Replace label text with something relevant to your concept */}
      <label htmlFor="demo-input">
        <strong>Input</strong>
      </label>
      <br />
      <input
        id="demo-input"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="TODO: describe what to type here"
        style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
      />
      <br />
      <button
        onClick={handleSubmit}
        disabled={loading || !input}
        style={{ marginTop: "1rem", padding: "0.5rem 1.5rem" }}
      >
        {loading ? "Loading…" : "Submit"}  {/* TODO: Change button label */}
      </button>

      {response && (
        <pre
          style={{
            marginTop: "1.5rem",
            background: "#f4f4f4",
            padding: "1rem",
            borderRadius: 4,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
}
