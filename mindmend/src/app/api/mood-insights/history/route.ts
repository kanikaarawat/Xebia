import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('mood_logs')
    .select('mood_score, logged_at')
    .eq('user_id', userId)
    .order('logged_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const moodValues = data.map((d: { mood_score: number }) => d.mood_score);
  const average =
    moodValues.length > 0
      ? moodValues.reduce((sum: number, score: number) => sum + score, 0) / moodValues.length
      : null;

  return NextResponse.json({
    average_mood: average,
    userId,
    moods: data,
  });
}
