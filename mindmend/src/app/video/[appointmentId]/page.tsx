"use client";

import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function VideoCallPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.appointmentId as string;

  // Generate room URL using appointment ID (if needed)
  const roomUrl = `/video/${appointmentId}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">Join Video Call</h1>
      <p className="mb-2 text-slate-700">Appointment ID: {appointmentId}</p>
      <Button
        className="mt-6 bg-green-600 text-white hover:bg-green-700 px-6 py-3 text-lg"
        onClick={() => window.open(roomUrl, '_blank')}
      >
        Join Video Call
      </Button>
      <Button className="mt-4" onClick={() => router.push("/dashboard/appointments")}>Back to Appointments</Button>
    </div>
  );
} 