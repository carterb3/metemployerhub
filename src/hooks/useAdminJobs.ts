import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type {
  AdminJobFull,
  AdminJobFilters,
  Tag,
  JobAttachment,
  JobActivityLog,
  JobStatus,
} from "@/types/jobs";

// Fetch all jobs for admin with filters
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
            contact_name,
            contact_phone,
            website,
            is_partner
          )
        `);

      // Hide archived by default unless explicitly requested
      if (!filters?.archived) {
        query = query.is("archived_at", null);
      }

      // Apply filters
      if (filters?.status && filters.status !== "all") {
        query = query.eq("status", filters.status);
      }

      if (filters?.region && filters.region !== "all") {
        query = query.eq("region", filters.region);
      }

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      if (filters?.employment_type && filters.employment_type !== "all") {
        query = query.eq("employment_type", filters.employment_type);
      }

      if (filters?.location_type && filters.location_type !== "all") {
        query = query.eq("location_type", filters.location_type);
      }

      if (filters?.featured !== undefined) {
        query = query.eq("featured", filters.featured);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      // Sorting
      switch (filters?.sortBy) {
        case "expiring_soon":
          query = query.order("expires_at", { ascending: true, nullsFirst: false });
          break;
        case "priority":
          query = query.order("priority", { ascending: false });
          break;
        case "title":
          query = query.order("title", { ascending: true });
          break;
        case "newest":
        default:
          query = query.order("created_at", { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as AdminJobFull[];
    },
  });
};

// Fetch single job with all relations
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
            is_partner
          )
        `)
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) return null;

      // Fetch tags separately
      const { data: jobTags } = await supabase
        .from("job_tags")
        .select("tag_id, tags(id, name, created_at)")
        .eq("job_id", id);

      // Fetch attachments
      const { data: attachments } = await supabase
        .from("job_attachments")
        .select("*")
        .eq("job_id", id)
        .order("created_at", { ascending: false });

      return {
        ...data,
        tags: jobTags?.map((jt: any) => jt.tags).filter(Boolean) || [],
        attachments: attachments || [],
      } as AdminJobFull;
    },
    enabled: !!id,
  });
};

// Fetch job activity log
export const useJobActivityLog = (jobId: string | null) => {
  return useQuery({
    queryKey: ["job-activity-log", jobId],
    queryFn: async () => {
      if (!jobId) return [];

      const { data, error } = await supabase
        .from("job_activity_log")
        .select(`
          *
        `)
        .eq("job_id", jobId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as JobActivityLog[];
    },
    enabled: !!jobId,
  });
};

// Create job
export const useCreateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (job: Partial<AdminJobFull> & { tags?: string[] }) => {
      const { tags, employers, attachments, ...jobData } = job as any;

      const { data, error } = await supabase
        .from("jobs")
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;

      // Add tags if provided
      if (tags && tags.length > 0 && data) {
        await syncJobTags(data.id, tags);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Job Created",
        description: "The job posting has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Update job
export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...job }: Partial<AdminJobFull> & { id: string; tags?: string[] }) => {
      const { tags, employers, attachments, ...jobData } = job as any;

      const { data, error } = await supabase
        .from("jobs")
        .update(jobData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Sync tags if provided
      if (tags !== undefined) {
        await syncJobTags(id, tags);
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-job", variables.id] });
      toast({
        title: "Job Updated",
        description: "The job posting has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Update job status
export const useUpdateJobStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: JobStatus }) => {
      const { error } = await supabase
        .from("jobs")
        .update({ status })
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
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Delete job
export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Job Deleted",
        description: "The job posting has been deleted.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Archive job
export const useArchiveJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("jobs")
        .update({ archived_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Job Archived",
        description: "The job posting has been archived.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Restore archived job
export const useRestoreJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("jobs")
        .update({ archived_at: null, archived_by: null })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Job Restored",
        description: "The job posting has been restored.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Duplicate job
export const useDuplicateJob = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (sourceId: string) => {
      // Fetch the source job
      const { data: source, error: fetchError } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", sourceId)
        .single();

      if (fetchError) throw fetchError;

      // Create duplicate without IDs and reset status
      const {
        id,
        created_at,
        updated_at,
        created_by,
        updated_by,
        published_by,
        published_at,
        posted_at,
        slug,
        archived_at,
        archived_by,
        ...duplicateData
      } = source;

      const { data, error } = await supabase
        .from("jobs")
        .insert({
          ...duplicateData,
          title: `${source.title} (Copy)`,
          status: "draft",
          slug: null,
        })
        .select()
        .single();

      if (error) throw error;

      // Copy tags
      const { data: sourceTags } = await supabase
        .from("job_tags")
        .select("tag_id")
        .eq("job_id", sourceId);

      if (sourceTags && sourceTags.length > 0 && data) {
        await supabase.from("job_tags").insert(
          sourceTags.map((t) => ({ job_id: data.id, tag_id: t.tag_id }))
        );
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Job Duplicated",
        description: "A copy of the job has been created as a draft.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Bulk update jobs
export const useBulkUpdateJobs = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: Partial<AdminJobFull>;
    }) => {
      const { error } = await supabase
        .from("jobs")
        .update(updates as any)
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast({
        title: "Jobs Updated",
        description: `${variables.ids.length} job(s) have been updated.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Tags hooks
export const useTags = () => {
  return useQuery({
    queryKey: ["tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tags")
        .select("*")
        .order("name");

      if (error) throw error;
      return data as Tag[];
    },
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from("tags")
        .insert({ name: name.trim().toLowerCase() })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    },
  });
};

// Sync tags for a job
async function syncJobTags(jobId: string, tagIds: string[]) {
  // Delete existing tags
  await supabase.from("job_tags").delete().eq("job_id", jobId);

  // Insert new tags
  if (tagIds.length > 0) {
    await supabase.from("job_tags").insert(
      tagIds.map((tagId) => ({ job_id: jobId, tag_id: tagId }))
    );
  }
}

// Employers
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

// Attachments
export const useUploadAttachment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      jobId,
      file,
      isPublic = false,
    }: {
      jobId: string;
      file: File;
      isPublic?: boolean;
    }) => {
      const filePath = `${jobId}/${Date.now()}-${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("job-attachments")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Create record
      const { data, error } = await supabase
        .from("job_attachments")
        .insert({
          job_id: jobId,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          is_public: isPublic,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-job", variables.jobId] });
      toast({
        title: "Attachment Uploaded",
        description: "The file has been uploaded successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteAttachment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, filePath, jobId }: { id: string; filePath: string; jobId: string }) => {
      // Delete from storage
      await supabase.storage.from("job-attachments").remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from("job_attachments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return jobId;
    },
    onSuccess: (jobId) => {
      queryClient.invalidateQueries({ queryKey: ["admin-job", jobId] });
      toast({
        title: "Attachment Deleted",
        description: "The file has been removed.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Export jobs to CSV
export const exportJobsToCSV = (jobs: AdminJobFull[]) => {
  const headers = [
    "Title",
    "Company",
    "Status",
    "Region",
    "City",
    "Category",
    "Employment Type",
    "Location Type",
    "Featured",
    "Posted At",
    "Expires At",
    "Pay Range",
  ];

  const rows = jobs.map((job) => [
    job.title,
    job.employers?.company_name || "",
    job.status,
    job.region,
    job.city || "",
    job.category,
    job.employment_type,
    job.location_type,
    job.featured ? "Yes" : "No",
    job.posted_at || "",
    job.expires_at || "",
    job.pay_visible && job.pay_min
      ? `${job.pay_min}${job.pay_max ? `-${job.pay_max}` : ""} ${job.pay_currency}/${job.pay_period || ""}`
      : "",
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `jobs-export-${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
