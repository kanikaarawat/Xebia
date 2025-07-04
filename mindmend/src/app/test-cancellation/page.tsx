"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CancellationModal from '@/components/booking/CancellationModal';

export default function TestCancellationPage() {
  const [showModal, setShowModal] = useState(false);
  const [testAppointment, setTestAppointment] = useState({
    id: 'test-123',
    date: '2024-12-25',
    start_time: '14:00',
    amount: 50000, // ₹500 in paise
    status: 'upcoming'
  });

  const testScenarios = [
    {
      title: '48+ Hours Before Session',
      description: '80% refund (₹400)',
      appointment: {
        id: 'test-48h',
        date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '14:00',
        amount: 50000,
        status: 'upcoming'
      }
    },
    {
      title: '24-48 Hours Before Session',
      description: '50% refund (₹250)',
      appointment: {
        id: 'test-36h',
        date: new Date(Date.now() + 36 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '14:00',
        amount: 50000,
        status: 'upcoming'
      }
    },
    {
      title: 'Less than 24 Hours',
      description: 'No refund (₹0)',
      appointment: {
        id: 'test-12h',
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        start_time: '14:00',
        amount: 50000,
        status: 'upcoming'
      }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Cancellation & Refund Policy Test
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Test our cancellation system with different timing scenarios. 
            The refund amount is calculated based on how many hours before the session you cancel.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {testScenarios.map((scenario, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{scenario.title}</CardTitle>
                <p className="text-sm text-slate-600">{scenario.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p><strong>Session Date:</strong> {scenario.appointment.date}</p>
                  <p><strong>Session Time:</strong> {scenario.appointment.start_time}</p>
                  <p><strong>Amount:</strong> ₹{(scenario.appointment.amount / 100).toFixed(2)}</p>
                </div>
                <Button 
                  onClick={() => {
                    setTestAppointment(scenario.appointment);
                    setShowModal(true);
                  }}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700"
                >
                  Test Cancellation
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">📋 Refund Policy Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-100 rounded-lg">
                <div>
                  <h4 className="font-semibold text-green-800">48+ hours before session</h4>
                  <p className="text-sm text-green-700">Generous refund for early cancellation</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-800">80%</div>
                  <div className="text-sm text-green-700">refund</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-100 rounded-lg">
                <div>
                  <h4 className="font-semibold text-yellow-800">24-48 hours before session</h4>
                  <p className="text-sm text-yellow-700">Partial refund for moderate notice</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-yellow-800">50%</div>
                  <div className="text-sm text-yellow-700">refund</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-100 rounded-lg">
                <div>
                  <h4 className="font-semibold text-red-800">Less than 24 hours</h4>
                  <p className="text-sm text-red-700">No refund for late cancellation</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-red-800">0%</div>
                  <div className="text-sm text-red-700">refund</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <CancellationModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          appointment={testAppointment}
          onCancellationSuccess={() => {
            console.log('Cancellation successful!');
            setShowModal(false);
          }}
        />
      </div>
    </div>
  );
} 