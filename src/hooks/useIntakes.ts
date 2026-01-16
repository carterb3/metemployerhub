import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type IntakeStatus = Database["public"]["Enums"]["intake_status"];
type Region = Database["public"]["Enums"]["manitoba_region"];
type JobSeekerIntake = Database["public"]["Tables"]["job_seeker_intakes"]["Row"];

interface IntakeFilters {
  status?: IntakeStatus;
  region?: Region;
  search?: string;
  assignedTo?: string;
}

export function useIntakes(filters: IntakeFilters = {}) {
  return useQuery({
    queryKey: ["intakes", filters],
    queryFn: async () => {
      let query = supabase
        .from("job_seeker_intakes")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      if (filters.region) {
        query = query.eq("region", filters.region);
      }

      if (filters.assignedTo) {
        query = query.eq("assigned_to", filters.assignedTo);
      }

      if (filters.search) {
        query = query.or(
          `full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as JobSeekerIntake[];
    },
  });
}

export function useIntake(id: string) {
  return useQuery({
    queryKey: ["intake", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_seeker_intakes")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as JobSeekerIntake;
    },
    enabled: !!id,
  });
}

export function useUpdateIntakeStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: IntakeStatus;
    }) => {
      const { error } = await supabase
        .from("job_seeker_intakes")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intakes"] });
      queryClient.invalidateQueries({ queryKey: ["intake"] });
    },
  });
}

export function useAssignIntake() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      intakeId,
      assignedTo,
      assignedBy,
    }: {
      intakeId: string;
      assignedTo: string | null;
      assignedBy: string;
    }) => {
      // Get current assignment for logging
      const { data: current } = await supabase
        .from("job_seeker_intakes")
        .select("assigned_to")
        .eq("id", intakeId)
        .single();

      // Update intake
      const { error: updateError } = await supabase
        .from("job_seeker_intakes")
        .update({
          assigned_to: assignedTo,
          assigned_at: assignedTo ? new Date().toISOString() : null,
        })
        .eq("id", intakeId);

      if (updateError) throw updateError;

      // Log assignment
      const { error: logError } = await supabase
        .from("assignment_log")
        .insert({
          intake_id: intakeId,
          assigned_from: current?.assigned_to || null,
          assigned_to: assignedTo,
          assigned_by: assignedBy,
        });

      if (logError) throw logError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intakes"] });
      queryClient.invalidateQueries({ queryKey: ["intake"] });
    },
  });
}

export function useStaffMembers() {
  return useQuery({
    queryKey: ["staff-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("user_id, role")
        .in("role", ["staff", "admin"]);

      if (error) throw error;

      // Get profiles for these users
      const userIds = data.map((r) => r.user_id);
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      if (profileError) throw profileError;

      return profiles || [];
    },
  });
}
