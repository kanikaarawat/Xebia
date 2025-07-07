'use client';

import React, { useState } from 'react';

export default function WeeklyAnalysisDebug() {
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
      const res = await fetch(`/api/mood-analysis/weekly?userId=${userId}`);
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
      <h1>Test Weekly Mood Analysis</h1>
      <button onClick={handleFetch} disabled={loading}>
        {loading ? 'Loading...' : 'Get Weekly Analysis'}
      </button>
      
      {/* Sample Cleaned Text Display */}
      <div style={{ marginTop: 32, background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
        <h2 style={{ color: '#1e40af', marginBottom: 16 }}>Sample Pretty Analysis (How it will look in dashboard):</h2>
        <div style={{ 
          background: 'white', 
          padding: 24, 
          borderRadius: 12, 
          border: '1px solid #dbeafe',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Mood Summary */}
            <div style={{ 
              background: 'linear-gradient(to right, #eff6ff, #dbeafe)', 
              borderRadius: '8px', 
              padding: '16px', 
              borderLeft: '4px solid #3b82f6',
              color: '#1e40af'
            }}>
              <h4 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mood Summary
              </h4>
              <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                You've maintained a consistently positive mood this week, averaging 4/5! Your mood shows excellent stability with minimal fluctuations.
              </p>
            </div>

            {/* Key Insights */}
            <div style={{ 
              background: 'linear-gradient(to right, #f0fdf4, #dcfce7)', 
              borderRadius: '8px', 
              padding: '16px', 
              borderLeft: '4px solid #16a34a',
              color: '#166534'
            }}>
              <h4 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Key Insights
              </h4>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                  <span>Strong positive baseline with consistent high ratings</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                  <span>Good mood tracking consistency (71% of days)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                  <span>Stable emotional state with low variance</span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div style={{ 
              background: 'linear-gradient(to right, #faf5ff, #f3e8ff)', 
              borderRadius: '8px', 
              padding: '16px', 
              borderLeft: '4px solid #9333ea',
              color: '#7c3aed'
            }}>
              <h4 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Recommendations
              </h4>
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                  <span>Continue your current positive routines and habits</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                  <span>Try 5-minute daily meditation to maintain this energy</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                  <span>Schedule a therapy session to build on your progress</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: 'currentColor', borderRadius: '50%', marginTop: '8px', flexShrink: 0 }}></div>
                  <span>Practice gratitude journaling to reinforce positive patterns</span>
                </div>
              </div>
            </div>

            {/* Encouragement */}
            <div style={{ 
              background: 'linear-gradient(to right, #fff7ed, #fed7aa)', 
              borderRadius: '8px', 
              padding: '16px', 
              borderLeft: '4px solid #ea580c',
              color: '#c2410c'
            }}>
              <h4 style={{ fontWeight: '600', fontSize: '18px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                </svg>
                Encouragement
              </h4>
              <p style={{ fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                You're doing fantastic! Your consistent positive mood shows strong emotional well-being. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {analysis && (
        <div style={{ marginTop: 24 }}>
          <h2>Weekly Analysis Results:</h2>
          
          <div style={{ marginTop: 16, background: '#f8fafc', padding: 16, borderRadius: 8 }}>
            <h3>Statistics:</h3>
            <pre>{JSON.stringify(analysis.statistics, null, 2)}</pre>
          </div>
          
          <div style={{ marginTop: 16, background: '#f0f9ff', padding: 16, borderRadius: 8 }}>
            <h3>AI Analysis:</h3>
            <div style={{ whiteSpace: 'pre-line' }}>{analysis.analysis}</div>
          </div>
          
          <div style={{ marginTop: 16, background: '#fef3c7', padding: 16, borderRadius: 8 }}>
            <h3>Mood Data:</h3>
            <pre>{JSON.stringify(analysis.moodData, null, 2)}</pre>
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