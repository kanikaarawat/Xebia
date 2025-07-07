import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabaseClient';
import { subDays, format } from 'date-fns';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  try {
    // Get data for the last 30 days
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate = new Date(now.getTime() + istOffset);
    const startDate = subDays(istDate, 29);
    
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(istDate, 'yyyy-MM-dd');

    // Fetch mood logs for the last 30 days
    const { data: moodLogs, error: moodError } = await supabase
      .from('mood_logs')
      .select('id, user_id, mood_score, notes, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', startDateStr)
      .lte('logged_at', endDateStr)
      .order('logged_at', { ascending: true });

    if (moodError) {
      console.error('Mood logs error:', moodError);
      return NextResponse.json({ error: 'Failed to fetch mood data' }, { status: 500 });
    }

    // Fetch appointments/sessions data
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('id, user_id, therapist_id, appointment_date, status, created_at')
      .eq('user_id', userId)
      .gte('appointment_date', startDateStr)
      .lte('appointment_date', endDateStr)
      .order('appointment_date', { ascending: true });

    if (appointmentError) {
      console.error('Appointments error:', appointmentError);
      return NextResponse.json({ error: 'Failed to fetch appointment data' }, { status: 500 });
    }

    // Calculate comprehensive statistics
    const moodScores = moodLogs?.map(log => log.mood_score) || [];
    const averageMood = moodScores.length > 0 ? moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length : 0;
    const moodVariance = moodScores.length > 0 ? Math.max(...moodScores) - Math.min(...moodScores) : 0;
    const daysTracked = moodLogs?.length || 0;
    const consistency = (daysTracked / 30) * 100;

    const totalSessions = appointments?.length || 0;
    const completedSessions = appointments?.filter(apt => apt.status === 'completed').length || 0;
    const upcomingSessions = appointments?.filter(apt => apt.status === 'scheduled').length || 0;
    const sessionCompletionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Calculate mood trends
    const weeklyMoods = [];
    for (let i = 0; i < 4; i++) {
      const weekStart = subDays(istDate, 29 - (i * 7));
      const weekEnd = subDays(istDate, 22 - (i * 7));
      const weekStartStr = format(weekStart, 'yyyy-MM-dd');
      const weekEndStr = format(weekEnd, 'yyyy-MM-dd');
      
      const weekLogs = moodLogs?.filter(log => 
        log.logged_at >= weekStartStr && log.logged_at <= weekEndStr
      ) || [];
      
      const weekAvg = weekLogs.length > 0 
        ? weekLogs.reduce((sum, log) => sum + log.mood_score, 0) / weekLogs.length 
        : 0;
      
      weeklyMoods.push({
        week: i + 1,
        average: weekAvg,
        daysTracked: weekLogs.length
      });
    }

    // Check if there's enough data for analysis
    if (daysTracked === 0) {
      return NextResponse.json({ 
        error: 'No progress data found for the past 30 days',
        suggestion: 'Start logging your mood and booking sessions to get personalized progress insights!'
      }, { status: 404 });
    }

    // Get Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
    }

    // Prepare data for Gemini
    const progressData = {
      moodLogs: moodLogs?.map(log => ({
        date: log.logged_at,
        score: log.mood_score,
        notes: log.notes || ''
      })) || [],
      appointments: appointments?.map(apt => ({
        date: apt.appointment_date,
        status: apt.status,
        created_at: apt.created_at
      })) || [],
      statistics: {
        averageMood: parseFloat(averageMood.toFixed(1)),
        moodVariance,
        daysTracked,
        consistency: parseFloat(consistency.toFixed(1)),
        totalSessions,
        completedSessions,
        upcomingSessions,
        sessionCompletionRate: parseFloat(sessionCompletionRate.toFixed(1))
      },
      weeklyTrends: weeklyMoods
    };

    // Create comprehensive prompt for Gemini
    const prompt = `Analyze this user's comprehensive progress data for the past 30 days and provide personalized insights and recommendations:

MOOD DATA (${daysTracked} days tracked):
${progressData.moodLogs.map(log => `- ${log.date}: Score ${log.score}/5${log.notes ? `, Notes: "${log.notes}"` : ''}`).join('\n')}

SESSION DATA:
- Total sessions: ${totalSessions}
- Completed sessions: ${completedSessions}
- Upcoming sessions: ${upcomingSessions}
- Completion rate: ${sessionCompletionRate.toFixed(1)}%

WEEKLY MOOD TRENDS:
${weeklyMoods.map(week => `Week ${week.week}: Average ${week.average.toFixed(1)}/5 (${week.daysTracked} days tracked)`).join('\n')}

OVERALL STATISTICS:
- Average mood: ${averageMood.toFixed(1)}/5
- Mood variance: ${moodVariance} points
- Tracking consistency: ${consistency.toFixed(1)}%
- Session completion rate: ${sessionCompletionRate.toFixed(1)}%

Please provide a comprehensive progress analysis with:

Progress Overview
(2-3 sentences about their overall journey and achievements)

Key Achievements
(3-4 specific accomplishments and positive trends)

Areas for Growth
(2-3 areas where they can improve or focus)

Personalized Recommendations
(4-5 specific, actionable suggestions for continued progress)

Motivation & Next Steps
(2-3 encouraging sentences with clear next steps)

Keep the tone warm, supportive, and encouraging. Focus on celebrating achievements while providing constructive guidance. Keep the total response under 250 words.`;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);

    // Extract text from response
    let text = '';
    if (typeof result.response.text === 'function') {
      text = await result.response.text();
    } else if (
      result.response.candidates &&
      result.response.candidates[0] &&
      result.response.candidates[0].content &&
      result.response.candidates[0].content.parts &&
      result.response.candidates[0].content.parts[0] &&
      result.response.candidates[0].content.parts[0].text
    ) {
      text = result.response.candidates[0].content.parts[0].text;
    }

    if (!text) {
      return NextResponse.json({ error: 'No response from Gemini' }, { status: 500 });
    }

    return NextResponse.json({
      analysis: text,
      statistics: progressData.statistics,
      weeklyTrends: progressData.weeklyTrends,
      moodData: progressData.moodLogs,
      sessionData: progressData.appointments
    });

  } catch (err: unknown) {
    console.error('Progress analysis error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Progress analysis failed' }, { status: 500 });
  }
} 