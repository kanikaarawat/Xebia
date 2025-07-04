import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  try {
    const now = new Date().toISOString();
    
    // Calculate today's date range
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    // Upcoming sessions: scheduled_at > now and status = 'upcoming'
    const { count: upcoming, error: upcomingError } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", userId)
      .gt("scheduled_at", now)
      .eq("status", "upcoming");

    // Completed sessions: scheduled_at < now and status = 'completed'
    const { count: completed, error: completedError } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", userId)
      .lt("scheduled_at", now)
      .eq("status", "completed");

    // Today's appointments: scheduled_at between start and end of today
    const { count: todayCount, error: todayError } = await supabase
      .from("appointments")
      .select("id", { count: "exact", head: true })
      .eq("patient_id", userId)
      .gte("scheduled_at", startOfDay.toISOString())
      .lt("scheduled_at", endOfDay.toISOString());

    const { data: statusList } = await supabase
      .from("appointments")
      .select("status")
      .eq("patient_id", userId);

    console.log("Statuses for user:", statusList);

    if (upcomingError || completedError || todayError) {
      return NextResponse.json(
        { error: upcomingError?.message || completedError?.message || todayError?.message || "Failed to fetch session stats" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      upcoming: upcoming ?? 0,
      completed: completed ?? 0,
      today: todayCount ?? 0,
      data: statusList,
      
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch session stats" }, { status: 500 });
  }
} 