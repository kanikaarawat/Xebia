import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ error: 'Not implemented: supabase removed' }, { status: 501 });
} 