import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!query || !apiKey) {
    return NextResponse.json({ error: 'Missing query or API key' }, { status: 400 });
  }
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(query)}&key=${apiKey}`;
  const ytRes = await fetch(url);
  const ytData = await ytRes.json();
  if (ytData.error) {
    return NextResponse.json({ error: ytData.error }, { status: 500 });
  }
  return NextResponse.json({ videos: ytData.items || [] });
} 