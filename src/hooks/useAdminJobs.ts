import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate, Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

export type AdminJob = Tables<"jobs"> & {
  employers?: Tables<"employers"> | null;
};

export type JobInsert = TablesInsert<"jobs">;
export type JobUpdate = TablesUpdate<"jobs">;

type JobStatus = Database["public"]["Enums"]["job_status"];
type ManitobaRegion = Database["public"]["Enums"]["manitoba_region"];
type JobCategory = Database["public"]["Enums"]["job_category"];

export type AdminJobFilters = {
  search?: string;
  status?: string;
  region?: string;
  category?: string;
};

export const useAdminJobs = (filters?: AdminJobFilters) => {
  return useQuery({
    queryKey: ["admin-jobs", filters],
    queryFn: async () => {
      let query = supabase
        .from("jobs")
        .select(`
          *,
          employers (
            id,
            company_name,
            contact_email,
            is_partner
          )
        `)
        .order("created_at", { ascending: false });

      // Apply filters
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status as JobStatus);
      }

      if (filters?.region && filters.region !== "all") {
        query = query.eq("region", filters.region as ManitobaRegion);
      }

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category as JobCategory);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AdminJob[];
    },
  });
};

export const useAdminJob = (id: string | null) => {
  return useQuery({
    queryKey: ["admin-job", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          employers (
            id,
            company_name,
            contact_name,
            contact_email,
            contact_phone,
            website,
            industry,
            is_partner
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      return data as AdminJob | null;
    },
    enabled: !!id,
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (job: JobInsert) => {
      const { data, error } = await supabase
        .from("jobs")
        .insert(job)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Job Created",
        description: "The job posting has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...job }: JobUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("jobs")
        .update(job)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-job"] });
      toast({
        title: "Job Updated",
        description: "The job posting has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("jobs")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Job Deleted",
        description: "The job posting has been deleted.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const updateData: JobUpdate = { status: status as any };
      
      // Set posted_at when publishing for the first time
      if (status === "active") {
        const { data: existingJob } = await supabase
          .from("jobs")
          .select("posted_at")
          .eq("id", id)
          .single();
        
        if (!existingJob?.posted_at) {
          updateData.posted_at = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from("jobs")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Status Updated",
        description: "Job status has been updated.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useEmployers = () => {
  return useQuery({
    queryKey: ["employers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employers")
        .select("*")
        .order("company_name");

      if (error) throw error;
      return data;
    },
  });
};
