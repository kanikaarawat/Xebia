'use client';

import React, { useState } from 'react';

export default function ProgressAnalysisDebug() {
  const [analysis, setAnalysis] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetch = async () => {
    setLoading(true);
    setError('');
    setAnalysis(null);
    try {
      // You'll need to replace this with an actual user ID from your database
      const userId = '6642902a-a564-4310-b858-85f8ff6f601c'; // Example user ID
      const res = await fetch(`/api/mood-analysis/progress?userId=${userId}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || data.suggestion || 'Unknown error');
      } else {
        setAnalysis(data);
      }
    } catch (err) {
      setError('Network or server error');
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 32 }}>
      <h1>Test Progress Analysis API</h1>
      <button onClick={handleFetch} disabled={loading}>
        {loading ? 'Loading...' : 'Get Progress Analysis'}
      </button>
      
      {analysis && (
        <div style={{ marginTop: 24 }}>
          <h2>Progress Analysis Results:</h2>
          
          <div style={{ marginTop: 16, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
            <h3>Statistics:</h3>
            <pre>{JSON.stringify(analysis.statistics, null, 2)}</pre>
          </div>
          
          <div style={{ marginTop: 16, background: '#f0f9ff', padding: 16, borderRadius: 8 }}>
            <h3>AI Progress Analysis:</h3>
            <div style={{ whiteSpace: 'pre-line' }}>{analysis.analysis}</div>
          </div>
          
          <div style={{ marginTop: 16, background: '#fef3c7', padding: 16, borderRadius: 8 }}>
            <h3>Weekly Trends:</h3>
            <pre>{JSON.stringify(analysis.weeklyTrends, null, 2)}</pre>
          </div>
          
          <div style={{ marginTop: 16, background: '#f0fdf4', padding: 16, borderRadius: 8 }}>
            <h3>Mood Data (Last 30 days):</h3>
            <pre>{JSON.stringify(analysis.moodData, null, 2)}</pre>
          </div>
          
          <div style={{ marginTop: 16, background: '#fdf2f8', padding: 16, borderRadius: 8 }}>
            <h3>Session Data:</h3>
            <pre>{JSON.stringify(analysis.sessionData, null, 2)}</pre>
          </div>
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