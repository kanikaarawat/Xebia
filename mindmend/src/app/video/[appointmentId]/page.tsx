"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { DailyProvider, DailyAudio, DailyVideo, useDailyEvent, useDaily } from "@daily-co/daily-react";
import { Button } from "@/components/ui/button";

const DAILY_DOMAIN = "https://mindmend.daily.co"; // Updated to use the correct subdomain

export default function VideoCallPage() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params?.appointmentId as string;
  const user = useUser();
  const supabase = useSupabaseClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<any>(null);

  useEffect(() => {
    const fetchAppointment = async () => {
      if (!user || !appointmentId) return;
      setLoading(true);
      setError(null);
      // Fetch appointment from Supabase
      const { data, error } = await supabase
        .from("appointments")
        .select("*")
        .eq("id", appointmentId)
        .single();
      if (error) {
        setError("Appointment not found.");
        setLoading(false);
        return;
      }
      // Only allow patient or therapist
      if (data.patient_id !== user.id && data.therapist_id !== user.id) {
        setError("You are not authorized to join this call.");
        setLoading(false);
        return;
      }
      setAppointment(data);
      setLoading(false);
    };
    fetchAppointment();
  }, [user, appointmentId, supabase]);

  if (loading) return <div className="p-8 text-center">Loading video call...</div>;
  if (error) return <div className="p-8 text-center text-red-600">{error}</div>;
  if (!appointment) return null;

  // Generate room name using appointment ID
  const roomName = appointmentId;
  const roomUrl = `${DAILY_DOMAIN}/${roomName}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <h1 className="text-2xl font-bold mb-4">Video Call for Appointment</h1>
      <p className="mb-2 text-slate-700">Appointment ID: {appointmentId}</p>
      <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg p-4">
        <iframe
          src={roomUrl}
          allow="camera; microphone; fullscreen; speaker; display-capture"
          style={{ width: '100%', height: '600px', border: '0', borderRadius: '12px' }}
          title="Daily Video Call"
        />
      </div>
      <Button className="mt-6" onClick={() => router.push("/dashboard/appointments")}>Back to Appointments</Button>
    </div>
  );
} 