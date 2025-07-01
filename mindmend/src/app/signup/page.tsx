"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Heart, User, UserCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "therapist">("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const router = useRouter();
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    
    console.log('🚀 Starting signup with role:', role);
    
    try {
      await signUp(email, password, role);
      console.log('✅ Signup successful for role:', role);
      setEmailSent(true);
    } catch (err: any) {
      console.error('❌ Signup failed:', err);
      setError(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
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

          <Card className="bg-white shadow-xl">
            <CardHeader className="text-center space-y-1">
              <CardTitle className="text-2xl text-indigo-700 font-bold">Check Your Email</CardTitle>
              <CardDescription className="text-slate-600">
                We've sent a confirmation link to {email}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 text-center">
              <div className="space-y-4">
                <p className="text-slate-600">
                  Please check your email and click the confirmation link to verify your account.
                </p>
                <p className="text-sm text-slate-500">
                  Once confirmed, you'll be redirected to complete your profile setup.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setEmailSent(false)}
                >
                  Back to Sign Up
                </Button>
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    Already confirmed? Sign in
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

        <Card className="bg-white shadow-xl relative overflow-visible">
          <CardHeader className="text-center space-y-1">
            <CardTitle className="text-2xl text-indigo-700 font-bold">Create Account</CardTitle>
            <CardDescription className="text-slate-600">
              Join MindMend to start your wellness journey
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-10"
                    placeholder="Create a password"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="role">I am a</Label>
                <Select value={role} onValueChange={(value: "user" | "therapist") => setRole(value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] bg-white border border-slate-200 shadow-xl rounded-md overflow-hidden">
                    <SelectItem value="user">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>Patient</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="therapist">
                      <div className="flex items-center space-x-2">
                        <UserCheck className="w-4 h-4" />
                        <span>Therapist</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <p className="text-center text-sm text-red-600">{error}</p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-6"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-slate-500">Already have an account?</span>
              </div>
            </div>

            <div className="text-center">
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Sign in instead
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 