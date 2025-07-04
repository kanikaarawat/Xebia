"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { io, type Socket } from "socket.io-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Users, MessageCircle, Sparkles, Wifi, WifiOff } from "lucide-react"

interface Message {
    id: string
    senderId: string
    senderName: string
    message: string
    timestamp: Date
    roomId: string
}

interface User {
    id: string
    name: string
}

interface ChatRoomProps {
    userId: string
    userName: string
}

export default function ChatRoom({ userId, userName }: ChatRoomProps) {
    const [socket, setSocket] = useState<Socket | null>(null)
    const [currentRoom, setCurrentRoom] = useState<string>("")
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [userCount, setUserCount] = useState(0)
    const [isConnected, setIsConnected] = useState(false)
    const [statusMessage, setStatusMessage] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [isTyping, setIsTyping] = useState(false)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io("/", {
            path: "/api/socket/io",
            query: { userId, userName },
        })

        setSocket(newSocket)

        // Connection events
        newSocket.on("connect", () => {
            setIsConnected(true)
            setStatusMessage("Connected to server")

            // Request to join an available room
            newSocket.emit("join-room", { userId, userName })
        })

        newSocket.on("disconnect", () => {
            setIsConnected(false)
            setStatusMessage("Disconnected from server")
        })

        // Room events
        newSocket.on("room-assigned", (data: { roomId: string; userCount: number }) => {
            setCurrentRoom(data.roomId)
            setUserCount(data.userCount)
            setStatusMessage(`Joined ${data.roomId} (${data.userCount}/5 users)`)
            setIsLoading(false)
        })

        newSocket.on("room-switched", (data: { roomId: string; reason: string }) => {
            setCurrentRoom(data.roomId)
            setMessages([]) // Clear messages when switching rooms
            setStatusMessage(`Switched to ${data.roomId}: ${data.reason}`)
        })

        newSocket.on("room-full", (data: { message: string }) => {
            setStatusMessage(data.message)
        })

        // Message events
        newSocket.on("new-message", (message: Message) => {
            setMessages((prev) => [...prev, message])
        })

        newSocket.on("message-history", (history: Message[]) => {
            setMessages(history)
        })

        // User events
        newSocket.on("user-joined", (data: { user: User; userCount: number }) => {
            setUserCount(data.userCount)
            setStatusMessage(`${data.user.name} joined the room (${data.userCount}/5 users)`)

            // Clear status message after 3 seconds
            setTimeout(() => setStatusMessage(""), 3000)
        })

        newSocket.on("user-left", (data: { user: User; userCount: number }) => {
            setUserCount(data.userCount)
            setStatusMessage(`${data.user.name} left the room (${data.userCount}/5 users)`)

            // Clear status message after 3 seconds
            setTimeout(() => setStatusMessage(""), 3000)
        })

        newSocket.on("user-count-updated", (count: number) => {
            setUserCount(count)
        })

        // Error handling
        newSocket.on("error", (error: { message: string }) => {
            setStatusMessage(`Error: ${error.message}`)
        })

        return () => {
            newSocket.close()
        }
    }, [userId, userName])

    const sendMessage = () => {
        if (!socket || !newMessage.trim() || !currentRoom) return

        const messageData = {
            senderId: userId,
            senderName: userName,
            message: newMessage.trim(),
            roomId: currentRoom,
            timestamp: new Date(),
        }

        socket.emit("send-message", messageData)
        setNewMessage("")
        inputRef.current?.focus()
        setIsTyping(false)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            sendMessage()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value)
        if (!isTyping && e.target.value.length > 0) {
            setIsTyping(true)
        } else if (isTyping && e.target.value.length === 0) {
            setIsTyping(false)
        }
    }

    const formatTime = (timestamp: Date) => {
        return new Date(timestamp).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        })
    }

    const getMessageAnimation = (index: number) => {
        return {
            animation: `slideInMessage 0.3s ease-out ${index * 0.05}s both`,
        }
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto">
                <Card className="backdrop-blur-xl bg-white/80 border-0 shadow-2xl">
                    <CardContent className="flex items-center justify-center h-96">
                        <div className="text-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
                                    <MessageCircle className="h-8 w-8 text-white animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <p className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                    Connecting to MindMend
                                </p>
                                <p className="text-slate-500">Finding the perfect room for you...</p>
                                <div className="flex justify-center space-x-1 mt-4">
                                    <div className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"></div>
                                    <div
                                        className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.1s" }}
                                    ></div>
                                    <div
                                        className="w-2 h-2 bg-violet-500 rounded-full animate-bounce"
                                        style={{ animationDelay: "0.2s" }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="w-full max-w-4xl mx-auto">
            <style jsx>{`
        @keyframes slideInMessage {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .message-enter {
          animation: slideInMessage 0.3s ease-out;
        }
      `}</style>

            <Card className="backdrop-blur-xl bg-white/90 border-0 shadow-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-violet-500/10 via-purple-500/10 to-pink-500/10 border-b border-white/20 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-3 text-slate-800">
                            <div className="relative">
                                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 blur-sm opacity-30"></div>
                                <div className="relative bg-gradient-to-r from-violet-500 to-purple-500 p-2 rounded-full">
                                    <MessageCircle className="h-5 w-5 text-white" />
                                </div>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-bold">
                    MindMend
                  </span>
                                    <Sparkles className="h-4 w-4 text-violet-500" />
                                </div>
                                <div className="text-sm font-normal text-slate-600">{currentRoom}</div>
                            </div>
                        </CardTitle>
                        <div className="flex items-center gap-3">
                            <Badge
                                variant={isConnected ? "default" : "destructive"}
                                className={`flex items-center gap-2 px-3 py-1 ${
                                    isConnected
                                        ? "bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600"
                                        : "bg-gradient-to-r from-red-500 to-rose-500"
                                } border-0 shadow-lg`}
                            >
                                {isConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                                {isConnected ? "Connected" : "Disconnected"}
                            </Badge>
                            <Badge
                                variant="secondary"
                                className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-200/50 shadow-sm"
                            >
                                <Users className="h-3 w-3" />
                                {userCount}/5
                            </Badge>
                        </div>
                    </div>
                    {statusMessage && (
                        <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 shadow-sm">
                            <p className="text-sm text-blue-700 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                                {statusMessage}
                            </p>
                        </div>
                    )}
                </CardHeader>

                <CardContent className="p-0 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-50/30 via-transparent to-purple-50/30 pointer-events-none"></div>

                    <ScrollArea className="h-96 relative">
                        <div className="p-6 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-12 space-y-4">
                                    <div className="relative mx-auto w-20 h-20">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-200 to-purple-200 animate-pulse"></div>
                                        <MessageCircle className="absolute inset-0 m-auto h-10 w-10 text-violet-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-lg font-semibold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                                            Welcome to your chat room!
                                        </p>
                                        <p className="text-slate-500">Start a conversation and connect with others</p>
                                    </div>
                                </div>
                            ) : (
                                messages.map((msg, index) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.senderId === userId ? "justify-end" : "justify-start"} message-enter`}
                                        style={getMessageAnimation(index)}
                                    >
                                        <div className="max-w-xs lg:max-w-md group">
                                            <div
                                                className={`px-4 py-3 rounded-2xl shadow-lg transition-all duration-200 hover:shadow-xl ${
                                                    msg.senderId === userId
                                                        ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-br-md transform hover:scale-[1.02]"
                                                        : "bg-white/80 backdrop-blur-sm text-slate-800 rounded-bl-md border border-slate-200/50 hover:bg-white/90"
                                                }`}
                                            >
                                                {msg.senderId !== userId && (
                                                    <p className="text-xs font-semibold mb-2 text-violet-600 flex items-center gap-1">
                                                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-purple-400"></div>
                                                        {msg.senderName}
                                                    </p>
                                                )}
                                                <p className="text-sm leading-relaxed font-medium">{msg.message}</p>
                                                <p
                                                    className={`text-xs mt-2 flex items-center gap-1 ${
                                                        msg.senderId === userId ? "text-violet-100" : "text-slate-500"
                                                    }`}
                                                >
                                                    <div
                                                        className={`w-1 h-1 rounded-full ${
                                                            msg.senderId === userId ? "bg-violet-200" : "bg-slate-400"
                                                        }`}
                                                    ></div>
                                                    {formatTime(msg.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </ScrollArea>

                    <div className="border-t border-white/20 bg-gradient-to-r from-slate-50/80 to-white/80 backdrop-blur-sm p-6">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Input
                                    ref={inputRef}
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Type your message..."
                                    disabled={!isConnected || !currentRoom}
                                    className="pr-12 border-2 border-slate-200/50 focus:border-violet-400 focus:ring-violet-400/20 focus:ring-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm transition-all duration-200 placeholder:text-slate-400"
                                />
                                {isTyping && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <div className="flex space-x-1">
                                            <div className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"></div>
                                            <div
                                                className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.1s" }}
                                            ></div>
                                            <div
                                                className="w-1 h-1 bg-violet-500 rounded-full animate-bounce"
                                                style={{ animationDelay: "0.2s" }}
                                            ></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <Button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || !isConnected || !currentRoom}
                                className="bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-slate-500 flex items-center gap-2">
                                <kbd className="px-2 py-1 bg-slate-200/50 rounded text-xs">Enter</kbd>
                                to send
                            </p>
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400" : "bg-red-400"} animate-pulse`}
                                ></div>
                                <p className="text-xs text-slate-500">{isConnected ? "Connected" : "Disconnected"}</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
