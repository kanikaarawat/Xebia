"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Calendar,
  MessageCircle,
  BookOpen,
  Users,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Bell,
  Settings,
  Video,
  Phone,
} from "lucide-react";

export default function UserDashboard() {
  const [currentMood, setCurrentMood] = useState<"happy" | "neutral" | "sad" | null>(null);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upcomingAppointments = [
    {
      id: 1,
      therapist: "Dr. Sarah Chen",
      date: "Today, 2:00 PM",
      type: "Video Call",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      therapist: "Dr. Michael Rodriguez",
      date: "Tomorrow, 10:00 AM",
      type: "Phone Call",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  const moodData = [
    { day: "Mon", mood: 7 },
    { day: "Tue", mood: 6 },
    { day: "Wed", mood: 8 },
    { day: "Thu", mood: 5 },
    { day: "Fri", mood: 7 },
    { day: "Sat", mood: 9 },
    { day: "Sun", mood: 8 },
  ];

  // Map mood to score
  const moodToScore = (mood: "happy" | "neutral" | "sad") => {
    switch (mood) {
      case "happy": return 8;
      case "neutral": return 5;
      case "sad": return 2;
      default: return 5;
    }
  };

  const handleLogMood = async () => {
    if (!currentMood) return;
    setLoading(true);
    setError(null);
    setInsight(null);
    try {
      const res = await fetch("/api/mood-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood_score: moodToScore(currentMood) }),
      });
      if (!res.ok) throw new Error("Failed to fetch insight");
      const data = await res.json();
      setInsight(data.message);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      {/* Header */}
      <header className="border-b border-blue-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-slate-800">MindMend</span>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
              <Bell className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-slate-600 hover:text-blue-600">
              <Settings className="w-4 h-4" />
            </Button>
            <Avatar className="w-8 h-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback className="bg-blue-100 text-blue-600">JD</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Welcome back, Jordan</h1>
          <p className="text-slate-600">How are you feeling today? Let's check in on your wellness journey.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Mood Check */}
            <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <span>Quick Mood Check</span>
                </CardTitle>
                <CardDescription>How are you feeling right now?</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center space-x-8">
                  <Button
                    variant={currentMood === "happy" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setCurrentMood("happy")}
                    className={`flex flex-col items-center space-y-2 h-auto py-4 px-6 ${
                      currentMood === "happy"
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "border-green-200 hover:bg-green-50 text-green-600"
                    }`}
                  >
                    <Smile className="w-8 h-8" />
                    <span>Good</span>
                  </Button>
                  <Button
                    variant={currentMood === "neutral" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setCurrentMood("neutral")}
                    className={`flex flex-col items-center space-y-2 h-auto py-4 px-6 ${
                      currentMood === "neutral"
                        ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                        : "border-yellow-200 hover:bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    <Meh className="w-8 h-8" />
                    <span>Okay</span>
                  </Button>
                  <Button
                    variant={currentMood === "sad" ? "default" : "outline"}
                    size="lg"
                    onClick={() => setCurrentMood("sad")}
                    className={`flex flex-col items-center space-y-2 h-auto py-4 px-6 ${
                      currentMood === "sad"
                        ? "bg-blue-500 hover:bg-blue-600 text-white"
                        : "border-blue-200 hover:bg-blue-50 text-blue-600"
                    }`}
                  >
                    <Frown className="w-8 h-8" />
                    <span>Struggling</span>
                  </Button>
                </div>
                {currentMood && (
                  <div className="mt-4 text-center">
                    <Button
                      className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white"
                      onClick={handleLogMood}
                      disabled={loading}
                    >
                      {loading ? "Logging..." : "Log Mood"}
                    </Button>
                    {insight && (
                      <div className="mt-4 p-3 bg-blue-50 rounded text-blue-800 text-sm border border-blue-100">
                        {insight}
                      </div>
                    )}
                    {error && (
                      <div className="mt-4 p-3 bg-red-50 rounded text-red-800 text-sm border border-red-100">
                        {error}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mood Trends */}
            <Card className="border-green-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Your Mood This Week</span>
                </CardTitle>
                <CardDescription>Track your emotional patterns over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-end justify-between h-32 space-x-2">
                  {moodData.map((data, index) => (
                    <div key={index} className="flex flex-col items-center space-y-2 flex-1">
                      <div
                        className="w-full bg-gradient-to-t from-blue-400 to-green-400 rounded-t-md transition-all duration-300"
                        style={{ height: `${(data.mood / 10) * 100}%` }}
                      />
                      <span className="text-xs text-slate-600">{data.day}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span>Average: 7.1/10</span>
                  <Badge className="bg-green-100 text-green-700">+0.8 from last week</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="border-purple-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Self-Help Library</h3>
                      <p className="text-sm text-slate-600">Explore guided exercises</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-teal-100 bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">Community Forums</h3>
                      <p className="text-sm text-slate-600">Connect with others</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Upcoming Sessions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={appointment.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {appointment.therapist
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-800 truncate">{appointment.therapist}</p>
                      <p className="text-sm text-slate-600">{appointment.date}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        {appointment.type === "Video Call" ? (
                          <Video className="w-3 h-3 text-blue-600" />
                        ) : (
                          <Phone className="w-3 h-3 text-blue-600" />
                        )}
                        <span className="text-xs text-blue-600">{appointment.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">Book New Session</Button>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="border-green-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Your Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Weekly Goals</span>
                    <span className="text-green-600 font-medium">4/5</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Mood Entries</span>
                    <span className="text-blue-600 font-medium">6/7 days</span>
                  </div>
                  <Progress value={86} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-600">Self-Care Activities</span>
                    <span className="text-purple-600 font-medium">3/3</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Quick Support */}
            <Card className="border-red-100 bg-red-50/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-800">Need Support?</CardTitle>
                <CardDescription className="text-red-600">We're here for you 24/7</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full bg-white text-red-600 border-red-200 hover:bg-red-50">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Crisis Chat
                </Button>
                <div className="text-xs text-red-600 text-center">
                  <p>Crisis Text Line: Text HOME to 741741</p>
                  <p>National Suicide Prevention Lifeline: 988</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 