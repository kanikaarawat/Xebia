import { type NextRequest, NextResponse } from "next/server"

// Room-based message storage
interface Message {
  id: string
  username: string
  content: string
  timestamp: string
  roomId: string
}

// Simple in-memory storage for messages by room
const messagesByRoom: { [roomId: string]: Message[] } = {}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get("roomId")

  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
  }

  const messages = messagesByRoom[roomId] || []
  return NextResponse.json({ messages })
}

export async function POST(request: NextRequest) {
  try {
    const { username, content, roomId } = await request.json()

    if (!username || !content || !roomId) {
      return NextResponse.json({ error: "Username, content, and room ID are required" }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: "Message too long" }, { status: 400 })
    }

    const message: Message = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: username.trim(),
      content: content.trim(),
      timestamp: new Date().toISOString(),
      roomId: roomId,
    }

    // Initialize room messages if doesn't exist
    if (!messagesByRoom[roomId]) {
      messagesByRoom[roomId] = []
    }

    messagesByRoom[roomId].push(message)

    // Keep only last 100 messages per room to prevent memory issues
    if (messagesByRoom[roomId].length > 100) {
      messagesByRoom[roomId] = messagesByRoom[roomId].slice(-100)
    }

    return NextResponse.json({ message })
  } catch (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}
