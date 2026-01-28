import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
type Employer = Database["public"]["Tables"]["employers"]["Row"];

interface EmployerAuthState {
  user: User | null;
  session: Session | null;
  employer: Employer | null;
  roles: AppRole[];
  isLoading: boolean;
  isEmployer: boolean;
  isApproved: boolean;
}

export function useEmployerAuth() {
  const [authState, setAuthState] = useState<EmployerAuthState>({
    user: null,
    session: null,
    employer: null,
    roles: [],
    isLoading: true,
    isEmployer: false,
    isApproved: false,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchEmployerData(session.user.id, session);
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // Use setTimeout to avoid Supabase auth deadlock
        setTimeout(() => {
          fetchEmployerData(session.user.id, session);
        }, 0);
      } else {
        setAuthState({
          user: null,
          session: null,
          employer: null,
          roles: [],
          isLoading: false,
          isEmployer: false,
          isApproved: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchEmployerData = async (userId: string, session: Session) => {
    try {
      // Fetch roles
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);

      const userRoles = (roles?.map((r) => r.role) || []) as AppRole[];
      const isEmployer = userRoles.includes("employer");

      // Fetch employer profile if user is an employer
      let employer: Employer | null = null;
      if (isEmployer) {
        const { data: employerData } = await supabase
          .from("employers")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();
        
        employer = employerData;
      }

      setAuthState({
        user: session.user,
        session,
        employer,
        roles: userRoles,
        isLoading: false,
        isEmployer,
        isApproved: isEmployer && employer !== null,
      });
    } catch (error) {
      console.error("Error fetching employer data:", error);
      setAuthState((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/employer/dashboard`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const refetch = () => {
    if (authState.user) {
      fetchEmployerData(authState.user.id, authState.session!);
    }
  };

  return {
    ...authState,
    signIn,
    signUp,
    signOut,
    refetch,
  };
}
