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
      achievements: {
        Row: {
          category: string
          color: string
          created_at: string
          description: string | null
          display_name: string
          icon: string
          id: string
          name: string
        }
        Insert: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          display_name: string
          icon: string
          id?: string
          name: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          description?: string | null
          display_name?: string
          icon?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          category: string
          created_at: string
          description: string | null
          display_name: string
          id: string
          image_url: string
          is_available: boolean | null
          name: string
          rarity: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          display_name: string
          id?: string
          image_url: string
          is_available?: boolean | null
          name: string
          rarity?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          display_name?: string
          id?: string
          image_url?: string
          is_available?: boolean | null
          name?: string
          rarity?: string
        }
        Relationships: []
      }
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
          timing_score: number | null
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
          timing_score?: number | null
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
          timing_score?: number | null
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
      forum_categories: {
        Row: {
          color: string
          created_at: string
          description: string | null
          display_order: number | null
          icon: string
          id: string
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          color?: string
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string
          id?: string
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      forum_reactions: {
        Row: {
          created_at: string
          id: string
          reaction_type: string
          reply_id: string | null
          topic_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reaction_type?: string
          reply_id?: string | null
          topic_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reaction_type?: string
          reply_id?: string | null
          topic_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_reactions_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "forum_replies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reactions_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_reactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_replies: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_solution: boolean | null
          topic_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_solution?: boolean | null
          topic_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_solution?: boolean | null
          topic_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_replies_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_replies_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "forum_topics"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_topics: {
        Row: {
          author_id: string
          category_id: string
          content: string
          created_at: string
          id: string
          is_locked: boolean | null
          is_pinned: boolean | null
          last_reply_at: string | null
          last_reply_by: string | null
          replies_count: number | null
          title: string
          updated_at: string
          views_count: number | null
        }
        Insert: {
          author_id: string
          category_id: string
          content: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          last_reply_by?: string | null
          replies_count?: number | null
          title: string
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          author_id?: string
          category_id?: string
          content?: string
          created_at?: string
          id?: string
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_reply_at?: string | null
          last_reply_by?: string | null
          replies_count?: number | null
          title?: string
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "forum_topics_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "forum_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_topics_last_reply_by_fkey"
            columns: ["last_reply_by"]
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
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      player_achievements: {
        Row: {
          achievement_id: string
          display_order: number | null
          id: string
          is_displayed: boolean | null
          player_id: string
          unlocked_at: string
        }
        Insert: {
          achievement_id: string
          display_order?: number | null
          id?: string
          is_displayed?: boolean | null
          player_id: string
          unlocked_at?: string
        }
        Update: {
          achievement_id?: string
          display_order?: number | null
          id?: string
          is_displayed?: boolean | null
          player_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_achievements_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_banners: {
        Row: {
          banner_id: string
          id: string
          player_id: string
          unlocked_at: string
        }
        Insert: {
          banner_id: string
          id?: string
          player_id: string
          unlocked_at?: string
        }
        Update: {
          banner_id?: string
          id?: string
          player_id?: string
          unlocked_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_banners_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_banners_player_id_fkey"
            columns: ["player_id"]
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
          role: string | null
          selected_achievements: Json | null
          selected_banner_id: string | null
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
          role?: string | null
          selected_achievements?: Json | null
          selected_banner_id?: string | null
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
          role?: string | null
          selected_achievements?: Json | null
          selected_banner_id?: string | null
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
      redeemed_codes: {
        Row: {
          code_id: string
          id: string
          player_id: string
          redeemed_at: string
        }
        Insert: {
          code_id: string
          id?: string
          player_id: string
          redeemed_at?: string
        }
        Update: {
          code_id?: string
          id?: string
          player_id?: string
          redeemed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "redeemed_codes_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "redemption_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redeemed_codes_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      redemption_codes: {
        Row: {
          achievement_id: string | null
          banner_id: string | null
          code: string
          created_at: string
          current_uses: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
        }
        Insert: {
          achievement_id?: string | null
          banner_id?: string | null
          code: string
          created_at?: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Update: {
          achievement_id?: string | null
          banner_id?: string | null
          code?: string
          created_at?: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "redemption_codes_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemption_codes_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_disputes: {
        Row: {
          created_at: string
          dispute_reason: string
          evidence_url: string | null
          id: string
          match_id: string
          reported_by: string
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dispute_reason: string
          evidence_url?: string | null
          id?: string
          match_id: string
          reported_by: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dispute_reason?: string
          evidence_url?: string | null
          id?: string
          match_id?: string
          reported_by?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_disputes_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "tournament_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_disputes_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_matches: {
        Row: {
          bracket_position: number | null
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          evidence_url: string | null
          id: string
          is_disputed: boolean | null
          match_number: number
          next_match_id: string | null
          notes: string | null
          played_at: string | null
          player1_id: string | null
          player1_score: number | null
          player2_id: string | null
          player2_score: number | null
          reported_by: string | null
          reported_winner_id: string | null
          round: number
          status: string | null
          tournament_id: string
          updated_at: string | null
          winner_id: string | null
        }
        Insert: {
          bracket_position?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          evidence_url?: string | null
          id?: string
          is_disputed?: boolean | null
          match_number: number
          next_match_id?: string | null
          notes?: string | null
          played_at?: string | null
          player1_id?: string | null
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          reported_by?: string | null
          reported_winner_id?: string | null
          round: number
          status?: string | null
          tournament_id: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Update: {
          bracket_position?: number | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          evidence_url?: string | null
          id?: string
          is_disputed?: boolean | null
          match_number?: number
          next_match_id?: string | null
          notes?: string | null
          played_at?: string | null
          player1_id?: string | null
          player1_score?: number | null
          player2_id?: string | null
          player2_score?: number | null
          reported_by?: string | null
          reported_winner_id?: string | null
          round?: number
          status?: string | null
          tournament_id?: string
          updated_at?: string | null
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tournament_matches_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_next_match_id_fkey"
            columns: ["next_match_id"]
            isOneToOne: false
            referencedRelation: "tournament_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_player1_id_fkey"
            columns: ["player1_id"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_player2_id_fkey"
            columns: ["player2_id"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_reported_winner_id_fkey"
            columns: ["reported_winner_id"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_matches_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "tournament_participants"
            referencedColumns: ["id"]
          },
        ]
      }
      tournament_participants: {
        Row: {
          checked_in: boolean | null
          checked_in_at: string | null
          current_match_id: string | null
          final_position: number | null
          id: string
          player_id: string
          registered_at: string
          seed: number | null
          tournament_id: string
        }
        Insert: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          current_match_id?: string | null
          final_position?: number | null
          id?: string
          player_id: string
          registered_at?: string
          seed?: number | null
          tournament_id: string
        }
        Update: {
          checked_in?: boolean | null
          checked_in_at?: string | null
          current_match_id?: string | null
          final_position?: number | null
          id?: string
          player_id?: string
          registered_at?: string
          seed?: number | null
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
      tournament_rewards: {
        Row: {
          achievement_id: string | null
          banner_id: string | null
          created_at: string | null
          custom_reward_text: string | null
          id: string
          points_reward: number | null
          position: number
          tournament_id: string
        }
        Insert: {
          achievement_id?: string | null
          banner_id?: string | null
          created_at?: string | null
          custom_reward_text?: string | null
          id?: string
          points_reward?: number | null
          position: number
          tournament_id: string
        }
        Update: {
          achievement_id?: string | null
          banner_id?: string | null
          created_at?: string | null
          custom_reward_text?: string | null
          id?: string
          points_reward?: number | null
          position?: number
          tournament_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tournament_rewards_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rewards_banner_id_fkey"
            columns: ["banner_id"]
            isOneToOne: false
            referencedRelation: "banners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tournament_rewards_tournament_id_fkey"
            columns: ["tournament_id"]
            isOneToOne: false
            referencedRelation: "tournaments"
            referencedColumns: ["id"]
          },
        ]
      }
      tournaments: {
        Row: {
          bracket_data: Json | null
          check_in_end: string | null
          check_in_start: string | null
          created_at: string
          created_by: string | null
          current_round: number | null
          description: string | null
          id: string
          image_url: string | null
          max_participants: number | null
          max_rank: string | null
          min_rank: string | null
          name: string
          registration_end: string
          registration_start: string
          require_top_character: boolean | null
          required_character: string | null
          rules_text: string | null
          status: string | null
          tournament_start: string
          tournament_type: string | null
          updated_at: string
        }
        Insert: {
          bracket_data?: Json | null
          check_in_end?: string | null
          check_in_start?: string | null
          created_at?: string
          created_by?: string | null
          current_round?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          max_participants?: number | null
          max_rank?: string | null
          min_rank?: string | null
          name: string
          registration_end: string
          registration_start?: string
          require_top_character?: boolean | null
          required_character?: string | null
          rules_text?: string | null
          status?: string | null
          tournament_start: string
          tournament_type?: string | null
          updated_at?: string
        }
        Update: {
          bracket_data?: Json | null
          check_in_end?: string | null
          check_in_start?: string | null
          created_at?: string
          created_by?: string | null
          current_round?: number | null
          description?: string | null
          id?: string
          image_url?: string | null
          max_participants?: number | null
          max_rank?: string | null
          min_rank?: string | null
          name?: string
          registration_end?: string
          registration_start?: string
          require_top_character?: boolean | null
          required_character?: string | null
          rules_text?: string | null
          status?: string | null
          tournament_start?: string
          tournament_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      advance_tournament_winner: {
        Args: { p_match_id: string; p_winner_id: string }
        Returns: undefined
      }
      can_update_profile_settings: {
        Args: { user_id: string }
        Returns: boolean
      }
      distribute_tournament_rewards: {
        Args: { tournament_uuid: string }
        Returns: undefined
      }
      get_initial_points_for_rank: {
        Args: { rank_name: string }
        Returns: number
      }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_moderator: { Args: { user_uuid: string }; Returns: boolean }
      redeem_code: {
        Args: { p_code_text: string; p_player_id: string }
        Returns: Json
      }
      set_initial_admin: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      update_kage_titles: { Args: never; Returns: undefined }
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
