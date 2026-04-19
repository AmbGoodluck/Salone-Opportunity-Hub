export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ambassadors: {
        Row: {
          id: string
          user_id: string
          name: string
          /**
           * @deprecated Use user profile avatar_url instead
           */
          profile_picture?: string | null
          city: string
          region: string | null
          phone: string
          email: string
          bio: string | null
          slug: string
          status: 'pending' | 'approved' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          profile_picture?: string | null
          city: string
          region?: string | null
          phone: string
          email: string
          bio?: string | null
          slug: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          profile_picture?: string | null
          city?: string
          region?: string | null
          phone?: string
          email?: string
          bio?: string | null
          slug?: string
          status?: 'pending' | 'approved' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string
          avatar_url: string | null
          location: string | null
          education_level: string | null
          interests: string[] | null
          notifications_enabled: boolean
          email_notifications: boolean
          preferred_types: string[]
          preferred_categories: string[]
          skills: string[] | null
          experience_level: string | null
          preferred_opportunity_location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email: string
          avatar_url?: string | null
          location?: string | null
          education_level?: string | null
          interests?: string[] | null
          notifications_enabled?: boolean
          email_notifications?: boolean
          preferred_types?: string[]
          preferred_categories?: string[]
          skills?: string[] | null
          experience_level?: string | null
          preferred_opportunity_location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string
          avatar_url?: string | null
          location?: string | null
          education_level?: string | null
          interests?: string[] | null
          notifications_enabled?: boolean
          email_notifications?: boolean
          preferred_types?: string[]
          preferred_categories?: string[]
          skills?: string[] | null
          experience_level?: string | null
          preferred_opportunity_location?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          id: string
          name: string
          slug: string | null
          email: string
          phone: string | null
          logo_url: string | null
          tagline: string | null
          about: string | null
          website: string | null
          location: string | null
          gallery_urls: string[] | null
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          slug?: string | null
          email: string
          phone?: string | null
          logo_url?: string | null
          tagline?: string | null
          about?: string | null
          website?: string | null
          location?: string | null
          gallery_urls?: string[] | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string | null
          email?: string
          phone?: string | null
          logo_url?: string | null
          tagline?: string | null
          about?: string | null
          website?: string | null
          location?: string | null
          gallery_urls?: string[] | null
          is_public?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          id: string
          title: string
          slug: string | null
          organization: string
          organization_id: string | null
          description: string
          requirements: string | null
          how_to_apply: string | null
          type: 'job' | 'internship' | 'scholarship' | 'event' | 'grant'
          category: string
          location: string | null
          location_type: 'remote' | 'onsite' | 'hybrid'
          is_remote: boolean
          deadline: string | null
          funding_amount: string | null
          study_level: string | null
          application_link: string
          image_url: string | null
          source_url: string | null
          is_verified: boolean
          sl_eligible: boolean
          required_skills: Json
          education_level: string | null
          experience_level: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug?: string | null
          organization: string
          organization_id?: string | null
          description: string
          requirements?: string | null
          how_to_apply?: string | null
          type: 'job' | 'internship' | 'scholarship' | 'event' | 'grant'
          category: string
          location?: string | null
          location_type?: 'remote' | 'onsite' | 'hybrid'
          is_remote?: boolean
          deadline?: string | null
          funding_amount?: string | null
          study_level?: string | null
          application_link: string
          image_url?: string | null
          source_url?: string | null
          is_verified?: boolean
          sl_eligible?: boolean
          required_skills?: Json
          education_level?: string | null
          experience_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string | null
          organization?: string
          organization_id?: string | null
          description?: string
          requirements?: string | null
          how_to_apply?: string | null
          type?: 'job' | 'internship' | 'scholarship' | 'event' | 'grant'
          category?: string
          location?: string | null
          location_type?: 'remote' | 'onsite' | 'hybrid'
          is_remote?: boolean
          deadline?: string | null
          funding_amount?: string | null
          study_level?: string | null
          application_link?: string
          image_url?: string | null
          source_url?: string | null
          is_verified?: boolean
          sl_eligible?: boolean
          required_skills?: Json
          education_level?: string | null
          experience_level?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'opportunities_organization_id_fkey'
            columns: ['organization_id']
            isOneToOne: false
            referencedRelation: 'organizations'
            referencedColumns: ['id']
          }
        ]
      }
      saved_opportunities: {
        Row: {
          id: string
          user_id: string
          opportunity_id: string
          notes: string | null
          status: 'saved' | 'applied' | 'in_progress' | 'closed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          opportunity_id: string
          notes?: string | null
          status?: 'saved' | 'applied' | 'in_progress' | 'closed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          opportunity_id?: string
          notes?: string | null
          status?: 'saved' | 'applied' | 'in_progress' | 'closed'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'saved_opportunities_opportunity_id_fkey'
            columns: ['opportunity_id']
            isOneToOne: false
            referencedRelation: 'opportunities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'saved_opportunities_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          opportunity_id: string | null
          title: string
          body: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          opportunity_id?: string | null
          title: string
          body?: string | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          opportunity_id?: string | null
          title?: string
          body?: string | null
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      cvs: {
        Row: {
          id: string
          user_id: string
          template_id: string
          personal_info: Json
          education: Json[]
          experience: Json[]
          skills: string[]
          languages: Json[]
          certifications: Json[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          template_id: string
          personal_info: Json
          education?: Json[]
          experience?: Json[]
          skills?: string[]
          languages?: Json[]
          certifications?: Json[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          template_id?: string
          personal_info?: Json
          education?: Json[]
          experience?: Json[]
          skills?: string[]
          languages?: Json[]
          certifications?: Json[]
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
        Database[PublicTableNameOrOptions['schema']]['Views'])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
      Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
    ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
    ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never
