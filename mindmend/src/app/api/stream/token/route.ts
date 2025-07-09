import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Stream configuration
const STREAM_API_KEY = process.env.STREAM_API_KEY || 'mmhfdzb5evj2';

export async function POST(req: NextRequest) {
  try {
    const { appointmentId } = await req.json();

    // Validate required fields
    if (!appointmentId) {
      return NextResponse.json(
        { error: 'Missing required field: appointmentId' },
        { status: 400 }
      );
    }

    // Verify user authentication
    const supabase = createServerComponentClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Generate Stream token
    const token = generateStreamToken();

    return NextResponse.json({
      token,
      apiKey: STREAM_API_KEY,
      appointmentId
    });

  } catch (error) {
    console.error('Stream token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}

function generateStreamToken(): string {
  // For demo purposes, using a test token
  // In production, you should use the Stream server SDK to generate tokens
  // const stream = require('stream-chat');
  // const serverClient = stream.getServerClient(STREAM_API_KEY, STREAM_API_SECRET);
  // const token = serverClient.createToken(userId);
  
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL3Byb250by5nZXRzdHJlYW0uaW8iLCJzdWIiOiJ1c2VyL1NhdGVsZV9TaGFuIiwidXNlcl9pZCI6IlNhdGVsZV9TaGFuIiwidmFsaWRpdHlfaW5fc2Vjb25kcyI6NjA0ODAwLCJpYXQiOjE3NTE3NTQyOTksImV4cCI6MTc1MjM1OTA5OX0.aNMgVHaPkrTPUrWg5sCME3NUiu7Zt2VtELa-5oXqJRc';
} 