'use client';

import { SessionContextProvider } from '@supabase/auth-helpers-react';
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/supabase-js';
import { useState } from 'react';

interface Props {
  children: React.ReactNode;
  initialSession: Session | null;
}

export function SupabaseProvider({ children, initialSession }: Props) {
  const [supabase] = useState(() => createPagesBrowserClient());

  return (
    <SessionContextProvider supabaseClient={supabase} initialSession={initialSession}>
      {children}
    </SessionContextProvider>
  );
}
