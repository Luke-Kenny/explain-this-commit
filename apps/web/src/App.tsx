import { useMemo, useState } from "react";

type Audience = "junior" | "senior";

type ExplainResponse = {
  diffStats: {
    filesChanged: number;
    additions: number;
    deletions: number;
    filePaths: string[];
  };
  summary: string[];
  risks: string[];
  assumptions: string[];
  reviewChecklist: string[];
};

export default function App() {
  const [diff, setDiff] = useState("");
  const [audience, setAudience] = useState<Audience>("junior");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ExplainResponse | null>(null);

  const canSubmit = useMemo(
    () => diff.trim().length > 0 && !loading,
    [diff, loading],
  );

  async function onExplain() {
    setError(null);
    setData(null);
    setLoading(true);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ diff, audience }),
      });

      const json = await res.json();

      if (!res.ok) {
        const msg =
          typeof json?.error === "string"
            ? json.error
            : `Request failed with status ${res.status}`;
        setError(msg);
        return;
      }

      setData(json as ExplainResponse);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginBottom: 6 }}>Explain This Commit</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        Paste a <code>git diff</code> and get a structured explanation
      </p>

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
          Audience:
          <select
            value={audience}
            onChange={(e) => setAudience(e.target.value as Audience)}
            disabled={loading}
          >
            <option value="junior">junior</option>
            <option value="senior">senior</option>
          </select>
        </label>

        <button onClick={onExplain} disabled={!canSubmit}>
          {loading ? "Explaining..." : "Explain"}
        </button>

        <button
          onClick={() => {
            setDiff("");
            setData(null);
            setError(null);
          }}
          disabled={loading}
        >
          Clear
        </button>
      </div>

      <textarea
        value={diff}
        onChange={(e) => setDiff(e.target.value)}
        placeholder="Paste your git diff here..."
        rows={14}
        style={{
          width: "100%",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
        }}
        disabled={loading}
      />

      {error && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #f99" }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div style={{ marginTop: 16, display: "grid", gap: 12 }}>
          <section style={{ padding: 12, border: "1px solid #ddd" }}>
            <h2 style={{ marginTop: 0 }}>Diff stats</h2>
            <div>
              <strong>Files:</strong> {data.diffStats.filesChanged}{" "}
              &nbsp;|&nbsp;
              <strong>+{data.diffStats.additions}</strong> &nbsp;|&nbsp;
              <strong>-{data.diffStats.deletions}</strong>
            </div>
            {data.diffStats.filePaths.length > 0 && (
              <>
                <div style={{ marginTop: 8, fontWeight: 600 }}>
                  Files changed
                </div>
                <ul style={{ marginTop: 6 }}>
                  {data.diffStats.filePaths.map((p) => (
                    <li key={p}>
                      <code>{p}</code>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          <Section title="Summary" items={data.summary} />
          <Section
            title="Risks"
            items={data.risks}
            emptyText="No risks detected by heuristics."
          />
          <Section title="Assumptions" items={data.assumptions} />
          <Section title="Review checklist" items={data.reviewChecklist} />
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  items,
  emptyText,
}: {
  title: string;
  items: string[];
  emptyText?: string;
}) {
  return (
    <section style={{ padding: 12, border: "1px solid #ddd" }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {items.length === 0 ? (
        <div style={{ opacity: 0.75 }}>{emptyText ?? "Nothing here."}</div>
      ) : (
        <ul style={{ marginTop: 6 }}>
          {items.map((x, i) => (
            <li key={`${title}-${i}`}>{x}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
