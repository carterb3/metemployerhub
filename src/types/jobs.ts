import type { Database } from "@/integrations/supabase/types";

// Enums
export type JobStatus = Database["public"]["Enums"]["job_status"];
export type JobCategory = Database["public"]["Enums"]["job_category"];
export type EmploymentType = Database["public"]["Enums"]["employment_type"];
export type ManitobaRegion = Database["public"]["Enums"]["manitoba_region"];
export type ListingType = Database["public"]["Enums"]["listing_type"];

// New enums from migration
export type JobSource = "manual" | "imported";
export type LocationType = "onsite" | "hybrid" | "remote";
export type ApplicationMethod = "apply_url" | "apply_through_met" | "email" | "phone" | "in_person";
export type PayPeriod = "hour" | "day" | "week" | "month" | "year" | "project";
export type JobAction = "create" | "update" | "status_change" | "publish" | "unpublish" | "duplicate" | "archive" | "restore";

// Extended job type with new fields
export interface AdminJobFull {
  id: string;
  employer_id: string | null;
  employer_name: string | null;
  title: string;
  description: string;
  requirements: string | null;
  pay_range: string | null;
  region: ManitobaRegion;
  city: string | null;
  is_remote: boolean | null;
  category: JobCategory;
  employment_type: EmploymentType;
  status: JobStatus;
  posted_at: string | null;
  expires_at: string | null;
  apply_url: string | null;
  apply_through_met: boolean | null;
  created_at: string;
  updated_at: string;
  listing_type: ListingType;
  
  // New fields
  created_by: string | null;
  updated_by: string | null;
  published_by: string | null;
  slug: string | null;
  external_id: string | null;
  source: JobSource;
  featured: boolean;
  priority: number;
  location_type: LocationType;
  province: string;
  address: string | null;
  postal_code: string | null;
  application_method: ApplicationMethod;
  apply_email: string | null;
  apply_phone: string | null;
  apply_instructions: string | null;
  pay_min: number | null;
  pay_max: number | null;
  pay_currency: string;
  pay_period: PayPeriod | null;
  pay_visible: boolean;
  published_at: string | null;
  scheduled_publish_at: string | null;
  scheduled_unpublish_at: string | null;
  archived_at: string | null;
  archived_by: string | null;
  
  // Relations
  employers?: {
    id: string;
    company_name: string;
    contact_email: string;
    contact_name: string;
    contact_phone: string | null;
    website: string | null;
    is_partner: boolean | null;
  } | null;
  tags?: Tag[];
  attachments?: JobAttachment[];
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
}

export interface JobTag {
  job_id: string;
  tag_id: string;
}

export interface JobAttachment {
  id: string;
  job_id: string;
  file_name: string;
  file_path: string;
  file_size: number | null;
  file_type: string | null;
  is_public: boolean;
  uploaded_by: string | null;
  created_at: string;
}

export interface JobActivityLog {
  id: string;
  job_id: string;
  action: JobAction;
  actor_user_id: string | null;
  before_state: Record<string, any> | null;
  after_state: Record<string, any> | null;
  metadata: Record<string, any> | null;
  created_at: string;
  actor?: {
    email: string | null;
    full_name: string | null;
  } | null;
}

// Label maps
export const jobSourceLabels: Record<JobSource, string> = {
  manual: "Manual Entry",
  imported: "Imported",
};

export const locationTypeLabels: Record<LocationType, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
};

export const applicationMethodLabels: Record<ApplicationMethod, string> = {
  apply_url: "External URL",
  apply_through_met: "Apply through MET",
  email: "Email Application",
  phone: "Phone Application",
  in_person: "In-Person Application",
};

export const payPeriodLabels: Record<PayPeriod, string> = {
  hour: "per hour",
  day: "per day",
  week: "per week",
  month: "per month",
  year: "per year",
  project: "per project",
};

export const jobActionLabels: Record<JobAction, string> = {
  create: "Created",
  update: "Updated",
  status_change: "Status Changed",
  publish: "Published",
  unpublish: "Unpublished",
  duplicate: "Duplicated",
  archive: "Archived",
  restore: "Restored",
};

export const statusColors: Record<JobStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning/10 text-warning",
  active: "bg-success/10 text-success",
  expired: "bg-muted text-muted-foreground",
  closed: "bg-destructive/10 text-destructive",
};

// Filter types
export interface AdminJobFilters {
  search?: string;
  status?: JobStatus | "all";
  region?: ManitobaRegion | "all";
  category?: JobCategory | "all";
  employment_type?: EmploymentType | "all";
  location_type?: LocationType | "all";
  featured?: boolean;
  archived?: boolean;
  sortBy?: "newest" | "expiring_soon" | "priority" | "title";
}

// Form types
export interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  region: ManitobaRegion;
  city: string;
  category: JobCategory;
  employment_type: EmploymentType;
  listing_type: ListingType;
  location_type: LocationType;
  is_remote: boolean;
  province: string;
  address: string;
  postal_code: string;
  employer_name: string;
  application_method: ApplicationMethod;
  apply_url: string;
  apply_email: string;
  apply_phone: string;
  apply_instructions: string;
  pay_min: string;
  pay_max: string;
  pay_period: PayPeriod | "";
  pay_visible: boolean;
  featured: boolean;
  priority: number;
  expires_at: string;
  scheduled_publish_at: string;
  scheduled_unpublish_at: string;
  status: JobStatus;
  tags: string[];
}
