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
      addon_variations: {
        Row: {
          absolute_price: number | null
          addon_id: string
          created_at: string
          display_order: number | null
          id: string
          is_available: boolean | null
          is_default: boolean | null
          name: string
          price_adjustment: number | null
          updated_at: string
        }
        Insert: {
          absolute_price?: number | null
          addon_id: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          is_default?: boolean | null
          name: string
          price_adjustment?: number | null
          updated_at?: string
        }
        Update: {
          absolute_price?: number | null
          addon_id?: string
          created_at?: string
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          is_default?: boolean | null
          name?: string
          price_adjustment?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "addon_variations_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "menu_addons"
            referencedColumns: ["id"]
          },
        ]
      }
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
      broadcast_messages: {
        Row: {
          body: string
          created_at: string | null
          created_by: string | null
          delivered_count: number | null
          error_message: string | null
          id: string
          image_url: string | null
          read_count: number | null
          recipient_count: number | null
          scheduled_for: string | null
          sent_at: string | null
          status: string | null
          target_audience: string | null
          target_user_ids: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          read_count?: number | null
          recipient_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          target_audience?: string | null
          target_user_ids?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          created_by?: string | null
          delivered_count?: number | null
          error_message?: string | null
          id?: string
          image_url?: string | null
          read_count?: number | null
          recipient_count?: number | null
          scheduled_for?: string | null
          sent_at?: string | null
          status?: string | null
          target_audience?: string | null
          target_user_ids?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broadcast_messages_created_by_fkey"
            columns: ["created_by"]
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
      hall_bookings: {
        Row: {
          access_code: string | null
          admin_notes: string | null
          applicant_address: string
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          applicant_surname: string
          bank_account_holder: string
          bank_account_number: string
          bank_branch_code: string
          bank_name: string
          booking_reference: string
          catering_details: string | null
          chairs_required: number | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string | null
          damages_cost: number | null
          damages_description: string | null
          damages_found: boolean | null
          deposit_amount: number
          deposit_forfeited: boolean | null
          deposit_refund_amount: number | null
          deposit_refund_date: string | null
          deposit_refund_reason: string | null
          deposit_refunded: boolean | null
          event_date: string
          event_description: string | null
          event_end_time: string
          event_start_time: string
          event_type: string
          forfeiture_reason: string | null
          id: string
          inspection_completed: boolean | null
          inspection_date: string | null
          inspection_notes: string | null
          is_roberts_resident: boolean | null
          music_details: string | null
          number_of_vehicles: number | null
          payment_date: string | null
          payment_reference: string | null
          payment_status: string | null
          pdf_form_url: string | null
          proof_of_payment_url: string | null
          rejection_reason: string | null
          rental_fee: number
          roberts_estate_address: string | null
          security_assigned: boolean | null
          special_requests: string | null
          special_requirements: string | null
          status: string | null
          submitted_at: string | null
          tables_required: number | null
          terms_accepted: boolean
          terms_accepted_at: string | null
          terms_page_1_initial: string | null
          terms_page_2_initial: string | null
          terms_page_3_initial: string | null
          terms_page_4_initial: string | null
          terms_version: string | null
          total_amount: number
          total_guests: number
          updated_at: string | null
          user_id: string
          violations_reported: string[] | null
          will_play_music: boolean | null
          yoco_checkout_id: string | null
        }
        Insert: {
          access_code?: string | null
          admin_notes?: string | null
          applicant_address: string
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          applicant_surname: string
          bank_account_holder: string
          bank_account_number: string
          bank_branch_code: string
          bank_name: string
          booking_reference: string
          catering_details?: string | null
          chairs_required?: number | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          damages_cost?: number | null
          damages_description?: string | null
          damages_found?: boolean | null
          deposit_amount?: number
          deposit_forfeited?: boolean | null
          deposit_refund_amount?: number | null
          deposit_refund_date?: string | null
          deposit_refund_reason?: string | null
          deposit_refunded?: boolean | null
          event_date: string
          event_description?: string | null
          event_end_time: string
          event_start_time: string
          event_type: string
          forfeiture_reason?: string | null
          id?: string
          inspection_completed?: boolean | null
          inspection_date?: string | null
          inspection_notes?: string | null
          is_roberts_resident?: boolean | null
          music_details?: string | null
          number_of_vehicles?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          pdf_form_url?: string | null
          proof_of_payment_url?: string | null
          rejection_reason?: string | null
          rental_fee?: number
          roberts_estate_address?: string | null
          security_assigned?: boolean | null
          special_requests?: string | null
          special_requirements?: string | null
          status?: string | null
          submitted_at?: string | null
          tables_required?: number | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          terms_page_1_initial?: string | null
          terms_page_2_initial?: string | null
          terms_page_3_initial?: string | null
          terms_page_4_initial?: string | null
          terms_version?: string | null
          total_amount?: number
          total_guests: number
          updated_at?: string | null
          user_id: string
          violations_reported?: string[] | null
          will_play_music?: boolean | null
          yoco_checkout_id?: string | null
        }
        Update: {
          access_code?: string | null
          admin_notes?: string | null
          applicant_address?: string
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string
          applicant_surname?: string
          bank_account_holder?: string
          bank_account_number?: string
          bank_branch_code?: string
          bank_name?: string
          booking_reference?: string
          catering_details?: string | null
          chairs_required?: number | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          damages_cost?: number | null
          damages_description?: string | null
          damages_found?: boolean | null
          deposit_amount?: number
          deposit_forfeited?: boolean | null
          deposit_refund_amount?: number | null
          deposit_refund_date?: string | null
          deposit_refund_reason?: string | null
          deposit_refunded?: boolean | null
          event_date?: string
          event_description?: string | null
          event_end_time?: string
          event_start_time?: string
          event_type?: string
          forfeiture_reason?: string | null
          id?: string
          inspection_completed?: boolean | null
          inspection_date?: string | null
          inspection_notes?: string | null
          is_roberts_resident?: boolean | null
          music_details?: string | null
          number_of_vehicles?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          pdf_form_url?: string | null
          proof_of_payment_url?: string | null
          rejection_reason?: string | null
          rental_fee?: number
          roberts_estate_address?: string | null
          security_assigned?: boolean | null
          special_requests?: string | null
          special_requirements?: string | null
          status?: string | null
          submitted_at?: string | null
          tables_required?: number | null
          terms_accepted?: boolean
          terms_accepted_at?: string | null
          terms_page_1_initial?: string | null
          terms_page_2_initial?: string | null
          terms_page_3_initial?: string | null
          terms_page_4_initial?: string | null
          terms_version?: string | null
          total_amount?: number
          total_guests?: number
          updated_at?: string | null
          user_id?: string
          violations_reported?: string[] | null
          will_play_music?: boolean | null
          yoco_checkout_id?: string | null
        }
        Relationships: []
      }
      menu_addons: {
        Row: {
          category: string | null
          category_id: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string | null
          is_available: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name: string
          price?: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_addons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          category_type: Database["public"]["Enums"]["category_type"] | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          is_showcase: boolean | null
          name: string
        }
        Insert: {
          category_type?: Database["public"]["Enums"]["category_type"] | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_showcase?: boolean | null
          name: string
        }
        Update: {
          category_type?: Database["public"]["Enums"]["category_type"] | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          is_showcase?: boolean | null
          name?: string
        }
        Relationships: []
      }
      menu_item_addons: {
        Row: {
          addon_id: string
          category_id: string | null
          created_at: string
          id: string
          is_required: boolean | null
          max_quantity: number | null
          menu_item_id: string | null
        }
        Insert: {
          addon_id: string
          category_id?: string | null
          created_at?: string
          id?: string
          is_required?: boolean | null
          max_quantity?: number | null
          menu_item_id?: string | null
        }
        Update: {
          addon_id?: string
          category_id?: string | null
          created_at?: string
          id?: string
          is_required?: boolean | null
          max_quantity?: number | null
          menu_item_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_addons_addon_id_fkey"
            columns: ["addon_id"]
            isOneToOne: false
            referencedRelation: "menu_addons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_addons_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_addons_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_variations: {
        Row: {
          absolute_price: number | null
          created_at: string
          display_order: number | null
          id: string
          is_available: boolean | null
          is_default: boolean | null
          menu_item_id: string
          name: string
          price_adjustment: number
          updated_at: string
          variation_type: string | null
        }
        Insert: {
          absolute_price?: number | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          is_default?: boolean | null
          menu_item_id: string
          name: string
          price_adjustment?: number
          updated_at?: string
          variation_type?: string | null
        }
        Update: {
          absolute_price?: number | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_available?: boolean | null
          is_default?: boolean | null
          menu_item_id?: string
          name?: string
          price_adjustment?: number
          updated_at?: string
          variation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_variations_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
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
      notification_history: {
        Row: {
          action_url: string | null
          body: string
          category: string | null
          clicked_at: string | null
          created_at: string | null
          data: Json | null
          delivered_at: string | null
          delivery_method: string[] | null
          delivery_status: string | null
          error_message: string | null
          icon_url: string | null
          id: string
          image_url: string | null
          notification_type: string
          read_at: string | null
          sent_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          body: string
          category?: string | null
          clicked_at?: string | null
          created_at?: string | null
          data?: Json | null
          delivered_at?: string | null
          delivery_method?: string[] | null
          delivery_status?: string | null
          error_message?: string | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          notification_type: string
          read_at?: string | null
          sent_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          body?: string
          category?: string | null
          clicked_at?: string | null
          created_at?: string | null
          data?: Json | null
          delivered_at?: string | null
          delivery_method?: string[] | null
          delivery_status?: string | null
          error_message?: string | null
          icon_url?: string | null
          id?: string
          image_url?: string | null
          notification_type?: string
          read_at?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          apns_token: string | null
          created_at: string | null
          email_enabled: boolean | null
          event_announcements_enabled: boolean | null
          expo_push_token: string | null
          fcm_token: string | null
          id: string
          order_updates_enabled: boolean | null
          promotional_enabled: boolean | null
          push_enabled: boolean | null
          push_subscription: Json | null
          sms_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          apns_token?: string | null
          created_at?: string | null
          email_enabled?: boolean | null
          event_announcements_enabled?: boolean | null
          expo_push_token?: string | null
          fcm_token?: string | null
          id?: string
          order_updates_enabled?: boolean | null
          promotional_enabled?: boolean | null
          push_enabled?: boolean | null
          push_subscription?: Json | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          apns_token?: string | null
          created_at?: string | null
          email_enabled?: boolean | null
          event_announcements_enabled?: boolean | null
          expo_push_token?: string | null
          fcm_token?: string | null
          id?: string
          order_updates_enabled?: boolean | null
          promotional_enabled?: boolean | null
          push_enabled?: boolean | null
          push_subscription?: Json | null
          sms_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
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
          selected_addons: Json | null
          special_instructions: string | null
          variation_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id?: string | null
          price: number
          quantity?: number
          selected_addons?: Json | null
          special_instructions?: string | null
          variation_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          menu_item_id?: string | null
          order_id?: string | null
          price?: number
          quantity?: number
          selected_addons?: Json | null
          special_instructions?: string | null
          variation_id?: string | null
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
          {
            foreignKeyName: "order_items_variation_id_fkey"
            columns: ["variation_id"]
            isOneToOne: false
            referencedRelation: "menu_item_variations"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_verified: boolean | null
          created_at: string | null
          delivery_address: string | null
          delivery_coordinates: Json | null
          delivery_fee: number | null
          delivery_method: string | null
          delivery_zone: string | null
          id: string
          order_number: string | null
          payment_status: string | null
          special_instructions: string | null
          status: string | null
          tip_amount: number | null
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_verified?: boolean | null
          created_at?: string | null
          delivery_address?: string | null
          delivery_coordinates?: Json | null
          delivery_fee?: number | null
          delivery_method?: string | null
          delivery_zone?: string | null
          id?: string
          order_number?: string | null
          payment_status?: string | null
          special_instructions?: string | null
          status?: string | null
          tip_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_verified?: boolean | null
          created_at?: string | null
          delivery_address?: string | null
          delivery_coordinates?: Json | null
          delivery_fee?: number | null
          delivery_method?: string | null
          delivery_zone?: string | null
          id?: string
          order_number?: string | null
          payment_status?: string | null
          special_instructions?: string | null
          status?: string | null
          tip_amount?: number | null
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
      restaurant_closures: {
        Row: {
          closure_type: string
          created_at: string | null
          created_by: string | null
          end_time: string | null
          id: string
          is_active: boolean | null
          reason: string | null
          start_time: string | null
          updated_at: string | null
        }
        Insert: {
          closure_type: string
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          start_time?: string | null
          updated_at?: string | null
        }
        Update: {
          closure_type?: string
          created_at?: string | null
          created_by?: string | null
          end_time?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          start_time?: string | null
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
      get_user_role: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_staff_or_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      category_type: "menu_items" | "addons"
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
      category_type: ["menu_items", "addons"],
    },
  },
} as const
