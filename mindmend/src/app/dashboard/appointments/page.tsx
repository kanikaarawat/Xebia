'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import AppointmentsList from '@/components/booking/AppointmentsList';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

export default function AppointmentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [status, setStatus] = useState('all');
  const router = useRouter();

  // Map status to filter array for AppointmentsList
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'no-show', label: 'No-show' },
    { value: 'rescheduled', label: 'Rescheduled' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' },
  ];
  const statusFilter = status === 'all' ? undefined : [status];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100">
        <div className="container mx-auto flex items-center justify-between px-8 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-pink-500">
              <Calendar className="h-5 w-5 text-white" />
            </span>
            <span className="text-2xl font-semibold text-indigo-700">
              Appointments
            </span>
          </div>
          <Button 
            onClick={() => router.push('/dashboard/book-session')}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Book New Session
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto space-y-8 px-8 py-16 max-w-7xl">
        {/* Quick Stats */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md">
            <CardContent className="flex items-center gap-5 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <Clock className="h-6 w-6 text-blue-600" />
              </span>
              <div>
                <p className="text-2xl font-bold text-indigo-800 mb-1">Upcoming</p>
                <p className="text-sm text-slate-600 font-medium">Next sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md">
            <CardContent className="flex items-center gap-5 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </span>
              <div>
                <p className="text-2xl font-bold text-indigo-800 mb-1">Completed</p>
                <p className="text-sm text-slate-600 font-medium">Past sessions</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-indigo-100 bg-white/80 backdrop-blur-sm shadow-md">
            <CardContent className="flex items-center gap-5 p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </span>
              <div>
                <p className="text-2xl font-bold text-indigo-800 mb-1">Total</p>
                <p className="text-sm text-slate-600 font-medium">All sessions</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-3 rounded-xl bg-white/70 backdrop-blur p-1 h-14">
            <TabsTrigger value="all" className="rounded-lg text-base font-medium">
              All Appointments
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="rounded-lg text-base font-medium">
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="past" className="rounded-lg text-base font-medium">
              Past Sessions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <label htmlFor="status-filter" className="text-sm font-medium text-slate-700">Filter by status:</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status-filter" className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <AppointmentsList 
              showUpcoming={true}
              showPast={true}
              title="All Appointments"
              description="View and manage all your therapy sessions"
              statusFilter={statusFilter}
            />
          </TabsContent>

          <TabsContent value="upcoming" className="space-y-8">
            <AppointmentsList 
              showUpcoming={true}
              showPast={false}
              title="Upcoming Appointments"
              description="Your scheduled therapy sessions"
            />
          </TabsContent>

          <TabsContent value="past" className="space-y-8">
            <AppointmentsList 
              showUpcoming={false}
              showPast={true}
              title="Past Sessions"
              description="Your completed therapy sessions"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
} 