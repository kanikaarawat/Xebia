'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  CreditCard, 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  LogOut,
  BarChart3
} from 'lucide-react';


interface Analytics {
  totalUsers: number;
  totalTherapists: number;
  totalAppointments: number;
  upcomingAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  rejectedAppointments: number;
  expiredAppointments: number;
  totalPhoneCalls: number;
  totalVideoCalls: number;
  pendingPayments: number;
  paidPayments: number;
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  scheduled_at: string;
  status: string;
  type: string;
  payment_status: string;
  duration: number;
  notes?: string;
  patient?: { first_name: string; last_name: string; email: string };
  therapist?: { first_name: string; last_name: string; email: string };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Record<string, unknown> | null>(null);
  const [editType, setEditType] = useState<'user' | 'appointment'>('user');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedTherapistId, setSelectedTherapistId] = useState('');

  // Simple toast implementation
  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    console.log(`${type.toUpperCase()}: ${title} - ${message}`);
    // You can replace this with a proper toast library
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [usersRes, appointmentsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/appointments'),
        fetch('/api/admin/analytics')
      ]);

      const usersData = await usersRes.json();
      const appointmentsData = await appointmentsRes.json();
      const analyticsData = await analyticsRes.json();

      if (usersRes.ok) setUsers(usersData);
      if (appointmentsRes.ok) setAppointments(appointmentsData);
      if (analyticsRes.ok) setAnalytics(analyticsData);
          } catch (error) {
        console.error('Error fetching data:', error);
        showToast("Error", "Failed to fetch data", "error");
      } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('adminAuthenticated');
    window.location.href = '/admin/login';
  };

  const handleCreate = (type: 'user' | 'appointment') => {
    setEditType(type);
    setEditingItem(null);
    setSelectedPatientId('');
    setSelectedTherapistId('');
    setIsCreateModalOpen(true);
  };

  const handleEdit = (item: Record<string, unknown>, type: 'user' | 'appointment') => {
    setEditingItem(item);
    setEditType(type);
    
    // Set selected values for appointments
    if (type === 'appointment') {
      setSelectedPatientId(item.patient_id as string || '');
      setSelectedTherapistId(item.therapist_id as string || '');
    }
    
    setIsEditModalOpen(true);
  };

  const handleDelete = (item: Record<string, unknown>, type: 'user' | 'appointment') => {
    setEditingItem(item);
    setEditType(type);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries());

    // For appointments, use the selected IDs
    if (editType === 'appointment') {
      data.patient_id = selectedPatientId;
      data.therapist_id = selectedTherapistId;
    }

    try {
      const url = editType === 'user' ? '/api/admin/users' : '/api/admin/appointments';
      const method = editingItem ? 'PUT' : 'POST';
      
      if (editingItem && typeof editingItem.id === 'string') {
        data.id = editingItem.id;
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (response.ok) {
        showToast("Success", `${editType === 'user' ? 'User' : 'Appointment'} ${editingItem ? 'updated' : 'created'} successfully`);
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setSelectedPatientId('');
        setSelectedTherapistId('');
        fetchData();
      } else {
        throw new Error(result.error || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast("Error", error instanceof Error ? error.message : 'Operation failed', "error");
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const url = editType === 'user' ? '/api/admin/users' : '/api/admin/appointments';
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingItem?.id })
      });

      const result = await response.json();

      if (response.ok) {
        showToast("Success", `${editType === 'user' ? 'User' : 'Appointment'} deleted successfully`);
        setIsDeleteModalOpen(false);
        fetchData();
      } else {
        throw new Error(result.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Error:', error);
      showToast("Error", error instanceof Error ? error.message : 'Delete failed', "error");
    }
  };



  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      expired: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {status}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      paid: 'bg-green-100 text-green-800 border-green-200'
    };

    return (
      <Badge className={variants[status] || 'bg-gray-100 text-gray-800 border-gray-200'}>
        {status}
      </Badge>
    );
  };

  const getFullName = (user: User) => {
    const firstName = user.first_name || '';
    const lastName = user.last_name || '';
    return `${firstName} ${lastName}`.trim() || user.email;
  };

  const getPatientName = (appointment: Appointment) => {
    if (appointment.patient) {
      const firstName = appointment.patient.first_name || '';
      const lastName = appointment.patient.last_name || '';
      return `${firstName} ${lastName}`.trim() || appointment.patient.email;
    }
    return 'Unknown';
  };

  const getTherapistName = (appointment: Appointment) => {
    if (appointment.therapist) {
      const firstName = appointment.therapist.first_name || '';
      const lastName = appointment.therapist.last_name || '';
      return `${firstName} ${lastName}`.trim() || appointment.therapist.email;
    }
    return 'Unknown';
  };

  const filteredUsers = users.filter(user => 
    getFullName(user).toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = 
      getPatientName(appointment).toLowerCase().includes(searchQuery.toLowerCase()) ||
      getTherapistName(appointment).toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || appointment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-indigo-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">A</span>
              </div>
              <h1 className="text-2xl font-bold text-indigo-800">Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-indigo-600">Welcome, Admin</span>
              <Button onClick={handleLogout} variant="outline" size="sm" className="border-indigo-200 text-indigo-700">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile full-width minimal nav bar */}
      <div className="lg:hidden w-full sticky top-16 z-40 bg-gradient-to-r from-white via-indigo-50 to-pink-50 shadow-md border-b border-indigo-100">
        <div className="flex justify-between items-center px-1 py-1">
          {[
            { value: "overview", icon: BarChart3 },
            { value: "users", icon: Users },
            { value: "appointments", icon: Calendar },
            { value: "therapists", icon: Users },
            { value: "analytics", icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.value}
              className={`flex flex-col items-center justify-center flex-1 transition-all mx-1 ${activeTab === tab.value ? "text-indigo-700" : "text-slate-400 hover:text-indigo-500"}`}
              onClick={() => setActiveTab(tab.value)}
              aria-label={tab.value}
            >
              <tab.icon className={`h-5 w-5 ${activeTab === tab.value ? "" : "opacity-70"}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-pink-600 rounded-xl p-6 text-white shadow-lg mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h2>
              <p className="text-indigo-100">Monitor and manage your mental health platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-indigo-200">Last Updated</p>
              <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden lg:grid w-full grid-cols-5 bg-white/50 backdrop-blur-sm border border-indigo-200">
            <TabsTrigger value="overview" className="text-indigo-700 data-[state=active]:bg-indigo-100">Overview</TabsTrigger>
            <TabsTrigger value="users" className="text-indigo-700 data-[state=active]:bg-indigo-100">Users</TabsTrigger>
            <TabsTrigger value="appointments" className="text-indigo-700 data-[state=active]:bg-indigo-100">Appointments</TabsTrigger>
            <TabsTrigger value="therapists" className="text-indigo-700 data-[state=active]:bg-indigo-100">Therapists</TabsTrigger>
            <TabsTrigger value="analytics" className="text-indigo-700 data-[state=active]:bg-indigo-100">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
           

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 min-w-0">
                  <CardTitle className="text-xs sm:text-sm md:text-base font-medium text-indigo-600 break-words truncate">Total Users</CardTitle>
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-800 break-words truncate">{analytics?.totalUsers || 0}</div>
                  <p className="text-xs sm:text-sm text-indigo-600 mt-1 break-words truncate">Registered users</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 min-w-0">
                  <CardTitle className="text-xs sm:text-sm md:text-base font-medium text-indigo-600 break-words truncate">Total Therapists</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Users className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-800 break-words truncate">{analytics?.totalTherapists || 0}</div>
                  <p className="text-xs sm:text-sm text-indigo-600 mt-1 break-words truncate">Active therapists</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 min-w-0">
                  <CardTitle className="text-xs sm:text-sm md:text-base font-medium text-indigo-600 break-words truncate">Total Appointments</CardTitle>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Calendar className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-800 break-words truncate">{analytics?.totalAppointments || 0}</div>
                  <p className="text-xs sm:text-sm text-indigo-600 mt-1 break-words truncate">All appointments</p>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 min-w-0">
                  <CardTitle className="text-xs sm:text-sm md:text-base font-medium text-indigo-600 break-words truncate">Upcoming</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="text-xl sm:text-2xl font-bold text-indigo-800 break-words truncate">{analytics?.upcomingAppointments || 0}</div>
                  <p className="text-xs sm:text-sm text-indigo-600 mt-1 break-words truncate">Scheduled sessions</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Analytics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Appointment Status Overview */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="min-w-0">
                  <CardTitle className="text-indigo-800 flex items-center space-x-2 min-w-0">
                    <Calendar className="h-5 w-5" />
                    <span>Appointment Status</span>
                  </CardTitle>
                  <CardDescription className="text-indigo-600">Current appointment distribution</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-indigo-700 font-medium">Upcoming</span>
                      </div>
                      <Badge variant="outline" className="border-blue-200 text-blue-700">
                        {analytics?.upcomingAppointments || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-indigo-700 font-medium">Completed</span>
                      </div>
                      <Badge variant="outline" className="border-green-200 text-green-700">
                        {analytics?.completedAppointments || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="text-indigo-700 font-medium">Cancelled</span>
                      </div>
                      <Badge variant="outline" className="border-red-200 text-red-700">
                        {analytics?.cancelledAppointments || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="text-indigo-700 font-medium">Rejected</span>
                      </div>
                      <Badge variant="outline" className="border-orange-200 text-orange-700">
                        {analytics?.rejectedAppointments || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                        <span className="text-indigo-700 font-medium">Expired</span>
                      </div>
                      <Badge variant="outline" className="border-gray-200 text-gray-700">
                        {analytics?.expiredAppointments || 0}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Session Types & Payment Status */}
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader className="min-w-0">
                  <CardTitle className="text-indigo-800 flex items-center space-x-2 min-w-0">
                    <CreditCard className="h-5 w-5" />
                    <span>Session Types & Payments</span>
                  </CardTitle>
                  <CardDescription className="text-indigo-600">Session distribution and payment status</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="space-y-6">
                    {/* Session Types */}
                    <div>
                      <h4 className="text-sm font-medium text-indigo-700 mb-3">Session Types</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-indigo-50 rounded-lg border border-indigo-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                            <span className="text-indigo-700 font-medium">Phone Calls</span>
                          </div>
                          <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                            {analytics?.totalPhoneCalls || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-pink-50 rounded-lg border border-pink-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                            <span className="text-indigo-700 font-medium">Video Calls</span>
                          </div>
                          <Badge variant="outline" className="border-pink-200 text-pink-700">
                            {analytics?.totalVideoCalls || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <h4 className="text-sm font-medium text-indigo-700 mb-3">Payment Status</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span className="text-indigo-700 font-medium">Pending</span>
                          </div>
                          <Badge variant="outline" className="border-yellow-200 text-yellow-700">
                            {analytics?.pendingPayments || 0}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-indigo-700 font-medium">Paid</span>
                          </div>
                          <Badge variant="outline" className="border-green-200 text-green-700">
                            {analytics?.paidPayments || 0}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="min-w-0">
                <CardTitle className="text-indigo-800 min-w-0">Quick Actions</CardTitle>
                <CardDescription className="text-indigo-600">Common admin tasks</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => handleCreate('user')}
                    className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white h-16 flex flex-col items-center justify-center space-y-1"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-sm">Add User</span>
                  </Button>
                  <Button 
                    onClick={() => handleCreate('appointment')}
                    className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white h-16 flex flex-col items-center justify-center space-y-1"
                  >
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">Add Appointment</span>
                  </Button>
                  <Button 
                    onClick={() => window.location.href = '/admin?tab=analytics'}
                    className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white h-16 flex flex-col items-center justify-center space-y-1"
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm">View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity Summary */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="min-w-0">
                <CardTitle className="text-indigo-800 min-w-0">Platform Summary</CardTitle>
                <CardDescription className="text-indigo-600">Key insights about your platform</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                    <div className="text-2xl font-bold text-indigo-800">{analytics?.totalUsers || 0}</div>
                    <div className="text-sm text-indigo-600">Total Users</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="text-2xl font-bold text-green-800">{analytics?.totalTherapists || 0}</div>
                    <div className="text-sm text-green-600">Active Therapists</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="text-2xl font-bold text-purple-800">{analytics?.totalAppointments || 0}</div>
                    <div className="text-sm text-purple-600">Total Sessions</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg border border-pink-200">
                    <div className="text-2xl font-bold text-pink-800">{analytics?.upcomingAppointments || 0}</div>
                    <div className="text-sm text-pink-600">Upcoming</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-indigo-800 min-w-0">User Management</CardTitle>
                    <CardDescription className="text-indigo-600">Manage user accounts and permissions</CardDescription>
                  </div>
                  <Button onClick={() => handleCreate('user')} className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
                    <Input
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-indigo-200 focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-4">
                    {filteredUsers.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors overflow-x-auto min-w-0 w-full">
                        <div className="flex items-center space-x-3 min-w-0 w-full">
                          <Avatar>
                            <AvatarImage src="" />
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-pink-600 text-white">
                              {getFullName(user).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 w-full">
                            <p className="font-medium text-indigo-800 truncate max-w-full break-words overflow-hidden">{getFullName(user)}</p>
                            <p className="text-sm text-indigo-600 truncate max-w-full break-words overflow-hidden">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 min-w-0 w-full">
                          <Badge variant="secondary">{user.role}</Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user as unknown as Record<string, unknown>, 'user')}
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(user as unknown as Record<string, unknown>, 'user')}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="min-w-0">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-indigo-800 min-w-0">Appointment Management</CardTitle>
                    <CardDescription className="text-indigo-600">Manage appointments and schedules</CardDescription>
                  </div>
                  <Button onClick={() => handleCreate('appointment')} className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Appointment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-indigo-400 w-4 h-4" />
                      <Input
                        placeholder="Search appointments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-indigo-200 focus:border-indigo-500"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full sm:w-48 border-indigo-200">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-4">
                    {filteredAppointments.map((appointment) => (
                      <div key={appointment.id} className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(appointment.status)}
                            <Badge variant="outline" className="border-indigo-200 text-indigo-700">
                              {appointment.type || 'session'}
                            </Badge>
                            {getPaymentStatusBadge(appointment.payment_status)}
                          </div>
                          <p className="text-sm text-indigo-600">
                            {new Date(appointment.scheduled_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <p className="text-indigo-800"><strong>Patient:</strong> {getPatientName(appointment)}</p>
                            <p className="text-indigo-800"><strong>Therapist:</strong> {getTherapistName(appointment)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-indigo-600">
                              {new Date(appointment.scheduled_at).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-end mt-2 space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(appointment as unknown as Record<string, unknown>, 'appointment')}
                            className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(appointment as unknown as Record<string, unknown>, 'appointment')}
                            className="border-red-200 text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="therapists" className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="min-w-0">
                <CardTitle className="text-indigo-800 min-w-0">Therapist Management</CardTitle>
                <CardDescription className="text-indigo-600">Manage therapist accounts and availability</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="space-y-4">
                  {users.filter(user => user.role === 'therapist').map((therapist) => (
                    <div key={therapist.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors overflow-x-auto min-w-0 w-full">
                      <div className="flex items-center space-x-3 min-w-0 w-full">
                        <Avatar>
                          <AvatarImage src="" />
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-blue-600 text-white">
                            {getFullName(therapist).charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 w-full">
                          <p className="font-medium text-indigo-800 truncate max-w-full break-words overflow-hidden">{getFullName(therapist)}</p>
                          <p className="text-sm text-indigo-600 truncate max-w-full break-words overflow-hidden">{therapist.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 min-w-0 w-full">
                        <Badge variant="secondary">Therapist</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(therapist as unknown as Record<string, unknown>, 'user')}
                          className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(therapist as unknown as Record<string, unknown>, 'user')}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader className="min-w-0">
                <CardTitle className="text-indigo-800 min-w-0">Payment Analytics</CardTitle>
                <CardDescription className="text-indigo-600">Payment status overview</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <CreditCard className="h-8 w-8 text-yellow-500" />
                    <div>
                      <div className="text-2xl font-bold text-indigo-800">{analytics?.pendingPayments || 0}</div>
                      <div className="text-sm text-indigo-600">Pending Payments</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <TrendingUp className="h-8 w-8 text-green-500" />
                    <div>
                      <div className="text-2xl font-bold text-indigo-800">{analytics?.paidPayments || 0}</div>
                      <div className="text-sm text-indigo-600">Paid Payments</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-800">Create New {editType === 'user' ? 'User' : 'Appointment'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editType === 'user' ? (
              <>
                <div>
                  <Label htmlFor="email" className="text-indigo-700">Email</Label>
                  <Input id="email" name="email" type="email" required className="border-indigo-200 focus:border-indigo-500" />
                </div>
                <div>
                  <Label htmlFor="first_name" className="text-indigo-700">First Name</Label>
                  <Input id="first_name" name="first_name" required className="border-indigo-200 focus:border-indigo-500" />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-indigo-700">Last Name</Label>
                  <Input id="last_name" name="last_name" required className="border-indigo-200 focus:border-indigo-500" />
                </div>
                <div>
                  <Label htmlFor="role" className="text-indigo-700">Role</Label>
                  <Select name="role" defaultValue="user">
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="patient_id" className="text-indigo-700">Patient</Label>
                  <Select name="patient_id" value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue placeholder="Select Patient">
                        {selectedPatientId && users.find(u => u.id === selectedPatientId) 
                          ? getFullName(users.find(u => u.id === selectedPatientId)!) 
                          : "Select Patient"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {users.filter(user => user.role === 'user').map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {getFullName(patient)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="therapist_id" className="text-indigo-700">Therapist</Label>
                  <Select name="therapist_id" value={selectedTherapistId} onValueChange={setSelectedTherapistId}>
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue placeholder="Select Therapist">
                        {selectedTherapistId && users.find(u => u.id === selectedTherapistId) 
                          ? getFullName(users.find(u => u.id === selectedTherapistId)!) 
                          : "Select Therapist"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {users.filter(user => user.role === 'therapist').map(therapist => (
                        <SelectItem key={therapist.id} value={therapist.id}>
                          {getFullName(therapist)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled_at" className="text-indigo-700">Scheduled At</Label>
                  <Input id="scheduled_at" name="scheduled_at" type="datetime-local" required className="border-indigo-200 focus:border-indigo-500" />
                </div>
                <div>
                  <Label htmlFor="type" className="text-indigo-700">Type</Label>
                  <Select name="type" defaultValue="session">
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="session" disabled>Session</SelectItem>
                      <SelectItem value="Phone Call">Phone Call</SelectItem>
                      <SelectItem value="Video Call">Video Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-indigo-700">Notes</Label>
                  <Textarea id="notes" name="notes" className="border-indigo-200 focus:border-indigo-500" />
                </div>
              </>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} className="border-indigo-200 text-indigo-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white">
                Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-800">Edit {editType === 'user' ? 'User' : 'Appointment'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            {editType === 'user' ? (
              <>
                <div>
                  <Label htmlFor="email" className="text-indigo-700">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={editingItem?.email as string} required className="border-indigo-200 focus:border-indigo-500" />
                </div>
                <div>
                  <Label htmlFor="first_name" className="text-indigo-700">First Name</Label>
                  <Input id="first_name" name="first_name" defaultValue={editingItem?.first_name as string} required className="border-indigo-200 focus:border-indigo-500" />
                </div>
                <div>
                  <Label htmlFor="last_name" className="text-indigo-700">Last Name</Label>
                  <Input id="last_name" name="last_name" defaultValue={editingItem?.last_name as string} required className="border-indigo-200 focus:border-indigo-500" />
                </div>
                <div>
                  <Label htmlFor="role" className="text-indigo-700">Role</Label>
                  <Select name="role" defaultValue={editingItem?.role as string}>
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="therapist">Therapist</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="patient_id" className="text-indigo-700">Patient</Label>
                  <Select name="patient_id" value={selectedPatientId} onValueChange={setSelectedPatientId}>
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue placeholder="Select Patient">
                        {selectedPatientId && users.find(u => u.id === selectedPatientId) 
                          ? getFullName(users.find(u => u.id === selectedPatientId)!) 
                          : "Select Patient"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {users.filter(user => user.role === 'user').map(patient => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {getFullName(patient)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="therapist_id" className="text-indigo-700">Therapist</Label>
                  <Select name="therapist_id" value={selectedTherapistId} onValueChange={setSelectedTherapistId}>
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue placeholder="Select Therapist">
                        {selectedTherapistId && users.find(u => u.id === selectedTherapistId) 
                          ? getFullName(users.find(u => u.id === selectedTherapistId)!) 
                          : "Select Therapist"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      {users.filter(user => user.role === 'therapist').map(therapist => (
                        <SelectItem key={therapist.id} value={therapist.id}>
                          {getFullName(therapist)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="scheduled_at" className="text-indigo-700">Scheduled At</Label>
                  <Input id="scheduled_at" name="scheduled_at" type="datetime-local" defaultValue={editingItem?.scheduled_at as string} required className="border-indigo-200 focus:border-indigo-500" />
                </div>
                <div>
                  <Label htmlFor="type" className="text-indigo-700">Type</Label>
                  <Select name="type" defaultValue={editingItem?.type as string}>
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="session">Session</SelectItem>
                      <SelectItem value="Phone Call">Phone Call</SelectItem>
                      <SelectItem value="Video Call">Video Call</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status" className="text-indigo-700">Status</Label>
                  <Select name="status" defaultValue={editingItem?.status as string}>
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="payment_status" className="text-indigo-700">Payment Status</Label>
                  <Select name="payment_status" defaultValue={editingItem?.payment_status as string}>
                    <SelectTrigger className="border-indigo-200 focus:border-indigo-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg">
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes" className="text-indigo-700">Notes</Label>
                  <Textarea id="notes" name="notes" defaultValue={editingItem?.notes as string} className="border-indigo-200 focus:border-indigo-500" />
                </div>
              </>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="border-indigo-200 text-indigo-700">
                Cancel
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700 text-white">
                Update
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white border border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-indigo-800">Confirm Delete</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-indigo-700">
              Are you sure you want to delete this {editType}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="border-indigo-200 text-indigo-700">
                Cancel
              </Button>
              <Button 
                type="button" 
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 