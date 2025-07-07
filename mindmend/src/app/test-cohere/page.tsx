"use client";
import { useState } from "react";

export default function TestCoherePage() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const resp = await fetch("/api/generate-youtube-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes }),
      });
      const data = await resp.json();
      if (resp.ok) {
        setResult(data.query);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Test Cohere API</h1>
      <textarea
        className="w-full border rounded p-2 mb-4"
        rows={3}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Enter a mood note..."
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleTest}
        disabled={loading}
      >
        {loading ? "Testing..." : "Generate YouTube Query"}
      </button>
      {result && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
          <strong>Generated Query:</strong> {result}
        </div>
      )}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
} 