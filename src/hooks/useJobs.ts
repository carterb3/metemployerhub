import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, Database } from "@/integrations/supabase/types";

export type Job = Tables<"jobs"> & {
  employers?: Tables<"employers"> | null;
};

type ManitobaRegion = Database["public"]["Enums"]["manitoba_region"];
type JobCategory = Database["public"]["Enums"]["job_category"];
type EmploymentType = Database["public"]["Enums"]["employment_type"];

export type JobFilters = {
  search?: string;
  region?: string;
  category?: string;
  employmentType?: string;
};

// Map database enum values to display labels
export const regionLabels: Record<string, string> = {
  interlake: "Interlake",
  northwest: "Northwest",
  southeast: "Southeast",
  southwest: "Southwest",
  winnipeg: "Winnipeg",
  the_pas: "The Pas",
  thompson: "Thompson",
  beyond_borders: "Beyond Borders",
  parklands: "Parklands",
  swan_river: "Swan River",
};

export const categoryLabels: Record<string, string> = {
  administration: "Administration",
  construction_trades: "Construction & Trades",
  education: "Education",
  healthcare: "Healthcare",
  hospitality: "Hospitality",
  information_technology: "Information Technology",
  manufacturing: "Manufacturing",
  natural_resources: "Natural Resources",
  retail_sales: "Retail & Sales",
  transportation: "Transportation",
  other: "Other",
};

export const employmentTypeLabels: Record<string, string> = {
  full_time: "Full-time",
  part_time: "Part-time",
  contract: "Contract",
  seasonal: "Seasonal",
  internship: "Internship",
  remote: "Remote",
};

export const useJobs = (filters?: JobFilters) => {
  return useQuery({
    queryKey: ["jobs", filters],
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
        .eq("status", "active")
        .or("expires_at.is.null,expires_at.gt.now()")
        .order("posted_at", { ascending: false, nullsFirst: false });

      // Apply filters
      if (filters?.region && filters.region !== "all") {
        query = query.eq("region", filters.region as ManitobaRegion);
      }

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category as JobCategory);
      }

      if (filters?.employmentType && filters.employmentType !== "all") {
        query = query.eq("employment_type", filters.employmentType as EmploymentType);
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Job[];
    },
  });
};

export const useJob = (id: string) => {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
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
      return data as Job | null;
    },
    enabled: !!id,
  });
};

// Helper to check if a job is new (posted within last 7 days)
export const isJobNew = (postedAt: string | null): boolean => {
  if (!postedAt) return false;
  const postedDate = new Date(postedAt);
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  return postedDate > sevenDaysAgo;
};

// Helper to format posted date
export const formatPostedDate = (postedAt: string | null): string => {
  if (!postedAt) return "Recently";
  
  const posted = new Date(postedAt);
  const now = new Date();
  const diffMs = now.getTime() - posted.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} month${Math.floor(diffDays / 30) > 1 ? "s" : ""} ago`;
};
