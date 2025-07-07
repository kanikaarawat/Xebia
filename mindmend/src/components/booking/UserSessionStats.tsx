import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface UserSessionStatsProps {
  userId: string;
  className?: string;
}

export default function UserSessionStats({ userId, className }: UserSessionStatsProps) {
  const [upcomingCount, setUpcomingCount] = useState<number | null>(null);
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    console.log("[UserSessionStats] userId:", userId);
    setLoading(true);
    setError(null);
    const fetchCounts = async () => {
      try {
        const now = new Date().toISOString();
        console.log("[UserSessionStats] now:", now);
        // Upcoming sessions: scheduled_at > now and status = 'scheduled'
        const { count: upcoming, error: upcomingError } = await supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("patient_id", userId)
          .gt("scheduled_at", now)
          .eq("status", "upcoming");
        console.log("[UserSessionStats] upcoming:", upcoming, "upcomingError:", upcomingError);
        // Completed sessions: scheduled_at < now and status = 'completed'
        const { count: completed, error: completedError } = await supabase
          .from("appointments")
          .select("id", { count: "exact", head: true })
          .eq("patient_id", userId)
          .lt("scheduled_at", now)
          .eq("status", "completed");
        console.log("[UserSessionStats] completed:", completed, "completedError:", completedError);
        if (upcomingError || completedError) {
          setError(upcomingError?.message || completedError?.message || "Failed to fetch session stats");
        } else {
          setUpcomingCount(upcoming ?? 0);
          setCompletedCount(completed ?? 0);
        }
      } catch (err: unknown) {
        console.log("[UserSessionStats] catch error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch session stats");
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const fetchAllAppointments = async () => {
      try {
        const { data: allAppointments, error: allError } = await supabase
          .from("appointments")
          .select("*")
          .eq("patient_id", userId);
        console.log("All appointments for user:", allAppointments, allError);
      } catch (err: unknown) {
        console.log("[UserSessionStats] catch error:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch all appointments");
      }
    };
    fetchAllAppointments();
  }, [userId]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Session Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-slate-600">Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-indigo-700 font-medium">Upcoming Sessions</span>
              <span className="font-bold text-lg">{upcomingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-green-700 font-medium">Completed Sessions</span>
              <span className="font-bold text-lg">{completedCount}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 