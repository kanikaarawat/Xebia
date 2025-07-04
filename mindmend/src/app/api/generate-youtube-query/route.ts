import { NextRequest, NextResponse } from 'next/server';
import { generateYoutubeQueryFromMood } from '@/lib/cohereClient';

export async function POST(req: NextRequest) {
  try {
    const { notes } = await req.json();
    console.log('[Cohere API] Received notes:', notes);
    const query = await generateYoutubeQueryFromMood(notes);
    console.log('[Cohere API] Generated query:', query);
    return NextResponse.json({ query });
  } catch (error) {
    console.error('[Cohere API] Error:', error, JSON.stringify(error));
    return NextResponse.json({ error: error instanceof Error ? error.message : JSON.stringify(error) }, { status: 500 });
  }
} 