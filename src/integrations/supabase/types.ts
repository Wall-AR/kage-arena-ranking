export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activity_log: {
        Row: {
          action_type: string
          details: string | null
          id: string
          record_id: string | null
          record_type: string
          timestamp: string | null
          user_email: string
          user_id: string
        }
        Insert: {
          action_type: string
          details?: string | null
          id?: string
          record_id?: string | null
          record_type: string
          timestamp?: string | null
          user_email: string
          user_id: string
        }
        Update: {
          action_type?: string
          details?: string | null
          id?: string
          record_id?: string | null
          record_type?: string
          timestamp?: string | null
          user_email?: string
          user_id?: string
        }
        Relationships: []
      }
      billing_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          entry_date: string
          faturamento_atr: number
          faturamento_released: number
          id: string
          month_year: string
          notes: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entry_date?: string
          faturamento_atr?: number
          faturamento_released?: number
          id?: string
          month_year: string
          notes?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entry_date?: string
          faturamento_atr?: number
          faturamento_released?: number
          id?: string
          month_year?: string
          notes?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      daily_sales: {
        Row: {
          created_at: string | null
          goal_amount: number
          id: string
          month_year: string
          sale_date: string
          sales_amount: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          goal_amount?: number
          id?: string
          month_year: string
          sale_date: string
          sales_amount?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          goal_amount?: number
          id?: string
          month_year?: string
          sale_date?: string
          sales_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      kpis: {
        Row: {
          created_at: string | null
          global_avg_ticket: number | null
          id: string
          month_year: string
          new_clients: number | null
          total_clients: number | null
          total_goal: number | null
          total_sold: number | null
        }
        Insert: {
          created_at?: string | null
          global_avg_ticket?: number | null
          id?: string
          month_year: string
          new_clients?: number | null
          total_clients?: number | null
          total_goal?: number | null
          total_sold?: number | null
        }
        Update: {
          created_at?: string | null
          global_avg_ticket?: number | null
          id?: string
          month_year?: string
          new_clients?: number | null
          total_clients?: number | null
          total_goal?: number | null
          total_sold?: number | null
        }
        Relationships: []
      }
      sales_records: {
        Row: {
          amount: number
          created_at: string | null
          created_by: string
          customer_name: string | null
          id: string
          is_new_customer: boolean | null
          order_number: string
          sale_date: string
          salesperson_id: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          created_by: string
          customer_name?: string | null
          id?: string
          is_new_customer?: boolean | null
          order_number: string
          sale_date: string
          salesperson_id: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          created_by?: string
          customer_name?: string | null
          id?: string
          is_new_customer?: boolean | null
          order_number?: string
          sale_date?: string
          salesperson_id?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_records_salesperson_id_fkey"
            columns: ["salesperson_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      salespeople: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          photo_url: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          photo_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          photo_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      seller_targets: {
        Row: {
          challenge_value: number
          created_at: string | null
          goal_value: number
          id: string
          mega_goal_value: number
          month: string
          seller_id: string
          updated_at: string | null
        }
        Insert: {
          challenge_value?: number
          created_at?: string | null
          goal_value?: number
          id?: string
          mega_goal_value?: number
          month: string
          seller_id: string
          updated_at?: string | null
        }
        Update: {
          challenge_value?: number
          created_at?: string | null
          goal_value?: number
          id?: string
          mega_goal_value?: number
          month?: string
          seller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_targets_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "salespeople"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          role: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          role?: Database["public"]["Enums"]["user_role_enum"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      current_user_is_finance: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      current_user_is_sales: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_user_role: {
        Args: { p_user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_finance_user: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      is_sales_user: {
        Args: { p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role_enum: "adm" | "sales" | "finance"
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
      user_role_enum: ["adm", "sales", "finance"],
    },
  },
} as const
