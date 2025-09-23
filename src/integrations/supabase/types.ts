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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      challenges: {
        Row: {
          accepted_at: string | null
          challenged_id: string
          challenger_id: string
          checked_in_at: string | null
          created_at: string
          expires_at: string
          id: string
          match_type: string | null
          message: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          challenged_id: string
          challenger_id: string
          checked_in_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          match_type?: string | null
          message?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          challenged_id?: string
          challenger_id?: string
          checked_in_at?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          match_type?: string | null
          message?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenges_challenged_id_fkey"
            columns: ["challenged_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenges_challenger_id_fkey"
            columns: ["challenger_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      character_images: {
        Row: {
          character_name: string
          created_at: string
          id: string
          image_url: string
        }
        Insert: {
          character_name: string
          created_at?: string
          id?: string
          image_url: string
        }
        Update: {
          character_name?: string
          created_at?: string
          id?: string
          image_url?: string
        }
        Relationships: []
      }
      evaluation_results: {
        Row: {
          aerial_score: number | null
          created_at: string
          dash_score: number | null
          defense_score: number | null
          evaluation_id: string
          evaluation_summary: string
          evaluator_id: string
          general_score: number | null
          id: string
          initial_points: number
          initial_rank: string
          kunai_score: number | null
          pin_score: number | null
          player_id: string
          resource_score: number | null
          timing_score: number | null
          tip_1: string
          tip_2: string
          tip_3: string
          updated_at: string
        }
        Insert: {
          aerial_score?: number | null
          created_at?: string
          dash_score?: number | null
          defense_score?: number | null
          evaluation_id: string
          evaluation_summary: string
          evaluator_id: string
          general_score?: number | null
          id?: string
          initial_points: number
          initial_rank: string
          kunai_score?: number | null
          pin_score?: number | null
          player_id: string
          resource_score?: number | null
          timing_score?: number | null
          tip_1: string
          tip_2: string
          tip_3: string
          updated_at?: string
        }
        Update: {
          aerial_score?: number | null
          created_at?: string
          dash_score?: number | null
          defense_score?: number | null
          evaluation_id?: string
          evaluation_summary?: string
          evaluator_id?: string
          general_score?: number | null
          id?: string
          initial_points?: number
          initial_rank?: string
          kunai_score?: number | null
          pin_score?: number | null
          player_id?: string
          resource_score?: number | null
          timing_score?: number | null
          tip_1?: string
          tip_2?: string
          tip_3?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluation_results_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "evaluations"
            referencedColumns: ["id"]
          },
        ]
      }
      evaluations: {
        Row: {
          aerial_score: number | null
          comments: string | null
          created_at: string
          dash_score: number | null
          defense_score: number | null
          evaluated_at: string | null
          evaluator_id: string | null
          general_score: number | null
          id: string
          initial_rank: string | null
          kunai_score: number | null
          pin_score: number | null
          player_id: string
          request_message: string | null
          resource_score: number | null
          status: string | null
          summary: string | null
          timing_score: number | null
          tip_1: string | null
          tip_2: string | null
          tip_3: string | null
          tips: string | null
          updated_at: string
        }
        Insert: {
          aerial_score?: number | null
          comments?: string | null
          created_at?: string
          dash_score?: number | null
          defense_score?: number | null
          evaluated_at?: string | null
          evaluator_id?: string | null
          general_score?: number | null
          id?: string
          initial_rank?: string | null
          kunai_score?: number | null
          pin_score?: number | null
          player_id: string
          request_message?: string | null
          resource_score?: number | null
          status?: string | null
          summary?: string | null
          timing_score?: number | null
          tip_1?: string | null
          tip_2?: string | null
          tip_3?: string | null
          tips?: string | null
          updated_at?: string
        }
        Update: {
          aerial_score?: number | null
          comments?: string | null
          created_at?: string
          dash_score?: number | null
          defense_score?: number | null
          evaluated_at?: string | null
          evaluator_id?: string | null
          general_score?: number | null
          id?: string
          initial_rank?: string | null
          kunai_score?: number | null
          pin_score?: number | null
          player_id?: string
          request_message?: string | null
          resource_score?: number | null
          status?: string | null
          summary?: string | null
          timing_score?: number | null
          tip_1?: string | null
          tip_2?: string | null
          tip_3?: string | null
          tips?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evaluations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          challenge_id: string | null
          created_at: string
          evidence_url: string | null
          id: string
          loser_id: string
          loser_points_change: number | null
          match_notes: string | null
          played_at: string
          rounds_data: Json | null
          winner_id: string
          winner_points_change: number | null
        }
        Insert: {
          challenge_id?: string | null
          created_at?: string
          evidence_url?: string | null
          id?: string
          loser_id: string
          loser_points_change?: number | null
          match_notes?: string | null
          played_at?: string
          rounds_data?: Json | null
          winner_id: string
          winner_points_change?: number | null
        }
        Update: {
          challenge_id?: string | null
          created_at?: string
          evidence_url?: string | null
          id?: string
          loser_id?: string
          loser_points_change?: number | null
          match_notes?: string | null
          played_at?: string
          rounds_data?: Json | null
          winner_id?: string
          winner_points_change?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_loser_id_fkey"
            columns: ["loser_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          avatar_url: string | null
          created_at: string
          current_points: number | null
          favorite_characters: Json | null
          id: string
          immunity_until: string | null
          is_admin: boolean | null
          is_moderator: boolean | null
          is_ranked: boolean | null
          kage_title: string | null
          last_match_date: string | null
          last_profile_update: string | null
          last_promotion_attempt: string | null
          losses: number | null
          name: string
          ninja_phrase: string | null
          points: number | null
          privacy_settings: Json | null
          promotion_series_active: boolean | null
          promotion_series_losses: number | null
          promotion_series_wins: number | null
          rank: string | null
          rank_level: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          tutor_id: string | null
          updated_at: string
          user_id: string | null
          win_streak: number | null
          wins: number | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          current_points?: number | null
          favorite_characters?: Json | null
          id?: string
          immunity_until?: string | null
          is_admin?: boolean | null
          is_moderator?: boolean | null
          is_ranked?: boolean | null
          kage_title?: string | null
          last_match_date?: string | null
          last_profile_update?: string | null
          last_promotion_attempt?: string | null
          losses?: number | null
          name: string
          ninja_phrase?: string | null
          points?: number | null
          privacy_settings?: Json | null
          promotion_series_active?: boolean | null
          promotion_series_losses?: number | null
          promotion_series_wins?: number | null
          rank?: string | null
          rank_level?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          tutor_id?: string | null
          updated_at?: string
          user_id?: string | null
          win_streak?: number | null
          wins?: number | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          current_points?: number | null
          favorite_characters?: Json | null
          id?: string
          immunity_until?: string | null
          is_admin?: boolean | null
          is_moderator?: boolean | null
          is_ranked?: boolean | null
          kage_title?: string | null
          last_match_date?: string | null
          last_profile_update?: string | null
          last_promotion_attempt?: string | null
          losses?: number | null
          name?: string
          ninja_phrase?: string | null
          points?: number | null
          privacy_settings?: Json | null
          promotion_series_active?: boolean | null
          promotion_series_losses?: number | null
          promotion_series_wins?: number | null
          rank?: string | null
          rank_level?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          tutor_id?: string | null
          updated_at?: string
          user_id?: string | null
          win_streak?: number | null
          wins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      ranking_changes: {
        Row: {
          change_reason: string
          created_at: string
          evaluation_id: string | null
          id: string
          match_id: string | null
          new_points: number | null
          new_rank: string | null
          old_points: number | null
          old_rank: string | null
          player_id: string
        }
        Insert: {
          change_reason: string
          created_at?: string
          evaluation_id?: string | null
          id?: string
          match_id?: string | null
          new_points?: number | null
          new_rank?: string | null
          old_points?: number | null
          old_rank?: string | null
          player_id: string
        }
        Update: {
          change_reason?: string
          created_at?: string
          evaluation_id?: string | null
          id?: string
          match_id?: string | null
          new_points?: number | null
          new_rank?: string | null
          old_points?: number | null
          old_rank?: string | null
          player_id?: string
        }
        Relationships: []
      }
      tournament_participants: {
        Row: {
          eliminated_at: string | null
          final_position: number | null
          id: string
          player_id: string
          registered_at: string
          tournament_id: string
        }
        Insert: {
          eliminated_at?: string | null
          final_position?: number | null
          id?: string
          player_id: string
          registered_at?: string
          tournament_id: string
        }
        Update: {
          eliminated_at?: string | null
          final_position?: number | null
          id?: string
          player_id?: string
          registered_at?: string
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_participants_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_participants_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          max_participants: number | null
          name: string
          prize_description: string | null
          registration_end: string
          registration_start: string
          status: string | null
          tournament_start: string
          tournament_type: string | null
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          max_participants?: number | null
          name: string
          prize_description?: string | null
          registration_end: string
          registration_start?: string
          status?: string | null
          tournament_start: string
          tournament_type?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          max_participants?: number | null
          name?: string
          prize_description?: string | null
          registration_end?: string
          registration_start?: string
          status?: string | null
          tournament_start?: string
          tournament_type?: string | null
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournaments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournaments_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_update_profile_settings: {
        Args: { user_id: string }
        Returns: boolean
      }
      get_initial_points_for_rank: {
        Args: { rank_name: string }
        Returns: number
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_moderator: {
        Args: { user_id: string }
        Returns: boolean
      }
      make_user_admin: {
        Args: { user_email: string }
        Returns: string
      }
      make_user_moderator: {
        Args: { user_email: string }
        Returns: string
      }
      set_initial_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_kage_titles: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "admin" | "moderator" | "player"
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
      user_role: ["admin", "moderator", "player"],
    },
  },
} as const
