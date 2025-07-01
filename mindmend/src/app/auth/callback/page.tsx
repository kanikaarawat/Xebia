'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const missing = (v: unknown) => typeof v !== "string" ? !v : v.trim().length === 0;

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      // If no profile exists, create one
      if (!profile) {
        console.log('📝 Creating profile in auth callback...');
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          role: user.user_metadata?.role || "user",
        });
        
        if (insertError) {
          console.error("❌ Error creating profile:", insertError);
        } else {
          console.log('✅ Profile created with role:', user.user_metadata?.role || "user");
        }
        
        router.push("/setup-profile");
        return;
      }
      
      const isTherapist = profile.role === "therapist";
      const incomplete =
        missing(profile.first_name) ||
        missing(profile.last_name) ||
        (isTherapist && (
          missing(profile.bio) ||
          missing(profile.specialization) ||
          missing(profile.license_number)
        ));
      router.push(incomplete ? "/setup-profile" : "/dashboard");
    };
    checkProfile();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
} 