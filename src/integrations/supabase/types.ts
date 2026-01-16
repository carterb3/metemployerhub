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
      employer_inquiries: {
        Row: {
          assigned_to: string | null
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone: string | null
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
          company_name: string
          contact_email: string
          contact_name: string
          contact_phone?: string | null
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
          company_name?: string
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
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
        Relationships: []
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
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
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
      jobs: {
        Row: {
          apply_through_met: boolean | null
          apply_url: string | null
          category: Database["public"]["Enums"]["job_category"]
          city: string | null
          created_at: string
          description: string
          employer_id: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          expires_at: string | null
          id: string
          is_remote: boolean | null
          listing_type: Database["public"]["Enums"]["listing_type"]
          pay_range: string | null
          posted_at: string | null
          region: Database["public"]["Enums"]["manitoba_region"]
          requirements: string | null
          status: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at: string
        }
        Insert: {
          apply_through_met?: boolean | null
          apply_url?: string | null
          category: Database["public"]["Enums"]["job_category"]
          city?: string | null
          created_at?: string
          description: string
          employer_id?: string | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          expires_at?: string | null
          id?: string
          is_remote?: boolean | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          pay_range?: string | null
          posted_at?: string | null
          region: Database["public"]["Enums"]["manitoba_region"]
          requirements?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title: string
          updated_at?: string
        }
        Update: {
          apply_through_met?: boolean | null
          apply_url?: string | null
          category?: Database["public"]["Enums"]["job_category"]
          city?: string | null
          created_at?: string
          description?: string
          employer_id?: string | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          expires_at?: string | null
          id?: string
          is_remote?: boolean | null
          listing_type?: Database["public"]["Enums"]["listing_type"]
          pay_range?: string | null
          posted_at?: string | null
          region?: Database["public"]["Enums"]["manitoba_region"]
          requirements?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          title?: string
          updated_at?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff_or_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "staff" | "user"
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
      job_status: "draft" | "pending" | "active" | "expired" | "closed"
      listing_type:
        | "summer_employment"
        | "met_positions"
        | "partner_jobs"
        | "training_programs"
      manitoba_region:
        | "winnipeg"
        | "southeast"
        | "interlake"
        | "parklands"
        | "northwest"
        | "the_pas"
        | "thompson"
        | "swan_river"
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
      app_role: ["admin", "staff", "user"],
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
      job_status: ["draft", "pending", "active", "expired", "closed"],
      listing_type: [
        "summer_employment",
        "met_positions",
        "partner_jobs",
        "training_programs",
      ],
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
    },
  },
} as const
