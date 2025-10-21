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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      crs_history: {
        Row: {
          calculation_data: Json
          created_at: string
          crs_score: number
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          calculation_data: Json
          created_at?: string
          crs_score: number
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          calculation_data?: Json
          created_at?: string
          crs_score?: number
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crs_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crs_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      crs_simulations: {
        Row: {
          base_crs_score: number
          changes: Json
          created_at: string
          id: string
          projected_crs_score: number
          score_difference: number
          simulation_name: string
          simulation_type: string
          user_id: string
        }
        Insert: {
          base_crs_score: number
          changes: Json
          created_at?: string
          id?: string
          projected_crs_score: number
          score_difference: number
          simulation_name: string
          simulation_type: string
          user_id: string
        }
        Update: {
          base_crs_score?: number
          changes?: Json
          created_at?: string
          id?: string
          projected_crs_score?: number
          score_difference?: number
          simulation_name?: string
          simulation_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crs_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crs_simulations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      draw_alerts: {
        Row: {
          created_at: string
          draw_types: string[] | null
          email_notifications: boolean | null
          id: string
          is_active: boolean | null
          last_notified_at: string | null
          min_crs_threshold: number | null
          updated_at: string
          user_id: string
          whatsapp_notifications: boolean | null
        }
        Insert: {
          created_at?: string
          draw_types?: string[] | null
          email_notifications?: boolean | null
          id?: string
          is_active?: boolean | null
          last_notified_at?: string | null
          min_crs_threshold?: number | null
          updated_at?: string
          user_id: string
          whatsapp_notifications?: boolean | null
        }
        Update: {
          created_at?: string
          draw_types?: string[] | null
          email_notifications?: boolean | null
          id?: string
          is_active?: boolean | null
          last_notified_at?: string | null
          min_crs_threshold?: number | null
          updated_at?: string
          user_id?: string
          whatsapp_notifications?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "draw_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draw_alerts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      express_entry_draws: {
        Row: {
          category: string | null
          created_at: string | null
          crs_min: number
          date: string
          id: number
          invitations: number
          source_url: string
          tiebreak_ts: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          crs_min: number
          date: string
          id: number
          invitations: number
          source_url: string
          tiebreak_ts?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          crs_min?: number
          date?: string
          id?: number
          invitations?: number
          source_url?: string
          tiebreak_ts?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      pdf_reports: {
        Row: {
          generated_at: string
          id: string
          is_free_trial: boolean | null
          pdf_url: string | null
          report_data: Json
          report_type: string
          user_id: string
        }
        Insert: {
          generated_at?: string
          id?: string
          is_free_trial?: boolean | null
          pdf_url?: string | null
          report_data: Json
          report_type: string
          user_id: string
        }
        Update: {
          generated_at?: string
          id?: string
          is_free_trial?: boolean | null
          pdf_url?: string | null
          report_data?: Json
          report_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pdf_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pdf_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          location: string | null
          stripe_customer_id: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          location?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          location?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      quiz_completions: {
        Row: {
          completed_at: string
          created_at: string
          id: string
          session_id: string
        }
        Insert: {
          completed_at?: string
          created_at?: string
          id?: string
          session_id: string
        }
        Update: {
          completed_at?: string
          created_at?: string
          id?: string
          session_id?: string
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          created_at: string
          id: string
          results: Json
          session_id: string
          updated_at: string
          user_email: string | null
          user_location: string | null
          user_name: string | null
          user_timeline: string | null
          user_whatsapp: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          results: Json
          session_id: string
          updated_at?: string
          user_email?: string | null
          user_location?: string | null
          user_name?: string | null
          user_timeline?: string | null
          user_whatsapp?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          results?: Json
          session_id?: string
          updated_at?: string
          user_email?: string | null
          user_location?: string | null
          user_name?: string | null
          user_timeline?: string | null
          user_whatsapp?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_stats"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      user_stats: {
        Row: {
          crs_calculations_count: number | null
          email: string | null
          full_name: string | null
          latest_crs_date: string | null
          latest_crs_score: number | null
          plan_type: string | null
          reports_count: number | null
          simulations_count: number | null
          subscription_status: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      count_user_pdf_reports: {
        Args: { user_uuid: string }
        Returns: number
      }
      get_quiz_completions_count: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_subscription: {
        Args: { user_uuid: string }
        Returns: {
          cancel_at_period_end: boolean
          current_period_end: string
          id: string
          plan_type: string
          status: string
          trial_end: string
        }[]
      }
      is_pro_user: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
