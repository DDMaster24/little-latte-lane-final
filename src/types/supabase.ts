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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string | null
          email: string
          id: string
          name: string
          party_size: number
          phone: string | null
          special_requests: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          party_size: number
          phone?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          party_size?: number
          phone?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_submissions: {
        Row: {
          created_at: string | null
          email: string
          event_type: string | null
          id: string
          message: string | null
          name: string
          party_size: number | null
          phone: string | null
          preferred_date: string | null
          preferred_time: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          event_type?: string | null
          id?: string
          message?: string | null
          name: string
          party_size?: number | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          event_type?: string | null
          id?: string
          message?: string | null
          name?: string
          party_size?: number | null
          phone?: string | null
          preferred_date?: string | null
          preferred_time?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          background_image: string | null
          content: Json | null
          created_at: string | null
          description: string | null
          display_order: number | null
          end_date: string | null
          event_type: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          start_date: string | null
          status: string | null
          theme_settings: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          background_image?: string | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date?: string | null
          status?: string | null
          theme_settings?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          background_image?: string | null
          content?: Json | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          end_date?: string | null
          event_type?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          start_date?: string | null
          status?: string | null
          theme_settings?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string | null
          id: string
          menu_item_id: string | null
          order_id: string | null
          price: number
          quantity: number
          special_instructions: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id?: string | null
          price: number
          quantity?: number
          special_instructions?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id?: string | null
          price?: number
          quantity?: number
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string | null
          delivery_address: string | null
          delivery_method: string | null
          id: string
          order_number: string | null
          payment_status: string | null
          special_instructions: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_method?: string | null
          id?: string
          order_number?: string | null
          payment_status?: string | null
          special_instructions?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: string | null
          delivery_method?: string | null
          id?: string
          order_number?: string | null
          payment_status?: string | null
          special_instructions?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_admin: boolean | null
          is_staff: boolean | null
          phone: string | null
          phone_number: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_admin?: boolean | null
          is_staff?: boolean | null
          phone?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_staff?: boolean | null
          phone?: string | null
          phone_number?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_requests: {
        Row: {
          assigned_to: string | null
          created_at: string | null
          id: string
          message: string
          priority: string | null
          request_type: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message: string
          priority?: string | null
          request_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string | null
          id?: string
          message?: string
          priority?: string | null
          request_type?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_requests_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_staff_or_admin: {
        Args: Record<PropertyKey, never>
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
