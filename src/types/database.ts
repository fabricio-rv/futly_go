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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      conversation_participants: {
        Row: {
          conversation_id: string
          joined_at: string
          last_read_at: string
          role: Database["public"]["Enums"]["conversation_role"]
          user_id: string
        }
        Insert: {
          conversation_id: string
          joined_at?: string
          last_read_at?: string
          role?: Database["public"]["Enums"]["conversation_role"]
          user_id: string
        }
        Update: {
          conversation_id?: string
          joined_at?: string
          last_read_at?: string
          role?: Database["public"]["Enums"]["conversation_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversation_list"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          is_archived: boolean
          last_message_at: string | null
          last_message_id: string | null
          match_id: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean
          last_message_at?: string | null
          last_message_id?: string | null
          match_id?: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_archived?: boolean
          last_message_at?: string | null
          last_message_id?: string | null
          match_id?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "chat_conversation_list"
            referencedColumns: ["last_message_id"]
          },
          {
            foreignKeyName: "conversations_last_message_id_fkey"
            columns: ["last_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participants: {
        Row: {
          id: string
          is_host: boolean
          joined_at: string
          match_id: string
          position_key: string
          position_label: string
          status: Database["public"]["Enums"]["participant_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_host?: boolean
          joined_at?: string
          match_id: string
          position_key: string
          position_label: string
          status?: Database["public"]["Enums"]["participant_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_host?: boolean
          joined_at?: string
          match_id?: string
          position_key?: string
          position_label?: string
          status?: Database["public"]["Enums"]["participant_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participants_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_participation_requests: {
        Row: {
          created_at: string
          decided_at: string | null
          decision_by: string | null
          decision_reason: string | null
          id: string
          match_id: string
          note: string | null
          requested_position_key: string
          requested_position_label: string
          status: Database["public"]["Enums"]["participation_request_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          decided_at?: string | null
          decision_by?: string | null
          decision_reason?: string | null
          id?: string
          match_id: string
          note?: string | null
          requested_position_key: string
          requested_position_label: string
          status?: Database["public"]["Enums"]["participation_request_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          decided_at?: string | null
          decision_by?: string | null
          decision_reason?: string | null
          id?: string
          match_id?: string
          note?: string | null
          requested_position_key?: string
          requested_position_label?: string
          status?: Database["public"]["Enums"]["participation_request_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_participation_requests_decision_by_fkey"
            columns: ["decision_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participation_requests_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_participation_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          accepted_levels: Database["public"]["Enums"]["match_level"][]
          address: string | null
          allow_external_reserves: boolean
          cep: string | null
          city: string | null
          contact_phone: string | null
          created_at: string
          created_by: string
          description: string | null
          district: string | null
          duration_minutes: number
          facilities: Json
          formation_json: Json
          id: string
          match_date: string
          match_time: string
          max_age: number
          min_age: number
          modality: string
          price_per_person: number
          referee_included: boolean
          rest_break: boolean
          state: string | null
          status: Database["public"]["Enums"]["match_status"]
          title: string
          turno: Database["public"]["Enums"]["match_turno"]
          updated_at: string
          venue_name: string | null
        }
        Insert: {
          accepted_levels?: Database["public"]["Enums"]["match_level"][]
          address?: string | null
          allow_external_reserves?: boolean
          cep?: string | null
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          district?: string | null
          duration_minutes: number
          facilities?: Json
          formation_json?: Json
          id?: string
          match_date: string
          match_time: string
          max_age?: number
          min_age?: number
          modality: string
          price_per_person?: number
          referee_included?: boolean
          rest_break?: boolean
          state?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          title: string
          turno: Database["public"]["Enums"]["match_turno"]
          updated_at?: string
          venue_name?: string | null
        }
        Update: {
          accepted_levels?: Database["public"]["Enums"]["match_level"][]
          address?: string | null
          allow_external_reserves?: boolean
          cep?: string | null
          city?: string | null
          contact_phone?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          district?: string | null
          duration_minutes?: number
          facilities?: Json
          formation_json?: Json
          id?: string
          match_date?: string
          match_time?: string
          max_age?: number
          min_age?: number
          modality?: string
          price_per_person?: number
          referee_included?: boolean
          rest_break?: boolean
          state?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          title?: string
          turno?: Database["public"]["Enums"]["match_turno"]
          updated_at?: string
          venue_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "matches_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          message_type: Database["public"]["Enums"]["message_type"]
          metadata: Json
          sender_id: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json
          sender_id?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          message_type?: Database["public"]["Enums"]["message_type"]
          metadata?: Json
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversation_list"
            referencedColumns: ["conversation_id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          actor_id: string | null
          body: string
          created_at: string
          id: string
          is_read: boolean
          metadata: Json
          read_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          body: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          actor_id?: string | null
          body?: string
          created_at?: string
          id?: string
          is_read?: boolean
          metadata?: Json
          read_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          cep: string | null
          city: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          location_enabled: boolean
          notifications_enabled: boolean
          phone: string | null
          state: string | null
          theme: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          location_enabled?: boolean
          notifications_enabled?: boolean
          phone?: string | null
          state?: string | null
          theme?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          cep?: string | null
          city?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          location_enabled?: boolean
          notifications_enabled?: boolean
          phone?: string | null
          state?: string | null
          theme?: string
          updated_at?: string
        }
        Relationships: []
      }
      ratings: {
        Row: {
          anonymous: boolean
          comment: string | null
          created_at: string
          id: string
          match_id: string
          reviewed_id: string
          reviewer_id: string
          score: number
          tags: string[]
          target_role: Database["public"]["Enums"]["rating_target_role"]
          updated_at: string
        }
        Insert: {
          anonymous?: boolean
          comment?: string | null
          created_at?: string
          id?: string
          match_id: string
          reviewed_id: string
          reviewer_id: string
          score: number
          tags?: string[]
          target_role: Database["public"]["Enums"]["rating_target_role"]
          updated_at?: string
        }
        Update: {
          anonymous?: boolean
          comment?: string | null
          created_at?: string
          id?: string
          match_id?: string
          reviewed_id?: string
          reviewer_id?: string
          score?: number
          tags?: string[]
          target_role?: Database["public"]["Enums"]["rating_target_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_messages: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      chat_conversation_list: {
        Row: {
          archived_at: string | null
          conversation_id: string | null
          conversation_type:
            | Database["public"]["Enums"]["conversation_type"]
            | null
          created_at: string | null
          is_archived: boolean | null
          last_message_at: string | null
          last_message_content: string | null
          last_message_created_at: string | null
          last_message_id: string | null
          last_message_sender_id: string | null
          last_message_sender_name: string | null
          last_message_type: Database["public"]["Enums"]["message_type"] | null
          match_date: string | null
          match_host_id: string | null
          match_id: string | null
          match_time: string | null
          match_title: string | null
          match_venue_name: string | null
          my_role: Database["public"]["Enums"]["conversation_role"] | null
          private_partner_id: string | null
          private_partner_name: string | null
          unread_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["private_partner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_created_by_fkey"
            columns: ["match_host_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["last_message_sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      match_rating_tasks: {
        Row: {
          action_label: string | null
          match_date: string | null
          match_id: string | null
          match_title: string | null
          target_role: Database["public"]["Enums"]["rating_target_role"] | null
          target_user_id: string | null
          target_user_name: string | null
          task_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      archive_expired_match_conversations: { Args: never; Returns: number }
      create_notification: {
        Args: {
          p_actor_id: string
          p_body: string
          p_metadata?: Json
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: string
      }
      create_private_conversation: {
        Args: { p_initial_message?: string; p_other_user_id: string }
        Returns: string
      }
      delete_my_account: { Args: never; Returns: undefined }
      ensure_match_conversation: {
        Args: { p_match_id: string }
        Returns: string
      }
      get_users_position_stats: {
        Args: { p_user_ids: string[] }
        Returns: {
          avg_rating: number
          matches_count: number
          modality: string
          position_key: string
          position_label: string
          ratings_count: number
          user_id: string
        }[]
      }
      is_conversation_participant: {
        Args: { p_conversation_id: string; p_user_id?: string }
        Returns: boolean
      }
      is_match_host: {
        Args: { p_match_id: string; p_user_id?: string }
        Returns: boolean
      }
      match_has_ended: { Args: { p_match_id: string }; Returns: boolean }
      process_match_participation_request: {
        Args: {
          p_action: string
          p_decision_reason?: string
          p_request_id: string
        }
        Returns: {
          created_at: string
          decided_at: string | null
          decision_by: string | null
          decision_reason: string | null
          id: string
          match_id: string
          note: string | null
          requested_position_key: string
          requested_position_label: string
          status: Database["public"]["Enums"]["participation_request_status"]
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "match_participation_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      seed_chat_mock_data: { Args: never; Returns: undefined }
      sync_match_conversation_participants: {
        Args: { p_match_id: string }
        Returns: undefined
      }
      sync_rating_notifications_for_current_user: {
        Args: never
        Returns: number
      }
    }
    Enums: {
      conversation_role: "host" | "player" | "system"
      conversation_type: "group" | "private"
      match_level:
        | "pereba"
        | "resenha"
        | "casual"
        | "intermediario"
        | "avancado"
        | "competitivo"
        | "semi_amador"
        | "amador"
        | "ex_profissional"
      match_status: "rascunho" | "publicada" | "cancelada" | "finalizada"
      match_turno: "manha" | "tarde" | "noite"
      message_type: "user" | "system"
      notification_type:
        | "participation_requested"
        | "participation_pending"
        | "participation_accepted"
        | "participation_rejected"
        | "match_rating_available"
        | "rating_received"
        | "system"
      participant_status: "confirmado" | "pendente" | "cancelado"
      participation_request_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "cancelled"
      rating_target_role: "creator" | "player"
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
      conversation_role: ["host", "player", "system"],
      conversation_type: ["group", "private"],
      match_level: [
        "pereba",
        "resenha",
        "casual",
        "intermediario",
        "avancado",
        "competitivo",
        "semi_amador",
        "amador",
        "ex_profissional",
      ],
      match_status: ["rascunho", "publicada", "cancelada", "finalizada"],
      match_turno: ["manha", "tarde", "noite"],
      message_type: ["user", "system"],
      notification_type: [
        "participation_requested",
        "participation_pending",
        "participation_accepted",
        "participation_rejected",
        "match_rating_available",
        "rating_received",
        "system",
      ],
      participant_status: ["confirmado", "pendente", "cancelado"],
      participation_request_status: [
        "pending",
        "accepted",
        "rejected",
        "cancelled",
      ],
      rating_target_role: ["creator", "player"],
    },
  },
} as const
