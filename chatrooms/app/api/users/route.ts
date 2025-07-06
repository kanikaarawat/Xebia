import { type NextRequest, NextResponse } from "next/server"

// Room-based storage structure
interface User {
  username: string
  joinedAt: string
  roomId: string
}

interface Room {
  id: string
  users: User[]
  createdAt: string
}

// Simple in-memory storage for rooms and users
let rooms: Room[] = []
const MAX_USERS_PER_ROOM = 5

function findAvailableRoom(): Room {
  // Find a room with space
  let availableRoom = rooms.find((room) => room.users.length < MAX_USERS_PER_ROOM)

  if (!availableRoom) {
    // Create new room
    availableRoom = {
      id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      users: [],
      createdAt: new Date().toISOString(),
    }
    rooms.push(availableRoom)
  }

  return availableRoom
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get("roomId")

  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 })
  }

  const room = rooms.find((r) => r.id === roomId)
  if (!room) {
    return NextResponse.json({ users: [] })
  }

  return NextResponse.json({
    users: room.users,
    roomInfo: {
      id: room.id,
      userCount: room.users.length,
      maxUsers: MAX_USERS_PER_ROOM,
    },
  })
}

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 })
    }

    const trimmedUsername = username.trim()

    if (trimmedUsername.length < 2 || trimmedUsername.length > 20) {
      return NextResponse.json({ error: "Username must be between 2 and 20 characters" }, { status: 400 })
    }

    // Check if username is already taken across all rooms
    const existingUser = rooms.some((room) =>
      room.users.some((user) => user.username.toLowerCase() === trimmedUsername.toLowerCase()),
    )

    if (existingUser) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 })
    }

    // Find or create available room
    const availableRoom = findAvailableRoom()

    const user: User = {
      username: trimmedUsername,
      joinedAt: new Date().toISOString(),
      roomId: availableRoom.id,
    }

    availableRoom.users.push(user)

    return NextResponse.json({
      user,
      roomInfo: {
        id: availableRoom.id,
        userCount: availableRoom.users.length,
        maxUsers: MAX_USERS_PER_ROOM,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to join chatroom" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { username, roomId } = await request.json()

    if (!username || !roomId) {
      return NextResponse.json({ error: "Username and room ID are required" }, { status: 400 })
    }

    const room = rooms.find((r) => r.id === roomId)
    if (room) {
      room.users = room.users.filter((user) => user.username !== username.trim())

      // Clean up empty rooms (except keep at least one room)
      if (room.users.length === 0 && rooms.length > 1) {
        rooms = rooms.filter((r) => r.id !== roomId)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to leave chatroom" }, { status: 500 })
  }
}
