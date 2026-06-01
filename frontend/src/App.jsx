import DemoPanel from "./components/DemoPanel";

// TODO: Replace the heading and description with your concept name and summary
export default function App() {
  async function handleDemoSubmit(input) {
    const res = await fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  }

  return (
    <main>
      <h1>TODO: Concept Name — codecrumbs.in</h1>
      <p>TODO: One-line description of what this demo teaches.</p>
      <DemoPanel onSubmit={handleDemoSubmit} />
    </main>
  );
}
