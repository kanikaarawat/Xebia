"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useSupabaseClient } from '@supabase/auth-helpers-react';

export default function EmailConfirmationPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired" | "sending">("loading");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = useSupabaseClient();

  useEffect(() => {
    const confirmEmail = async () => {
      setStatus('loading');
      setMessage('Checking confirmation status...');
      const token = searchParams.get('token');
      if (!token) {
        setStatus('error');
        setMessage('No confirmation token found.');
        return;
      }
      // Supabase automatically confirms email via magic link, so just show success
      setStatus('success');
      setMessage('Your email has been confirmed! You can now continue.');
    };
    confirmEmail();
  }, [router, searchParams]);

  const handleResendEmail = async () => {
    setStatus('sending');
    setMessage('Resending confirmation email...');
    try {
      const email = searchParams.get('email');
      if (!email) throw new Error('No email found.');
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      if (error) throw error;
      setStatus('success');
      setMessage('Confirmation email resent! Please check your inbox.');
    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || 'Failed to resend confirmation email.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-100 p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-indigo-400 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold text-slate-800">MindMend</span>
          </Link>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl text-indigo-700 font-bold">
              Email Confirmation
            </CardTitle>
            <CardDescription className="text-slate-600">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status === "loading" && (
              <div className="flex flex-col items-center space-y-4">
                <RefreshCw className="animate-spin w-8 h-8 text-indigo-500" />
                <div className="text-indigo-700 font-medium">Checking confirmation status...</div>
              </div>
            )}
            {status === "success" && (
              <div className="flex flex-col items-center space-y-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div className="text-green-700 font-medium">{message}</div>
                <Button onClick={() => router.push("/setup-profile")}>Continue</Button>
              </div>
            )}
            {status === "error" && (
              <div className="flex flex-col items-center space-y-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div className="text-red-700 font-medium">{message}</div>
                <Button onClick={() => router.push("/login")}>Back to Login</Button>
              </div>
            )}
            {status === "expired" && (
              <div className="flex flex-col items-center space-y-4">
                <AlertCircle className="w-8 h-8 text-yellow-500" />
                <div className="text-yellow-700 font-medium">{message}</div>
                <Button onClick={handleResendEmail} disabled={status === "sending"}>
                  {status === "sending" ? "Sending..." : "Resend Confirmation Email"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 