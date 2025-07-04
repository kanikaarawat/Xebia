// Socket.IO Server Setup (for reference - this would typically be in a separate server file)
import { Server as SocketIOServer } from "socket.io"
import type { Server as HTTPServer } from "http"

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
        if (previousRoomId) {
            this.leaveRoom(user.id)
        }

        // Add user to new room
        room.users.push({ ...user, roomId: room.id })
        this.userRooms.set(user.id, room.id)

        return room
    }

    leaveRoom(userId: string): Room | null {
        const roomId = this.userRooms.get(userId)
        if (!roomId) return null

        const room = this.rooms.get(roomId)
        if (!room) return null

        // Remove user from room
        room.users = room.users.filter((u) => u.id !== userId)
        this.userRooms.delete(userId)

        return room
    }

    addMessage(message: Message): Room | null {
        const room = this.rooms.get(message.roomId)
        if (!room) return null

        const messageWithId = {
            ...message,
            id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }

        room.messages.push(messageWithId)

        // Keep only last 100 messages per room
        if (room.messages.length > 100) {
            room.messages = room.messages.slice(-100)
        }

        return room
    }

    getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId)
    }

    getUserRoom(userId: string): Room | null {
        const roomId = this.userRooms.get(userId)
        return roomId ? this.rooms.get(roomId) || null : null
    }
}

export function initializeSocketServer(httpServer: HTTPServer) {
    const io = new SocketIOServer(httpServer, {
        cors: {
            origin: process.env.NODE_ENV === "production" ? ["https://your-domain.com"] : ["http://localhost:3000"],
            methods: ["GET", "POST"],
        },
    })

    const chatManager = new ChatRoomManager()

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id)

        socket.on("join-room", ({ userId, userName }) => {
            try {
                const user: User = { id: userId, name: userName, roomId: "" }
                const room = chatManager.joinRoom(user)

                // Join socket room
                socket.join(room.id)

                // Send room assignment to user
                socket.emit("room-assigned", {
                    roomId: room.id,
                    userCount: room.users.length,
                })

                // Send message history
                socket.emit("message-history", room.messages)

                // Notify other users in the room
                socket.to(room.id).emit("user-joined", {
                    user: { id: userId, name: userName },
                    userCount: room.users.length,
                })

                console.log(`User ${userName} joined ${room.id}`)
            } catch (error) {
                socket.emit("error", { message: "Failed to join room" })
            }
        })

        socket.on("send-message", (messageData) => {
            try {
                const room = chatManager.addMessage(messageData)
                if (room) {
                    // Broadcast message to all users in the room
                    io.to(room.id).emit("new-message", {
                        ...messageData,
                        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    })
                }
            } catch (error) {
                socket.emit("error", { message: "Failed to send message" })
            }
        })

        socket.on("disconnect", () => {
            try {
                const { userId } = socket.handshake.query
                if (userId && typeof userId === "string") {
                    const room = chatManager.leaveRoom(userId)
                    if (room) {
                        // Notify other users
                        socket.to(room.id).emit("user-left", {
                            user: { id: userId, name: "User" },
                            userCount: room.users.length,
                        })
                    }
                }
                console.log("User disconnected:", socket.id)
            } catch (error) {
                console.error("Error handling disconnect:", error)
            }
        })
    })

    return io
}
