import React, { useState, useRef } from "react";

const BREATH_DURATION = 4000; // ms for inhale/exhale

export default function BreathingExercise() {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    setRunning(true);
    setPhase('inhale');
    setProgress(0);
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress((elapsed % BREATH_DURATION) / BREATH_DURATION);
      if (elapsed % (BREATH_DURATION * 2) < BREATH_DURATION) {
        setPhase('inhale');
      } else {
        setPhase('exhale');
      }
    }, 16);
  };

  const stop = () => {
    setRunning(false);
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <h3 className="font-semibold text-indigo-700 mb-2">Breathing Exercise</h3>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Follow the circle: Inhale as it grows, exhale as it shrinks. Repeat for 1-2 minutes to relax.
      </p>
      <div className="my-4 flex items-center justify-center" style={{ height: 120 }}>
        <div
          className={`transition-all duration-1000 rounded-full bg-indigo-200 flex items-center justify-center`}
          style={{
            width: running ? (phase === 'inhale' ? 100 + progress * 40 : 140 - progress * 40) : 100,
            height: running ? (phase === 'inhale' ? 100 + progress * 40 : 140 - progress * 40) : 100,
            boxShadow: '0 0 0 8px #e0e7ff',
          }}
        >
          <span className="text-indigo-700 font-bold text-lg">
            {running ? (phase === 'inhale' ? 'Inhale' : 'Exhale') : 'Ready?'}
          </span>
        </div>
      </div>
      {running ? (
        <button
          className="mt-2 px-4 py-2 bg-rose-100 text-rose-700 rounded-lg font-medium hover:bg-rose-200 transition"
          onClick={stop}
        >
          Stop
        </button>
      ) : (
        <button
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition"
          onClick={start}
        >
          Start
        </button>
      )}
    </div>
  );
} 