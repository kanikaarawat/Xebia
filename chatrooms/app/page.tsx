"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Users, Heart, Sparkles, MessageCircle, LogOut } from "lucide-react"

interface Message {
  id: string
  username: string
  content: string
  timestamp: string
}

interface User {
  username: string
  joinedAt: string
}

export default function MindMendChatroom() {
  const [username, setUsername] = useState("")
  const [isJoined, setIsJoined] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout>()
  const [roomId, setRoomId] = useState("")
  const [roomInfo, setRoomInfo] = useState<{ userCount: number; maxUsers: number } | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isJoined && roomId) {
      const pollData = async () => {
        try {
          const [messagesRes, usersRes] = await Promise.all([
            fetch(`/api/messages?roomId=${roomId}`),
            fetch(`/api/users?roomId=${roomId}`),
          ])

          if (messagesRes.ok && usersRes.ok) {
            const messagesData = await messagesRes.json()
            const usersData = await usersRes.json()
            setMessages(messagesData.messages)
            setUsers(usersData.users)
            if (usersData.roomInfo) {
              setRoomInfo(usersData.roomInfo)
            }
          }
        } catch (error) {
          console.error("Error polling data:", error)
        }
      }

      pollData()
      pollIntervalRef.current = setInterval(pollData, 1000)

      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current)
        }
      }
    }
  }, [isJoined, roomId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const joinChatroom = async () => {
    if (!username.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setRoomId(data.roomInfo.id)
        setRoomInfo(data.roomInfo)
        setIsJoined(true)
      } else {
        const error = await response.json()
        alert(error.error || "Failed to join chatroom")
      }
    } catch (error) {
      alert("Failed to join chatroom")
    } finally {
      setIsLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!message.trim() || !roomId) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username,
          content: message.trim(),
          roomId,
        }),
      })

      if (response.ok) {
        setMessage("")
      }
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const leaveChatroom = async () => {
    try {
      await fetch("/api/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, roomId }),
      })
    } catch (error) {
      console.error("Error leaving chatroom:", error)
    }

    setIsJoined(false)
    setUsername("")
    setRoomId("")
    setRoomInfo(null)
    setMessages([])
    setUsers([])

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getAvatarColor = (username: string) => {
    const colors = [
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600",
      "bg-gradient-to-br from-yellow-400 to-yellow-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-indigo-400 to-indigo-600",
      "bg-gradient-to-br from-red-400 to-red-600",
      "bg-gradient-to-br from-teal-400 to-teal-600",
    ]
    const index = username.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length
    return colors[index]
  }

  if (!isJoined) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>

        <Card className="w-full max-w-md backdrop-blur-sm bg-white/80 border-0 shadow-2xl relative z-10">
          <CardHeader className="text-center pb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <Heart className="h-8 w-8 text-purple-600 animate-pulse" />
                <Sparkles className="h-4 w-4 text-pink-400 absolute -top-1 -right-1 animate-bounce" />
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                MindMend
              </CardTitle>
            </div>
            <p className="text-gray-600 text-lg">Join our supportive community</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-500">Safe space for wellness conversations</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-8 pb-8">
            <div className="space-y-2">
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700">
                Choose your username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="Enter a friendly username..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && joinChatroom()}
                maxLength={20}
                className="h-12 text-lg border-2 border-purple-100 focus:border-purple-400 rounded-xl transition-all duration-300"
              />
            </div>
            <Button
              onClick={joinChatroom}
              disabled={!username.trim() || isLoading}
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Joining...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Join Community
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-blue-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto p-6 h-screen flex flex-col relative z-10">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 mb-6 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Heart className="h-7 w-7 text-purple-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  MindMend Community
                </h1>
              </div>
              {roomInfo && (
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                  Room {roomInfo.userCount}/{roomInfo.maxUsers}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Users className="h-4 w-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">{users.length} online</span>
              </div>
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-semibold">
                {username}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={leaveChatroom}
                className="text-red-600 border-red-200 hover:bg-red-50 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2 transition-all duration-300 hover:scale-105"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Leave
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 flex gap-6 min-h-0">
          {/* Enhanced Main Chat Area */}
          <Card className="flex-1 flex flex-col bg-white/80 backdrop-blur-md border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-b border-purple-100/50 pb-4">
              <CardTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <MessageCircle className="h-6 w-6 text-purple-600" />
                Community Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col min-h-0 p-0">
              {/* Enhanced Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-16">
                      <div className="relative mb-4">
                        <Heart className="h-16 w-16 mx-auto text-purple-200" />
                        <Sparkles className="h-6 w-6 text-pink-300 absolute top-0 right-1/2 transform translate-x-8 animate-bounce" />
                      </div>
                      <p className="text-lg font-medium">Welcome to your safe space</p>
                      <p className="text-sm text-gray-400 mt-2">Start a meaningful conversation</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => (
                      <div
                        key={msg.id}
                        className={`flex gap-4 animate-in slide-in-from-bottom-2 duration-500 ${
                          msg.username === username ? "flex-row-reverse" : ""
                        }`}
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        {/* Avatar */}
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg ${getAvatarColor(
                            msg.username,
                          )}`}
                        >
                          {msg.username.charAt(0).toUpperCase()}
                        </div>

                        {/* Message Content */}
                        <div className={`flex-1 max-w-xs ${msg.username === username ? "text-right" : ""}`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-700 text-sm">{msg.username}</span>
                            <span className="text-xs text-gray-400">{formatTime(msg.timestamp)}</span>
                          </div>
                          <div
                            className={`rounded-2xl px-4 py-3 shadow-md transition-all duration-300 hover:shadow-lg ${
                              msg.username === username
                                ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-br-md"
                                : "bg-white border border-gray-100 text-gray-800 rounded-bl-md"
                            }`}
                          >
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Enhanced Message Input */}
              <div className="p-6 border-t border-purple-100/50 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
                <div className="flex gap-3">
                  <Input
                    placeholder="Share your thoughts..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    disabled={isLoading}
                    maxLength={500}
                    className="flex-1 h-12 text-base border-2 border-purple-100 focus:border-purple-400 rounded-xl bg-white/80 backdrop-blur-sm transition-all duration-300"
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!message.trim() || isLoading}
                    className="h-12 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Users Sidebar */}
          <Card className="w-80 hidden lg:block bg-white/80 backdrop-blur-md border-0 shadow-xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-blue-100/50 pb-4">
              <CardTitle className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Community Members
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-96 p-4">
                <div className="space-y-3">
                  {users.map((user, index) => (
                    <div
                      key={user.username}
                      className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-50 to-purple-50/30 hover:from-purple-50 hover:to-pink-50 transition-all duration-300 transform hover:scale-105 animate-in slide-in-from-right-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-md ${getAvatarColor(
                          user.username,
                        )}`}
                      >
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <span className="text-sm font-semibold text-gray-700">{user.username}</span>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-xs text-gray-500">Online</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
