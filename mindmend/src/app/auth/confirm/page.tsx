"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, CheckCircle, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function EmailConfirmationPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "expired" | "sending">("loading");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [redirectTo, setRedirectTo] = useState<"setup" | "dashboard">("setup");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        console.log('🔍 Starting email confirmation process...');
        
        // Check for error parameters in URL
        const error = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');
        
        if (error === 'access_denied' && errorDescription?.includes('expired')) {
          console.log('❌ Email link expired');
          setStatus("expired");
          setMessage("The email confirmation link has expired. Please request a new one.");
          return;
        }
        
        if (error) {
          console.log('❌ Error in URL:', error, errorDescription);
          setStatus("error");
          setMessage(`Confirmation failed: ${errorDescription || error}`);
          return;
        }

        // Get the session after email confirmation
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('📧 Session data:', { session: !!session, error: sessionError });
        
        if (sessionError || !session?.user) {
          console.error('❌ Session error:', sessionError);
          setStatus("error");
          setMessage("Email confirmation failed. Please try again.");
          return;
        }

        console.log('✅ User found:', session.user.email);
        console.log('📅 Email confirmed at:', session.user.email_confirmed_at);

        // Check if user's email is confirmed
        if (!session.user.email_confirmed_at) {
          console.log('❌ Email not confirmed yet');
          setStatus("error");
          setMessage("Email not confirmed. Please check your email and click the confirmation link.");
          return;
        }

        console.log('✅ Email is confirmed!');

        // Create profile if it doesn't exist
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        console.log('👤 Profile check:', { profile: !!profile, error: profileError });

        if (profileError || !profile) {
          console.log('📝 Creating new profile...');
          console.log('👤 User metadata role:', session.user.user_metadata?.role);
          
          // Create basic profile
          const { error: insertError } = await supabase.from("profiles").insert({
            id: session.user.id,
            email: session.user.email,
            role: session.user.user_metadata?.role || "user",
          });

          if (insertError) {
            console.error("❌ Error creating profile:", insertError);
          } else {
            console.log('✅ Profile created successfully with role:', session.user.user_metadata?.role || "user");
          }
          
          // New profile created, redirect to setup
          setStatus("success");
          setMessage("Email confirmed successfully! Redirecting to setup...");
          setRedirectTo("setup");
          
          setTimeout(() => {
            console.log('🚀 Redirecting to /setup-profile (new profile)');
            router.push("/setup-profile");
          }, 2000);
          return;
        }

        // Profile exists, check if setup is complete
        console.log('✅ Profile already exists, checking completeness...');
        
        const missing = (v: unknown) => typeof v !== "string" ? !v : v.trim().length === 0;
        const isTherapist = profile.role === "therapist";
        
        const incomplete =
          missing(profile.first_name) ||
          missing(profile.last_name) ||
          missing(profile.bio) ||
          (isTherapist && (
            missing(profile.specialization) ||
            missing(profile.license_number)
          ));

        console.log('📊 Profile completeness check:', {
          isTherapist,
          incomplete,
          hasFirstName: !missing(profile.first_name),
          hasLastName: !missing(profile.last_name),
          hasBio: !missing(profile.bio),
          hasSpecialization: !missing(profile.specialization),
          hasLicense: !missing(profile.license_number)
        });

        if (incomplete) {
          // Profile setup incomplete, redirect to setup
          setStatus("success");
          setMessage("Email confirmed successfully! Redirecting to setup...");
          setRedirectTo("setup");
          
          setTimeout(() => {
            console.log('🚀 Redirecting to /setup-profile (incomplete profile)');
            router.push("/setup-profile");
          }, 2000);
        } else {
          // Profile setup complete, redirect to dashboard
          setStatus("success");
          setMessage("Email confirmed successfully! Redirecting to dashboard...");
          setRedirectTo("dashboard");
          
          setTimeout(() => {
            console.log('🚀 Redirecting to /dashboard (complete profile)');
            router.push("/dashboard");
          }, 2000);
        }

      } catch (error) {
        console.error("❌ Email confirmation error:", error);
        setStatus("error");
        setMessage("An error occurred during email confirmation.");
      }
    };

    handleEmailConfirmation();
  }, [router, searchParams]);

  const handleResendEmail = async () => {
    setStatus("sending");
    setMessage("Sending new confirmation email...");
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail,
      });
      
      if (error) {
        setStatus("error");
        setMessage(`Failed to resend email: ${error.message}`);
      } else {
        setStatus("success");
        setMessage("New confirmation email sent! Please check your inbox.");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to resend confirmation email.");
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
              {status === "loading" && "Confirming your email..."}
              {status === "success" && "Email confirmed successfully!"}
              {status === "error" && "Confirmation failed"}
              {status === "expired" && "Link expired"}
              {status === "sending" && "Sending new email..."}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 text-center">
            <div className="flex justify-center">
              {status === "loading" && (
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              )}
              {status === "success" && (
                <CheckCircle className="w-12 h-12 text-green-600" />
              )}
              {status === "error" && (
                <AlertCircle className="w-12 h-12 text-red-600" />
              )}
              {status === "expired" && (
                <RefreshCw className="w-12 h-12 text-orange-600" />
              )}
            </div>

            <p className="text-slate-600">{message}</p>

            {status === "error" && (
              <div className="space-y-3">
                <Button 
                  onClick={() => window.location.reload()} 
                  className="w-full"
                >
                  Try Again
                </Button>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            )}

            {status === "expired" && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button 
                    onClick={handleResendEmail}
                    disabled={!userEmail}
                    className="w-full"
                  >
                    {status === "sending" ? "Sending..." : "Resend Confirmation Email"}
                  </Button>
                </div>
                <Link href="/signup">
                  <Button variant="outline" className="w-full">
                    Sign Up Again
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            )}

            {status === "success" && (
              <div className="space-y-3">
                <p className="text-sm text-slate-500">
                  {redirectTo === "setup" 
                    ? "You will be redirected to complete your profile setup..."
                    : "You will be redirected to your dashboard..."
                  }
                </p>
                <Link href={redirectTo === "setup" ? "/setup-profile" : "/dashboard"}>
                  <Button className="w-full">
                    Continue to {redirectTo === "setup" ? "Setup" : "Dashboard"}
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 