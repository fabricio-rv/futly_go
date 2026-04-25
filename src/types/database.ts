export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          phone: string | null;
          state: string | null;
          city: string | null;
          cep: string | null;
          bio: string | null;
          primary_position: string | null;
          secondary_positions: string[];
          skill_level: Database['public']['Enums']['match_level'] | null;
          height_cm: number | null;
          weight_kg: number | null;
          birth_date: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          phone?: string | null;
          state?: string | null;
          city?: string | null;
          cep?: string | null;
          bio?: string | null;
          primary_position?: string | null;
          secondary_positions?: string[];
          skill_level?: Database['public']['Enums']['match_level'] | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          birth_date?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          phone?: string | null;
          state?: string | null;
          city?: string | null;
          cep?: string | null;
          bio?: string | null;
          primary_position?: string | null;
          secondary_positions?: string[];
          skill_level?: Database['public']['Enums']['match_level'] | null;
          height_cm?: number | null;
          weight_kg?: number | null;
          birth_date?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      matches: {
        Row: {
          id: string;
          created_by: string;
          title: string;
          description: string | null;
          modality: string;
          match_date: string;
          match_time: string;
          turno: Database['public']['Enums']['match_turno'];
          duration_minutes: number;
          price_per_person: number;
          min_age: number;
          max_age: number;
          accepted_levels: Database['public']['Enums']['match_level'][];
          status: Database['public']['Enums']['match_status'];
          allow_external_reserves: boolean;
          rest_break: boolean;
          referee_included: boolean;
          contact_phone: string | null;
          venue_name: string | null;
          cep: string | null;
          district: string | null;
          city: string | null;
          state: string | null;
          address: string | null;
          formation_json: Json;
          facilities: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_by: string;
          title: string;
          description?: string | null;
          modality: string;
          match_date: string;
          match_time: string;
          turno: Database['public']['Enums']['match_turno'];
          duration_minutes: number;
          price_per_person?: number;
          min_age?: number;
          max_age?: number;
          accepted_levels?: Database['public']['Enums']['match_level'][];
          status?: Database['public']['Enums']['match_status'];
          allow_external_reserves?: boolean;
          rest_break?: boolean;
          referee_included?: boolean;
          contact_phone?: string | null;
          venue_name?: string | null;
          cep?: string | null;
          district?: string | null;
          city?: string | null;
          state?: string | null;
          address?: string | null;
          formation_json?: Json;
          facilities?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_by?: string;
          title?: string;
          description?: string | null;
          modality?: string;
          match_date?: string;
          match_time?: string;
          turno?: Database['public']['Enums']['match_turno'];
          duration_minutes?: number;
          price_per_person?: number;
          min_age?: number;
          max_age?: number;
          accepted_levels?: Database['public']['Enums']['match_level'][];
          status?: Database['public']['Enums']['match_status'];
          allow_external_reserves?: boolean;
          rest_break?: boolean;
          referee_included?: boolean;
          contact_phone?: string | null;
          venue_name?: string | null;
          cep?: string | null;
          district?: string | null;
          city?: string | null;
          state?: string | null;
          address?: string | null;
          formation_json?: Json;
          facilities?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'matches_created_by_fkey';
            columns: ['created_by'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      match_participants: {
        Row: {
          id: string;
          match_id: string;
          user_id: string;
          position_key: string;
          position_label: string;
          status: Database['public']['Enums']['participant_status'];
          is_host: boolean;
          joined_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          user_id: string;
          position_key: string;
          position_label: string;
          status?: Database['public']['Enums']['participant_status'];
          is_host?: boolean;
          joined_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          user_id?: string;
          position_key?: string;
          position_label?: string;
          status?: Database['public']['Enums']['participant_status'];
          is_host?: boolean;
          joined_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'match_participants_match_id_fkey';
            columns: ['match_id'];
            referencedRelation: 'matches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'match_participants_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      ratings: {
        Row: {
          id: string;
          match_id: string;
          reviewer_id: string;
          reviewed_id: string;
          target_role: Database['public']['Enums']['rating_target_role'];
          score: number;
          tags: string[];
          comment: string | null;
          anonymous: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          match_id: string;
          reviewer_id: string;
          reviewed_id: string;
          target_role: Database['public']['Enums']['rating_target_role'];
          score: number;
          tags?: string[];
          comment?: string | null;
          anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          match_id?: string;
          reviewer_id?: string;
          reviewed_id?: string;
          target_role?: Database['public']['Enums']['rating_target_role'];
          score?: number;
          tags?: string[];
          comment?: string | null;
          anonymous?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ratings_match_id_fkey';
            columns: ['match_id'];
            referencedRelation: 'matches';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ratings_reviewed_id_fkey';
            columns: ['reviewed_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ratings_reviewer_id_fkey';
            columns: ['reviewer_id'];
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      match_turno: 'manha' | 'tarde' | 'noite';
      match_level:
        | 'pereba'
        | 'resenha'
        | 'casual'
        | 'intermediario'
        | 'avancado'
        | 'competitivo'
        | 'semi_amador'
        | 'amador'
        | 'ex_profissional';
      match_status: 'rascunho' | 'publicada' | 'cancelada' | 'finalizada';
      participant_status: 'confirmado' | 'pendente' | 'cancelado';
      rating_target_role: 'creator' | 'player';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicSchema = Database['public'];
export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];
