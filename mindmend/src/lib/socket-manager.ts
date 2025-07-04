interface User {
    id: string
    name: string
    roomId: string
}

interface Message {
    id: string
    senderId: string
    senderName: string
    message: string
    timestamp: Date
    roomId: string
}

interface Room {
    id: string
    users: User[]
    messages: Message[]
    maxUsers: number
}

class ChatRoomManager {
    private rooms: Map<string, Room> = new Map()
    private userRooms: Map<string, string> = new Map()
    private readonly MAX_USERS_PER_ROOM = 5

    constructor() {
        // Initialize first room
        this.createRoom("room-1")
    }

    private createRoom(roomId: string): Room {
        const room: Room = {
            id: roomId,
            users: [],
            messages: [],
            maxUsers: this.MAX_USERS_PER_ROOM,
        }
        this.rooms.set(roomId, room)
        console.log(`Created new room: ${roomId}`)
        return room
    }

    private findAvailableRoom(): Room {
        // Find a room with space
        for (const room of this.rooms.values()) {
            if (room.users.length < room.maxUsers) {
                return room
            }
        }

        // Create new room if all are full
        const newRoomNumber = this.rooms.size + 1
        const newRoomId = `room-${newRoomNumber}`
        return this.createRoom(newRoomId)
    }

    joinRoom(user: User): Room {
        const room = this.findAvailableRoom()

        // Remove user from previous room if exists
        const previousRoomId = this.userRooms.get(user.id)
        if (previousRoomId && previousRoomId !== room.id) {
            this.leaveRoom(user.id)
        }

        // Check if user is already in this room
        const existingUser = room.users.find((u) => u.id === user.id)
        if (!existingUser) {
            // Add user to new room
            room.users.push({ ...user, roomId: room.id })
            this.userRooms.set(user.id, room.id)
        }

        return room
    }

    leaveRoom(userId: string): Room | null {
        const roomId = this.userRooms.get(userId)
        if (!roomId) return null

        const room = this.rooms.get(roomId)
        if (!room) return null

        // Remove user from room
        const userIndex = room.users.findIndex((u) => u.id === userId)
        if (userIndex > -1) {
            room.users.splice(userIndex, 1)
            this.userRooms.delete(userId)
        }

        return room
    }

    addMessage(message: Omit<Message, "id">): Message {
        const room = this.rooms.get(message.roomId)
        if (!room) {
            throw new Error(`Room ${message.roomId} not found`)
        }

        const messageWithId: Message = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }

        room.messages.push(messageWithId)

        // Keep only last 100 messages per room
        if (room.messages.length > 100) {
            room.messages = room.messages.slice(-100)
        }

        return messageWithId
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId)
    }

    getUserRoom(userId: string): Room | null {
        const roomId = this.userRooms.get(userId)
        return roomId ? this.rooms.get(roomId) || null : null
    }

    getAllRooms(): Room[] {
        return Array.from(this.rooms.values())
    }

    getRoomStats() {
        const rooms = this.getAllRooms()
        return {
            totalRooms: rooms.length,
            totalUsers: rooms.reduce((sum, room) => sum + room.users.length, 0),
            roomDetails: rooms.map((room) => ({
                id: room.id,
                userCount: room.users.length,
                messageCount: room.messages.length,
            })),
        }
    }
}

// Global instance
let chatManager: ChatRoomManager | null = null

export function getChatManager(): ChatRoomManager {
    if (!chatManager) {
        chatManager = new ChatRoomManager()
    }
    return chatManager
}
