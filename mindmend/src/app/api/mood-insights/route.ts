import { NextRequest, NextResponse } from 'next/server';

// TODO: Replace <your-project-ref> with your actual Supabase project ref (found in your Supabase dashboard URL)
const SUPABASE_PROJECT_REF = '<your-project-ref>';
const EDGE_FUNCTION_URL = `https://${SUPABASE_PROJECT_REF}.functions.supabase.co/mood-insights`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
} 