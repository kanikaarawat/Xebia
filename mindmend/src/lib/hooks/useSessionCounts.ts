import { useState, useEffect, useCallback } from 'react';

interface SessionCounts {
  upcomingCount: number | null;
  completedCount: number | null;
  todayCount: number | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSessionCounts(userId: string | undefined): SessionCounts {
  const [upcomingCount, setUpcomingCount] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [todayCount, setTodayCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCounts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/user-session-stats?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch session counts');
      }
      const data = await res.json();
      console.log("data", data);
      setUpcomingCount(data.upcoming ?? 0);
      setCompletedCount(data.completed ?? 0);
      setTodayCount(data.today ?? 0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch session counts');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchCounts();
  }, [fetchCounts, userId]);

  return {
    upcomingCount,
    completedCount,
    todayCount,
    loading,
    error,
    refetch: fetchCounts,
  };
}