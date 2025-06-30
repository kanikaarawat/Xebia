"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Heart,
  Calendar,
  Users,
  Clock,
  Video,
  Phone,
  MessageCircle,
  FileText,
  TrendingUp,
  Bell,
  Settings,
  Star,
  CheckCircle,
} from "lucide-react";

export default function TherapistDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  const todayAppointments = [
    {
      id: 1,
      patient: "Jordan M.",
      time: "9:00 AM",
      type: "Video Call",
      status: "upcoming",
      notes: "Follow-up on anxiety management techniques",
    },
    {
      id: 2,
      patient: "Alex K.",
      time: "10:30 AM",
      type: "Phone Call",
      status: "completed",
      notes: "Initial consultation - depression screening",
    },
    {
      id: 3,
      patient: "Sam R.",
      time: "2:00 PM",
      type: "Video Call",
      status: "upcoming",
      notes: "CBT session - cognitive restructuring",
    },
    {
      id: 4,
      patient: "Taylor P.",
      time: "3:30 PM",
      type: "Video Call",
      status: "upcoming",
      notes: "Couples therapy session",
    },
  ];

  const recentPatients = [
    {
      id: 1,
      name: "Jordan M.",
      lastSession: "2 days ago",
      progress: "Improving",
      riskLevel: "low",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 2,
      name: "Alex K.",
      lastSession: "1 week ago",
      progress: "Stable",
      riskLevel: "medium",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      id: 3,
      name: "Sam R.",
      lastSession: "3 days ago",
      progress: "Excellent",
      riskLevel: "low",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ];

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "low":
        return <Badge className="bg-green-100 text-green-700">Low Risk</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-700">Medium Risk</Badge>;
      case "high":
        return <Badge className="bg-red-100 text-red-700">High Risk</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>;
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
            <Badge className="bg-blue-100 text-blue-700 ml-2">Therapist Portal</Badge>
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
              <AvatarFallback className="bg-blue-100 text-blue-600">SC</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Good morning, Dr. Chen</h1>
          <p className="text-slate-600">You have 4 appointments scheduled for today. Here's your overview.</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">4</p>
                          <p className="text-sm text-slate-600">Today's Sessions</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-100 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">23</p>
                          <p className="text-sm text-slate-600">Active Patients</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-purple-100 bg-white/80 backdrop-blur-sm">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                          <Star className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-slate-800">4.9</p>
                          <p className="text-sm text-slate-600">Avg Rating</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Today's Schedule */}
                <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span>Today's Schedule</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {todayAppointments.map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-slate-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="font-medium text-slate-800">{appointment.time}</p>
                            <div className="flex items-center space-x-1 mt-1">
                              {appointment.type === "Video Call" ? (
                                <Video className="w-3 h-3 text-blue-600" />
                              ) : (
                                <Phone className="w-3 h-3 text-blue-600" />
                              )}
                              <span className="text-xs text-blue-600">{appointment.type}</span>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{appointment.patient}</p>
                            <p className="text-sm text-slate-600">{appointment.notes}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {appointment.status === "completed" ? (
                            <Badge className="bg-green-100 text-green-700">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-700">Upcoming</Badge>
                          )}
                          <Button size="sm" variant="outline">
                            {appointment.status === "completed" ? "View Notes" : "Join Session"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Recent Patients */}
                <Card className="border-green-100 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-green-600" />
                      <span>Recent Patients</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recentPatients.map((patient) => (
                      <div key={patient.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={patient.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {patient.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-800 truncate">{patient.name}</p>
                          <p className="text-sm text-slate-600">{patient.lastSession}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className="bg-blue-100 text-blue-700 text-xs">{patient.progress}</Badge>
                            {getRiskBadge(patient.riskLevel)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-purple-100 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Create Note
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Schedule Session
                    </Button>
                  </CardContent>
                </Card>

                {/* Emergency Alerts */}
                <Card className="border-red-100 bg-red-50/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-red-800 flex items-center space-x-2">
                      <Bell className="w-5 h-5" />
                      <span>Alerts</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm font-medium text-yellow-800">Patient Check-in</p>
                        <p className="text-xs text-yellow-700">Alex K. missed their last appointment</p>
                      </div>
                      <Button variant="outline" className="w-full bg-white text-red-600 border-red-200 hover:bg-red-50">
                        View All Alerts
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-6">
            <Card className="border-blue-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>Manage your upcoming and past sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Appointment management interface would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="patients" className="space-y-6">
            <Card className="border-green-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Patient Management</CardTitle>
                <CardDescription>View and manage your patient roster</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Patient management interface would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-purple-100 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Practice Analytics</CardTitle>
                <CardDescription>Insights into your practice and patient outcomes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <p className="text-slate-600">Analytics dashboard would be implemented here</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 