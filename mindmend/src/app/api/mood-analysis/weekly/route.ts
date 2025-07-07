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
    // Get the last 7 days in Indian Standard Time
    const now = new Date();
    const istOffset = 5.5 * 60 * 60 * 1000; // IST is UTC+5:30
    const istDate = new Date(now.getTime() + istOffset);
    const endDate = new Date(istDate);
    const startDate = subDays(endDate, 6);
    
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    // Query for mood logs from the last 7 days
    const { data: logs, error } = await supabase
      .from('mood_logs')
      .select('id, user_id, mood_score, notes, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', startDateStr)
      .lte('logged_at', endDateStr)
      .order('logged_at', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Failed to fetch mood data' }, { status: 500 });
    }

    if (!logs || logs.length === 0) {
      return NextResponse.json({ 
        error: 'No mood data found for the past week',
        suggestion: 'Start logging your mood daily to get personalized weekly insights!'
      }, { status: 404 });
    }

    // Calculate statistics
    const moodScores = logs.map(log => log.mood_score);
    const averageMood = moodScores.reduce((sum, score) => sum + score, 0) / moodScores.length;
    const lowestMood = Math.min(...moodScores);
    const highestMood = Math.max(...moodScores);
    const moodVariance = Math.max(...moodScores) - Math.min(...moodScores);
    const daysTracked = logs.length;
    const consistency = daysTracked / 7; // percentage of days tracked

    // Get Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
    }

    // Prepare data for Gemini
    const moodData = logs.map(log => ({
      date: log.logged_at,
      score: log.mood_score,
      notes: log.notes || ''
    }));

    // Create prompt for Gemini
    const prompt = `Analyze this user's mood data for the past week and provide personalized insights and recommendations:

Mood Data:
${moodData.map(day => `- ${day.date}: Score ${day.score}/5${day.notes ? `, Notes: "${day.notes}"` : ''}`).join('\n')}

Statistics:
- Average mood: ${averageMood.toFixed(1)}/5
- Lowest mood: ${lowestMood}/5
- Highest mood: ${highestMood}/5
- Mood variance: ${moodVariance} points
- Days tracked: ${daysTracked}/7 (${(consistency * 100).toFixed(0)}% consistency)

Please provide a concise, well-structured analysis with these sections:

Mood Summary
(2-3 sentences about their overall pattern)

Key Insights
(2-3 bullet points about what the data reveals)

Recommendations
(3-4 specific, actionable suggestions)

Encouragement
(1-2 supportive sentences)

Keep the tone warm and conversational. Use bullet points (•) for easy reading. Do NOT use any markdown formatting like ** or __. Focus on practical, achievable suggestions. Keep the total response under 200 words.`;

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
      statistics: {
        averageMood: parseFloat(averageMood.toFixed(1)),
        lowestMood,
        highestMood,
        moodVariance,
        daysTracked,
        consistency: parseFloat((consistency * 100).toFixed(0)),
        totalLogs: logs.length
      },
      moodData: moodData
    });

  } catch (err: unknown) {
    console.error('Weekly mood analysis error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Weekly analysis failed' }, { status: 500 });
  }
} 