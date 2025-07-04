"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Hash, TrendingUp, Activity } from "lucide-react"

interface RoomStats {
    totalRooms: number
    totalUsers: number
    roomDetails: Array<{
        id: string
        userCount: number
        messageCount: number
    }>
}

export default function RoomStats() {
    const [stats, setStats] = useState<RoomStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetch("/api/rooms")
                const data = await response.json()
                if (data.success) {
                    setStats(data.data)
                }
            } catch (error) {
                console.error("Error fetching room stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()

        // Refresh stats every 30 seconds
        const interval = setInterval(fetchStats, 30000)
        return () => clearInterval(interval)
    }, [])

    if (loading) {
        return (
            <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 border-0 shadow-xl">
                <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-violet-200 to-purple-200 rounded-full"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-3/4"></div>
                                <div className="h-3 bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg w-1/2"></div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!stats) {
        return (
            <Card className="w-full max-w-md backdrop-blur-xl bg-white/80 border-0 shadow-xl">
                <CardContent className="p-6 text-center">
                    <div className="space-y-3">
                        <div className="w-12 h-12 mx-auto bg-gradient-to-r from-red-100 to-rose-100 rounded-full flex items-center justify-center">
                            <Activity className="h-6 w-6 text-red-500" />
                        </div>
                        <p className="text-slate-600">Unable to load room statistics</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="w-full max-w-md backdrop-blur-xl bg-white/90 border-0 shadow-2xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 border-b border-white/20">
                <CardTitle className="flex items-center gap-3 text-lg">
                    <div className="relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500 blur-sm opacity-30"></div>
                        <div className="relative bg-gradient-to-r from-emerald-500 to-blue-500 p-2 rounded-full">
                            <TrendingUp className="h-5 w-5 text-white" />
                        </div>
                    </div>
                    <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent font-bold">
            Live Statistics
          </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/50">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            {stats.totalRooms}
                        </div>
                        <div className="text-sm text-blue-600 font-medium flex items-center justify-center gap-1 mt-1">
                            <Hash className="h-3 w-3" />
                            Active Rooms
                        </div>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-200/50">
                        <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                            {stats.totalUsers}
                        </div>
                        <div className="text-sm text-emerald-600 font-medium flex items-center justify-center gap-1 mt-1">
                            <Users className="h-3 w-3" />
                            Online Users
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="font-semibold text-slate-700 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-violet-500" />
                        Room Activity
                    </h4>
                    <div className="space-y-2">
                        {stats.roomDetails.map((room, index) => (
                            <div
                                key={room.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
                                style={{
                                    animation: `slideInMessage 0.3s ease-out ${index * 0.1}s both`,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-400 to-purple-400"></div>
                                    <span className="font-medium text-slate-700">{room.id}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Badge
                                        variant="secondary"
                                        className="flex items-center gap-1 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border border-blue-200/50"
                                    >
                                        <Users className="h-3 w-3" />
                                        {room.userCount}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className="flex items-center gap-1 bg-gradient-to-r from-emerald-500/10 to-green-500/10 text-emerald-700 border border-emerald-200/50"
                                    >
                                        <MessageSquare className="h-3 w-3" />
                                        {room.messageCount}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="pt-3 border-t border-slate-200/50">
                    <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                        Updates every 30 seconds
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
