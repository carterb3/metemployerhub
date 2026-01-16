import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type InquiryStatus = Database["public"]["Enums"]["inquiry_status"];
type Region = Database["public"]["Enums"]["region"];
type EmployerInquiry = Database["public"]["Tables"]["employer_inquiries"]["Row"];

interface InquiryFilters {
  status?: InquiryStatus;
  region?: Region;
  search?: string;
  assignedTo?: string;
}

export function useEmployerInquiries(filters: InquiryFilters = {}) {
  return useQuery({
    queryKey: ["employer-inquiries", filters],
    queryFn: async () => {
      let query = supabase
        .from("employer_inquiries")
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
          `company_name.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as EmployerInquiry[];
    },
  });
}

export function useUpdateInquiryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: InquiryStatus;
    }) => {
      const { error } = await supabase
        .from("employer_inquiries")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-inquiries"] });
    },
  });
}

export function useAssignInquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      inquiryId,
      assignedTo,
    }: {
      inquiryId: string;
      assignedTo: string | null;
    }) => {
      const { error } = await supabase
        .from("employer_inquiries")
        .update({ assigned_to: assignedTo })
        .eq("id", inquiryId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employer-inquiries"] });
    },
  });
}
