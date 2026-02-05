export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assignment_log: {
        Row: {
          assigned_by: string | null
          assigned_from: string | null
          assigned_to: string | null
          created_at: string
          id: string
          intake_id: string
        }
        Insert: {
          assigned_by?: string | null
          assigned_from?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: string
          intake_id: string
        }
        Update: {
          assigned_by?: string | null
          assigned_from?: string | null
          assigned_to?: string | null
          created_at?: string
          id?: string
          intake_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_log_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "job_seeker_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_communications: {
        Row: {
          communication_date: string
          communication_type: string
          created_at: string
          created_by: string | null
          employer_id: string
          follow_up_date: string | null
          id: string
          notes: string
          subject: string | null
        }
        Insert: {
          communication_date?: string
          communication_type: string
          created_at?: string
          created_by?: string | null
          employer_id: string
          follow_up_date?: string | null
          id?: string
          notes: string
          subject?: string | null
        }
        Update: {
          communication_date?: string
          communication_type?: string
          created_at?: string
          created_by?: string | null
          employer_id?: string
          follow_up_date?: string | null
          id?: string
          notes?: string
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_communications_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employer_inquiries: {
        Row: {
          assigned_to: string | null
          attachment_filename: string | null
          attachment_url: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          converted_at: string | null
          converted_by: string | null
          converted_to_employer_id: string | null
          created_at: string
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          id: string
          inquiry_type: Database["public"]["Enums"]["inquiry_type"]
          job_description: string | null
          job_title: string | null
          message: string
          positions_count: number | null
          region: Database["public"]["Enums"]["manitoba_region"] | null
          status: Database["public"]["Enums"]["inquiry_status"]
          updated_at: string
          website: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachment_filename?: string | null
          attachment_url?: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          converted_at?: string | null
          converted_by?: string | null
          converted_to_employer_id?: string | null
          created_at?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          id?: string
          inquiry_type: Database["public"]["Enums"]["inquiry_type"]
          job_description?: string | null
          job_title?: string | null
          message: string
          positions_count?: number | null
          region?: Database["public"]["Enums"]["manitoba_region"] | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachment_filename?: string | null
          attachment_url?: string | null
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          converted_at?: string | null
          converted_by?: string | null
          converted_to_employer_id?: string | null
          created_at?: string
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          id?: string
          inquiry_type?: Database["public"]["Enums"]["inquiry_type"]
          job_description?: string | null
          job_title?: string | null
          message?: string
          positions_count?: number | null
          region?: Database["public"]["Enums"]["manitoba_region"] | null
          status?: Database["public"]["Enums"]["inquiry_status"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employer_inquiries_converted_to_employer_id_fkey"
            columns: ["converted_to_employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      employers: {
        Row: {
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
          created_at: string
          id: string
          industry: string | null
          is_partner: boolean | null
          notes: string | null
          source_inquiry_id: string | null
          status: string
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          is_partner?: boolean | null
          notes?: string | null
          source_inquiry_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          is_partner?: boolean | null
          notes?: string | null
          source_inquiry_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employers_source_inquiry_id_fkey"
            columns: ["source_inquiry_id"]
            isOneToOne: false
            referencedRelation: "employer_inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      intake_notes: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          intake_id: string
          note: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          intake_id: string
          note: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          intake_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_notes_intake_id_fkey"
            columns: ["intake_id"]
            isOneToOne: false
            referencedRelation: "job_seeker_intakes"
            referencedColumns: ["id"]
          },
        ]
      }
      job_activity_log: {
        Row: {
          action: Database["public"]["Enums"]["job_action"]
          actor_user_id: string | null
          after_state: Json | null
          before_state: Json | null
          created_at: string
          id: string
          job_id: string
          metadata: Json | null
        }
        Insert: {
          action: Database["public"]["Enums"]["job_action"]
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: string
          job_id: string
          metadata?: Json | null
        }
        Update: {
          action?: Database["public"]["Enums"]["job_action"]
          actor_user_id?: string | null
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string
          id?: string
          job_id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "job_activity_log_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string | null
          id: string
          is_public: boolean
          job_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean
          job_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_public?: boolean
          job_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_attachments_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_seeker_intakes: {
        Row: {
          assigned_at: string | null
          assigned_to: string | null
          barriers_description: string | null
          city: string | null
          consent_contact: boolean
          consent_data_collection: boolean
          contact_preference: Database["public"]["Enums"]["contact_preference"]
          created_at: string
          email: string
          employment_goals: string | null
          employment_status: string | null
          full_name: string
          has_barriers: boolean | null
          id: string
          interests: string[] | null
          is_urgent: boolean | null
          is_youth: boolean | null
          mmf_citizenship_number: string | null
          phone: string | null
          postal_code: string | null
          region: Database["public"]["Enums"]["manitoba_region"]
          resume_filename: string | null
          resume_url: string | null
          self_identifies_metis: boolean | null
          skills: string[] | null
          skills_other: string | null
          status: Database["public"]["Enums"]["intake_status"]
          updated_at: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_to?: string | null
          barriers_description?: string | null
          city?: string | null
          consent_contact?: boolean
          consent_data_collection?: boolean
          contact_preference?: Database["public"]["Enums"]["contact_preference"]
          created_at?: string
          email: string
          employment_goals?: string | null
          employment_status?: string | null
          full_name: string
          has_barriers?: boolean | null
          id?: string
          interests?: string[] | null
          is_urgent?: boolean | null
          is_youth?: boolean | null
          mmf_citizenship_number?: string | null
          phone?: string | null
          postal_code?: string | null
          region: Database["public"]["Enums"]["manitoba_region"]
          resume_filename?: string | null
          resume_url?: string | null
          self_identifies_metis?: boolean | null
          skills?: string[] | null
          skills_other?: string | null
          status?: Database["public"]["Enums"]["intake_status"]
          updated_at?: string
        }
        Update: {
          assigned_at?: string | null
          assigned_to?: string | null
          barriers_description?: string | null
          city?: string | null
          consent_contact?: boolean
          consent_data_collection?: boolean
          contact_preference?: Database["public"]["Enums"]["contact_preference"]
          created_at?: string
          email?: string
          employment_goals?: string | null
          employment_status?: string | null
          full_name?: string
          has_barriers?: boolean | null
          id?: string
          interests?: string[] | null
          is_urgent?: boolean | null
          is_youth?: boolean | null
          mmf_citizenship_number?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: Database["public"]["Enums"]["manitoba_region"]
          resume_filename?: string | null
          resume_url?: string | null
          self_identifies_metis?: boolean | null
          skills?: string[] | null
          skills_other?: string | null
          status?: Database["public"]["Enums"]["intake_status"]
          updated_at?: string
        }
        Relationships: []
      }
      job_tags: {
        Row: {
          job_id: string
          tag_id: string
        }
        Insert: {
          job_id: string
          tag_id: string
        }
        Update: {
          job_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_tags_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          address: string | null
          application_method: Database["public"]["Enums"]["application_method"]
          apply_email: string | null
          apply_instructions: string | null
          apply_phone: string | null
          apply_through_met: boolean | null
          apply_url: string | null
          archived_at: string | null
          archived_by: string | null
          category: Database["public"]["Enums"]["job_category"]
          city: string | null
          created_at: string
          created_by: string | null
          description: string
          employer_id: string | null
          employer_name: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          expires_at: string | null
          external_id: string | null
          featured: boolean
          id: string
          is_remote: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          location_type: Database["public"]["Enums"]["location_type"]
          pay_currency: string
          pay_max: number | null
          pay_min: number | null
          pay_period: Database["public"]["Enums"]["pay_period"] | null
          pay_range: string | null
          pay_visible: boolean
          postal_code: string | null
          posted_at: string | null
          priority: number
          province: string
          published_at: string | null
          published_by: string | null
          region: Database["public"]["Enums"]["manitoba_region"]
          requirements: string | null
          scheduled_publish_at: string | null
          scheduled_unpublish_at: string | null
          slug: string | null
          source: Database["public"]["Enums"]["job_source"]
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          application_method?: Database["public"]["Enums"]["application_method"]
          apply_email?: string | null
          apply_instructions?: string | null
          apply_phone?: string | null
          apply_through_met?: boolean | null
          apply_url?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category: Database["public"]["Enums"]["job_category"]
          city?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          employer_id?: string | null
          employer_name?: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          expires_at?: string | null
          external_id?: string | null
          featured?: boolean
          id?: string
          is_remote?: boolean | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location_type?: Database["public"]["Enums"]["location_type"]
          pay_currency?: string
          pay_max?: number | null
          pay_min?: number | null
          pay_period?: Database["public"]["Enums"]["pay_period"] | null
          pay_range?: string | null
          pay_visible?: boolean
          postal_code?: string | null
          posted_at?: string | null
          priority?: number
          province?: string
          published_at?: string | null
          published_by?: string | null
          region: Database["public"]["Enums"]["manitoba_region"]
          requirements?: string | null
          scheduled_publish_at?: string | null
          scheduled_unpublish_at?: string | null
          slug?: string | null
          source?: Database["public"]["Enums"]["job_source"]
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          application_method?: Database["public"]["Enums"]["application_method"]
          apply_email?: string | null
          apply_instructions?: string | null
          apply_phone?: string | null
          apply_through_met?: boolean | null
          apply_url?: string | null
          archived_at?: string | null
          archived_by?: string | null
          category?: Database["public"]["Enums"]["job_category"]
          city?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          employer_id?: string | null
          employer_name?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          expires_at?: string | null
          external_id?: string | null
          featured?: boolean
          id?: string
          is_remote?: boolean | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          location_type?: Database["public"]["Enums"]["location_type"]
          pay_currency?: string
          pay_max?: number | null
          pay_min?: number | null
          pay_period?: Database["public"]["Enums"]["pay_period"] | null
          pay_range?: string | null
          pay_visible?: boolean
          postal_code?: string | null
          posted_at?: string | null
          priority?: number
          province?: string
          published_at?: string | null
          published_by?: string | null
          region?: Database["public"]["Enums"]["manitoba_region"]
          requirements?: string | null
          scheduled_publish_at?: string | null
          scheduled_unpublish_at?: string | null
          slug?: string | null
          source?: Database["public"]["Enums"]["job_source"]
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_employer_id_fkey"
            columns: ["employer_id"]
            isOneToOne: false
            referencedRelation: "employers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_employer_for_user: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_employer: { Args: { _user_id: string }; Returns: boolean }
      is_staff_or_admin: { Args: { _user_id: string }; Returns: boolean }
      setup_demo_employer: {
        Args: {
          p_company_name?: string
          p_contact_name?: string
          p_email: string
        }
        Returns: {
          employer_id: string
          message: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "user" | "employer"
      application_method:
        | "apply_url"
        | "apply_through_met"
        | "email"
        | "phone"
        | "in_person"
      contact_preference: "email" | "phone" | "text" | "any"
      employment_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "seasonal"
        | "internship"
        | "remote"
      inquiry_status: "new" | "in_progress" | "resolved" | "closed"
      inquiry_type:
        | "job_posting"
        | "candidate_request"
        | "partnership"
        | "general"
      intake_status:
        | "new"
        | "contacted"
        | "engaged"
        | "referred"
        | "placed"
        | "closed"
      job_action:
        | "create"
        | "update"
        | "status_change"
        | "publish"
        | "unpublish"
        | "duplicate"
        | "archive"
        | "restore"
      job_category:
        | "administration"
        | "construction_trades"
        | "education"
        | "healthcare"
        | "hospitality"
        | "information_technology"
        | "manufacturing"
        | "natural_resources"
        | "retail_sales"
        | "transportation"
        | "other"
      job_source: "manual" | "imported"
      job_status: "draft" | "pending" | "active" | "expired" | "closed"
      listing_type:
        | "summer_employment"
        | "met_positions"
        | "partner_jobs"
        | "training_programs"
      location_type: "onsite" | "hybrid" | "remote"
      manitoba_region:
        | "winnipeg"
        | "southeast"
        | "interlake"
        | "parklands"
        | "northwest"
        | "the_pas"
        | "thompson"
        | "swan_river"
      pay_period: "hour" | "day" | "week" | "month" | "year" | "project"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "staff", "user", "employer"],
      application_method: [
        "apply_url",
        "apply_through_met",
        "email",
        "phone",
        "in_person",
      ],
      contact_preference: ["email", "phone", "text", "any"],
      employment_type: [
        "full_time",
        "part_time",
        "contract",
        "seasonal",
        "internship",
        "remote",
      ],
      inquiry_status: ["new", "in_progress", "resolved", "closed"],
      inquiry_type: [
        "job_posting",
        "candidate_request",
        "partnership",
        "general",
      ],
      intake_status: [
        "new",
        "contacted",
        "engaged",
        "referred",
        "placed",
        "closed",
      ],
      job_action: [
        "create",
        "update",
        "status_change",
        "publish",
        "unpublish",
        "duplicate",
        "archive",
        "restore",
      ],
      job_category: [
        "administration",
        "construction_trades",
        "education",
        "healthcare",
        "hospitality",
        "information_technology",
        "manufacturing",
        "natural_resources",
        "retail_sales",
        "transportation",
        "other",
      ],
      job_source: ["manual", "imported"],
      job_status: ["draft", "pending", "active", "expired", "closed"],
      listing_type: [
        "summer_employment",
        "met_positions",
        "partner_jobs",
        "training_programs",
      ],
      location_type: ["onsite", "hybrid", "remote"],
      manitoba_region: [
        "winnipeg",
        "southeast",
        "interlake",
        "parklands",
        "northwest",
        "the_pas",
        "thompson",
        "swan_river",
      ],
      pay_period: ["hour", "day", "week", "month", "year", "project"],
    },
  },
} as const
