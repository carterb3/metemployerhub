import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

interface AuthState {
  user: User | null;
  session: Session | null;
  roles: AppRole[];
  isLoading: boolean;
  isStaff: boolean;
  isAdmin: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    roles: [],
    isLoading: true,
    isStaff: false,
    isAdmin: false,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchRoles(session.user.id, session);
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        fetchRoles(session.user.id, session);
      } else {
        setAuthState({
          user: null,
          session: null,
          roles: [],
          isLoading: false,
          isStaff: false,
          isAdmin: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRoles = async (userId: string, session: Session) => {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    const userRoles = (roles?.map((r) => r.role) || []) as AppRole[];
    const isAdmin = userRoles.includes("admin");
    const isStaff = userRoles.includes("staff") || isAdmin;

    setAuthState({
      user: session.user,
      session,
      roles: userRoles,
      isLoading: false,
      isStaff,
      isAdmin,
    });
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return {
    ...authState,
    signIn,
    signOut,
  };
}
