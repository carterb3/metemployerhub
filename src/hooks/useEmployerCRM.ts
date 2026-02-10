import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

export type Employer = Tables<"employers"> & {
  source_inquiry_id?: string | null;
  notes?: string | null;
  status?: string;
};

export type EmployerCommunication = {
  id: string;
  employer_id: string;
  communication_type: string;
  subject: string | null;
  notes: string;
  communication_date: string;
  follow_up_date: string | null;
  created_by: string | null;
  created_at: string;
};

export type EmployerInquiryWithConversion = Tables<"employer_inquiries"> & {
  converted_to_employer_id?: string | null;
  converted_at?: string | null;
  converted_by?: string | null;
};

export const employerStatusLabels: Record<string, string> = {
  active: "Active Partner",
  inactive: "Inactive",
  prospect: "Prospect",
};

export const communicationTypeLabels: Record<string, string> = {
  email: "Email",
  phone: "Phone Call",
  meeting: "Meeting",
  site_visit: "Site Visit",
  other: "Other",
};

export function useEmployers() {
  return useQuery({
    queryKey: ["employers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employers")
        .select("*")
        .order("company_name");

      if (error) throw error;
      return data as Employer[];
    },
  });
}

export function useEmployer(id: string | undefined) {
  return useQuery({
    queryKey: ["employer", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("employers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Employer;
    },
    enabled: !!id,
  });
}

export function useEmployerCommunications(employerId: string | undefined) {
  return useQuery({
    queryKey: ["employer-communications", employerId],
    queryFn: async () => {
      if (!employerId) return [];
      const { data, error } = await supabase
        .from("employer_communications")
        .select("*")
        .eq("employer_id", employerId)
        .order("communication_date", { ascending: false });

      if (error) throw error;
      return data as EmployerCommunication[];
    },
    enabled: !!employerId,
  });
}

export function useCreateEmployer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employer: Partial<Employer>) => {
      const { data, error } = await supabase
        .from("employers")
        .insert(employer as TablesInsert<"employers">)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      toast.success("Employer created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create employer: ${error.message}`);
    },
  });
}

export function useUpdateEmployer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Employer> & { id: string }) => {
      const { data, error } = await supabase
        .from("employers")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      queryClient.invalidateQueries({ queryKey: ["employer", data.id] });
      toast.success("Employer updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update employer: ${error.message}`);
    },
  });
}

export function useAddCommunication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (communication: Omit<EmployerCommunication, "id" | "created_at" | "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from("employer_communications")
        .insert({
          ...communication,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employer-communications", data.employer_id] });
      toast.success("Communication logged successfully");
    },
    onError: (error) => {
      toast.error(`Failed to log communication: ${error.message}`);
    },
  });
}

export function useConvertInquiryToEmployer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inquiry: EmployerInquiryWithConversion) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Create the employer record
      const { data: employer, error: employerError } = await supabase
        .from("employers")
        .insert({
          company_name: inquiry.company_name,
          contact_name: inquiry.contact_name,
          contact_email: inquiry.contact_email,
          contact_phone: inquiry.contact_phone,
          website: inquiry.website,
          is_partner: false,
          source_inquiry_id: inquiry.id,
          status: "prospect",
        } as any)
        .select()
        .single();

      if (employerError) throw employerError;

      // Update the inquiry to mark it as converted
      const { error: inquiryError } = await supabase
        .from("employer_inquiries")
        .update({
          converted_to_employer_id: employer.id,
          converted_at: new Date().toISOString(),
          converted_by: user?.id,
        } as any)
        .eq("id", inquiry.id);

      if (inquiryError) throw inquiryError;

      return employer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      queryClient.invalidateQueries({ queryKey: ["employer-inquiries"] });
      toast.success("Inquiry converted to employer successfully");
    },
    onError: (error) => {
      toast.error(`Failed to convert inquiry: ${error.message}`);
    },
  });
}

export function useDeleteEmployer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("employers")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employers"] });
      toast.success("Employer deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete employer: ${error.message}`);
    },
  });
}

export function useUnconvertedInquiries() {
  return useQuery({
    queryKey: ["unconverted-inquiries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employer_inquiries")
        .select("*")
        .is("converted_to_employer_id", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as EmployerInquiryWithConversion[];
    },
  });
}
