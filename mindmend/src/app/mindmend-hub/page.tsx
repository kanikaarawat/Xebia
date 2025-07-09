"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Play, Heart, Wind, Coffee, Package, Cloud, ArrowRight, Home, Settings, LogOut, BookOpen, Users, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react'

export default function MindMendHub() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()
  const user = useUser()
  const supabase = useSupabaseClient()

  const routeMap = {
    "video-library": "/video-library",
    "calm-cat": "/calm-cat",
    "guided-breathing": "/guided-breathing",
    "mindful-sipping": "/mindful-sipping",
    "worry-box": "/worry-box",
    "loud-thoughts": "/cloud-thoughts",
  }

  const handleCardClick = (cardId: string) => {
    const route = routeMap[cardId as keyof typeof routeMap]
    if (route) {
      router.push(route)
    } else {
      console.warn(`No route found for card: ${cardId}`)
    }
  }

  const cards = [
    {
      id: "video-library",
      title: "Video Library",
      description: "Calming nature sounds & visuals",
      icon: Play,
      gradient: "from-blue-500 to-cyan-500",
      hoverGradient: "from-blue-600 to-cyan-600",
      preview: "Rain on leaves, flowing streams...",
      badge: "Popular",
      duration: "5-15 min"
    },
    {
      id: "calm-cat",
      title: "Calm Cat",
      description: "Breathe and relax together",
      icon: Heart,
      gradient: "from-pink-500 to-rose-500",
      hoverGradient: "from-pink-600 to-rose-600",
      preview: "Purr... purr... breathe...",
      badge: "New",
      duration: "3-10 min"
    },
    {
      id: "guided-breathing",
      title: "Guided Breathing",
      description: "Breathe with me",
      icon: Wind,
      gradient: "from-cyan-500 to-blue-500",
      hoverGradient: "from-cyan-600 to-blue-600",
      preview: "Inhale... hold... exhale...",
      badge: "Featured",
      duration: "2-8 min"
    },
    {
      id: "mindful-sipping",
      title: "Mindful Sipping",
      description: "Focus on warmth & sensation",
      icon: Coffee,
      gradient: "from-amber-500 to-orange-500",
      hoverGradient: "from-amber-600 to-orange-600",
      preview: "Feel the warmth, taste the moment...",
      duration: "5-12 min"
    },
    {
      id: "worry-box",
      title: "Worry Box",
      description: "Send your worries away",
      icon: Package,
      gradient: "from-purple-500 to-violet-500",
      hoverGradient: "from-purple-600 to-violet-600",
      preview: "Let it go... whoosh...",
      badge: "Therapeutic",
      duration: "3-7 min"
    },
    {
      id: "loud-thoughts",
      title: "Loud Thoughts",
      description: "Write it down, let it drift away",
      icon: Cloud,
      gradient: "from-slate-500 to-gray-500",
      hoverGradient: "from-slate-600 to-gray-600",
      preview: "Write... release... watch it float away...",
      duration: "5-15 min"
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-lg border-b border-indigo-200 shadow-sm">
        <div className="container mx-auto flex items-center justify-between px-3 sm:px-4 lg:px-6 xl:px-8 py-2 sm:py-3 lg:py-4">
          {/* Left: Logo and Brand */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="flex h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 shadow-lg">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
              </span>
              <span className="text-sm sm:text-base lg:text-lg xl:text-xl font-bold text-indigo-800 hidden sm:block">
                MindMend
              </span>
            </div>
          </div>

          {/* Center: Page Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-xs sm:text-sm lg:text-base xl:text-lg font-semibold text-indigo-700">
              Wellness Hub
            </h1>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 sm:gap-2 lg:gap-3 xl:gap-4">
            {/* Dashboard Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600 p-1 sm:p-2"
              onClick={() => router.push('/dashboard')}
            >
              <Home className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </Button>

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="sm"
              className="text-indigo-600 p-1 sm:p-2"
              onClick={() => router.push('/dashboard/settings')}
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </Button>

            {/* Profile Dropdown */}
            {user && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="sm" className="p-1">
                    <Avatar className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 xl:h-10 xl:w-10 cursor-pointer">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs sm:text-sm lg:text-base">
                        {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-44 sm:w-48 lg:w-56 p-0 bg-gradient-to-br from-white via-indigo-50/30 to-pink-50/30 backdrop-blur-sm border border-indigo-200 shadow-xl" align="end">
                  <div className="p-2 sm:p-3 lg:p-4 border-b border-indigo-200 bg-gradient-to-r from-indigo-50 to-pink-50">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10">
                        <AvatarImage src={user.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-indigo-100 text-indigo-700">
                          {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-indigo-900 text-xs sm:text-sm lg:text-base">
                          {user.user_metadata?.full_name || user.email}
                        </p>
                        <p className="text-xs sm:text-sm text-indigo-600">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-1">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left hover:bg-indigo-50/50 text-xs sm:text-sm"
                      onClick={() => router.push('/dashboard')}
                    >
                      <Home className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left text-red-600 hover:text-red-700 hover:bg-red-50/50 text-xs sm:text-sm"
                      onClick={async () => {
                        await supabase.auth.signOut();
                        router.push('/login');
                      }}
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="container mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 xl:py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 rounded-xl sm:rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 border border-indigo-100 shadow-sm mb-3 sm:mb-4 lg:mb-6 xl:mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 xl:h-20 xl:w-20 border-2 sm:border-4 border-white shadow-lg rounded-xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-12 xl:w-12 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-indigo-800 mb-1 sm:mb-2">
                Welcome to your Wellness Hub! ✨
              </h1>
              <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-indigo-600 mb-2 sm:mb-3">
                Discover gentle activities designed to support your mental wellness journey.
              </p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <Badge className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium">
                  Wellness Activities
                </Badge>
                <Badge className="bg-white/80 text-indigo-700 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium border border-indigo-200">
                  6 Activities Available
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full max-w-7xl mx-auto"
        >
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 rounded-xl bg-white/70 backdrop-blur p-1 h-10 sm:h-12 lg:h-14 xl:h-16">
            <TabsTrigger value="overview" className="rounded-lg text-sm sm:text-base lg:text-lg font-medium">Overview</TabsTrigger>
            <TabsTrigger value="activities" className="rounded-lg text-sm sm:text-base lg:text-lg font-medium">Activities</TabsTrigger>
            <TabsTrigger value="resources" className="rounded-lg text-sm sm:text-base lg:text-lg font-medium hidden sm:block">Resources</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
            <div className="grid gap-3 sm:gap-4 lg:gap-6 xl:gap-8 xl:grid-cols-3">
              {/* Left (2 cols on large screens, 1 col on smaller) */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8 xl:col-span-2">
                {/* Stats Cards */}
                <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4">
                  {[
                    {
                      icon: BookOpen,
                      value: "6",
                      label: "Activities",
                    },
                    {
                      icon: Clock,
                      value: "5-15",
                      label: "Minutes",
                    },
                    {
                      icon: Heart,
                      value: "24/7",
                      label: "Available",
                    },
                    {
                      icon: TrendingUp,
                      value: "Free",
                      label: "Access",
                    },
                  ].map(({ icon: Icon, value, label }) => (
                    <Card
                      key={label}
                      className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow"
                    >
                      <CardContent className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 lg:p-4 xl:p-5">
                        <span className="flex h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 xl:h-11 xl:w-11 items-center justify-center rounded-full bg-indigo-100">
                          <Icon className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-indigo-600" />
                        </span>
                        <div>
                          <p className="text-sm sm:text-base lg:text-lg xl:text-xl 2xl:text-2xl font-bold mb-1 text-indigo-800">
                            {value}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-600 font-medium">{label}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Action Cards - Mobile Only */}
                <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-1 sm:hidden">
                  <Card className="border-indigo-100 bg-gradient-to-r from-indigo-50 to-pink-50 shadow-md">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-semibold text-indigo-800">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 sm:p-4 pt-0">
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <Button
                          variant="outline"
                          className="flex flex-col items-center gap-1 p-2 sm:p-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                          onClick={() => setActiveTab('activities')}
                        >
                          <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm font-medium">Activities</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex flex-col items-center gap-1 p-2 sm:p-3 border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300 transition-colors"
                          onClick={() => setActiveTab('resources')}
                        >
                          <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="text-xs sm:text-sm font-medium">Resources</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Featured Activity */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-2 sm:pb-3 lg:pb-4 xl:pb-6">
                    <CardTitle className="flex items-center gap-2 sm:gap-3 text-indigo-800 text-sm sm:text-base lg:text-lg xl:text-xl">
                      <Heart className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-indigo-600" />
                      Featured Activity: Guided Breathing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-8 pt-0">
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-cyan-200">
                      <div className="flex items-center gap-3 sm:gap-4 mb-4">
                        <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-lg">
                          <Wind className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold text-slate-800">Guided Breathing</h3>
                          <p className="text-sm text-slate-600">Perfect for stress relief and relaxation</p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mb-4">
                        Take a moment to breathe deeply and find your center. This guided breathing exercise 
                        helps reduce stress and promotes mental clarity.
                      </p>
                      <Button 
                        onClick={() => handleCardClick('guided-breathing')}
                        className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
                      >
                        Start Breathing Exercise
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
                {/* Wellness Tips */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-2 sm:pb-3 lg:pb-4 xl:pb-6">
                    <CardTitle className="text-indigo-800 text-sm sm:text-base lg:text-lg xl:text-xl">
                      Wellness Tips
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-8 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Take breaks throughout the day to practice mindfulness
                        </p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 rounded-full bg-pink-500 mt-2 flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Stay hydrated and maintain a regular sleep schedule
                        </p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 flex-shrink-0"></div>
                        <p className="text-xs sm:text-sm text-slate-600">
                          Practice gratitude and self-compassion daily
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="border-indigo-100 bg-white/80 shadow-md">
                  <CardHeader className="pb-2 sm:pb-3 lg:pb-4 xl:pb-6">
                    <CardTitle className="text-indigo-800 text-sm sm:text-base lg:text-lg xl:text-xl">
                      Your Wellness Journey
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-8 pt-0">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-slate-600">Activities Completed</span>
                        <span className="text-sm sm:text-base font-semibold text-indigo-600">0</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-slate-600">Total Time</span>
                        <span className="text-sm sm:text-base font-semibold text-indigo-600">0 min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs sm:text-sm text-slate-600">Current Streak</span>
                        <span className="text-sm sm:text-base font-semibold text-indigo-600">0 days</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Activities Tab */}
          <TabsContent value="activities" className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {cards.map((card, index) => {
                const Icon = card.icon
                return (
                  <motion.div
                    key={card.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    onHoverStart={() => setHoveredCard(card.id)}
                    onHoverEnd={() => setHoveredCard(null)}
                    className="relative group"
                  >
                    <Card 
                      className="overflow-hidden border-0 bg-gradient-to-br from-white to-slate-50/50 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer h-full transform hover:scale-105 hover:-translate-y-1"
                      onClick={() => handleCardClick(card.id)}
                    >
                      {/* Gradient Background Overlay */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                      
                      {/* Animated Border */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-xl`} />
                      
                      <CardHeader className="pb-4 relative z-10">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <motion.div
                              className={`p-4 rounded-2xl bg-gradient-to-br ${card.gradient} shadow-2xl group-hover:shadow-3xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-3`}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                            >
                              <Icon className="w-8 h-8 text-white" />
                            </motion.div>
                            
                            {/* Badge */}
                            {card.badge && (
                              <Badge 
                                className="bg-white/95 text-slate-700 border-0 shadow-lg backdrop-blur-sm font-medium text-xs px-2 py-1"
                              >
                                {card.badge}
                              </Badge>
                            )}
                          </div>
                          
                          {/* Duration */}
                          <div className="text-xs font-semibold text-slate-500 bg-white/80 px-2 py-1 rounded-full">
                            {card.duration}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0 relative z-10">
                        <div className="space-y-4">
                          <div>
                            <CardTitle className="text-2xl font-bold text-slate-800 group-hover:text-slate-900 transition-colors mb-3">
                              {card.title}
                            </CardTitle>
                            <CardDescription className="text-slate-600 group-hover:text-slate-700 transition-colors text-base leading-relaxed">
                              {card.description}
                            </CardDescription>
                          </div>

                          {/* Preview Text */}
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ 
                              opacity: hoveredCard === card.id ? 1 : 0,
                              height: hoveredCard === card.id ? "auto" : 0
                            }}
                            transition={{ duration: 0.4 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-slate-500 italic bg-slate-50/80 p-3 rounded-lg">
                              {card.preview}
                            </p>
                          </motion.div>

                          {/* Action Button */}
                          <div className="flex items-center justify-between pt-4">
                            <Button
                              className={`bg-gradient-to-r ${card.gradient} hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-white border-0`}
                              size="sm"
                            >
                              Start Activity
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                            
                            {/* Subtle animation elements */}
                            <motion.div
                              animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.3, 0.6, 0.3],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 opacity-0 group-hover:opacity-100"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-3 sm:space-y-4 lg:space-y-6 xl:space-y-8">
            <Card className="border-indigo-100 bg-white/80 shadow-md">
              <CardHeader>
                <CardTitle className="text-indigo-800">Mental Wellness Resources</CardTitle>
                <CardDescription>
                  Additional resources to support your mental health journey
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 lg:p-6 xl:p-8 pt-0">
                <div className="grid gap-4 sm:gap-6">
                  <div className="bg-gradient-to-r from-indigo-50 to-pink-50 rounded-xl p-4 sm:p-6 border border-indigo-200">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-2">Crisis Resources</h3>
                    <p className="text-sm text-slate-600 mb-3">
                      If you&apos;re experiencing a mental health crisis, help is available 24/7.
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-indigo-700">National Suicide Prevention Lifeline: 988</p>
                      <p className="text-sm font-medium text-indigo-700">Crisis Text Line: Text HOME to 741741</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 sm:p-6 border border-green-200">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Self-Care Tips</h3>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• Practice daily gratitude</li>
                      <li>• Maintain a regular sleep schedule</li>
                      <li>• Stay connected with loved ones</li>
                      <li>• Engage in physical activity</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}