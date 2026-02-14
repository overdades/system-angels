"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { Session } from "@supabase/supabase-js";

export function useAdminAuth() {
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      const email = data.session?.user?.email ?? "";
      setAdminEmail(email);
      setIsAdminAuthed(!!data.session);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event: string, session: Session | null) => {
        const email = session?.user?.email ?? "";
        setAdminEmail(email);
        setIsAdminAuthed(!!session);
      }
    );

    return () => {
      sub.subscription.unsubscribe();
    };
  }, []);

  async function adminLogin(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function adminLogout() {
    await supabase.auth.signOut();
  }

  return { isAdminAuthed, adminEmail, adminLogin, adminLogout };
}
