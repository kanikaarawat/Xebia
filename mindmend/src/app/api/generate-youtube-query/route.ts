import { NextRequest, NextResponse } from 'next/server';
import { generateYoutubeQueryFromMood } from '@/lib/cohereClient';

export async function POST(req: NextRequest) {
  const { notes } = await req.json();
  const query = await generateYoutubeQueryFromMood(notes);
  return NextResponse.json({ query });
} 