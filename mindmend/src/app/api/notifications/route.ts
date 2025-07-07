import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/notifications - Create a notification
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user_id, type, title, message, meta } = body;
    if (!user_id || !type || !title || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ user_id, type, title, message, meta }])
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ notification: data }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'An error occurred' }, { status: 500 });
  }
}

// GET /api/notifications?user_id=... - Fetch notifications for a user
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  if (!user_id) {
    return NextResponse.json({ error: 'Missing user_id' }, { status: 400 });
  }
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ notifications: data });
}

// PATCH /api/notifications - Mark notification(s) as read
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { notification_id, user_id, mark_all } = body;
    if (mark_all && user_id) {
      // Mark all as read for user
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user_id)
        .eq('read', false);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ message: 'All notifications marked as read' });
    } else if (notification_id) {
      // Mark single notification as read
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notification_id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ message: 'Notification marked as read' });
    } else {
      return NextResponse.json({ error: 'Missing notification_id or user_id for mark_all' }, { status: 400 });
    }
  } catch (err: unknown) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'An error occurred' }, { status: 500 });
  }
} 