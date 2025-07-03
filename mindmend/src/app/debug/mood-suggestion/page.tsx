'use client';

import React, { useState } from 'react';

export default function MoodSuggestionDebug() {
  const [reflection, setReflection] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    setReflection('');
    try {
      const res = await fetch('/api/mood-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mood_score: 3,
          notes: "i slept alot, feeling unproductive"
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Unknown error');
      } else {
        setReflection(data.reflection);
      }
    } catch (err) {
      setError('Network or server error');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Test Gemini Mood Suggestion</h1>
      <button onClick={handleFetch} disabled={loading}>
        {loading ? 'Loading...' : 'Get Suggestion'}
      </button>
      {reflection && (
        <div style={{ marginTop: 24, background: '#f0f0f0', padding: 16 }}>
          <strong>Gemini Suggestion:</strong>
          <div>{reflection}</div>
        </div>
      )}
      {error && (
        <div style={{ marginTop: 24, color: 'red' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
} 