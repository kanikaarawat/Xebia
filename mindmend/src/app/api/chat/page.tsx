"use client"

import type React from "react"

import { useState, useEffect } from "react"
import ChatRoom from "@/components/ui/chat-room"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User, Sparkles, MessageCircle } from "lucide-react"
import RoomStats from "@/components/ui/room-stats"

export default function ChatPage() {
    const [userId, setUserId] = useState("")
    const [userName, setUserName] = useState("")
    const [isJoined, setIsJoined] = useState(false)

    useEffect(() => {
        // Generate a unique user ID if not exists
        const storedUserId = localStorage.getItem("mindmend-user-id")
        const storedUserName = localStorage.getItem("mindmend-user-name")

        if (storedUserId && storedUserName) {
            setUserId(storedUserId)
            setUserName(storedUserName)
            setIsJoined(true)
        } else if (!storedUserId) {
            const newUserId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            setUserId(newUserId)
            localStorage.setItem("mindmend-user-id", newUserId)
        }
    }, [])

    const handleJoinChat = () => {
        if (userName.trim()) {
            localStorage.setItem("mindmend-user-name", userName.trim())
            setIsJoined(true)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleJoinChat()
        }
    }

    if (!isJoined) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
                </div>

                <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 border-0 shadow-2xl relative z-10">
                    <CardHeader className="text-center space-y-4 pb-6">
                        <div className="mx-auto relative">
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-500 to-purple-500 blur-lg opacity-30 scale-110"></div>
                            <div className="relative bg-gradient-to-r from-violet-500 to-purple-500 p-4 rounded-full">
                                <MessageCircle className="h-8 w-8 text-white" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent font-bold">
                  Join MindMend
                </span>
                                <Sparkles className="h-6 w-6 text-violet-500" />
                            </CardTitle>
                            <p className="text-slate-600">Enter your name to start meaningful conversations</p>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-0">
                        <div className="space-y-3">
                            <label htmlFor="userName" className="block text-sm font-semibold text-slate-700">
                                Your Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    id="userName"
                                    value={userName}
                                    onChange={(e) => setUserName(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter your name..."
                                    className="pl-10 border-2 border-slate-200/50 focus:border-violet-400 focus:ring-violet-400/20 focus:ring-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm transition-all duration-200"
                                    autoFocus
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleJoinChat}
                            disabled={!userName.trim()}
                            className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border-0 font-semibold"
                        >
                            Join Chat Room
                        </Button>
                        <div className="text-center space-y-2">
                            <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                                Rooms automatically manage up to 5 users each
                            </p>
                            <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-violet-400"></div>
                  Real-time messaging
                </span>
                                <span className="flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-purple-400"></div>
                  Auto room switching
                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-pink-100 p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl"></div>
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 rounded-full blur-3xl"></div>
            </div>

            <div className="container mx-auto py-8 relative z-10">
                <div className="space-y-8">
                    <ChatRoom userId={userId} userName={userName} />
                    <div className="flex justify-center">
                        <RoomStats />
                    </div>
                </div>
            </div>
        </div>
    )
}