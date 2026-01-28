import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Job = Database["public"]["Tables"]["jobs"]["Row"];
type JobInsert = Database["public"]["Tables"]["jobs"]["Insert"];

export function useEmployerJobs(employerId: string | undefined) {
  return useQuery({
    queryKey: ["employer-jobs", employerId],
    queryFn: async () => {
      if (!employerId) return [];
      
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("employer_id", employerId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    enabled: !!employerId,
  });
}

export function useCreateEmployerJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (job: Partial<JobInsert>) => {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          ...job,
          status: "pending", // Employer jobs go to pending for admin review
          source: "manual" as const,
        } as JobInsert)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      toast.success("Job posting submitted for review");
    },
    onError: (error) => {
      toast.error(`Failed to create job: ${error.message}`);
    },
  });
}

export function useUpdateEmployerJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Job> & { id: string }) => {
      const { data, error } = await supabase
        .from("jobs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employer-jobs"] });
      toast.success("Job posting updated");
    },
    onError: (error) => {
      toast.error(`Failed to update job: ${error.message}`);
    },
  });
}

export function useEmployerJobStats(employerId: string | undefined) {
  return useQuery({
    queryKey: ["employer-job-stats", employerId],
    queryFn: async () => {
      if (!employerId) return { total: 0, active: 0, pending: 0, draft: 0 };
      
      const { data, error } = await supabase
        .from("jobs")
        .select("status")
        .eq("employer_id", employerId);

      if (error) throw error;
      
      const stats = {
        total: data.length,
        active: data.filter((j) => j.status === "active").length,
        pending: data.filter((j) => j.status === "pending").length,
        draft: data.filter((j) => j.status === "draft").length,
      };
      
      return stats;
    },
    enabled: !!employerId,
  });
}
