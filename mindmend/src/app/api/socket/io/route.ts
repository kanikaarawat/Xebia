import { NextResponse } from "next/server"
import { Server as SocketIOServer } from "socket.io"
import { getChatManager } from "@/lib/socket-manager"

// We need to store the Socket.IO server instance globally
let io: SocketIOServer | undefined

export async function GET() {
    if (!io) {
        // Initialize Socket.IO server
        const httpServer = (global as unknown).httpServer
        if (!httpServer) {
            return NextResponse.json({ error: "HTTP server not available" }, { status: 500 })
        }

        io = new SocketIOServer(httpServer, {
            path: "/api/socket/io",
            addTrailingSlash: false,
            cors: {
                origin:
                    process.env.NODE_ENV === "production"
                        ? [process.env.NEXT_PUBLIC_APP_URL || "https://your-domain.com"]
                        : ["http://localhost:3000"],
                methods: ["GET", "POST"],
                credentials: true,
            },
        })

        const manager = getChatManager()

        io.on("connection", (socket) => {
            console.log("User connected:", socket.id)

            socket.on("join-room", ({ userId, userName }) => {
                try {
                    const user = { id: userId, name: userName, roomId: "" }
                    const room = manager.joinRoom(user)

                    // Leave all previous rooms
                    socket.rooms.forEach((roomId) => {
                        if (roomId !== socket.id) {
                            socket.leave(roomId)
                        }
                    })

                    // Join new socket room
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

                    console.log(`User ${userName} (${userId}) joined ${room.id} - Total users: ${room.users.length}`)
                } catch (error) {
                    console.error("Error joining room:", error)
                    socket.emit("error", { message: "Failed to join room" })
                }
            })

            socket.on("send-message", (messageData) => {
                try {
                    const message = manager.addMessage({
                        senderId: messageData.senderId,
                        senderName: messageData.senderName,
                        message: messageData.message,
                        roomId: messageData.roomId,
                        timestamp: new Date(messageData.timestamp),
                    })

                    // Broadcast message to all users in the room
                    io?.to(message.roomId).emit("new-message", message)

                    console.log(`Message sent in ${message.roomId} by ${message.senderName}`)
                } catch (error) {
                    console.error("Error sending message:", error)
                    socket.emit("error", { message: "Failed to send message" })
                }
            })

            socket.on("disconnect", (reason) => {
                try {
                    const { userId, userName } = socket.handshake.query
                    if (userId && typeof userId === "string") {
                        const room = manager.leaveRoom(userId)
                        if (room) {
                            // Notify other users
                            socket.to(room.id).emit("user-left", {
                                user: { id: userId, name: userName || "User" },
                                userCount: room.users.length,
                            })
                            console.log(`User ${userName} (${userId}) left ${room.id} - Reason: ${reason}`)
                        }
                    }
                } catch (error) {
                    console.error("Error handling disconnect:", error)
                }
            })
        })

        console.log("Socket.IO server initialized successfully")
    }

    return NextResponse.json({
        status: "Socket.IO server running",
        timestamp: new Date().toISOString(),
    })
}
