import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from '@/lib/supabaseClient';

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Get today's date in Indian Standard Time (YYYY-MM-DD)
  const todayStr = new Date().toLocaleDateString('en-CA', { 
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }); // Returns 'YYYY-MM-DD' in IST

  // Query for today's mood log (IST date)
  const { data: log, error } = await supabase
    .from('mood_logs')
    .select('id, user_id, mood_score, notes, logged_at')
    .eq('user_id', userId)
    .eq('logged_at', todayStr)
    .order('logged_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !log) {
    return NextResponse.json({ error: 'No mood log found for today' }, { status: 404 });
  }

  return NextResponse.json({ log });
}

export async function POST(req: NextRequest) {
  const { mood_score, notes } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Missing Gemini API Key' }, { status: 500 });
  }
  if (
    typeof mood_score !== 'number' ||
    mood_score < 1 ||
    mood_score > 5 ||
    typeof notes !== 'string'
  ) {
    return NextResponse.json({ error: 'mood_score must be a number from 1 to 5 and notes must be a string' }, { status: 400 });
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const prompt = `The user has a mood score of ${mood_score} out of 5. Their note: "${notes}". 
      Based on this, give a short 2-line reflection on their emotional state and suggest 2 personalized wellness activities. Give it in a way that feels like youre talking to a friend. The response should be in a conversational tone.`;

    const result = await model.generateContent(prompt);

    // The SDK's response structure may vary; check for .response.text() or .response.candidates[0].content.parts[0].text
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
      return NextResponse.json({ error: 'No response from Gemini', details: result }, { status: 500 });
    }

    return NextResponse.json({ reflection: text });
  } catch (err: unknown) {
    console.error('Gemini API Error:', err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Gemini API call failed' }, { status: 500 });
  }
}
