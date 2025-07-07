import { NextRequest, NextResponse } from "next/server";
import { NotificationService } from '@/lib/notificationService';

// GET /api/notifications/preferences - Get user's notification preferences
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const preferences = await NotificationService.getNotificationPreferences(userId);

    return NextResponse.json({ preferences });
  } catch (error: unknown) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification preferences' },
      { status: 500 }
    );
  }
}

// PUT /api/notifications/preferences - Update user's notification preferences
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, preferences } = body;

    if (!userId || !preferences) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const success = await NotificationService.updateNotificationPreferences(
      userId,
      preferences
    );

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to update notification preferences' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update notification preferences' },
      { status: 500 }
    );
  }
} 