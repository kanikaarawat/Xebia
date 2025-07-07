import { NextRequest, NextResponse } from 'next/server';

// GET /api/video/rooms - List all video call rooms
export async function GET() {
  try {
    const dailyApiKey = process.env.DAILY_API_KEY;
    
    if (!dailyApiKey) {
      return NextResponse.json(
        { error: 'Video service not configured' },
        { status: 500 }
      );
    }

    // Get all rooms from Daily.co
    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rooms from Daily.co');
    }

    const rooms = await response.json();
    
    // Filter rooms that belong to our appointments
    const appointmentRooms = rooms.data?.filter((room: unknown) => 
      room.name && room.name.length > 0
    ) || [];

    return NextResponse.json({
      rooms: appointmentRooms,
      total: appointmentRooms.length,
    });
  } catch (error) {
    console.error('Error fetching video rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video rooms' },
      { status: 500 }
    );
  }
}

// POST /api/video/rooms - Create a new video call room
export async function POST(req: NextRequest) {
  try {
    const { appointmentId, roomName, properties } = await req.json();
    
    if (!appointmentId || !roomName) {
      return NextResponse.json(
        { error: 'appointmentId and roomName are required' },
        { status: 400 }
      );
    }

    const dailyApiKey = process.env.DAILY_API_KEY;
    
    if (!dailyApiKey) {
      return NextResponse.json(
        { error: 'Video service not configured' },
        { status: 500 }
      );
    }

    // Create room with default properties
    const roomProperties = {
      enable_prejoin_ui: true,
      enable_chat: true,
      enable_recording: 'cloud',
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // Expire in 24 hours
      ...properties,
    };

    const response = await fetch('https://api.daily.co/v1/rooms', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: roomName,
        properties: roomProperties,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Daily.co API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to create video room', details: errorData },
        { status: 500 }
      );
    }

    const roomData = await response.json();

    return NextResponse.json({
      success: true,
      room: roomData,
      message: 'Video room created successfully',
    });
  } catch (error) {
    console.error('Error creating video room:', error);
    return NextResponse.json(
      { error: 'Failed to create video room' },
      { status: 500 }
    );
  }
}

// DELETE /api/video/rooms - Delete a video call room
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const roomName = searchParams.get('roomName');
    
    if (!roomName) {
      return NextResponse.json(
        { error: 'roomName parameter is required' },
        { status: 400 }
      );
    }

    const dailyApiKey = process.env.DAILY_API_KEY;
    
    if (!dailyApiKey) {
      return NextResponse.json(
        { error: 'Video service not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(`https://api.daily.co/v1/rooms/${roomName}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${dailyApiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Daily.co API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to delete video room', details: errorData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video room deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting video room:', error);
    return NextResponse.json(
      { error: 'Failed to delete video room' },
      { status: 500 }
    );
  }
} 