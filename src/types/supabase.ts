export interface Database {
  public: {
    Tables: {
      menu_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          image_url: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          image_url?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          is_featured: boolean;
          allergens: string[] | null;
          preparation_time: number;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
          is_featured?: boolean;
          allergens?: string[] | null;
          preparation_time?: number;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
          is_featured?: boolean;
          allergens?: string[] | null;
          preparation_time?: number;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          phone_number: string | null;
          full_name: string | null;
          is_admin: boolean;
          is_staff: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          phone_number?: string | null;
          full_name?: string | null;
          is_admin?: boolean;
          is_staff?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          phone_number?: string | null;
          full_name?: string | null;
          is_admin?: boolean;
          is_staff?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          order_number: string;
          customer_name: string | null;
          customer_email: string | null;
          customer_phone: string;
          total_amount: number;
          status: string;
          payment_status: string;
          payment_id: string | null;
          payment_method: string;
          order_type: string;
          delivery_address: string | null;
          special_instructions: string | null;
          estimated_ready_time: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          order_number?: string;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone: string;
          total_amount: number;
          status?: string;
          payment_status?: string;
          payment_id?: string | null;
          payment_method?: string;
          order_type?: string;
          delivery_address?: string | null;
          special_instructions?: string | null;
          estimated_ready_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          order_number?: string;
          customer_name?: string | null;
          customer_email?: string | null;
          customer_phone?: string;
          total_amount?: number;
          status?: string;
          payment_status?: string;
          payment_id?: string | null;
          payment_method?: string;
          order_type?: string;
          delivery_address?: string | null;
          special_instructions?: string | null;
          estimated_ready_time?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string | null;
          menu_item_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          customizations: Record<string, unknown> | null;
          special_requests: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          menu_item_id?: string | null;
          quantity?: number;
          unit_price: number;
          total_price: number;
          customizations?: Record<string, unknown> | null;
          special_requests?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          menu_item_id?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          customizations?: Record<string, unknown> | null;
          special_requests?: string | null;
          created_at?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          user_id: string | null;
          booking_type: string;
          customer_name: string;
          customer_email: string | null;
          customer_phone: string;
          booking_date: string;
          booking_time: string;
          party_size: number;
          duration_hours: number;
          status: string;
          special_requests: string | null;
          table_preferences: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          booking_type: string;
          customer_name: string;
          customer_email?: string | null;
          customer_phone: string;
          booking_date: string;
          booking_time: string;
          party_size: number;
          duration_hours?: number;
          status?: string;
          special_requests?: string | null;
          table_preferences?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          booking_type?: string;
          customer_name?: string;
          customer_email?: string | null;
          customer_phone?: string;
          booking_date?: string;
          booking_time?: string;
          party_size?: number;
          duration_hours?: number;
          status?: string;
          special_requests?: string | null;
          table_preferences?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory: {
        Row: {
          id: string;
          menu_item_id: string | null;
          stock_quantity: number;
          low_stock_threshold: number;
          is_tracked: boolean;
          last_updated: string;
        };
        Insert: {
          id?: string;
          menu_item_id?: string | null;
          stock_quantity?: number;
          low_stock_threshold?: number;
          is_tracked?: boolean;
          last_updated?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string | null;
          stock_quantity?: number;
          low_stock_threshold?: number;
          is_tracked?: boolean;
          last_updated?: string;
        };
      };
      events: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          event_type: string | null;
          start_date: string;
          end_date: string | null;
          is_active: boolean;
          image_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          event_type?: string | null;
          start_date: string;
          end_date?: string | null;
          is_active?: boolean;
          image_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          event_type?: string | null;
          start_date?: string;
          end_date?: string | null;
          is_active?: boolean;
          image_url?: string | null;
          created_at?: string;
        };
      };
      admin_settings: {
        Row: {
          id: string;
          setting_key: string;
          setting_value: unknown | null;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          setting_key: string;
          setting_value?: unknown | null;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          setting_key?: string;
          setting_value?: unknown | null;
          description?: string | null;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
