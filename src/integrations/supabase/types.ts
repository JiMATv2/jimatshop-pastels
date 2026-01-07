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
      admin_profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          is_super_admin: boolean | null
          last_name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          is_super_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          is_super_admin?: boolean | null
          last_name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      analytics_events: {
        Row: {
          campaign_id: string | null
          cart_id: string | null
          created_at: string
          event_name: string
          id: string
          metadata: Json
          order_id: string | null
          page: string | null
          product_id: string | null
          quantity: number | null
          referrer: string | null
          seller_profile_id: string | null
          session_id: string | null
          source: string | null
          user_id: string | null
        }
        Insert: {
          campaign_id?: string | null
          cart_id?: string | null
          created_at?: string
          event_name: string
          id?: string
          metadata?: Json
          order_id?: string | null
          page?: string | null
          product_id?: string | null
          quantity?: number | null
          referrer?: string | null
          seller_profile_id?: string | null
          session_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Update: {
          campaign_id?: string | null
          cart_id?: string | null
          created_at?: string
          event_name?: string
          id?: string
          metadata?: Json
          order_id?: string | null
          page?: string | null
          product_id?: string | null
          quantity?: number | null
          referrer?: string | null
          seller_profile_id?: string | null
          session_id?: string | null
          source?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_seller_profile_fk"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events_buffered: {
        Row: {
          created_at: string
          data: Json
          id: string
          occurred_at: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          occurred_at: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          occurred_at?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      bonus_structures: {
        Row: {
          bonus_amount: number
          created_at: string | null
          description: string | null
          id: string
          name: string
          threshold_amount: number
          updated_at: string | null
        }
        Insert: {
          bonus_amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          threshold_amount: number
          updated_at?: string | null
        }
        Update: {
          bonus_amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          threshold_amount?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_name_mappings: {
        Row: {
          created_at: string | null
          id: string
          is_regex: boolean | null
          normalized_name: string
          original_pattern: string
          priority: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_regex?: boolean | null
          normalized_name: string
          original_pattern: string
          priority?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_regex?: boolean | null
          normalized_name?: string
          original_pattern?: string
          priority?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          description: string | null
          enabled: boolean | null
          id: string
          image_url: string | null
          legacy_brand_id: number | null
          legacy_id: number | null
          name: string
          seller_id: string | null
          supplier_code: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          image_url?: string | null
          legacy_brand_id?: number | null
          legacy_id?: number | null
          name: string
          seller_id?: string | null
          supplier_code?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          enabled?: boolean | null
          id?: string
          image_url?: string | null
          legacy_brand_id?: number | null
          legacy_id?: number | null
          name?: string
          seller_id?: string | null
          supplier_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brands_new_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_browsing_history: {
        Row: {
          action_type: string
          buyer_id: string
          created_at: string
          id: string
          product_id: string
          quantity: number | null
        }
        Insert: {
          action_type: string
          buyer_id: string
          created_at?: string
          id?: string
          product_id: string
          quantity?: number | null
        }
        Update: {
          action_type?: string
          buyer_id?: string
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_browsing_history_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_browsing_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_browsing_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      buyer_inventories: {
        Row: {
          buyer_location_id: string
          cost_price: number
          created_at: string
          current_qty: number
          id: string
          lead_time_days: number
          product_id: string
          reorder_level: number
          retail_price: number
          safety_stock: number
          status: string
          updated_at: string
        }
        Insert: {
          buyer_location_id: string
          cost_price?: number
          created_at?: string
          current_qty?: number
          id?: string
          lead_time_days?: number
          product_id: string
          reorder_level?: number
          retail_price?: number
          safety_stock?: number
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_location_id?: string
          cost_price?: number
          created_at?: string
          current_qty?: number
          id?: string
          lead_time_days?: number
          product_id?: string
          reorder_level?: number
          retail_price?: number
          safety_stock?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_inventories_buyer_location_id_fkey"
            columns: ["buyer_location_id"]
            isOneToOne: false
            referencedRelation: "buyer_locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_inventories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_inventories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      buyer_locations: {
        Row: {
          address: string | null
          buyer_id: string
          contact: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          buyer_id: string
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          buyer_id?: string
          contact?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_locations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_notification_reads: {
        Row: {
          buyer_id: string | null
          created_at: string
          id: string
          notification_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          notification_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          id?: string
          notification_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_notification_reads_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_ownership_transfers: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          buyer_id: string
          buyer_profile_id: string | null
          created_at: string
          current_user_id: string | null
          id: string
          is_approved: boolean
          new_user_email: string | null
          new_user_id: string
          previous_user_id: string | null
          reason: string | null
          request_reason: string | null
          requested_by_email: string | null
          status: string | null
          transferred_by: string
          updated_at: string | null
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          buyer_id: string
          buyer_profile_id?: string | null
          created_at?: string
          current_user_id?: string | null
          id?: string
          is_approved?: boolean
          new_user_email?: string | null
          new_user_id: string
          previous_user_id?: string | null
          reason?: string | null
          request_reason?: string | null
          requested_by_email?: string | null
          status?: string | null
          transferred_by?: string
          updated_at?: string | null
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          buyer_id?: string
          buyer_profile_id?: string | null
          created_at?: string
          current_user_id?: string | null
          id?: string
          is_approved?: boolean
          new_user_email?: string | null
          new_user_id?: string
          previous_user_id?: string | null
          reason?: string | null
          request_reason?: string | null
          requested_by_email?: string | null
          status?: string | null
          transferred_by?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_ownership_transfers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_ownership_transfers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_ownership_transfers_buyer_profile_id_fkey"
            columns: ["buyer_profile_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_profile_ownership_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          buyer_profile_id: string
          created_at: string
          current_user_id: string | null
          id: string
          new_user_email: string
          new_user_id: string
          request_reason: string | null
          requested_by_email: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          buyer_profile_id: string
          created_at?: string
          current_user_id?: string | null
          id?: string
          new_user_email: string
          new_user_id: string
          request_reason?: string | null
          requested_by_email: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          approved_by?: string | null
          buyer_profile_id?: string
          created_at?: string
          current_user_id?: string | null
          id?: string
          new_user_email?: string
          new_user_id?: string
          request_reason?: string | null
          requested_by_email?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_profile_ownership_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_profile_ownership_requests_buyer_profile_id_fkey"
            columns: ["buyer_profile_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_profiles: {
        Row: {
          address: string | null
          area: string | null
          business_name: string
          city: string | null
          contact_name: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string
          id: string
          legacy_id: number | null
          legacy_outlet_id: number | null
          line1: string | null
          line2: string | null
          outlet_email: string | null
          outlet_name: string | null
          outlet_phone: string | null
          phone: string | null
          postcode: string | null
          state: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          area?: string | null
          business_name: string
          city?: string | null
          contact_name?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email: string
          id?: string
          legacy_id?: number | null
          legacy_outlet_id?: number | null
          line1?: string | null
          line2?: string | null
          outlet_email?: string | null
          outlet_name?: string | null
          outlet_phone?: string | null
          phone?: string | null
          postcode?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          area?: string | null
          business_name?: string
          city?: string | null
          contact_name?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string
          id?: string
          legacy_id?: number | null
          legacy_outlet_id?: number | null
          line1?: string | null
          line2?: string | null
          outlet_email?: string | null
          outlet_name?: string | null
          outlet_phone?: string | null
          phone?: string | null
          postcode?: string | null
          state?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      buyer_purchase_orders: {
        Row: {
          billplz_bill_id: string | null
          billplz_collection_id: string | null
          buyer_id: string
          created_at: string
          gateway_response: string | null
          id: string
          legacy_bulk_order_id: number | null
          legacy_purchase_order_id: number | null
          notes: string | null
          payment_completed_at: string | null
          payment_method: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          purchase_order_number: string
          status: Database["public"]["Enums"]["order_status"] | null
          total_amount: number
          total_orders_count: number | null
          updated_at: string
          warehouse_info: string | null
          week: string | null
        }
        Insert: {
          billplz_bill_id?: string | null
          billplz_collection_id?: string | null
          buyer_id: string
          created_at?: string
          gateway_response?: string | null
          id?: string
          legacy_bulk_order_id?: number | null
          legacy_purchase_order_id?: number | null
          notes?: string | null
          payment_completed_at?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          purchase_order_number: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          total_orders_count?: number | null
          updated_at?: string
          warehouse_info?: string | null
          week?: string | null
        }
        Update: {
          billplz_bill_id?: string | null
          billplz_collection_id?: string | null
          buyer_id?: string
          created_at?: string
          gateway_response?: string | null
          id?: string
          legacy_bulk_order_id?: number | null
          legacy_purchase_order_id?: number | null
          notes?: string | null
          payment_completed_at?: string | null
          payment_method?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          purchase_order_number?: string
          status?: Database["public"]["Enums"]["order_status"] | null
          total_amount?: number
          total_orders_count?: number | null
          updated_at?: string
          warehouse_info?: string | null
          week?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_purchase_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_stock_movements: {
        Row: {
          buyer_id: string
          buyer_inventory_id: string
          created_at: string
          created_by: string | null
          delivery_order_id: string | null
          id: string
          movement_type: string
          order_id: string | null
          product_id: string
          quantity_changed: number
          reference_id: string | null
          reference_type: string | null
          remarks: string | null
          stock_after: number
          stock_before: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          buyer_inventory_id: string
          created_at?: string
          created_by?: string | null
          delivery_order_id?: string | null
          id?: string
          movement_type: string
          order_id?: string | null
          product_id: string
          quantity_changed: number
          reference_id?: string | null
          reference_type?: string | null
          remarks?: string | null
          stock_after: number
          stock_before: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          buyer_inventory_id?: string
          created_at?: string
          created_by?: string | null
          delivery_order_id?: string | null
          id?: string
          movement_type?: string
          order_id?: string | null
          product_id?: string
          quantity_changed?: number
          reference_id?: string | null
          reference_type?: string | null
          remarks?: string | null
          stock_after?: number
          stock_before?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "buyer_stock_movements_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_stock_movements_buyer_inventory_id_fkey"
            columns: ["buyer_inventory_id"]
            isOneToOne: false
            referencedRelation: "buyer_inventories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_stock_movements_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_stock_movements_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_stock_movements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      buyers: {
        Row: {
          activate_jimatshop: boolean | null
          address: string | null
          area: string | null
          business_name: string
          city: string | null
          company_type: string | null
          contact_name: string | null
          contact_person: string | null
          coop_category: string | null
          coop_type: string | null
          created_at: string | null
          credit_limit: number | null
          credit_rating: number | null
          credit_terms: number | null
          email: string
          first_name: string | null
          group_id: string | null
          group_name: string | null
          has_agree_tnc: boolean
          has_audited: boolean | null
          id: string
          last_name: string | null
          last_order_date: string | null
          legacy_id: number | null
          legacy_outlet_id: number | null
          line1: string | null
          line2: string | null
          outlet_email: string | null
          outlet_name: string | null
          outlet_phone: string | null
          outstanding_balance: number | null
          overdue_amount: number | null
          phone: string | null
          postal_code: string | null
          shop_photo_url: string | null
          signboard_photo_url: string | null
          signup_status: string | null
          skm_number: string | null
          state: string | null
          status: string | null
          total_order_value: number | null
          total_orders: number | null
          updated_at: string | null
          user_id: string | null
          zone_id: string | null
        }
        Insert: {
          activate_jimatshop?: boolean | null
          address?: string | null
          area?: string | null
          business_name: string
          city?: string | null
          company_type?: string | null
          contact_name?: string | null
          contact_person?: string | null
          coop_category?: string | null
          coop_type?: string | null
          created_at?: string | null
          credit_limit?: number | null
          credit_rating?: number | null
          credit_terms?: number | null
          email: string
          first_name?: string | null
          group_id?: string | null
          group_name?: string | null
          has_agree_tnc?: boolean
          has_audited?: boolean | null
          id?: string
          last_name?: string | null
          last_order_date?: string | null
          legacy_id?: number | null
          legacy_outlet_id?: number | null
          line1?: string | null
          line2?: string | null
          outlet_email?: string | null
          outlet_name?: string | null
          outlet_phone?: string | null
          outstanding_balance?: number | null
          overdue_amount?: number | null
          phone?: string | null
          postal_code?: string | null
          shop_photo_url?: string | null
          signboard_photo_url?: string | null
          signup_status?: string | null
          skm_number?: string | null
          state?: string | null
          status?: string | null
          total_order_value?: number | null
          total_orders?: number | null
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Update: {
          activate_jimatshop?: boolean | null
          address?: string | null
          area?: string | null
          business_name?: string
          city?: string | null
          company_type?: string | null
          contact_name?: string | null
          contact_person?: string | null
          coop_category?: string | null
          coop_type?: string | null
          created_at?: string | null
          credit_limit?: number | null
          credit_rating?: number | null
          credit_terms?: number | null
          email?: string
          first_name?: string | null
          group_id?: string | null
          group_name?: string | null
          has_agree_tnc?: boolean
          has_audited?: boolean | null
          id?: string
          last_name?: string | null
          last_order_date?: string | null
          legacy_id?: number | null
          legacy_outlet_id?: number | null
          line1?: string | null
          line2?: string | null
          outlet_email?: string | null
          outlet_name?: string | null
          outlet_phone?: string | null
          outstanding_balance?: number | null
          overdue_amount?: number | null
          phone?: string | null
          postal_code?: string | null
          shop_photo_url?: string | null
          signboard_photo_url?: string | null
          signup_status?: string | null
          skm_number?: string | null
          state?: string | null
          status?: string | null
          total_order_value?: number | null
          total_orders?: number | null
          updated_at?: string | null
          user_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyers_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "retailer_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyers_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          cart_id: string | null
          created_at: string | null
          id: string
          original_price: number | null
          product_id: string | null
          promotion_id: string | null
          quantity: number
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          original_price?: number | null
          product_id?: string | null
          promotion_id?: string | null
          quantity: number
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          cart_id?: string | null
          created_at?: string | null
          id?: string
          original_price?: number | null
          product_id?: string | null
          promotion_id?: string | null
          quantity?: number
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_cart_id_fkey"
            columns: ["cart_id"]
            isOneToOne: false
            referencedRelation: "carts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "cart_items_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      carts: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "carts_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          attachment_filename: string | null
          attachment_size: number | null
          attachment_url: string | null
          created_at: string
          id: string
          message: string
          message_type: string | null
          read_at: string | null
          room_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachment_filename?: string | null
          attachment_size?: number | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          message: string
          message_type?: string | null
          read_at?: string | null
          room_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachment_filename?: string | null
          attachment_size?: number | null
          attachment_url?: string | null
          created_at?: string
          id?: string
          message?: string
          message_type?: string | null
          read_at?: string | null
          room_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_rooms: {
        Row: {
          admin_profile_id: string | null
          buyer_profile_id: string | null
          chat_type: string
          created_at: string
          id: string
          last_message_at: string | null
          sales_person_id: string | null
          seller_profile_id: string | null
          status: string | null
          ticket_id: string | null
          updated_at: string
        }
        Insert: {
          admin_profile_id?: string | null
          buyer_profile_id?: string | null
          chat_type?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          sales_person_id?: string | null
          seller_profile_id?: string | null
          status?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Update: {
          admin_profile_id?: string | null
          buyer_profile_id?: string | null
          chat_type?: string
          created_at?: string
          id?: string
          last_message_at?: string | null
          sales_person_id?: string | null
          seller_profile_id?: string | null
          status?: string | null
          ticket_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_rooms_admin_profile_id_fkey"
            columns: ["admin_profile_id"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_buyer_profile_id_fkey"
            columns: ["buyer_profile_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_sales_person_id_fkey"
            columns: ["sales_person_id"]
            isOneToOne: false
            referencedRelation: "sales_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_rooms_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      cities: {
        Row: {
          created_at: string
          id: string
          name: string
          state: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          state: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
      commission_settings: {
        Row: {
          created_at: string | null
          default_rate: number | null
          id: string
          team_lead_override_rate: number | null
          tier_enabled: boolean
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          default_rate?: number | null
          id?: string
          team_lead_override_rate?: number | null
          tier_enabled?: boolean
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          default_rate?: number | null
          id?: string
          team_lead_override_rate?: number | null
          tier_enabled?: boolean
          updated_at?: string | null
        }
        Relationships: []
      }
      commission_tiers: {
        Row: {
          created_at: string | null
          id: string
          max_amount: number | null
          min_amount: number
          name: string
          package_type: string | null
          rate: number
          type: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          max_amount?: number | null
          min_amount: number
          name: string
          package_type?: string | null
          rate: number
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          max_amount?: number | null
          min_amount?: number
          name?: string
          package_type?: string | null
          rate?: number
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      commissions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          month: string
          payment_date: string | null
          sales_person_id: string
          seller_lead_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          month: string
          payment_date?: string | null
          sales_person_id: string
          seller_lead_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          month?: string
          payment_date?: string | null
          sales_person_id?: string
          seller_lead_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "commissions_sales_person_id_fkey"
            columns: ["sales_person_id"]
            isOneToOne: false
            referencedRelation: "sales_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: false
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_applications: {
        Row: {
          application_id: string
          approved_amount: number | null
          approved_at: string | null
          approved_by: string | null
          buyer_id: string | null
          created_at: string | null
          credit_type: Database["public"]["Enums"]["credit_type"]
          email_status: string | null
          id: string
          order_proofs: string[]
          payment_proofs: string[]
          rejection_reason: string | null
          seller_name: string | null
          seller_profile_id: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          application_id: string
          approved_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          buyer_id?: string | null
          created_at?: string | null
          credit_type?: Database["public"]["Enums"]["credit_type"]
          email_status?: string | null
          id?: string
          order_proofs: string[]
          payment_proofs: string[]
          rejection_reason?: string | null
          seller_name?: string | null
          seller_profile_id?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          application_id?: string
          approved_amount?: number | null
          approved_at?: string | null
          approved_by?: string | null
          buyer_id?: string | null
          created_at?: string | null
          credit_type?: Database["public"]["Enums"]["credit_type"]
          email_status?: string | null
          id?: string
          order_proofs?: string[]
          payment_proofs?: string[]
          rejection_reason?: string | null
          seller_name?: string | null
          seller_profile_id?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_applications_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_applications_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_summary_master: {
        Row: {
          buyer_id: string
          created_at: string
          credit_type: Database["public"]["Enums"]["credit_type"]
          id: string
          last_application_id: string | null
          last_updated_at: string
          seller_id: string | null
          seller_key: string | null
          total_approved: number
          total_available: number
          total_used: number
        }
        Insert: {
          buyer_id: string
          created_at?: string
          credit_type: Database["public"]["Enums"]["credit_type"]
          id?: string
          last_application_id?: string | null
          last_updated_at?: string
          seller_id?: string | null
          seller_key?: string | null
          total_approved?: number
          total_available?: number
          total_used?: number
        }
        Update: {
          buyer_id?: string
          created_at?: string
          credit_type?: Database["public"]["Enums"]["credit_type"]
          id?: string
          last_application_id?: string | null
          last_updated_at?: string
          seller_id?: string | null
          seller_key?: string | null
          total_approved?: number
          total_available?: number
          total_used?: number
        }
        Relationships: [
          {
            foreignKeyName: "credit_summary_master_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_summary_master_last_application_id_fkey"
            columns: ["last_application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_summary_master_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_transaction_summary: {
        Row: {
          approved_amount: number | null
          available_amount: number | null
          buyer_id: string
          created_at: string | null
          credit_type: Database["public"]["Enums"]["credit_type"]
          current_balance: number | null
          id: string
          last_transaction_amount: number | null
          last_transaction_date: string | null
          last_transaction_id: string | null
          last_transaction_type: string | null
          last_updated_at: string | null
          net_amount: number | null
          seller_id: string | null
          status: string | null
          total_credit_amount: number | null
          total_debit_amount: number | null
          total_transactions: number | null
          updated_at: string | null
          used_amount: number | null
        }
        Insert: {
          approved_amount?: number | null
          available_amount?: number | null
          buyer_id: string
          created_at?: string | null
          credit_type?: Database["public"]["Enums"]["credit_type"]
          current_balance?: number | null
          id?: string
          last_transaction_amount?: number | null
          last_transaction_date?: string | null
          last_transaction_id?: string | null
          last_transaction_type?: string | null
          last_updated_at?: string | null
          net_amount?: number | null
          seller_id?: string | null
          status?: string | null
          total_credit_amount?: number | null
          total_debit_amount?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          used_amount?: number | null
        }
        Update: {
          approved_amount?: number | null
          available_amount?: number | null
          buyer_id?: string
          created_at?: string | null
          credit_type?: Database["public"]["Enums"]["credit_type"]
          current_balance?: number | null
          id?: string
          last_transaction_amount?: number | null
          last_transaction_date?: string | null
          last_transaction_id?: string | null
          last_transaction_type?: string | null
          last_updated_at?: string | null
          net_amount?: number | null
          seller_id?: string | null
          status?: string | null
          total_credit_amount?: number | null
          total_debit_amount?: number | null
          total_transactions?: number | null
          updated_at?: string | null
          used_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_transaction_summary_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_transaction_summary_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_usages: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string | null
          credit_application_id: string | null
          credit_type: string
          due_date: string | null
          id: string
          legacy_purchase_order_id: number | null
          order_number: string
          transaction_type: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string | null
          credit_application_id?: string | null
          credit_type?: string
          due_date?: string | null
          id?: string
          legacy_purchase_order_id?: number | null
          order_number: string
          transaction_type?: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string | null
          credit_application_id?: string | null
          credit_type?: string
          due_date?: string | null
          id?: string
          legacy_purchase_order_id?: number | null
          order_number?: string
          transaction_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_usages_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_job_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          emails_failed: number | null
          emails_sent: number | null
          error_message: string | null
          id: string
          job_name: string
          run_timestamp: string | null
          status: string | null
          total_checked: number | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          emails_failed?: number | null
          emails_sent?: number | null
          error_message?: string | null
          id?: string
          job_name: string
          run_timestamp?: string | null
          status?: string | null
          total_checked?: number | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          emails_failed?: number | null
          emails_sent?: number | null
          error_message?: string | null
          id?: string
          job_name?: string
          run_timestamp?: string | null
          status?: string | null
          total_checked?: number | null
        }
        Relationships: []
      }
      delivery_order_items: {
        Row: {
          created_at: string | null
          delivery_order_id: string
          id: string
          order_item_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_order_id: string
          id?: string
          order_item_id: string
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_order_id?: string
          id?: string
          order_item_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_order_items_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_order_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_invoice_mismatch"
            referencedColumns: ["order_item_id"]
          },
          {
            foreignKeyName: "delivery_order_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_orders: {
        Row: {
          created_at: string | null
          delivery_date: string | null
          delivery_order_url: string | null
          delivery_ref: string | null
          id: string
          legacy_invoice_id: number | null
          notes: string | null
          order_id: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_date?: string | null
          delivery_order_url?: string | null
          delivery_ref?: string | null
          id?: string
          legacy_invoice_id?: number | null
          notes?: string | null
          order_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_date?: string | null
          delivery_order_url?: string | null
          delivery_ref?: string | null
          id?: string
          legacy_invoice_id?: number | null
          notes?: string | null
          order_id?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_orders_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      digital_banner_uploads: {
        Row: {
          admin_comments: string | null
          approval_status: Database["public"]["Enums"]["banner_approval_status"]
          approved_at: string | null
          approved_by: string | null
          banner_description: string | null
          banner_image_url: string
          banner_link_url: string | null
          banner_title: string
          campaign_end_date: string | null
          campaign_start_date: string | null
          created_at: string | null
          id: string
          placement: Database["public"]["Enums"]["digital_banner_placement"][]
          rejected_reason: string | null
          seller_profile_id: string
          seller_subscription_id: string
          target_audience: string | null
          updated_at: string | null
          zone_id: string | null
        }
        Insert: {
          admin_comments?: string | null
          approval_status?: Database["public"]["Enums"]["banner_approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          banner_description?: string | null
          banner_image_url: string
          banner_link_url?: string | null
          banner_title: string
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string | null
          id?: string
          placement?: Database["public"]["Enums"]["digital_banner_placement"][]
          rejected_reason?: string | null
          seller_profile_id: string
          seller_subscription_id: string
          target_audience?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Update: {
          admin_comments?: string | null
          approval_status?: Database["public"]["Enums"]["banner_approval_status"]
          approved_at?: string | null
          approved_by?: string | null
          banner_description?: string | null
          banner_image_url?: string
          banner_link_url?: string | null
          banner_title?: string
          campaign_end_date?: string | null
          campaign_start_date?: string | null
          created_at?: string | null
          id?: string
          placement?: Database["public"]["Enums"]["digital_banner_placement"][]
          rejected_reason?: string | null
          seller_profile_id?: string
          seller_subscription_id?: string
          target_audience?: string | null
          updated_at?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_banner_uploads_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_banner_uploads_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_banner_uploads_seller_subscription_id_fkey"
            columns: ["seller_subscription_id"]
            isOneToOne: false
            referencedRelation: "seller_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_banner_uploads_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      dun_cities: {
        Row: {
          city_id: string
          created_at: string
          dun_id: string
        }
        Insert: {
          city_id: string
          created_at?: string
          dun_id: string
        }
        Update: {
          city_id?: string
          created_at?: string
          dun_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dun_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      email_reminders: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          is_recurring: boolean | null
          message: string
          priority: string
          recurrence_interval: unknown
          reminder_type: string
          sales_person_id: string | null
          scheduled_for: string
          seller_profile_id: string
          sent_at: string | null
          status: string
          subject: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_recurring?: boolean | null
          message: string
          priority?: string
          recurrence_interval?: unknown
          reminder_type?: string
          sales_person_id?: string | null
          scheduled_for: string
          seller_profile_id: string
          sent_at?: string | null
          status?: string
          subject: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          is_recurring?: boolean | null
          message?: string
          priority?: string
          recurrence_interval?: unknown
          reminder_type?: string
          sales_person_id?: string | null
          scheduled_for?: string
          seller_profile_id?: string
          sent_at?: string | null
          status?: string
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_reminders_sales_person_id_fkey"
            columns: ["sales_person_id"]
            isOneToOne: false
            referencedRelation: "sales_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_reminders_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          contents: string
          created_at: string | null
          description: string | null
          expected_keys: string[] | null
          id: string
          name: string
          subject: string | null
          test_map: Json | null
          updated_at: string | null
        }
        Insert: {
          contents: string
          created_at?: string | null
          description?: string | null
          expected_keys?: string[] | null
          id?: string
          name: string
          subject?: string | null
          test_map?: Json | null
          updated_at?: string | null
        }
        Update: {
          contents?: string
          created_at?: string | null
          description?: string | null
          expected_keys?: string[] | null
          id?: string
          name?: string
          subject?: string | null
          test_map?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      favourite_sellers: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          retailer_signup_tokens_id: string | null
          seller_profile_id: string
          signup_status: string | null
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          retailer_signup_tokens_id?: string | null
          seller_profile_id: string
          signup_status?: string | null
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          retailer_signup_tokens_id?: string | null
          seller_profile_id?: string
          signup_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favourite_sellers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favourite_sellers_retailer_signup_tokens_id_fkey"
            columns: ["retailer_signup_tokens_id"]
            isOneToOne: false
            referencedRelation: "retailer_signup_tokens"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favourite_sellers_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_accounts: {
        Row: {
          book: string
          code: string
          created_at: string
          id: string
          is_cash: boolean
          name: string
          type: string
        }
        Insert: {
          book: string
          code: string
          created_at?: string
          id?: string
          is_cash?: boolean
          name: string
          type: string
        }
        Update: {
          book?: string
          code?: string
          created_at?: string
          id?: string
          is_cash?: boolean
          name?: string
          type?: string
        }
        Relationships: []
      }
      gl_journal_entries: {
        Row: {
          book: string
          created_at: string
          description: string | null
          entry_date: string
          id: string
          ref: Json | null
          source: string | null
        }
        Insert: {
          book?: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          ref?: Json | null
          source?: string | null
        }
        Update: {
          book?: string
          created_at?: string
          description?: string | null
          entry_date?: string
          id?: string
          ref?: Json | null
          source?: string | null
        }
        Relationships: []
      }
      gl_journal_lines: {
        Row: {
          account_id: string
          created_at: string
          credit: number
          debit: number
          entry_id: string
          id: string
          meta: Json | null
          party_id: string | null
        }
        Insert: {
          account_id: string
          created_at?: string
          credit?: number
          debit?: number
          entry_id: string
          id?: string
          meta?: Json | null
          party_id?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string
          credit?: number
          debit?: number
          entry_id?: string
          id?: string
          meta?: Json | null
          party_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gl_journal_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "gl_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_journal_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "gl_cashbook_view"
            referencedColumns: ["entry_id"]
          },
          {
            foreignKeyName: "gl_journal_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "gl_journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gl_journal_lines_entry_id_fkey"
            columns: ["entry_id"]
            isOneToOne: false
            referencedRelation: "gl_journal_lines_view"
            referencedColumns: ["entry_id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          delivery_order_id: string | null
          id: string
          invoice_id: string
          legacy_line_item_id: string | null
          product_id: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_order_id?: string | null
          id?: string
          invoice_id: string
          legacy_line_item_id?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_order_id?: string | null
          id?: string
          invoice_id?: string
          legacy_line_item_id?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      invoices: {
        Row: {
          angkasa_fee_paid_date: string | null
          created_at: string | null
          credit_fee: number | null
          id: string
          invoice_number: string
          is_disputed: boolean | null
          legacy_invoice_id: number | null
          legacy_outlet_id: number | null
          legacy_retail_purchase_order_id: number | null
          net_payable: number | null
          online_fee: number | null
          order_id: string | null
          payment_date: string | null
          payment_due_date: string | null
          payment_id: string | null
          payment_proof_url: string | null
          payment_status: string
          payment_type: Database["public"]["Enums"]["payment_method"] | null
          po_number: string | null
          refund_amount: number | null
          seller_id: string | null
          seller_settlement_date: string | null
          status: string | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          angkasa_fee_paid_date?: string | null
          created_at?: string | null
          credit_fee?: number | null
          id?: string
          invoice_number: string
          is_disputed?: boolean | null
          legacy_invoice_id?: number | null
          legacy_outlet_id?: number | null
          legacy_retail_purchase_order_id?: number | null
          net_payable?: number | null
          online_fee?: number | null
          order_id?: string | null
          payment_date?: string | null
          payment_due_date?: string | null
          payment_id?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          payment_type?: Database["public"]["Enums"]["payment_method"] | null
          po_number?: string | null
          refund_amount?: number | null
          seller_id?: string | null
          seller_settlement_date?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          angkasa_fee_paid_date?: string | null
          created_at?: string | null
          credit_fee?: number | null
          id?: string
          invoice_number?: string
          is_disputed?: boolean | null
          legacy_invoice_id?: number | null
          legacy_outlet_id?: number | null
          legacy_retail_purchase_order_id?: number | null
          net_payable?: number | null
          online_fee?: number | null
          order_id?: string | null
          payment_date?: string | null
          payment_due_date?: string | null
          payment_id?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          payment_type?: Database["public"]["Enums"]["payment_method"] | null
          po_number?: string | null
          refund_amount?: number | null
          seller_id?: string | null
          seller_settlement_date?: string | null
          status?: string | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "new_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      jimatcoin_transactions: {
        Row: {
          after_amount: number
          amount: number
          before_amount: number
          created_at: string
          created_by: string | null
          id: string
          invoice_id: string | null
          jimatcoin_id: string
          order_id: string | null
          remarks: string | null
          transaction_type: string
        }
        Insert: {
          after_amount: number
          amount: number
          before_amount: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          jimatcoin_id: string
          order_id?: string | null
          remarks?: string | null
          transaction_type: string
        }
        Update: {
          after_amount?: number
          amount?: number
          before_amount?: number
          created_at?: string
          created_by?: string | null
          id?: string
          invoice_id?: string | null
          jimatcoin_id?: string
          order_id?: string | null
          remarks?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "jimatcoin_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatcoin_transactions_jimatcoin_id_fkey"
            columns: ["jimatcoin_id"]
            isOneToOne: false
            referencedRelation: "jimatcoins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatcoin_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      jimatcoins: {
        Row: {
          available_amount: number
          buyer_id: string
          created_at: string
          expires_at: string | null
          id: string
          seller_id: string | null
          total_amount: number
          updated_at: string
          used_amount: number
        }
        Insert: {
          available_amount?: number
          buyer_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          seller_id?: string | null
          total_amount?: number
          updated_at?: string
          used_amount?: number
        }
        Update: {
          available_amount?: number
          buyer_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          seller_id?: string | null
          total_amount?: number
          updated_at?: string
          used_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "jimatcoins_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatcoins_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jimatshop_coin_transactions: {
        Row: {
          after_amount: number | null
          amount: number
          before_amount: number | null
          coin_id: string | null
          created_at: string
          id: string
          jimatshop_order_id: string | null
          legacy_sales_order_id: number | null
          remarks: string | null
          shopper_id: string
        }
        Insert: {
          after_amount?: number | null
          amount: number
          before_amount?: number | null
          coin_id?: string | null
          created_at?: string
          id?: string
          jimatshop_order_id?: string | null
          legacy_sales_order_id?: number | null
          remarks?: string | null
          shopper_id: string
        }
        Update: {
          after_amount?: number | null
          amount?: number
          before_amount?: number | null
          coin_id?: string | null
          created_at?: string
          id?: string
          jimatshop_order_id?: string | null
          legacy_sales_order_id?: number | null
          remarks?: string | null
          shopper_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jimatshop_coin_transactions_coin_id_fkey"
            columns: ["coin_id"]
            isOneToOne: false
            referencedRelation: "jimatshop_coins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatshop_coin_transactions_jimatshop_order_id_fkey"
            columns: ["jimatshop_order_id"]
            isOneToOne: false
            referencedRelation: "jimatshop_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatshop_coin_transactions_shopper_id_fkey"
            columns: ["shopper_id"]
            isOneToOne: false
            referencedRelation: "shoppers"
            referencedColumns: ["id"]
          },
        ]
      }
      jimatshop_coins: {
        Row: {
          balance: number
          buyer_id: string | null
          created_at: string
          id: string
          shopper_id: string
          updated_at: string
        }
        Insert: {
          balance?: number
          buyer_id?: string | null
          created_at?: string
          id?: string
          shopper_id: string
          updated_at?: string
        }
        Update: {
          balance?: number
          buyer_id?: string | null
          created_at?: string
          id?: string
          shopper_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jimatshop_coins_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatshop_coins_shopper_id_fkey"
            columns: ["shopper_id"]
            isOneToOne: false
            referencedRelation: "shoppers"
            referencedColumns: ["id"]
          },
        ]
      }
      jimatshop_deliveries: {
        Row: {
          created_at: string | null
          delivery_date: string | null
          delivery_order_url: string | null
          delivery_ref: string | null
          id: string
          jimatshop_order_id: string
          legacy_invoice_id: number | null
          notes: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_date?: string | null
          delivery_order_url?: string | null
          delivery_ref?: string | null
          id?: string
          jimatshop_order_id: string
          legacy_invoice_id?: number | null
          notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_date?: string | null
          delivery_order_url?: string | null
          delivery_ref?: string | null
          id?: string
          jimatshop_order_id?: string
          legacy_invoice_id?: number | null
          notes?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jimatshop_deliveries_jimatshop_order_id_fkey"
            columns: ["jimatshop_order_id"]
            isOneToOne: false
            referencedRelation: "jimatshop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      jimatshop_delivery_items: {
        Row: {
          created_at: string | null
          id: string
          jimatshop_delivery_id: string
          jimatshop_order_item_id: string
          quantity: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          jimatshop_delivery_id: string
          jimatshop_order_item_id: string
          quantity: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          jimatshop_delivery_id?: string
          jimatshop_order_item_id?: string
          quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jimatshop_delivery_items_jimatshop_delivery_id_fkey"
            columns: ["jimatshop_delivery_id"]
            isOneToOne: false
            referencedRelation: "jimatshop_deliveries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatshop_delivery_items_jimatshop_order_item_id_fkey"
            columns: ["jimatshop_order_item_id"]
            isOneToOne: false
            referencedRelation: "jimatshop_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      jimatshop_order_items: {
        Row: {
          buyer_inventory_id: string
          created_at: string | null
          id: string
          order_id: string
          quantity: number
          subtotal: number
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          buyer_inventory_id: string
          created_at?: string | null
          id?: string
          order_id: string
          quantity: number
          subtotal: number
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          buyer_inventory_id?: string
          created_at?: string | null
          id?: string
          order_id?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jimatshop_order_items_buyer_inventory_id_fkey"
            columns: ["buyer_inventory_id"]
            isOneToOne: false
            referencedRelation: "buyer_inventories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatshop_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "jimatshop_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      jimatshop_orders: {
        Row: {
          buyer_id: string
          created_at: string | null
          id: string
          legacy_payload: Json | null
          legacy_sales_order_id: number | null
          notes: string | null
          payment_method: string | null
          payment_status: string
          shipping_address: Json | null
          shopper_id: string
          status: Database["public"]["Enums"]["jimatshop_order_status"]
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          buyer_id: string
          created_at?: string | null
          id?: string
          legacy_payload?: Json | null
          legacy_sales_order_id?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          shipping_address?: Json | null
          shopper_id: string
          status?: Database["public"]["Enums"]["jimatshop_order_status"]
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          buyer_id?: string
          created_at?: string | null
          id?: string
          legacy_payload?: Json | null
          legacy_sales_order_id?: number | null
          notes?: string | null
          payment_method?: string | null
          payment_status?: string
          shipping_address?: Json | null
          shopper_id?: string
          status?: Database["public"]["Enums"]["jimatshop_order_status"]
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_jimatshop_orders_shopper_id"
            columns: ["shopper_id"]
            isOneToOne: false
            referencedRelation: "shoppers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatshop_orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      jimatshop_reviews: {
        Row: {
          approved: boolean
          buyer_id: string
          created_at: string
          id: string
          ratings: number
          reviews: string
          shopper_id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          buyer_id: string
          created_at?: string
          id?: string
          ratings: number
          reviews: string
          shopper_id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          buyer_id?: string
          created_at?: string
          id?: string
          ratings?: number
          reviews?: string
          shopper_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jimatshop_reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jimatshop_reviews_shopper_id_fkey"
            columns: ["shopper_id"]
            isOneToOne: false
            referencedRelation: "shoppers"
            referencedColumns: ["id"]
          },
        ]
      }
      legacy_external_id_conflicts: {
        Row: {
          conflict_reason: string
          conflicted_with_record_id: number | null
          created_at: string | null
          id: string
          new_external_id: string
          notes: string | null
          old_external_id: string
          record_id: number
          resolved_at: string | null
          resolved_by: string | null
          table_name: string
        }
        Insert: {
          conflict_reason: string
          conflicted_with_record_id?: number | null
          created_at?: string | null
          id?: string
          new_external_id: string
          notes?: string | null
          old_external_id: string
          record_id: number
          resolved_at?: string | null
          resolved_by?: string | null
          table_name: string
        }
        Update: {
          conflict_reason?: string
          conflicted_with_record_id?: number | null
          created_at?: string | null
          id?: string
          new_external_id?: string
          notes?: string | null
          old_external_id?: string
          record_id?: number
          resolved_at?: string | null
          resolved_by?: string | null
          table_name?: string
        }
        Relationships: []
      }
      locations: {
        Row: {
          address: string | null
          contact: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          seller_profile_id: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          seller_profile_id: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          seller_profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_locations_seller_profile"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      login_logs: {
        Row: {
          created_at: string
          id: string
          ip_address: string | null
          is_high_risk: boolean
          seller_profile_id: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address?: string | null
          is_high_risk?: boolean
          seller_profile_id: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string | null
          is_high_risk?: boolean
          seller_profile_id?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "login_logs_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      migration_error_logs: {
        Row: {
          business_name: string | null
          buyer_id: string | null
          column_name: string | null
          constraint_name: string | null
          context: string
          created_at: string
          error_code: string | null
          error_message: string | null
          id: number
          legacy_outlet_id: number | null
          schema_name: string | null
          table_name: string | null
        }
        Insert: {
          business_name?: string | null
          buyer_id?: string | null
          column_name?: string | null
          constraint_name?: string | null
          context: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: number
          legacy_outlet_id?: number | null
          schema_name?: string | null
          table_name?: string | null
        }
        Update: {
          business_name?: string | null
          buyer_id?: string | null
          column_name?: string | null
          constraint_name?: string | null
          context?: string
          created_at?: string
          error_code?: string | null
          error_message?: string | null
          id?: number
          legacy_outlet_id?: number | null
          schema_name?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      monthly_fast_moving_products: {
        Row: {
          analysis_month: string
          analysis_period_end: string
          analysis_period_start: string
          category: string
          created_at: string | null
          id: string
          product_id: string
          product_name: string
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          sub_category: string | null
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
          updated_at: string | null
        }
        Insert: {
          analysis_month: string
          analysis_period_end: string
          analysis_period_start: string
          category: string
          created_at?: string | null
          id?: string
          product_id: string
          product_name: string
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          sub_category?: string | null
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
          updated_at?: string | null
        }
        Update: {
          analysis_month?: string
          analysis_period_end?: string
          analysis_period_start?: string
          category?: string
          created_at?: string | null
          id?: string
          product_id?: string
          product_name?: string
          rank_within_platform?: number
          rank_within_seller?: number
          seller_id?: string
          seller_name?: string
          sub_category?: string | null
          total_orders?: number
          total_quantity_sold?: number
          unique_buyers?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_fast_moving_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_fast_moving_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "monthly_fast_moving_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      monthly_seller_score: {
        Row: {
          average_days_late: number | null
          calculated_at: string | null
          cancelled_orders: number | null
          consistency_component: number | null
          consistency_score: number | null
          created_at: string | null
          custom_delivery_days: number | null
          days_late_score: number | null
          id: string
          late_orders: number | null
          month_end_date: string
          month_start_date: string
          on_time_fulfillment_rate: number | null
          on_time_orders: number | null
          on_time_score: number | null
          seller_id: string
          total_orders: number | null
          updated_at: string | null
          weighted_score: number | null
          year_month: string
        }
        Insert: {
          average_days_late?: number | null
          calculated_at?: string | null
          cancelled_orders?: number | null
          consistency_component?: number | null
          consistency_score?: number | null
          created_at?: string | null
          custom_delivery_days?: number | null
          days_late_score?: number | null
          id?: string
          late_orders?: number | null
          month_end_date: string
          month_start_date: string
          on_time_fulfillment_rate?: number | null
          on_time_orders?: number | null
          on_time_score?: number | null
          seller_id: string
          total_orders?: number | null
          updated_at?: string | null
          weighted_score?: number | null
          year_month: string
        }
        Update: {
          average_days_late?: number | null
          calculated_at?: string | null
          cancelled_orders?: number | null
          consistency_component?: number | null
          consistency_score?: number | null
          created_at?: string | null
          custom_delivery_days?: number | null
          days_late_score?: number | null
          id?: string
          late_orders?: number | null
          month_end_date?: string
          month_start_date?: string
          on_time_fulfillment_rate?: number | null
          on_time_orders?: number | null
          on_time_score?: number | null
          seller_id?: string
          total_orders?: number | null
          updated_at?: string | null
          weighted_score?: number | null
          year_month?: string
        }
        Relationships: [
          {
            foreignKeyName: "monthly_seller_score_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          finalized_qty: number | null
          id: string
          order_id: string
          ordered_qty: number
          original_price: number | null
          product_id: string
          promotion_id: string | null
          quantity: number
          total_price: number
          unit_price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          finalized_qty?: number | null
          id?: string
          order_id: string
          ordered_qty: number
          original_price?: number | null
          product_id: string
          promotion_id?: string | null
          quantity: number
          total_price: number
          unit_price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          finalized_qty?: number | null
          id?: string
          order_id?: string
          ordered_qty?: number
          original_price?: number | null
          product_id?: string
          promotion_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "order_items_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          billplz_bill_id: string | null
          billplz_collection_id: string | null
          buyer_confirmed: boolean | null
          buyer_id: string
          buyer_purchase_order_id: string | null
          cancellation_reason: string | null
          cancelled_by: string | null
          created_at: string
          delivery_date: string | null
          delivery_order_url: string | null
          delivery_ref: string | null
          id: string
          invoice_url: string | null
          legacy_retail_purchase_order_id: number | null
          notes: string | null
          order_number: string
          payment_completed_at: string | null
          payment_method: string | null
          payment_status: string | null
          refund_amount: number | null
          refund_evidence: string[] | null
          refund_reason: string | null
          refund_status: string | null
          restore_stock: boolean | null
          seller_id: string
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          total_amount: number
          updated_at: string
        }
        Insert: {
          billplz_bill_id?: string | null
          billplz_collection_id?: string | null
          buyer_confirmed?: boolean | null
          buyer_id: string
          buyer_purchase_order_id?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          delivery_date?: string | null
          delivery_order_url?: string | null
          delivery_ref?: string | null
          id?: string
          invoice_url?: string | null
          legacy_retail_purchase_order_id?: number | null
          notes?: string | null
          order_number: string
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          refund_amount?: number | null
          refund_evidence?: string[] | null
          refund_reason?: string | null
          refund_status?: string | null
          restore_stock?: boolean | null
          seller_id: string
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Update: {
          billplz_bill_id?: string | null
          billplz_collection_id?: string | null
          buyer_confirmed?: boolean | null
          buyer_id?: string
          buyer_purchase_order_id?: string | null
          cancellation_reason?: string | null
          cancelled_by?: string | null
          created_at?: string
          delivery_date?: string | null
          delivery_order_url?: string | null
          delivery_ref?: string | null
          id?: string
          invoice_url?: string | null
          legacy_retail_purchase_order_id?: number | null
          notes?: string | null
          order_number?: string
          payment_completed_at?: string | null
          payment_method?: string | null
          payment_status?: string | null
          refund_amount?: number | null
          refund_evidence?: string[] | null
          refund_reason?: string | null
          refund_status?: string | null
          restore_stock?: boolean | null
          seller_id?: string
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_buyer_purchase_order_id_fkey"
            columns: ["buyer_purchase_order_id"]
            isOneToOne: false
            referencedRelation: "buyer_purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          created_at: string | null
          credit_fee_percentage: number | null
          description: string | null
          id: string
          name: string
          online_fee_fixed: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          credit_fee_percentage?: number | null
          description?: string | null
          id?: string
          name: string
          online_fee_fixed?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          credit_fee_percentage?: number | null
          description?: string | null
          id?: string
          name?: string
          online_fee_fixed?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          buyer_profile_id: string | null
          created_at: string | null
          credit_fee: number
          dispute_reason: string | null
          id: string
          invoice_id: string | null
          is_disputed: boolean | null
          jimatbiz_revenue: number | null
          metadata: Json | null
          net_payable: number | null
          online_fee: number
          payment_date: string | null
          payment_due_date: string | null
          payment_method: string | null
          payment_method_id: string | null
          payment_reference: string | null
          payment_status: string | null
          payment_type: Database["public"]["Enums"]["payment_type"] | null
          reference_id: string | null
          refund_amount: number | null
          seller_payout_amount: number | null
          total_amount: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          buyer_profile_id?: string | null
          created_at?: string | null
          credit_fee?: number
          dispute_reason?: string | null
          id?: string
          invoice_id?: string | null
          is_disputed?: boolean | null
          jimatbiz_revenue?: number | null
          metadata?: Json | null
          net_payable?: number | null
          online_fee?: number
          payment_date?: string | null
          payment_due_date?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type"] | null
          reference_id?: string | null
          refund_amount?: number | null
          seller_payout_amount?: number | null
          total_amount: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          buyer_profile_id?: string | null
          created_at?: string | null
          credit_fee?: number
          dispute_reason?: string | null
          id?: string
          invoice_id?: string | null
          is_disputed?: boolean | null
          jimatbiz_revenue?: number | null
          metadata?: Json | null
          net_payable?: number | null
          online_fee?: number
          payment_date?: string | null
          payment_due_date?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          payment_type?: Database["public"]["Enums"]["payment_type"] | null
          reference_id?: string | null
          refund_amount?: number | null
          seller_payout_amount?: number | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_buyer_profile_id_fkey"
            columns: ["buyer_profile_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          buyer_purchase_order_id: string | null
          created_at: string | null
          created_by: string | null
          gateway_reference: string | null
          gateway_response: Json | null
          id: string
          invoice_id: string | null
          invoice_ids: string[] | null
          notes: string | null
          paid_at: string | null
          payment_proof_url: string | null
          payment_status: string
          payment_type: Database["public"]["Enums"]["payment_method"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          buyer_purchase_order_id?: string | null
          created_at?: string | null
          created_by?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          invoice_ids?: string[] | null
          notes?: string | null
          paid_at?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          payment_type: Database["public"]["Enums"]["payment_method"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          buyer_purchase_order_id?: string | null
          created_at?: string | null
          created_by?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          invoice_id?: string | null
          invoice_ids?: string[] | null
          notes?: string | null
          paid_at?: string | null
          payment_proof_url?: string | null
          payment_status?: string
          payment_type?: Database["public"]["Enums"]["payment_method"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_buyer_purchase_order_id_fkey"
            columns: ["buyer_purchase_order_id"]
            isOneToOne: false
            referencedRelation: "buyer_purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          legacy_category_id: number | null
          legacy_id: number | null
          name: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          legacy_category_id?: number | null
          legacy_id?: number | null
          name: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          legacy_category_id?: number | null
          legacy_id?: number | null
          name?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      product_clone_map: {
        Row: {
          created_at: string
          id: string
          principal_product_id: string
          warehouse_product_id: string
          warehouse_seller_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          principal_product_id: string
          warehouse_product_id: string
          warehouse_seller_id: string
        }
        Update: {
          created_at?: string
          id?: string
          principal_product_id?: string
          warehouse_product_id?: string
          warehouse_seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_clone_map_principal_product_id_fkey"
            columns: ["principal_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_clone_map_principal_product_id_fkey"
            columns: ["principal_product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_clone_map_warehouse_product_id_fkey"
            columns: ["warehouse_product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_clone_map_warehouse_product_id_fkey"
            columns: ["warehouse_product_id"]
            isOneToOne: true
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "product_clone_map_warehouse_seller_id_fkey"
            columns: ["warehouse_seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      product_customer_groups: {
        Row: {
          created_at: string
          customer_group: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          customer_group: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          customer_group?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_customer_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_customer_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_images: {
        Row: {
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_cover: boolean
          product_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_cover?: boolean
          product_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_cover?: boolean
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_statuses: {
        Row: {
          ba100: boolean | null
          created_at: string | null
          featured: boolean | null
          hot: boolean | null
          hot_price_cents: number | null
          id: string
          legacy_id: number | null
          legacy_variant_id: number | null
          promo: boolean | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          ba100?: boolean | null
          created_at?: string | null
          featured?: boolean | null
          hot?: boolean | null
          hot_price_cents?: number | null
          id?: string
          legacy_id?: number | null
          legacy_variant_id?: number | null
          promo?: boolean | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          ba100?: boolean | null
          created_at?: string | null
          featured?: boolean | null
          hot?: boolean | null
          hot_price_cents?: number | null
          id?: string
          legacy_id?: number | null
          legacy_variant_id?: number | null
          promo?: boolean | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: []
      }
      product_variant_bulk: {
        Row: {
          bulk_price_cents: number | null
          bulk_quantity: number
          created_at: string | null
          id: string
          legacy_id: number | null
          legacy_variant_id: number | null
          updated_at: string | null
          variant_id: string | null
        }
        Insert: {
          bulk_price_cents?: number | null
          bulk_quantity?: number
          created_at?: string | null
          id?: string
          legacy_id?: number | null
          legacy_variant_id?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Update: {
          bulk_price_cents?: number | null
          bulk_quantity?: number
          created_at?: string | null
          id?: string
          legacy_id?: number | null
          legacy_variant_id?: number | null
          updated_at?: string | null
          variant_id?: string | null
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          barcode: string | null
          created_at: string
          id: string
          legacy_variant_id: number | null
          price: number
          product_id: string
          sku: string | null
          updated_at: string
          weight: number | null
          weight_unit: string | null
        }
        Insert: {
          barcode?: string | null
          created_at?: string
          id?: string
          legacy_variant_id?: number | null
          price: number
          product_id: string
          sku?: string | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Update: {
          barcode?: string | null
          created_at?: string
          id?: string
          legacy_variant_id?: number | null
          price?: number
          product_id?: string
          sku?: string | null
          updated_at?: string
          weight?: number | null
          weight_unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_variations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          price: number
          product_id: string
          stock: number
          type: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number
          product_id: string
          stock?: number
          type: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          price?: number
          product_id?: string
          stock?: number
          type?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_variations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_violation_reports: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          notes: string | null
          product_id: string
          reason: string
          status: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id: string
          reason: string
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          product_id?: string
          reason?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_violation_reports_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_violation_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_violation_reports_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      product_visibility_regions: {
        Row: {
          created_at: string
          id: string
          product_id: string
          region: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          region: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          region?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_visibility_regions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_visibility_regions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          base64_image: string | null
          brand_id: string | null
          carton_size: string | null
          category: string | null
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          deactivated_by_admin: boolean | null
          description: string | null
          embedding_updated_at: string | null
          id: string
          image_url: string | null
          img_url_1: string | null
          img_url_2: string | null
          img_url_3: string | null
          img_url_4: string | null
          is_active: boolean
          is_nationwide: boolean
          items_per_carton: number
          jimatshop_image_url: string | null
          jimatshop_name: string | null
          lead_time_days: number | null
          legacy_brand_id: number | null
          legacy_category_id: number | null
          legacy_id: number | null
          legacy_product_id: number | null
          legacy_supplier_code: string | null
          legacy_supplier_id: number | null
          name: string
          name_embedding: string | null
          normal_price: number
          promotion_end: string | null
          promotion_price: number | null
          promotion_start: string | null
          reorder_threshold: number | null
          retail_price: number | null
          safety_stock: number | null
          seller_id: string
          sub_category: string | null
          sub_category_id: string | null
          supplier_id: string | null
          updated_at: string
          wholesale_prices: string | null
        }
        Insert: {
          barcode?: string | null
          base64_image?: string | null
          brand_id?: string | null
          carton_size?: string | null
          category?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          deactivated_by_admin?: boolean | null
          description?: string | null
          embedding_updated_at?: string | null
          id?: string
          image_url?: string | null
          img_url_1?: string | null
          img_url_2?: string | null
          img_url_3?: string | null
          img_url_4?: string | null
          is_active?: boolean
          is_nationwide?: boolean
          items_per_carton?: number
          jimatshop_image_url?: string | null
          jimatshop_name?: string | null
          lead_time_days?: number | null
          legacy_brand_id?: number | null
          legacy_category_id?: number | null
          legacy_id?: number | null
          legacy_product_id?: number | null
          legacy_supplier_code?: string | null
          legacy_supplier_id?: number | null
          name: string
          name_embedding?: string | null
          normal_price: number
          promotion_end?: string | null
          promotion_price?: number | null
          promotion_start?: string | null
          reorder_threshold?: number | null
          retail_price?: number | null
          safety_stock?: number | null
          seller_id: string
          sub_category?: string | null
          sub_category_id?: string | null
          supplier_id?: string | null
          updated_at?: string
          wholesale_prices?: string | null
        }
        Update: {
          barcode?: string | null
          base64_image?: string | null
          brand_id?: string | null
          carton_size?: string | null
          category?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          deactivated_by_admin?: boolean | null
          description?: string | null
          embedding_updated_at?: string | null
          id?: string
          image_url?: string | null
          img_url_1?: string | null
          img_url_2?: string | null
          img_url_3?: string | null
          img_url_4?: string | null
          is_active?: boolean
          is_nationwide?: boolean
          items_per_carton?: number
          jimatshop_image_url?: string | null
          jimatshop_name?: string | null
          lead_time_days?: number | null
          legacy_brand_id?: number | null
          legacy_category_id?: number | null
          legacy_id?: number | null
          legacy_product_id?: number | null
          legacy_supplier_code?: string | null
          legacy_supplier_id?: number | null
          name?: string
          name_embedding?: string | null
          normal_price?: number
          promotion_end?: string | null
          promotion_price?: number | null
          promotion_start?: string | null
          reorder_threshold?: number | null
          retail_price?: number | null
          safety_stock?: number | null
          seller_id?: string
          sub_category?: string | null
          sub_category_id?: string | null
          supplier_id?: string | null
          updated_at?: string
          wholesale_prices?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_sub_category_id_fkey"
            columns: ["sub_category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_products: {
        Row: {
          bundle_quantity: number | null
          buy_quantity: number | null
          created_at: string
          discount_price: number | null
          free_quantity: number | null
          id: string
          is_bundle_product: boolean | null
          product_id: string
          promotion_id: string
          updated_at: string
        }
        Insert: {
          bundle_quantity?: number | null
          buy_quantity?: number | null
          created_at?: string
          discount_price?: number | null
          free_quantity?: number | null
          id?: string
          is_bundle_product?: boolean | null
          product_id: string
          promotion_id: string
          updated_at?: string
        }
        Update: {
          bundle_quantity?: number | null
          buy_quantity?: number | null
          created_at?: string
          discount_price?: number | null
          free_quantity?: number | null
          id?: string
          is_bundle_product?: boolean | null
          product_id?: string
          promotion_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "promotion_products_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotion_rules: {
        Row: {
          created_at: string
          id: string
          promotion_id: string
          rule_type: string
          rule_value: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          promotion_id: string
          rule_type: string
          rule_value?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          promotion_id?: string
          rule_type?: string
          rule_value?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_rules_promotion_id_fkey"
            columns: ["promotion_id"]
            isOneToOne: false
            referencedRelation: "promotions"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          created_at: string
          description: string | null
          end_date: string
          id: string
          limit_per_buyer: number | null
          name: string
          promotion_image: string | null
          seller_id: string
          start_date: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          limit_per_buyer?: number | null
          name: string
          promotion_image?: string | null
          seller_id: string
          start_date: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          limit_per_buyer?: number | null
          name?: string
          promotion_image?: string | null
          seller_id?: string
          start_date?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotions_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_items: {
        Row: {
          buyer_id: string
          created_at: string
          delivered_qty: number
          id: string
          order_id: string
          order_item_id: string
          ordered_qty: number
          payment_method: string
          product_id: string
          product_name: string
          refund_amount: number
          refund_qty: number
          refund_reason: string | null
          refund_request_id: string | null
          seller_id: string
          status: string
          transaction_id: string | null
          unit_price: number
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          delivered_qty: number
          id?: string
          order_id: string
          order_item_id: string
          ordered_qty: number
          payment_method: string
          product_id: string
          product_name: string
          refund_amount: number
          refund_qty: number
          refund_reason?: string | null
          refund_request_id?: string | null
          seller_id: string
          status?: string
          transaction_id?: string | null
          unit_price: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          delivered_qty?: number
          id?: string
          order_id?: string
          order_item_id?: string
          ordered_qty?: number
          payment_method?: string
          product_id?: string
          product_name?: string
          refund_amount?: number
          refund_qty?: number
          refund_reason?: string | null
          refund_request_id?: string | null
          seller_id?: string
          status?: string
          transaction_id?: string | null
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: true
            referencedRelation: "order_invoice_mismatch"
            referencedColumns: ["order_item_id"]
          },
          {
            foreignKeyName: "refund_items_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: true
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "refund_items_refund_request_id_fkey"
            columns: ["refund_request_id"]
            isOneToOne: false
            referencedRelation: "refund_request"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_request: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          buyer_id: string
          created_at: string
          id: string
          notes: string | null
          order_id: string
          payment_method: string
          refund_amount: number
          refund_description: string | null
          refund_evidence: string[] | null
          refund_reason: string
          rejected_at: string | null
          rejected_by: string | null
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          buyer_id: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          payment_method: string
          refund_amount: number
          refund_description?: string | null
          refund_evidence?: string[] | null
          refund_reason: string
          rejected_at?: string | null
          rejected_by?: string | null
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          buyer_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_method?: string
          refund_amount?: number
          refund_description?: string | null
          refund_evidence?: string[] | null
          refund_reason?: string
          rejected_at?: string | null
          rejected_by?: string | null
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refund_request_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_request_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_request_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      retailer_groups: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      retailer_signup_tokens: {
        Row: {
          buyer_id: string | null
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          updated_at: string | null
          used_at: string | null
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string | null
          email: string
          expires_at: string
          id?: string
          token: string
          updated_at?: string | null
          used_at?: string | null
        }
        Update: {
          buyer_id?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "retailer_signup_tokens_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          buyer_id: string
          comment: string | null
          created_at: string | null
          id: string
          rating: number
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          buyer_id: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating: number
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          buyer_id?: string
          comment?: string | null
          created_at?: string | null
          id?: string
          rating?: number
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          badge_type: string | null
          created_at: string | null
          description: string | null
          id: string
          month: string
          name: string
          reward_value: string | null
          sales_person_id: string | null
          updated_at: string | null
        }
        Insert: {
          badge_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          month: string
          name: string
          reward_value?: string | null
          sales_person_id?: string | null
          updated_at?: string | null
        }
        Update: {
          badge_type?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          month?: string
          name?: string
          reward_value?: string | null
          sales_person_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rewards_sales_person_id_fkey"
            columns: ["sales_person_id"]
            isOneToOne: false
            referencedRelation: "sales_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_competition_rankings: {
        Row: {
          competition_id: string
          created_at: string | null
          id: string
          rank: number
          sales_person_id: string
          score: number | null
          updated_at: string | null
        }
        Insert: {
          competition_id: string
          created_at?: string | null
          id?: string
          rank: number
          sales_person_id: string
          score?: number | null
          updated_at?: string | null
        }
        Update: {
          competition_id?: string
          created_at?: string | null
          id?: string
          rank?: number
          sales_person_id?: string
          score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_competition_rankings_competition_id_fkey"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "sales_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_competition_rankings_sales_person_id_fkey"
            columns: ["sales_person_id"]
            isOneToOne: false
            referencedRelation: "sales_persons"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_competitions: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          is_active: boolean | null
          name: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          is_active?: boolean | null
          name: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          is_active?: boolean | null
          name?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_persons: {
        Row: {
          bonus_threshold: number | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          monthly_target: number | null
          referral_code: string | null
          role: Database["public"]["Enums"]["sales_role"]
          team_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          bonus_threshold?: number | null
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          is_active?: boolean | null
          monthly_target?: number | null
          referral_code?: string | null
          role?: Database["public"]["Enums"]["sales_role"]
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          bonus_threshold?: number | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          monthly_target?: number | null
          referral_code?: string | null
          role?: Database["public"]["Enums"]["sales_role"]
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_persons_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "sales_teams"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_teams: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      seller_admin_profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          seller_group_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          seller_group_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          seller_group_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_admin_profiles_seller_group_id_fkey"
            columns: ["seller_group_id"]
            isOneToOne: false
            referencedRelation: "seller_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_featured_products: {
        Row: {
          created_at: string | null
          feature_order: number
          featured_since: string | null
          id: string
          is_active: boolean | null
          product_id: string
          seller_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          feature_order: number
          featured_since?: string | null
          id?: string
          is_active?: boolean | null
          product_id: string
          seller_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          feature_order?: number
          featured_since?: string | null
          id?: string
          is_active?: boolean | null
          product_id?: string
          seller_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_featured_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_featured_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "seller_featured_products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      seller_leads: {
        Row: {
          address: string | null
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_name: string | null
          business_name: string | null
          business_reg_number: string | null
          business_type: string | null
          category: string | null
          claim_status: string
          contact_number: string | null
          created_at: string | null
          credit_feature_enabled: boolean | null
          credit_percentage: number | null
          custom_delivery_days: number | null
          fulfillment_capability: string | null
          id: string
          late_payment_fee: number | null
          location: string | null
          minimum_order_quantity: number | null
          notes: string | null
          package_type: string
          pic_name: string | null
          pic_phone_number: string | null
          revenue: number | null
          sales_person_id: string | null
          seller_email: string | null
          seller_id: string | null
          seller_name: string
          signed_at: string | null
          status: string
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_name?: string | null
          business_reg_number?: string | null
          business_type?: string | null
          category?: string | null
          claim_status?: string
          contact_number?: string | null
          created_at?: string | null
          credit_feature_enabled?: boolean | null
          credit_percentage?: number | null
          custom_delivery_days?: number | null
          fulfillment_capability?: string | null
          id?: string
          late_payment_fee?: number | null
          location?: string | null
          minimum_order_quantity?: number | null
          notes?: string | null
          package_type: string
          pic_name?: string | null
          pic_phone_number?: string | null
          revenue?: number | null
          sales_person_id?: string | null
          seller_email?: string | null
          seller_id?: string | null
          seller_name: string
          signed_at?: string | null
          status?: string
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_name?: string | null
          business_reg_number?: string | null
          business_type?: string | null
          category?: string | null
          claim_status?: string
          contact_number?: string | null
          created_at?: string | null
          credit_feature_enabled?: boolean | null
          credit_percentage?: number | null
          custom_delivery_days?: number | null
          fulfillment_capability?: string | null
          id?: string
          late_payment_fee?: number | null
          location?: string | null
          minimum_order_quantity?: number | null
          notes?: string | null
          package_type?: string
          pic_name?: string | null
          pic_phone_number?: string | null
          revenue?: number | null
          sales_person_id?: string | null
          seller_email?: string | null
          seller_id?: string | null
          seller_name?: string
          signed_at?: string | null
          status?: string
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_leads_sales_person_id_fkey"
            columns: ["sales_person_id"]
            isOneToOne: false
            referencedRelation: "sales_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_leads_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_notification_reads: {
        Row: {
          created_at: string
          id: string
          notification_id: string
          read_at: string
          seller_profile_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notification_id: string
          read_at?: string
          seller_profile_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notification_id?: string
          read_at?: string
          seller_profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_notification_reads_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_profiles: {
        Row: {
          address: string | null
          bank_account_holder: string | null
          bank_account_number: string | null
          bank_name: string | null
          business_document_url: string | null
          business_name: string | null
          business_reg_number: string | null
          business_type: string | null
          certifications: string[] | null
          contact_name: string | null
          contact_person: string | null
          created_at: string | null
          credit_feature_enabled: boolean | null
          credit_percentage: number | null
          custom_delivery_days: number | null
          custom_zones: string[] | null
          default_location_id: string | null
          description: string | null
          email: string
          first_name: string | null
          fulfillment_capability: string | null
          halal_certificate_url: string | null
          has_agree_tnc: boolean
          id: string
          is_full_local: boolean
          is_suspended: boolean | null
          is_verified: boolean | null
          last_name: string | null
          late_payment_fee: number | null
          legacy_code: string | null
          legacy_codes: string[] | null
          legacy_id: number | null
          legacy_ids: number[] | null
          logo_url: string | null
          minimum_order_quantity: number | null
          need_sms_login: boolean | null
          payment_methods: string[] | null
          phone: string | null
          pic_name: string | null
          pic_phone_number: string | null
          referral_registered_at: string | null
          referral_source: string | null
          referred_by_code: string | null
          remarks: string | null
          remind_buyers_on_seller_credit_payments: boolean
          require_admin_approval: boolean
          sales_person_id: string | null
          seller_group_id: string | null
          shop_banner_image: string | null
          sms_phone_number: string | null
          suspended_date: string | null
          tax_id: string | null
          temp_sms_code: string | null
          temp_sms_code_expires_at: string | null
          trade_license_url: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_document_url?: string | null
          business_name?: string | null
          business_reg_number?: string | null
          business_type?: string | null
          certifications?: string[] | null
          contact_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          credit_feature_enabled?: boolean | null
          credit_percentage?: number | null
          custom_delivery_days?: number | null
          custom_zones?: string[] | null
          default_location_id?: string | null
          description?: string | null
          email: string
          first_name?: string | null
          fulfillment_capability?: string | null
          halal_certificate_url?: string | null
          has_agree_tnc?: boolean
          id?: string
          is_full_local?: boolean
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          late_payment_fee?: number | null
          legacy_code?: string | null
          legacy_codes?: string[] | null
          legacy_id?: number | null
          legacy_ids?: number[] | null
          logo_url?: string | null
          minimum_order_quantity?: number | null
          need_sms_login?: boolean | null
          payment_methods?: string[] | null
          phone?: string | null
          pic_name?: string | null
          pic_phone_number?: string | null
          referral_registered_at?: string | null
          referral_source?: string | null
          referred_by_code?: string | null
          remarks?: string | null
          remind_buyers_on_seller_credit_payments?: boolean
          require_admin_approval?: boolean
          sales_person_id?: string | null
          seller_group_id?: string | null
          shop_banner_image?: string | null
          sms_phone_number?: string | null
          suspended_date?: string | null
          tax_id?: string | null
          temp_sms_code?: string | null
          temp_sms_code_expires_at?: string | null
          trade_license_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          bank_account_holder?: string | null
          bank_account_number?: string | null
          bank_name?: string | null
          business_document_url?: string | null
          business_name?: string | null
          business_reg_number?: string | null
          business_type?: string | null
          certifications?: string[] | null
          contact_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          credit_feature_enabled?: boolean | null
          credit_percentage?: number | null
          custom_delivery_days?: number | null
          custom_zones?: string[] | null
          default_location_id?: string | null
          description?: string | null
          email?: string
          first_name?: string | null
          fulfillment_capability?: string | null
          halal_certificate_url?: string | null
          has_agree_tnc?: boolean
          id?: string
          is_full_local?: boolean
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_name?: string | null
          late_payment_fee?: number | null
          legacy_code?: string | null
          legacy_codes?: string[] | null
          legacy_id?: number | null
          legacy_ids?: number[] | null
          logo_url?: string | null
          minimum_order_quantity?: number | null
          need_sms_login?: boolean | null
          payment_methods?: string[] | null
          phone?: string | null
          pic_name?: string | null
          pic_phone_number?: string | null
          referral_registered_at?: string | null
          referral_source?: string | null
          referred_by_code?: string | null
          remarks?: string | null
          remind_buyers_on_seller_credit_payments?: boolean
          require_admin_approval?: boolean
          sales_person_id?: string | null
          seller_group_id?: string | null
          shop_banner_image?: string | null
          sms_phone_number?: string | null
          suspended_date?: string | null
          tax_id?: string | null
          temp_sms_code?: string | null
          temp_sms_code_expires_at?: string | null
          trade_license_url?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_seller_profiles_referred_by_code"
            columns: ["referred_by_code"]
            isOneToOne: false
            referencedRelation: "sales_persons"
            referencedColumns: ["referral_code"]
          },
          {
            foreignKeyName: "seller_profiles_default_location_id_fkey"
            columns: ["default_location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_profiles_sales_person_id_fkey"
            columns: ["sales_person_id"]
            isOneToOne: false
            referencedRelation: "sales_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_profiles_seller_group_id_fkey"
            columns: ["seller_group_id"]
            isOneToOne: false
            referencedRelation: "seller_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_reviews: {
        Row: {
          approved: boolean
          buyer_id: string
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          seller_id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean
          buyer_id: string
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          seller_id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean
          buyer_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_reviews_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_reviews_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_score: {
        Row: {
          average_days_late: number | null
          cancelled_orders: number | null
          consistency_component: number | null
          consistency_score: number | null
          created_at: string | null
          days_late_score: number | null
          id: string
          last_calculated_at: string | null
          late_orders: number | null
          on_time_fulfillment_rate: number | null
          on_time_orders: number | null
          on_time_score: number | null
          seller_id: string
          total_orders: number | null
          updated_at: string | null
          weighted_score: number | null
        }
        Insert: {
          average_days_late?: number | null
          cancelled_orders?: number | null
          consistency_component?: number | null
          consistency_score?: number | null
          created_at?: string | null
          days_late_score?: number | null
          id?: string
          last_calculated_at?: string | null
          late_orders?: number | null
          on_time_fulfillment_rate?: number | null
          on_time_orders?: number | null
          on_time_score?: number | null
          seller_id: string
          total_orders?: number | null
          updated_at?: string | null
          weighted_score?: number | null
        }
        Update: {
          average_days_late?: number | null
          cancelled_orders?: number | null
          consistency_component?: number | null
          consistency_score?: number | null
          created_at?: string | null
          days_late_score?: number | null
          id?: string
          last_calculated_at?: string | null
          late_orders?: number | null
          on_time_fulfillment_rate?: number | null
          on_time_orders?: number | null
          on_time_score?: number | null
          seller_id?: string
          total_orders?: number | null
          updated_at?: string | null
          weighted_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_score_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: true
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_serviceable_cities: {
        Row: {
          city_id: string
          created_at: string
          id: string
          seller_profile_id: string
          updated_at: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          seller_profile_id: string
          updated_at?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          seller_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_serviceable_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_serviceable_cities_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_settlement_payment_items: {
        Row: {
          amount: number
          created_at: string
          id: string
          settlement_id: string
          settlement_payment_id: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          settlement_id: string
          settlement_payment_id: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          settlement_id?: string
          settlement_payment_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_settlement_payment_items_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "seller_settlements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_settlement_payment_items_settlement_payment_id_fkey"
            columns: ["settlement_payment_id"]
            isOneToOne: false
            referencedRelation: "seller_settlement_payments"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_settlement_payments: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          payment_date: string
          reference_no: string
          seller_id: string
          status: string
          total_amount: number
          updated_at: string
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          payment_date: string
          reference_no: string
          seller_id: string
          status?: string
          total_amount: number
          updated_at?: string
          week_end_date: string
          week_start_date: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          payment_date?: string
          reference_no?: string
          seller_id?: string
          status?: string
          total_amount?: number
          updated_at?: string
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_settlement_payments_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_settlements: {
        Row: {
          angkasa_fee: number | null
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          credit_fee: number
          id: string
          invoice_id: string
          net_settlement_amount: number
          notes: string | null
          platform_fee: number
          seller_id: string
          settlement_date: string | null
          settlement_status: string | null
          total_invoice_amount: number
          updated_at: string | null
          week_end_date: string
          week_start_date: string
        }
        Insert: {
          angkasa_fee?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          credit_fee: number
          id?: string
          invoice_id: string
          net_settlement_amount: number
          notes?: string | null
          platform_fee: number
          seller_id: string
          settlement_date?: string | null
          settlement_status?: string | null
          total_invoice_amount: number
          updated_at?: string | null
          week_end_date: string
          week_start_date: string
        }
        Update: {
          angkasa_fee?: number | null
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          credit_fee?: number
          id?: string
          invoice_id?: string
          net_settlement_amount?: number
          notes?: string | null
          platform_fee?: number
          seller_id?: string
          settlement_date?: string | null
          settlement_status?: string | null
          total_invoice_amount?: number
          updated_at?: string | null
          week_end_date?: string
          week_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_settlements_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_settlements_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_subscription_combo_orders: {
        Row: {
          amount: number
          billplz_bill_id: string | null
          billplz_collection_id: string | null
          combo_id: string
          created_at: string
          id: string
          seller_profile_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          billplz_bill_id?: string | null
          billplz_collection_id?: string | null
          combo_id: string
          created_at?: string
          id?: string
          seller_profile_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          billplz_bill_id?: string | null
          billplz_collection_id?: string | null
          combo_id?: string
          created_at?: string
          id?: string
          seller_profile_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_subscription_combo_orders_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "subscription_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_subscription_combo_orders_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_subscriptions: {
        Row: {
          billplz_bill_id: string | null
          billplz_collection_id: string
          created_at: string | null
          end_date: string
          id: string
          paid_amount: number
          payment_date: string | null
          payment_reference: string | null
          payment_status: string | null
          remarks: string | null
          sales_person_id: string | null
          seller_lead_id: string | null
          seller_profile_id: string
          start_date: string
          status: string | null
          subscription_id: string
          type: Database["public"]["Enums"]["subscription_type"]
          updated_at: string | null
        }
        Insert: {
          billplz_bill_id?: string | null
          billplz_collection_id: string
          created_at?: string | null
          end_date: string
          id?: string
          paid_amount?: number
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          remarks?: string | null
          sales_person_id?: string | null
          seller_lead_id?: string | null
          seller_profile_id: string
          start_date: string
          status?: string | null
          subscription_id: string
          type?: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string | null
        }
        Update: {
          billplz_bill_id?: string | null
          billplz_collection_id?: string
          created_at?: string | null
          end_date?: string
          id?: string
          paid_amount?: number
          payment_date?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          remarks?: string | null
          sales_person_id?: string | null
          seller_lead_id?: string | null
          seller_profile_id?: string
          start_date?: string
          status?: string | null
          subscription_id?: string
          type?: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_seller_profile_id"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_subscriptions_sales_person_id_fkey"
            columns: ["sales_person_id"]
            isOneToOne: false
            referencedRelation: "sales_persons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_subscriptions_seller_lead_id_fkey"
            columns: ["seller_lead_id"]
            isOneToOne: false
            referencedRelation: "seller_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_subscriptions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_upload_products: {
        Row: {
          created_at: string
          id: string
          product_data: Json
          product_id: string | null
          rejection_reason: string | null
          seller_upload_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_data: Json
          product_id?: string | null
          rejection_reason?: string | null
          seller_upload_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          product_data?: Json
          product_id?: string | null
          rejection_reason?: string | null
          seller_upload_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_upload_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_upload_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "seller_upload_products_upload_id_fkey"
            columns: ["seller_upload_id"]
            isOneToOne: false
            referencedRelation: "seller_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_uploads: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          approved_count: number
          created_at: string
          file_name: string | null
          id: string
          product_count: number
          rejected_count: number
          rejection_reason: string | null
          seller_id: string
          status: string
          updated_at: string
          upload_batch_id: string
          uploaded_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          approved_count?: number
          created_at?: string
          file_name?: string | null
          id?: string
          product_count?: number
          rejected_count?: number
          rejection_reason?: string | null
          seller_id: string
          status?: string
          updated_at?: string
          upload_batch_id: string
          uploaded_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          approved_count?: number
          created_at?: string
          file_name?: string | null
          id?: string
          product_count?: number
          rejected_count?: number
          rejection_reason?: string | null
          seller_id?: string
          status?: string
          updated_at?: string
          upload_batch_id?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_uploads_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settlement_invoices: {
        Row: {
          created_at: string | null
          id: string
          invoice_id: string
          settlement_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invoice_id: string
          settlement_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invoice_id?: string
          settlement_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlement_invoices_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "settlement_invoices_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "seller_settlements"
            referencedColumns: ["id"]
          },
        ]
      }
      shoppers: {
        Row: {
          address_line1: string | null
          address_line2: string | null
          city: string | null
          created_at: string | null
          customer_type: string | null
          email: string | null
          first_name: string
          ic_no: string | null
          id: string
          is_active: boolean | null
          last_name: string | null
          member_no: string | null
          phone: string | null
          postal_code: string | null
          role: string | null
          state: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          customer_type?: string | null
          email?: string | null
          first_name: string
          ic_no?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          member_no?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address_line1?: string | null
          address_line2?: string | null
          city?: string | null
          created_at?: string | null
          customer_type?: string | null
          email?: string | null
          first_name?: string
          ic_no?: string | null
          id?: string
          is_active?: boolean | null
          last_name?: string | null
          member_no?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string | null
          state?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stock_movements: {
        Row: {
          created_at: string
          created_by: string | null
          delivery_order_id: string | null
          id: string
          movement_type: string
          order_item_id: string | null
          quantity_changed: number
          reference_id: string | null
          reference_type: string | null
          remarks: string | null
          stock_after: number
          stock_before: number
          stock_summary_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          delivery_order_id?: string | null
          id?: string
          movement_type: string
          order_item_id?: string | null
          quantity_changed: number
          reference_id?: string | null
          reference_type?: string | null
          remarks?: string | null
          stock_after: number
          stock_before: number
          stock_summary_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          delivery_order_id?: string | null
          id?: string
          movement_type?: string
          order_item_id?: string | null
          quantity_changed?: number
          reference_id?: string | null
          reference_type?: string | null
          remarks?: string | null
          stock_after?: number
          stock_before?: number
          stock_summary_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_delivery_order_id_fkey"
            columns: ["delivery_order_id"]
            isOneToOne: false
            referencedRelation: "delivery_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_invoice_mismatch"
            referencedColumns: ["order_item_id"]
          },
          {
            foreignKeyName: "stock_movements_order_item_id_fkey"
            columns: ["order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_movements_stock_summary_id_fkey"
            columns: ["stock_summary_id"]
            isOneToOne: false
            referencedRelation: "stock_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_reservations: {
        Row: {
          buyer_id: string
          created_at: string
          expires_at: string
          id: string
          product_id: string
          quantity: number
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          expires_at: string
          id?: string
          product_id: string
          quantity: number
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          expires_at?: string
          id?: string
          product_id?: string
          quantity?: number
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_reservations_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      stock_summary: {
        Row: {
          created_at: string
          current_qty: number
          id: string
          location_id: string | null
          product_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_qty?: number
          id?: string
          location_id?: string | null
          product_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_qty?: number
          id?: string
          location_id?: string | null
          product_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_stock_summary_location"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_summary_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_summary_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      subscription_combo_items: {
        Row: {
          combo_id: string
          created_at: string
          id: string
          quantity: number
          subscription_id: string
        }
        Insert: {
          combo_id: string
          created_at?: string
          id?: string
          quantity?: number
          subscription_id: string
        }
        Update: {
          combo_id?: string
          created_at?: string
          id?: string
          quantity?: number
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_combo_items_combo_id_fkey"
            columns: ["combo_id"]
            isOneToOne: false
            referencedRelation: "subscription_combos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_combo_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_combos: {
        Row: {
          amount: number
          can_renew: boolean
          created_at: string
          description: string | null
          duration_months: number
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          can_renew?: boolean
          created_at?: string
          description?: string | null
          duration_months?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          can_renew?: boolean
          created_at?: string
          description?: string | null
          duration_months?: number
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          can_provide_seller_credit: boolean
          can_renew: boolean
          created_at: string | null
          description: string | null
          digital_banner_placement: string | null
          digital_banner_placements:
            | Database["public"]["Enums"]["digital_banner_placement"][]
            | null
          duration_months: number
          features: string | null
          id: string
          max_banners: number | null
          max_products: number | null
          name: string
          reminder_payment_to_buyers: boolean
          reporting: Database["public"]["Enums"]["subscription_reporting"][]
          status: Database["public"]["Enums"]["subscription_status"]
          type: Database["public"]["Enums"]["subscription_type"]
          updated_at: string | null
        }
        Insert: {
          amount: number
          can_provide_seller_credit?: boolean
          can_renew?: boolean
          created_at?: string | null
          description?: string | null
          digital_banner_placement?: string | null
          digital_banner_placements?:
            | Database["public"]["Enums"]["digital_banner_placement"][]
            | null
          duration_months: number
          features?: string | null
          id?: string
          max_banners?: number | null
          max_products?: number | null
          name: string
          reminder_payment_to_buyers?: boolean
          reporting?: Database["public"]["Enums"]["subscription_reporting"][]
          status?: Database["public"]["Enums"]["subscription_status"]
          type?: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string | null
        }
        Update: {
          amount?: number
          can_provide_seller_credit?: boolean
          can_renew?: boolean
          created_at?: string | null
          description?: string | null
          digital_banner_placement?: string | null
          digital_banner_placements?:
            | Database["public"]["Enums"]["digital_banner_placement"][]
            | null
          duration_months?: number
          features?: string | null
          id?: string
          max_banners?: number | null
          max_products?: number | null
          name?: string
          reminder_payment_to_buyers?: boolean
          reporting?: Database["public"]["Enums"]["subscription_reporting"][]
          status?: Database["public"]["Enums"]["subscription_status"]
          type?: Database["public"]["Enums"]["subscription_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      supplier_brand_profiles: {
        Row: {
          admin_comments: string | null
          approval_status: string
          brand_description: string
          brand_name: string
          brand_story: string | null
          created_at: string | null
          id: string
          logo_url: string
          rejected_reason: string | null
          seller_profile_id: string
          seller_subscription_id: string | null
          social_media: Json | null
          updated_at: string | null
          website_url: string | null
        }
        Insert: {
          admin_comments?: string | null
          approval_status?: string
          brand_description: string
          brand_name: string
          brand_story?: string | null
          created_at?: string | null
          id?: string
          logo_url: string
          rejected_reason?: string | null
          seller_profile_id: string
          seller_subscription_id?: string | null
          social_media?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Update: {
          admin_comments?: string | null
          approval_status?: string
          brand_description?: string
          brand_name?: string
          brand_story?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string
          rejected_reason?: string | null
          seller_profile_id?: string
          seller_subscription_id?: string | null
          social_media?: Json | null
          updated_at?: string | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_brand_profiles_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: true
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_brand_profiles_seller_subscription_id_fkey"
            columns: ["seller_subscription_id"]
            isOneToOne: false
            referencedRelation: "seller_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          category: string | null
          chat_room_id: string | null
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          priority: string | null
          resolution_notes: string | null
          resolved_at: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          category?: string | null
          chat_room_id?: string | null
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          category?: string | null
          chat_room_id?: string | null
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          priority?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_chat_room_id_fkey"
            columns: ["chat_room_id"]
            isOneToOne: false
            referencedRelation: "chat_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      system_documentation: {
        Row: {
          created_at: string | null
          description: string
          example_usage: string | null
          id: string
          module_name: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          example_usage?: string | null
          id?: string
          module_name: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          example_usage?: string | null
          id?: string
          module_name?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          description: string | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          description?: string | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          description?: string | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: []
      }
      temp_bulk_purchase_orders_import: {
        Row: {
          created_at: string | null
          legacy_id: number | null
          legacy_supplier_id: number | null
          notes: string | null
          supplier_name: string | null
          total_amount_cents: number | null
          total_orders_count: number | null
          updated_at: string | null
          warehouse_id: number | null
          warehouse_name: string | null
          week: string | null
        }
        Insert: {
          created_at?: string | null
          legacy_id?: number | null
          legacy_supplier_id?: number | null
          notes?: string | null
          supplier_name?: string | null
          total_amount_cents?: number | null
          total_orders_count?: number | null
          updated_at?: string | null
          warehouse_id?: number | null
          warehouse_name?: string | null
          week?: string | null
        }
        Update: {
          created_at?: string | null
          legacy_id?: number | null
          legacy_supplier_id?: number | null
          notes?: string | null
          supplier_name?: string | null
          total_amount_cents?: number | null
          total_orders_count?: number | null
          updated_at?: string | null
          warehouse_id?: number | null
          warehouse_name?: string | null
          week?: string | null
        }
        Relationships: []
      }
      temp_purchase_order_items_import: {
        Row: {
          barcode: string | null
          item_id: string | null
          legacy_order_number: string | null
          legacy_purchase_order_id: number | null
          product_name: string | null
          quantity: number | null
          supplier_code: string | null
          total_price_cents: number | null
          unit_price_cents: number | null
        }
        Insert: {
          barcode?: string | null
          item_id?: string | null
          legacy_order_number?: string | null
          legacy_purchase_order_id?: number | null
          product_name?: string | null
          quantity?: number | null
          supplier_code?: string | null
          total_price_cents?: number | null
          unit_price_cents?: number | null
        }
        Update: {
          barcode?: string | null
          item_id?: string | null
          legacy_order_number?: string | null
          legacy_purchase_order_id?: number | null
          product_name?: string | null
          quantity?: number | null
          supplier_code?: string | null
          total_price_cents?: number | null
          unit_price_cents?: number | null
        }
        Relationships: []
      }
      ticket_comments: {
        Row: {
          attachment_filename: string | null
          attachment_size: number | null
          attachment_url: string | null
          author_id: string
          comment: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
          updated_at: string | null
        }
        Insert: {
          attachment_filename?: string | null
          attachment_size?: number | null
          attachment_url?: string | null
          author_id: string
          comment: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id: string
          updated_at?: string | null
        }
        Update: {
          attachment_filename?: string | null
          attachment_size?: number | null
          attachment_url?: string | null
          author_id?: string
          comment?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          after_amt: number
          amount: number
          angkasa_after: number | null
          angkasa_before: number | null
          before_amt: number
          created_at: string | null
          credit_application_id: string | null
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          reference_id: string | null
          reference_type: string | null
          seller_id: string | null
          seller_name: string | null
          status: string
          transaction_type: string
          trx_id: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          after_amt: number
          amount: number
          angkasa_after?: number | null
          angkasa_before?: number | null
          before_amt: number
          created_at?: string | null
          credit_application_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          reference_id?: string | null
          reference_type?: string | null
          seller_id?: string | null
          seller_name?: string | null
          status: string
          transaction_type: string
          trx_id?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          after_amt?: number
          amount?: number
          angkasa_after?: number | null
          angkasa_before?: number | null
          before_amt?: number
          created_at?: string | null
          credit_application_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          reference_id?: string | null
          reference_type?: string | null
          seller_id?: string | null
          seller_name?: string | null
          status?: string
          transaction_type?: string
          trx_id?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_credit_application_id_fkey"
            columns: ["credit_application_id"]
            isOneToOne: false
            referencedRelation: "credit_applications"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_tokens: {
        Row: {
          created_at: string | null
          fcm_token: string
          id: string
          is_active: boolean
          platform: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fcm_token: string
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fcm_token?: string
          id?: string
          is_active?: boolean
          platform?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      warehouse_purchase_lines: {
        Row: {
          created_at: string
          id: string
          principal_product_id: string
          purchase_id: string
          qty_ordered: number
          qty_received: number
          unit_cost: number
          updated_at: string
          warehouse_product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          principal_product_id: string
          purchase_id: string
          qty_ordered: number
          qty_received?: number
          unit_cost?: number
          updated_at?: string
          warehouse_product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          principal_product_id?: string
          purchase_id?: string
          qty_ordered?: number
          qty_received?: number
          unit_cost?: number
          updated_at?: string
          warehouse_product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_purchase_lines_principal_product_id_fkey"
            columns: ["principal_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_purchase_lines_principal_product_id_fkey"
            columns: ["principal_product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "warehouse_purchase_lines_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "warehouse_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_purchase_lines_warehouse_product_id_fkey"
            columns: ["warehouse_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_purchase_lines_warehouse_product_id_fkey"
            columns: ["warehouse_product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      warehouse_purchases: {
        Row: {
          created_at: string
          id: string
          principal_seller_id: string
          status: string
          updated_at: string
          warehouse_seller_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          principal_seller_id: string
          status?: string
          updated_at?: string
          warehouse_seller_id: string
        }
        Update: {
          created_at?: string
          id?: string
          principal_seller_id?: string
          status?: string
          updated_at?: string
          warehouse_seller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_purchases_principal_seller_id_fkey"
            columns: ["principal_seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_purchases_warehouse_seller_id_fkey"
            columns: ["warehouse_seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      zone_cities: {
        Row: {
          city_id: string
          created_at: string
          id: string
          zone_id: string
        }
        Insert: {
          city_id: string
          created_at?: string
          id?: string
          zone_id: string
        }
        Update: {
          city_id?: string
          created_at?: string
          id?: string
          zone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "zone_cities_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "zone_cities_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
        ]
      }
      zones: {
        Row: {
          created_at: string | null
          id: string
          name: string
          state: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          state: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          state?: string
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      banner_approvals_view: {
        Row: {
          admin_comments: string | null
          approval_status:
            | Database["public"]["Enums"]["banner_approval_status"]
            | null
          approved_at: string | null
          banner_description: string | null
          banner_image_url: string | null
          banner_placement_position:
            | Database["public"]["Enums"]["digital_banner_placement"][]
            | null
          banner_title: string | null
          campaign_end_date: string | null
          campaign_start_date: string | null
          id: string | null
          rejected_reason: string | null
          seller_email: string | null
          seller_name: string | null
          seller_phone: string | null
          seller_profile_id: string | null
          seller_subscription_id: string | null
          subscription_created_at: string | null
          subscription_id: string | null
          subscription_status: string | null
          target_audience: string | null
          updated_at: string | null
          uploaded_at: string | null
          zone_id: string | null
          zone_name: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_banner_uploads_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_banner_uploads_seller_subscription_id_fkey"
            columns: ["seller_subscription_id"]
            isOneToOne: false
            referencedRelation: "seller_subscriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "digital_banner_uploads_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "zones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_subscriptions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profile_approvals_view: {
        Row: {
          admin_comments: string | null
          approval_status: string | null
          brand_description: string | null
          brand_name: string | null
          brand_story: string | null
          created_at: string | null
          id: string | null
          logo_url: string | null
          rejected_reason: string | null
          seller_email: string | null
          seller_name: string | null
          seller_phone: string | null
          seller_profile_id: string | null
          seller_subscription_id: string | null
          social_media: Json | null
          subscription_status: string | null
          updated_at: string | null
          website_url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_brand_profiles_seller_profile_id_fkey"
            columns: ["seller_profile_id"]
            isOneToOne: true
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "supplier_brand_profiles_seller_subscription_id_fkey"
            columns: ["seller_subscription_id"]
            isOneToOne: false
            referencedRelation: "seller_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      buyer_ownership_requests_view: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          approved_by: string | null
          business_name: string | null
          buyer_id: string | null
          buyer_profile_email: string | null
          buyer_profile_id: string | null
          created_at: string | null
          current_user_id: string | null
          id: string | null
          is_approved: boolean | null
          new_user_email: string | null
          new_user_id: string | null
          phone: string | null
          previous_user_id: string | null
          reason: string | null
          request_reason: string | null
          requested_by_email: string | null
          status: string | null
          transferred_by: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "buyer_ownership_transfers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "admin_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_ownership_transfers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "buyers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "buyer_ownership_transfers_buyer_profile_id_fkey"
            columns: ["buyer_profile_id"]
            isOneToOne: false
            referencedRelation: "buyer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_balances_view: {
        Row: {
          approved_amount: number | null
          available_amount: number | null
          buyer_id: string | null
          credit_type: Database["public"]["Enums"]["credit_type"] | null
          last_transaction_date: string | null
          seller_id: string | null
          seller_name: string | null
          status: string | null
          summary_id: string | null
          used_amount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "credit_transaction_summary_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      gl_cashbook_view: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          book: string | null
          created_at: string | null
          credit: number | null
          debit: number | null
          description: string | null
          entry_date: string | null
          entry_id: string | null
          is_cash: boolean | null
          line_id: string | null
          meta: Json | null
          ref: Json | null
          signed_amount: number | null
          source: string | null
        }
        Relationships: []
      }
      gl_journal_lines_view: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          book: string | null
          created_at: string | null
          credit: number | null
          debit: number | null
          description: string | null
          entry_date: string | null
          entry_id: string | null
          is_cash: boolean | null
          line_id: string | null
          meta: Json | null
          ref: Json | null
          signed_amount: number | null
          source: string | null
        }
        Relationships: []
      }
      gl_trial_balance_view: {
        Row: {
          account_code: string | null
          account_name: string | null
          account_type: string | null
          book: string | null
          net_balance: number | null
          total_credit: number | null
          total_debit: number | null
        }
        Relationships: []
      }
      monthly_stock_analytics: {
        Row: {
          avg_daily_usage: number | null
          closing_qty: number | null
          current_day: number | null
          current_qty: number | null
          days_in_month: number | null
          days_with_sales: number | null
          location_description: string | null
          location_id: string | null
          location_name: string | null
          month_end: string | null
          month_start: string | null
          opening_qty: number | null
          product_id: string | null
          product_name: string | null
          projected_monthly_usage: number | null
          total_in: number | null
          total_out: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_stock_summary_location"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_summary_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_stock_summary_product"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
          {
            foreignKeyName: "stock_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_summary_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      order_invoice_mismatch: {
        Row: {
          finalized_qty: number | null
          invoiced_qty: number | null
          order_id: string | null
          order_item_id: string | null
          order_number: string | null
          ordered_qty: number | null
          product_id: string | null
          product_name: string | null
          status: string | null
          total_price: number | null
          unit_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stock_availability"
            referencedColumns: ["product_id"]
          },
        ]
      }
      shared_product_images: {
        Row: {
          barcode: string | null
          cover_image_url: string | null
          product_name: string | null
        }
        Relationships: []
      }
      stock_availability: {
        Row: {
          available_stock: number | null
          product_id: string | null
          product_name: string | null
          seller_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "seller_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_daily_hourly_browsing_trail: {
        Row: {
          browsing_date: string | null
          browsing_hour: number | null
          event_types: string[] | null
          first_event_at: string | null
          hour_end: string | null
          hour_start: string | null
          last_event_at: string | null
          pages_visited: string[] | null
          products_viewed: number | null
          sellers_viewed: number | null
          session_ids: string[] | null
          total_events: number | null
          unique_sessions: number | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_bundle_products_to_cart: {
        Args: { p_buyer_id: string; p_promotion_id: string }
        Returns: Json
      }
      add_free_products_to_cart: {
        Args: { p_buyer_id: string; p_promotion_id: string }
        Returns: Json
      }
      add_missing_prerequisites_to_cart: {
        Args: { p_buyer_id: string; p_promotion_id: string }
        Returns: Json
      }
      add_promotion_product_to_cart: {
        Args: {
          p_buyer_id: string
          p_product_id: string
          p_promotion_id: string
          p_quantity: number
        }
        Returns: Json
      }
      add_to_cart: {
        Args: { p_buyer_id: string; p_product_id: string; p_quantity: number }
        Returns: Json
      }
      adjust_buyer_inventory: {
        Args: {
          p_buyer_location_id: string
          p_created_by?: string
          p_product_id: string
          p_quantity_change: number
          p_remarks?: string
        }
        Returns: undefined
      }
      admin_execute_query: { Args: { query_text: string }; Returns: Json }
      admin_insert: {
        Args: { data: Json; table_name: string }
        Returns: string
      }
      admin_update: {
        Args: { data: Json; record_id: string; table_name: string }
        Returns: boolean
      }
      approve_banner: {
        Args: { p_admin_notes?: string; p_banner_id: string }
        Returns: boolean
      }
      approve_batch: { Args: { upload_id: string }; Returns: number }
      approve_brand_profile: {
        Args: { p_admin_notes?: string; p_brand_profile_id: string }
        Returns: boolean
      }
      approve_buyer_ownership_transfer: {
        Args: { p_admin_notes?: string; p_request_id: string }
        Returns: Json
      }
      approve_jimatbiz_credit: {
        Args: {
          p_application_id: string
          p_approved_amount: number
          p_approved_by: string
        }
        Returns: boolean
      }
      approve_product: { Args: { upload_product_id: string }; Returns: string }
      assign_ticket: {
        Args: { p_assigned_to?: string; p_ticket_id: string }
        Returns: boolean
      }
      audit_and_fix_missing_credit_notes: {
        Args: { p_buyer_id?: string; p_dry_run?: boolean; p_user_id: string }
        Returns: {
          action_taken: string
          buyer_id: string
          buyer_name: string
          error_message: string
          order_id: string
          order_number: string
          payment_method: string
          refund_amount: number
        }[]
      }
      backfill_angkasa_running_balance: {
        Args: { p_recompute_all?: boolean; p_start_balance?: number }
        Returns: number
      }
      backfill_angkasa_running_balance_batch: {
        Args: { p_batch_size?: number; p_start_balance?: number }
        Returns: {
          last_row_created_at: string
          last_row_id: string
          next_balance: number
          processed_count: number
        }[]
      }
      backfill_angkasa_running_balance_from_batch: {
        Args: {
          p_batch_size?: number
          p_start_balance?: number
          p_start_date: string
        }
        Returns: {
          last_row_created_at: string
          last_row_id: string
          next_balance: number
          processed_count: number
        }[]
      }
      calculate_all_monthly_seller_scores: {
        Args: { p_year_month: string }
        Returns: number
      }
      calculate_monthly_fast_moving_products: {
        Args: never
        Returns: undefined
      }
      calculate_monthly_seller_score: {
        Args: { p_seller_id: string; p_year_month: string }
        Returns: undefined
      }
      calculate_seller_score: {
        Args: { p_seller_id: string }
        Returns: undefined
      }
      cancel_order_with_stock_option: {
        Args: {
          p_cancellation_reason: string
          p_cancelled_by: string
          p_order_id: string
          p_restore_stock: boolean
        }
        Returns: Json
      }
      check_credit_balance: {
        Args: { p_buyer_id: string; p_seller_id?: string }
        Returns: {
          approved_amount: number
          available_amount: number
          credit_type: string
          has_discrepancy: boolean
          last_transaction_date: string
          last_transaction_id: string
          stored_approved_amount: number
          stored_available_amount: number
          stored_used_amount: number
          used_amount: number
        }[]
      }
      check_stock_alignment_summary: {
        Args: never
        Returns: {
          metric: string
          status: string
          value: string
        }[]
      }
      check_stock_availability: {
        Args: { p_product_id: string; p_quantity: number }
        Returns: boolean
      }
      checkout_cart: {
        Args: { p_buyer_id: string; p_payment_method: string }
        Returns: Json
      }
      cleanup_expired_reservations: { Args: never; Returns: number }
      cleanup_old_browsing_history: { Args: never; Returns: undefined }
      cleanup_old_tokens: { Args: never; Returns: undefined }
      cleanup_stock_data_integrity: {
        Args: { batch_size?: number; seller_id_filter?: string }
        Returns: {
          analytics_refreshed: boolean
          initial_movements_created: number
          movement_details_created: number
          orphaned_movements_removed: number
          orphaned_records_cleaned: number
        }[]
      }
      clone_order_items_products_to_warehouse: {
        Args: { p_days?: number; p_target_warehouse_seller_id: string }
        Returns: {
          new_product_id: string
          source_product_id: string
        }[]
      }
      clone_products_by_ids_to_warehouse: {
        Args: {
          p_default_lead_time?: number
          p_product_ids: string[]
          p_target_warehouse_seller_id: string
        }
        Returns: {
          new_product_id: string
          source_product_id: string
        }[]
      }
      create_admin_credit_adjustment:
        | {
            Args: {
              p_adjustment_amount: number
              p_buyer_id: string
              p_credit_type: Database["public"]["Enums"]["credit_type"]
              p_reason?: string
              p_seller_profile_id?: string
              p_send_email?: boolean
            }
            Returns: string
          }
        | {
            Args: {
              p_adjustment_amount: number
              p_buyer_id: string
              p_credit_type: string
              p_reason?: string
              p_seller_profile_id?: string
              p_send_email?: boolean
            }
            Returns: string
          }
      create_admin_credit_adjustment_allow_orphan: {
        Args: {
          p_adjustment_amount: number
          p_buyer_id: string
          p_credit_type: string
          p_reason?: string
          p_seller_profile_id?: string
          p_send_email?: boolean
        }
        Returns: string
      }
      create_admin_credit_adjustment_simple: {
        Args: {
          p_adjustment_amount: number
          p_buyer_id: string
          p_credit_type: string
          p_reason?: string
          p_seller_profile_id?: string
          p_send_email?: boolean
        }
        Returns: string
      }
      create_admin_credit_adjustment_with_timestamps: {
        Args: {
          p_adjustment_amount: number
          p_approved_at?: string
          p_buyer_id: string
          p_created_at?: string
          p_credit_type: string
          p_reason?: string
          p_seller_profile_id?: string
          p_send_email?: boolean
        }
        Returns: string
      }
      create_chat_room_with_type: {
        Args: {
          p_admin_profile_id?: string
          p_chat_type: string
          p_other_user_id?: string
          p_profile_id: string
        }
        Returns: string
      }
      create_credit_application: {
        Args: {
          p_application_id: string
          p_credit_type: string
          p_order_proofs: string[]
          p_payment_proofs: string[]
          p_seller_name: string
          p_user_id: string
        }
        Returns: undefined
      }
      create_credit_refunds_for_cancelled_orders: {
        Args: { p_buyer_id?: string }
        Returns: {
          buyer_id: string
          credit_application_id: string
          refund_transactions_created: number
          total_refund_amount: number
        }[]
      }
      create_legacy_buyer_auth: {
        Args: {
          p_buyer_id: string
          p_email: string
          p_first_name: string
          p_last_name: string
          p_password: string
        }
        Returns: Json
      }
      create_multi_seller_order: {
        Args: {
          p_buyer_email: string
          p_buyer_id: string
          p_buyer_name: string
          p_cart_items: Json
          p_jimatcoins_amount?: number
          p_payment_method: string
          p_user_id: string
        }
        Returns: Json
      }
      create_refund_and_process_credit: {
        Args: { p_order_id: string; p_user_id: string }
        Returns: {
          credit_processed: boolean
          items_refunded: number
          message: string
          order_number: string
          refund_amount: number
          refund_request_id: string
        }[]
      }
      create_refund_for_quantity_differences: {
        Args: { p_order_id: string }
        Returns: {
          items_refunded: number
          order_number: string
          refund_amount: number
          refund_request_id: string
        }[]
      }
      create_seller_subscription: {
        Args: {
          billplz_bill_id: string
          billplz_collection_id: string
          end_date: string
          paid_amount: number
          remarks?: string
          seller_lead_id?: string
          seller_profile_id: string
          start_date: string
          subscription_id_text: string
          user_email: string
        }
        Returns: Json
      }
      create_subscription_combo_with_items: {
        Args: {
          p_amount: number
          p_can_renew: boolean
          p_description: string
          p_duration_months: number
          p_image_url: string
          p_is_active: boolean
          p_items: Json
          p_name: string
        }
        Returns: string
      }
      create_ticket_from_chat: {
        Args: {
          p_category?: string
          p_chat_room_id: string
          p_description?: string
          p_priority?: string
          p_title: string
        }
        Returns: string
      }
      create_unmapped_entities: {
        Args: never
        Returns: {
          created_buyers: number
          created_sellers: number
        }[]
      }
      daily_check_expiring_subscription: {
        Args: never
        Returns: {
          details: Json
          emails_failed: number
          emails_sent: number
          run_timestamp: string
          total_checked: number
        }[]
      }
      debug_credit_application_rejection: {
        Args: { p_application_id: string; p_rejection_reason: string }
        Returns: string
      }
      deduct_stock_for_orders: {
        Args: { p_order_ids: string[] }
        Returns: Json
      }
      disable_transaction_balance_trigger: { Args: never; Returns: boolean }
      disable_validate_credit_transaction_trigger: {
        Args: never
        Returns: string
      }
      enable_transaction_balance_trigger: { Args: never; Returns: boolean }
      enable_validate_credit_transaction_trigger: {
        Args: never
        Returns: string
      }
      ensure_seller_default_locations: {
        Args: never
        Returns: {
          action_taken: string
          location_id: string
          location_name: string
          seller_id: string
          seller_name: string
        }[]
      }
      ensure_seller_warehouse_setup: {
        Args: { batch_size?: number }
        Returns: {
          default_locations_set: number
          locations_created: number
          orphaned_references_fixed: number
          sellers_processed: number
        }[]
      }
      execute_sql: { Args: { query: string }; Returns: Json }
      find_orders_needing_refund:
        | {
            Args: never
            Returns: {
              already_has_refund: boolean
              difference: number
              invoice_total: number
              items_not_delivered: number
              order_id: string
              order_number: string
              order_total: number
            }[]
          }
        | {
            Args: { p_limit?: number }
            Returns: {
              already_has_refund: boolean
              difference: number
              invoice_total: number
              items_not_delivered: number
              order_id: string
              order_number: string
              order_total: number
            }[]
          }
        | {
            Args: { p_buyer_id?: string; p_limit?: number; p_offset?: number }
            Returns: {
              already_has_refund: boolean
              difference: number
              invoice_total: number
              items_not_delivered: number
              order_id: string
              order_number: string
              order_total: number
              total_count: number
            }[]
          }
      find_orders_needing_refund_by_buyer: {
        Args: { p_buyer_id?: string }
        Returns: {
          already_has_refund: boolean
          difference: number
          invoice_total: number
          items_not_delivered: number
          order_id: string
          order_number: string
          order_total: number
        }[]
      }
      fix_all_order_finalized_qty: {
        Args: never
        Returns: {
          fixed_items: Json
          order_number: string
          total_fixed: number
        }[]
      }
      fix_buyer_purchase_order_totals: {
        Args: never
        Returns: {
          total_amount_corrected: number
          updated_count: number
        }[]
      }
      fix_jimatbiz_legacy_housekeeping: { Args: never; Returns: Json }
      fix_order_finalized_qty: {
        Args: { p_order_id: string }
        Returns: {
          new_finalized_qty: number
          old_finalized_qty: number
          order_item_id: string
          ordered_qty: number
          product_name: string
        }[]
      }
      fix_order_seller_id_mismatch: {
        Args: never
        Returns: {
          errors_count: number
          execution_summary: Json
          multi_seller_orders_fixed: number
          single_seller_orders_fixed: number
          total_orders_processed: number
        }[]
      }
      fix_stock_location_mismatches: {
        Args: {
          dry_run?: boolean
          limit_fixes?: number
          specific_product_id?: string
        }
        Returns: {
          action_type: string
          message: string
          new_location_id: string
          new_location_name: string
          old_location_id: string
          old_location_name: string
          product_id: string
          product_name: string
          seller_id: string
          seller_name: string
          status: string
          stock_quantity: number
        }[]
      }
      fix_transaction_balance_amounts: {
        Args: { p_buyer_id?: string; p_credit_application_id?: string }
        Returns: {
          fixed_transactions: number
          processed_buyers: number
        }[]
      }
      gdpr_delete_user_data: { Args: { target_user_id: string }; Returns: Json }
      generate_credit_discrepancy_report: {
        Args: never
        Returns: {
          approved_difference: number
          available_difference: number
          buyer_id: string
          buyer_name: string
          calculated_approved: number
          calculated_available: number
          calculated_used: number
          credit_type: string
          last_transaction_date: string
          seller_id: string
          seller_name: string
          stored_approved: number
          stored_available: number
          stored_used: number
          used_difference: number
        }[]
      }
      generate_invoices: {
        Args: { p_order_ids: string[]; p_seller_id: string }
        Returns: string[]
      }
      generate_referral_code: { Args: never; Returns: string }
      generate_seller_sms_otp: {
        Args: { p_phone_number: string; p_seller_profile_id: string }
        Returns: string
      }
      generate_settlement_payment_reference: { Args: never; Returns: string }
      generate_signup_token: {
        Args: { buyer_id_param: string; email_param: string }
        Returns: string
      }
      generate_simple_embedding: {
        Args: { text_input: string }
        Returns: string
      }
      generate_weekly_settlements: { Args: never; Returns: undefined }
      get_active_subscription_by_type: {
        Args: {
          seller_profile_id_param: string
          subscription_type_param: Database["public"]["Enums"]["subscription_type"]
        }
        Returns: {
          end_date: string
          id: string
          seller_profile_id: string
          status: string
          subscription_id: string
          subscription_name: string
          subscription_type: Database["public"]["Enums"]["subscription_type"]
        }[]
      }
      get_alerts_notifications: {
        Args: never
        Returns: {
          alert_message: string
          alert_type: string
          buyer_id: string
          buyer_name: string
          created_at: string
          metadata: Json
          priority: string
          seller_id: string
          seller_name: string
        }[]
      }
      get_all_featured_products: {
        Args: never
        Returns: {
          category: string
          cover_image_url: string
          feature_order: number
          featured_since: string
          normal_price: number
          product_id: string
          product_name: string
          promotion_price: number
          seller_id: string
          seller_name: string
          sub_category: string
        }[]
      }
      get_angkasa_credit_invoices: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          angkasa_fee_paid_date: string
          created_at: string
          id: string
          invoice_number: string
          order_id: string
          payment_date: string
          payment_status: string
          seller_settlement_date: string
          total_amount: number
          total_count: number
        }[]
      }
      get_angkasa_monthly_statement: {
        Args: { p_end: string; p_start: string }
        Returns: {
          amount_collected: number
          angkasa_share: number
          balance: number
          buyer_name: string
          cash_delta: number
          credit_fee: number
          credit_provided: number
          description: string
          entry_date: string
          jimatbiz_payment_to_angkasa: number
          jimatbiz_share: number
          late_fee: number
          order_id: string
          order_number: string
          refunds: number
          remittance_date: string
          remittance_status: string
          transaction_type: string
        }[]
      }
      get_available_credit:
        | {
            Args: {
              p_buyer_id: string
              p_credit_type?: Database["public"]["Enums"]["credit_type"]
              p_seller_id?: string
            }
            Returns: number
          }
        | {
            Args: {
              p_buyer_id: string
              p_credit_type?: string
              p_seller_id?: string
            }
            Returns: number
          }
      get_available_stock: { Args: { p_product_id: string }; Returns: number }
      get_best_sellers_featured: {
        Args: { limit_count?: number; offset_count?: number }
        Returns: {
          category: string
          cover_image_url: string
          id: string
          name: string
          normal_price: number
          promotion_price: number
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          stock_level: number
          sub_category: string
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_big_buyers: {
        Args: {
          p_limit?: number
          p_month?: number
          p_offset?: number
          p_year?: number
        }
        Returns: {
          business_name: string
          buyer_id: string
          created_at: string
          email: string
          phone: string
          purchase_order_number: string
          total_amount: number
          total_count: number
        }[]
      }
      get_bundle_promotion_details: {
        Args: { p_buyer_id: string; p_promotion_id: string }
        Returns: Json
      }
      get_buy_x_free_y_promotion_details: {
        Args: { p_buyer_id: string; p_promotion_id: string }
        Returns: Json
      }
      get_buyer_admin_chats: {
        Args: never
        Returns: {
          admin_id: string
          admin_name: string
          buyer_id: string
          buyer_name: string
          chat_id: string
          created_at: string
          last_message_at: string
          status: string
          total_messages: number
        }[]
      }
      get_buyer_dashboard_data: {
        Args: { buyer_user_id: string }
        Returns: Json
      }
      get_buyer_engagement_metrics: {
        Args: {
          p_end_date?: string
          p_period_type?: string
          p_start_date?: string
        }
        Returns: {
          abandoned_cart_count: number
          abandoned_cart_rate: number
          add_to_cart_count: number
          buyer_login_count: number
          category_visit_count: number
          checkout_count: number
          period_label: string
          period_start: string
          product_click_count: number
        }[]
      }
      get_buyer_financial_stats: { Args: { p_buyer_id: string }; Returns: Json }
      get_buyer_orders: {
        Args: { buyer_user_id: string }
        Returns: {
          buyer_id: string
          created_at: string
          id: string
          items: Json
          shipping_address: string
          status: string
          total_amount: number
        }[]
      }
      get_buyer_payment_score: { Args: { p_buyer_id: string }; Returns: Json }
      get_buyer_performance_metrics: {
        Args: { p_month?: number; p_year?: number }
        Returns: {
          big_buyers: number
          inactive_buyers_current_month: number
          medium_buyers: number
          new_buyers_this_month: number
          returning_buyers: number
          small_buyers: number
          total_active_buyers: number
        }[]
      }
      get_buyer_recent_history: {
        Args: { p_action_type?: string; p_buyer_id: string; p_limit?: number }
        Returns: {
          action_type: string
          created_at: string
          id: string
          product_category: string
          product_cover_image_url: string
          product_id: string
          product_name: string
          product_price: number
          product_promotion_price: number
          product_subcategory: string
          quantity: number
          seller_id: string
        }[]
      }
      get_buyer_seller_chats_per_seller: {
        Args: never
        Returns: {
          active_chats: number
          closed_chats: number
          last_chat_date: string
          seller_id: string
          seller_name: string
          total_chats: number
          total_messages: number
        }[]
      }
      get_buyer_stock_movement_history: {
        Args: { p_buyer_id: string; p_limit?: number; p_product_id?: string }
        Returns: {
          movement_date: string
          movement_type: string
          order_number: string
          product_name: string
          quantity_changed: number
          reference_type: string
          remarks: string
          stock_after: number
          stock_before: number
        }[]
      }
      get_buyer_transaction_insights: {
        Args: { p_month?: number; p_year?: number }
        Returns: {
          average_buyer_spend: number
          average_order_frequency_per_month: number
          total_b2b_sales: number
        }[]
      }
      get_buyers_with_refund_needed: {
        Args: never
        Returns: {
          buyer_id: string
          buyer_name: string
          orders_count: number
        }[]
      }
      get_cart_contents: {
        Args: { p_buyer_id: string }
        Returns: {
          category: string
          image_url: string
          minimum_order_quantity: number
          product_id: string
          product_name: string
          promotion_price: number
          quantity: number
          seller_id: string
          seller_name: string
          stock_available: number
          sub_category: string
          subtotal: number
          unit_price: number
        }[]
      }
      get_categories_with_counts: {
        Args: never
        Returns: {
          description: string
          id: string
          image_url: string
          name: string
          parent_id: string
          products_count: number
        }[]
      }
      get_cities_for_zones: {
        Args: { zone_ids: string[] }
        Returns: {
          city_id: string
          city_name: string
          zone_id: string
        }[]
      }
      get_communication_helpdesk_summary: {
        Args: never
        Returns: {
          avg_resolution_time_hours: number
          in_progress_tickets: number
          new_tickets: number
          resolved_tickets: number
          total_buyer_admin_chats: number
          total_buyer_seller_chats: number
          total_help_desk_tickets: number
        }[]
      }
      get_credit_application_by_id: {
        Args: { application_id: string }
        Returns: Json
      }
      get_credit_application_details: {
        Args: { p_application_id: string }
        Returns: Json
      }
      get_credit_application_seller: {
        Args: { seller_id: string }
        Returns: {
          application_id: string
          approved_amount: number
          approved_at: string
          approved_by: string
          buyer_business_name: string
          buyer_email: string
          buyer_id: string
          buyer_name: string
          created_at: string
          credit_type: string
          id: string
          rejection_reason: string
          seller_name: string
          seller_profile_id: string
          status: string
          user_id: string
        }[]
      }
      get_credit_applications_for_seller: {
        Args: { seller_id: string }
        Returns: {
          application_id: string
          approved_amount: number
          approved_at: string
          approved_by: string
          buyer_business_name: string
          buyer_email: string
          buyer_id: string
          buyer_name: string
          created_at: string
          credit_type: string
          id: string
          rejection_reason: string
          seller_name: string
          seller_profile_id: string
          status: string
          user_id: string
        }[]
      }
      get_credit_breakdown_by_buyer:
        | {
            Args: never
            Returns: {
              buyer_id: string
              buyer_name: string
              payment_type: string
              total_amount: number
              total_orders: number
            }[]
          }
        | {
            Args: { p_search_text?: string }
            Returns: {
              buyer_id: string
              buyer_name: string
              payment_type: string
              total_amount: number
              total_orders: number
            }[]
          }
      get_credit_management_summary: {
        Args: never
        Returns: {
          total_credit_utilized: number
          total_platform_credit_extended: number
          total_seller_credit_offered: number
        }[]
      }
      get_credit_risk_monitoring: {
        Args: never
        Returns: {
          aging_bucket: string
          buyer_id: string
          buyer_name: string
          credit_limit: number
          credit_used: number
          days_overdue: number
          risk_type: string
          seller_id: string
          seller_name: string
          utilization_percentage: number
        }[]
      }
      get_delivered_qty_for_order_item: {
        Args: { p_order_id: string; p_product_id: string }
        Returns: number
      }
      get_detailed_seller_performance: {
        Args: {
          p_category?: string
          p_limit?: number
          p_offset?: number
          p_sales_performance?: string
          p_subscription_tier?: string
        }
        Returns: {
          assigned_sales_pic: string
          average_order_value: number
          buyer_chats_received: number
          response_rate: number
          seller_credit_limit_offered: number
          seller_credit_used: number
          seller_id: string
          seller_name: string
          subscription_tier: string
          total_count: number
          total_orders: number
          total_sales: number
        }[]
      }
      get_email_template_with_substitutions: {
        Args: { substitutions?: Json; template_id: string }
        Returns: {
          description: string
          expected_keys: string[]
          id: string
          missing_keys: string[]
          name: string
          original_contents: string
          substituted_contents: string
        }[]
      }
      get_fast_moving_analytics_summary: {
        Args: { period_days?: number }
        Returns: {
          avg_quantity_sold_per_product: number
          top_category: string
          top_category_count: number
          total_fast_moving_products: number
          total_quantity_sold_all_fast_moving: number
          total_sellers_with_fast_moving: number
        }[]
      }
      get_fast_moving_cron_status: {
        Args: never
        Returns: {
          is_active: boolean
          job_name: string
          last_calculation_month: string
          next_scheduled_run: string
          schedule: string
          total_products_calculated: number
        }[]
      }
      get_fast_moving_products: {
        Args: { period_days?: number }
        Returns: {
          analysis_period_end: string
          analysis_period_start: string
          category: string
          product_id: string
          product_name: string
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          sub_category: string
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_fast_moving_products_by_category: {
        Args: {
          input_category: string
          limit_count?: number
          period_days?: number
        }
        Returns: {
          product_id: string
          product_name: string
          rank_within_platform: number
          seller_id: string
          seller_name: string
          sub_category: string
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_finance_payout_summary: {
        Args: never
        Returns: {
          outstanding_credit_repayments: number
          total_commission_payables: number
          total_payouts_to_sellers: number
          total_pending_refunds: number
          total_platform_fee_collected: number
        }[]
      }
      get_group_current_seller_score: {
        Args: { p_seller_group_id: string }
        Returns: {
          average_days_late: number
          cancelled_orders: number
          consistency_score: number
          last_calculated_at: string
          late_orders: number
          on_time_fulfillment_rate: number
          on_time_orders: number
          total_orders: number
          weighted_score: number
        }[]
      }
      get_group_seller_profiles: {
        Args: { p_seller_group_id: string }
        Returns: {
          business_name: string
          email: string
          id: string
          phone: string
        }[]
      }
      get_group_sellers_current_scores: {
        Args: { p_seller_group_id: string }
        Returns: {
          average_days_late: number
          business_name: string
          cancelled_orders: number
          consistency_score: number
          last_calculated_at: string
          late_orders: number
          on_time_fulfillment_rate: number
          on_time_orders: number
          seller_id: string
          total_orders: number
          weighted_score: number
        }[]
      }
      get_help_desk_tickets_by_category: {
        Args: never
        Returns: {
          avg_resolution_time_hours: number
          category: string
          in_progress_tickets: number
          new_tickets: number
          resolved_tickets: number
          total_tickets: number
        }[]
      }
      get_highest_margin_products_count: {
        Args: {
          category_filter?: string
          search_query?: string
          semantic_threshold?: number
          subcategory_filter?: string
          use_semantic_search?: boolean
        }
        Returns: number
      }
      get_highest_margin_products_paginated: {
        Args: { limit_count?: number; offset_count?: number }
        Returns: {
          category: string
          cover_image_url: string
          id: string
          margin_per_unit: number
          name: string
          normal_price: number
          promotion_price: number
          seller_id: string
          seller_name: string
          stock_level: number
          sub_category: string
          total_profit: number
          total_quantity_sold: number
          unit_cost: number
        }[]
      }
      get_inactive_buyers_current_month: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          business_name: string
          buyer_id: string
          days_since_last_order: number
          email: string
          last_order_date: string
          phone: string
          total_count: number
          total_orders: number
        }[]
      }
      get_inactive_sellers:
        | {
            Args: { p_limit?: number }
            Returns: {
              business_name: string
              days_since_last_order: number
              email: string
              last_order_date: string
              phone: string
              seller_id: string
              total_orders: number
            }[]
          }
        | {
            Args: { p_limit?: number; p_offset?: number }
            Returns: {
              business_name: string
              days_since_last_order: number
              email: string
              last_order_date: string
              phone: string
              seller_id: string
              total_count: number
              total_orders: number
            }[]
          }
      get_invoice_migration_stats: {
        Args: never
        Returns: {
          migrated_invoices: number
          migrated_line_items: number
          migration_percentage: number
          pending_invoices: number
          total_legacy_invoices: number
          total_legacy_line_items: number
        }[]
      }
      get_invoice_total_by_month: {
        Args: { reporting_year: number }
        Returns: {
          month: number
          total_amount: number
        }[]
      }
      get_invoice_verification_data: {
        Args: never
        Returns: {
          calculated_line_items_total: number
          created_at: string
          external_id: string
          invoice_number: string
          legacy_id: number
          legacy_invoice_id: number
          legacy_outlet_id: number
          legacy_status: string
          line_items: Json
          match_status: string
          order_date: string
          outlet_id: number
          outlet_name: string
          payment_status: string
          public_id: string
          public_invoice_items_total: number
          public_status: string
          retail_purchase_order_id: number
          supplier_name: string
          total_amount: number
        }[]
      }
      get_invoice_verification_data_search: {
        Args: { search_text?: string; status_filter?: string }
        Returns: {
          calculated_line_items_total: number
          created_at: string
          external_id: string
          invoice_number: string
          legacy_id: number
          legacy_invoice_id: number
          legacy_outlet_id: number
          legacy_status: string
          line_items: Json
          match_status: string
          order_date: string
          outlet_id: number
          outlet_name: string
          payment_status: string
          public_id: string
          public_invoice_items_total: number
          public_status: string
          retail_purchase_order_id: number
          supplier_name: string
          total_amount: number
        }[]
      }
      get_invoice_verification_summary: {
        Args: never
        Returns: {
          amount_discrepancies_count: number
          legacy_only_count: number
          matched_count: number
          public_only_count: number
          status_discrepancies_count: number
          total_records: number
        }[]
      }
      get_invoice_verification_yearly_summary: {
        Args: never
        Returns: {
          amount_discrepancies_count: number
          legacy_count: number
          legacy_only_count: number
          legacy_paid_value: number
          legacy_value: number
          matched_count: number
          public_count: number
          public_only_count: number
          public_paid_value: number
          public_value: number
          status_discrepancies_count: number
          year_period: number
        }[]
      }
      get_invoices_by_buyer_po_year:
        | {
            Args: {
              filter_year: number
              page_limit?: number
              page_offset?: number
            }
            Returns: {
              buyer_po_created_at: string
              buyer_po_id: string
              buyer_po_number: string
              invoice_created_at: string
              invoice_id: string
              invoice_items: Json
              invoice_number: string
              invoice_status: string
              invoice_updated_at: string
              legacy_invoice_id: number
              order_id: string
              order_number: string
              payment_status: string
              total_amount: number
            }[]
          }
        | {
            Args: { filter_year: number; record_limit?: number }
            Returns: {
              buyer_po_created_at: string
              buyer_po_id: string
              buyer_po_number: string
              invoice_created_at: string
              invoice_id: string
              invoice_items: Json
              invoice_number: string
              invoice_status: string
              invoice_updated_at: string
              legacy_invoice_id: number
              order_id: string
              order_number: string
              payment_status: string
              total_amount: number
            }[]
          }
      get_invoices_by_year: {
        Args: { filter_year: number; page_limit?: number; page_offset?: number }
        Returns: {
          buyer_po_created_at: string
          buyer_po_id: string
          buyer_po_number: string
          invoice_created_at: string
          invoice_id: string
          invoice_items: Json
          invoice_number: string
          invoice_status: string
          invoice_updated_at: string
          legacy_invoice_id: number
          order_id: string
          order_number: string
          payment_status: string
          total_amount: number
        }[]
      }
      get_invoices_count_by_buyer_po_year: {
        Args: { filter_year: number }
        Returns: number
      }
      get_invoices_count_by_year: {
        Args: { filter_year: number }
        Returns: number
      }
      get_invoices_search: {
        Args: {
          filter_payment_date?: string
          page_no?: number
          page_size?: number
          search_text?: string
        }
        Returns: {
          created_at: string
          id: string
          invoice_number: string
          order: Json
          payment_date: string
          payment_proof_url: string
          payment_status: string
          seller: Json
          seller_id: string
          total_amount: number
          total_count: number
        }[]
      }
      get_jimatbiz_revenue_by_month: {
        Args: never
        Returns: {
          credit_fees: number
          month: number
          online_payment_fees: number
          subscription_fees: number
          total_jimatbiz_revenue: number
          year: number
        }[]
      }
      get_jimatshop_sales_summary: {
        Args: { p_buyer_id: string; p_time_filter: string }
        Returns: Json
      }
      get_latest_monthly_fast_moving_products: {
        Args: never
        Returns: {
          analysis_month: string
          category: string
          product_id: string
          product_name: string
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          sub_category: string
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_legacy_invoices: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_term?: string
          status_filter?: string
        }
        Returns: {
          external_id: string
          grand_total_amount_cents: number
          id: number
          order_date: string
          outlet_name: string
          payment_method: string
          payment_received_date: string
          settlement_status: string
          status: string
          supplier_name: string
        }[]
      }
      get_legacy_invoices_full: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          bulk_invoice_id: number
          credit_fees_in_cents: number
          discounted_amount_cents: number
          external_id: string
          grand_total_amount_cents: number
          id: number
          inserted_at: string
          is_received: boolean
          late_fee_amount_cents: number
          line_items: Json
          order_date: string
          outlet_address: string
          outlet_id: number
          outlet_name: string
          outlet_phone: string
          payment_method: string
          payment_received_date: string
          received_date: string
          remarks: string
          retail_purchase_order_id: number
          settlement_status: string
          status: string
          supplier_address: string
          supplier_brand: string
          supplier_code: string
          supplier_company_name: string
          supplier_email: string
          supplier_name: string
          supplier_phone: string
          updated_at: string
          user_id: number
        }[]
      }
      get_legacy_invoices_summary: {
        Args: { search_term?: string; status_filter?: string }
        Returns: {
          overall_stats: Json
          status_summary: Json
          yearly_summary: Json
        }[]
      }
      get_legacy_invoices_with_count: {
        Args: {
          limit_count?: number
          offset_count?: number
          search_term?: string
          status_filter?: string
        }
        Returns: {
          external_id: string
          grand_total_amount_cents: number
          id: number
          order_date: string
          outlet_name: string
          payment_method: string
          payment_received_date: string
          settlement_status: string
          status: string
          supplier_name: string
          total_count: number
        }[]
      }
      get_local_products_count_with_filters: {
        Args: {
          category_filter?: string
          search_query?: string
          subcategory_filter?: string
        }
        Returns: number
      }
      get_local_products_paginated: {
        Args: {
          category_filter?: string
          limit_count?: number
          offset_count?: number
          search_query?: string
          sort_by?: string
          subcategory_filter?: string
        }
        Returns: {
          category: string
          cover_image_url: string
          discount_percentage: number
          featured_order: number
          id: string
          is_fast_moving: boolean
          is_featured: boolean
          is_recommended: boolean
          name: string
          normal_price: number
          products_sold: number
          promotion_price: number
          seller_id: string
          seller_name: string
          stock_level: number
          sub_category: string
        }[]
      }
      get_medium_buyers: {
        Args: {
          p_limit?: number
          p_month?: number
          p_offset?: number
          p_year?: number
        }
        Returns: {
          business_name: string
          buyer_id: string
          created_at: string
          email: string
          phone: string
          purchase_order_number: string
          total_amount: number
          total_count: number
        }[]
      }
      get_minimart_category_analysis: {
        Args: { p_days_back?: number; p_min_orders?: number }
        Returns: {
          avg_margin_percentage: number
          avg_order_value: number
          category: string
          category_growth_trend: number
          last_order_date: string
          product_count: number
          sub_category: string
          top_selling_product: string
          top_selling_product_orders: number
          total_orders: number
          total_revenue: number
          unique_buyers: number
        }[]
      }
      get_minimart_commonly_ordered_items: {
        Args: {
          p_category_filter?: string
          p_days_back?: number
          p_limit?: number
          p_min_orders?: number
        }
        Returns: {
          avg_order_quantity: number
          category: string
          cover_image_url: string
          current_price: number
          last_ordered_date: string
          margin_percentage: number
          order_frequency_score: number
          popularity_rank: number
          product_id: string
          product_name: string
          retail_price: number
          seller_name: string
          sub_category: string
          total_orders_count: number
          total_quantity_sold: number
          unique_buyers_count: number
        }[]
      }
      get_minimart_regional_recommendations: {
        Args: {
          p_city?: string
          p_days_back?: number
          p_limit?: number
          p_min_regional_orders?: number
          p_state?: string
        }
        Returns: {
          avg_price: number
          category: string
          city_popularity: string
          is_trending: boolean
          product_id: string
          product_name: string
          regional_buyers: number
          regional_orders: number
          regional_preference_score: number
          seller_name: string
          state_popularity: string
          total_quantity: number
        }[]
      }
      get_monthly_seller_score_by_id: {
        Args: { p_seller_id: string; p_year_month: string }
        Returns: {
          average_days_late: number
          business_name: string
          calculated_at: string
          consistency_score: number
          custom_delivery_days: number
          late_orders: number
          month_end_date: string
          month_start_date: string
          on_time_fulfillment_rate: number
          on_time_orders: number
          seller_id: string
          total_orders: number
          weighted_score: number
          year_month: string
        }[]
      }
      get_monthly_seller_scores_ranked: {
        Args: { p_limit?: number; p_offset?: number; p_year_month: string }
        Returns: {
          average_days_late: number
          business_name: string
          calculated_at: string
          consistency_score: number
          custom_delivery_days: number
          late_orders: number
          month_end_date: string
          month_start_date: string
          on_time_fulfillment_rate: number
          on_time_orders: number
          rank: number
          seller_id: string
          total_orders: number
          weighted_score: number
        }[]
      }
      get_new_arrivals_count_with_filters_semantic: {
        Args: {
          category_filter?: string
          search_query?: string
          semantic_threshold?: number
          subcategory_filter?: string
          use_semantic_search?: boolean
        }
        Returns: number
      }
      get_new_arrivals_paginated_semantic: {
        Args: {
          category_filter?: string
          limit_count?: number
          offset_count?: number
          search_query?: string
          semantic_threshold?: number
          subcategory_filter?: string
          use_semantic_search?: boolean
        }
        Returns: {
          category: string
          cover_image_url: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          normal_price: number
          promotion_price: number
          seller_id: string
          seller_name: string
          semantic_similarity: number
          stock_level: number
          sub_category: string
        }[]
      }
      get_new_subscription_signups_by_month: {
        Args: never
        Returns: {
          month: number
          new_signups: number
          year: number
        }[]
      }
      get_or_create_cart: { Args: { p_buyer_id: string }; Returns: string }
      get_order_verification_data: {
        Args: never
        Returns: {
          legacy_po_external_id: string
          legacy_po_id: number
          legacy_po_inserted_at: string
          legacy_po_outlet_id: number
          legacy_po_status: string
          legacy_po_total_from_line_items: number
          legacy_rpo_external_id: string
          legacy_rpo_id: number
          legacy_rpo_inserted_at: string
          legacy_rpo_status: string
          legacy_rpo_total_from_line_items: number
          po_mapped_legacy_status: string
          po_match_status: string
          public_bpo_created_at: string
          public_bpo_id: string
          public_bpo_number: string
          public_bpo_payment_method: string
          public_bpo_status: string
          public_bpo_total_amount: number
          public_order_created_at: string
          public_order_id: string
          public_order_items_total: number
          public_order_number: string
          public_order_payment_status: string
          public_order_status: string
          public_order_total_amount: number
          rpo_mapped_legacy_status: string
          rpo_match_status: string
        }[]
      }
      get_order_verification_data_search: {
        Args: { search_text?: string; status_filter?: string }
        Returns: {
          legacy_po_external_id: string
          legacy_po_id: number
          legacy_po_inserted_at: string
          legacy_po_outlet_id: number
          legacy_po_status: string
          legacy_po_total_from_line_items: number
          legacy_rpo_external_id: string
          legacy_rpo_id: number
          legacy_rpo_inserted_at: string
          legacy_rpo_status: string
          legacy_rpo_total_from_line_items: number
          po_mapped_legacy_status: string
          po_match_status: string
          public_bpo_created_at: string
          public_bpo_id: string
          public_bpo_number: string
          public_bpo_payment_method: string
          public_bpo_status: string
          public_bpo_total_amount: number
          public_order_created_at: string
          public_order_id: string
          public_order_items_total: number
          public_order_number: string
          public_order_payment_status: string
          public_order_status: string
          public_order_total_amount: number
          rpo_mapped_legacy_status: string
          rpo_match_status: string
        }[]
      }
      get_order_verification_summary: {
        Args: never
        Returns: {
          po_amount_discrepancies_count: number
          po_legacy_only_count: number
          po_matched_count: number
          po_public_only_count: number
          po_status_discrepancies_count: number
          rpo_amount_discrepancies_count: number
          rpo_legacy_only_count: number
          rpo_matched_count: number
          rpo_public_only_count: number
          rpo_status_discrepancies_count: number
          total_records: number
        }[]
      }
      get_order_verification_yearly_summary: {
        Args: never
        Returns: {
          po_amount_discrepancies: number
          po_legacy_only: number
          po_legacy_value: number
          po_matched: number
          po_public_only: number
          po_public_value: number
          po_status_discrepancies: number
          po_total_legacy: number
          po_total_public: number
          rpo_amount_discrepancies: number
          rpo_legacy_only: number
          rpo_legacy_value: number
          rpo_matched: number
          rpo_public_only: number
          rpo_public_value: number
          rpo_status_discrepancies: number
          rpo_total_legacy: number
          rpo_total_public: number
          year_period: number
        }[]
      }
      get_overdue_credit_payments: {
        Args: never
        Returns: {
          buyer_id: string
          buyer_name: string
          credit_type: string
          days_overdue: number
          due_date: string
          invoice_number: string
          order_id: string
          overdue_amount: number
        }[]
      }
      get_payment_type_breakdown: {
        Args: { p_month?: number; p_year?: number }
        Returns: {
          buyer_count: number
          order_count: number
          payment_type: string
          total_amount: number
        }[]
      }
      get_platform_top_fast_moving_products: {
        Args: { limit_count?: number; period_days?: number }
        Returns: {
          category: string
          product_id: string
          product_name: string
          rank_within_platform: number
          seller_id: string
          seller_name: string
          sub_category: string
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_product_filters: {
        Args: never
        Returns: {
          brands: string[]
          categories: string[]
          subcategories: string[]
        }[]
      }
      get_product_reports: {
        Args: {
          filter_category?: string
          filter_month?: string
          filter_year?: string
          limit_count?: number
          offset_count?: number
        }
        Returns: {
          avg_selling_price: number
          category: string
          first_sale_date: string
          last_sale_date: string
          margin_per_unit: number
          margin_percentage: number
          normal_price: number
          order_count: number
          product_id: string
          product_name: string
          retail_price: number
          sale_date: string
          sale_month: string
          sale_year: string
          seller_id: string
          seller_name: string
          total_margin: number
          total_quantity_sold: number
          total_revenue: number
        }[]
      }
      get_product_reports_count: {
        Args: {
          filter_category?: string
          filter_month?: string
          filter_year?: string
        }
        Returns: number
      }
      get_products_by_brand: {
        Args: { p_brand_id: string }
        Returns: {
          category: string
          cover_image_url: string
          description: string
          id: string
          image_url: string
          is_active: boolean
          name: string
          normal_price: number
          promotion_price: number
          retail_price: number
          seller_id: string
          seller_name: string
          sub_category: string
        }[]
      }
      get_products_by_category: {
        Args: { p_category_id: string }
        Returns: {
          category: string
          cover_image_url: string
          description: string
          id: string
          image_url: string
          name: string
          normal_price: number
          promotion_price: number
          seller_id: string
          seller_name: string
          sub_category: string
        }[]
      }
      get_products_count_with_filters: {
        Args: {
          category_filter?: string
          search_query?: string
          subcategory_filter?: string
        }
        Returns: number
      }
      get_products_count_with_filters_semantic: {
        Args: {
          brand_filter?: string
          buyer_city?: string
          category_filter?: string
          search_query?: string
          semantic_threshold?: number
          subcategory_filter?: string
          use_semantic_search?: boolean
        }
        Returns: number
      }
      get_products_with_fast_moving_paginated: {
        Args: {
          category_filter?: string
          limit_count?: number
          offset_count?: number
          search_query?: string
          subcategory_filter?: string
        }
        Returns: {
          analysis_month: string
          category: string
          cover_image_url: string
          discount_percentage: number
          feature_order: number
          id: string
          is_fast_moving: boolean
          is_featured: boolean
          name: string
          normal_price: number
          promotion_price: number
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          stock_level: number
          sub_category: string
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_products_with_fast_moving_paginated_semantic: {
        Args: {
          brand_filter?: string
          buyer_city?: string
          category_filter?: string
          limit_count?: number
          offset_count?: number
          search_query?: string
          semantic_threshold?: number
          subcategory_filter?: string
          use_semantic_search?: boolean
        }
        Returns: {
          analysis_month: string
          category: string
          cover_image_url: string
          discount_percentage: number
          feature_order: number
          id: string
          is_fast_moving: boolean
          is_featured: boolean
          name: string
          normal_price: number
          promotion_price: number
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          semantic_similarity: number
          stock_level: number
          sub_category: string
          total_count: number
          total_orders: number
          total_pages: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_products_with_fast_moving_paginated_semantic_v2: {
        Args: {
          brand_filter?: string
          buyer_city?: string
          category_filter?: string
          limit_count?: number
          offset_count?: number
          search_query?: string
          semantic_threshold?: number
          subcategory_filter?: string
          use_semantic_search?: boolean
        }
        Returns: {
          analysis_month: string
          category: string
          cover_image_url: string
          discount_percentage: number
          feature_order: number
          id: string
          is_fast_moving: boolean
          is_featured: boolean
          name: string
          normal_price: number
          promotion_price: number
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          semantic_similarity: number
          stock_level: number
          sub_category: string
          total_count: number
          total_orders: number
          total_pages: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_products_with_fast_moving_paginated_semantic_v3: {
        Args: {
          brand_filter?: string
          buyer_city?: string
          category_filter?: string
          limit_count?: number
          offset_count?: number
          search_query?: string
          semantic_threshold?: number
          subcategory_filter?: string
          use_semantic_search?: boolean
        }
        Returns: {
          analysis_month: string
          category: string
          cover_image_url: string
          discount_percentage: number
          domain_score: number
          feature_order: number
          final_score: number
          id: string
          is_fast_moving: boolean
          is_featured: boolean
          name: string
          normal_price: number
          promotion_price: number
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          semantic_similarity: number
          stock_level: number
          sub_category: string
          total_count: number
          total_orders: number
          total_pages: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_products_with_reservations: {
        Args: { limit_count: number }
        Returns: {
          cover_image_url: string
          id: string
          items_per_carton: number
          name: string
          normal_price: number
          promotion_end: string
          promotion_price: number
          promotion_start: string
          reserved_quantity: number
          seller_id: string
        }[]
      }
      get_promotion_products_count: {
        Args: {
          category_filter?: string
          search_query?: string
          semantic_threshold?: number
          subcategory_filter?: string
          use_semantic_search?: boolean
        }
        Returns: number
      }
      get_promotion_products_paginated: {
        Args: {
          category_filter?: string
          limit_count?: number
          offset_count?: number
          search_query?: string
          semantic_threshold?: number
          sort_by_param?: string
          subcategory_filter?: string
          use_semantic_search?: boolean
        }
        Returns: {
          bundle_quantity: number
          buy_quantity: number
          category: string
          cover_image_url: string
          discount_percentage: number
          discount_price: number
          feature_order: number
          free_quantity: number
          id: string
          is_bundle_product: boolean
          is_fast_moving: boolean
          name: string
          normal_price: number
          promotion_description: string
          promotion_end: string
          promotion_id: string
          promotion_name: string
          promotion_price: number
          promotion_start: string
          promotion_type: string
          rank_within_platform: number
          rank_within_seller: number
          seller_id: string
          seller_name: string
          semantic_similarity: number
          stock_level: number
          sub_category: string
          total_quantity_sold: number
        }[]
      }
      get_public_brands_with_supplier_status: {
        Args: never
        Returns: {
          description: string
          has_active_supplier_brand: boolean
          id: string
          image_url: string
          name: string
          products_count: number
          seller_profile_id: string
        }[]
      }
      get_public_featured_sellers: {
        Args: { limit_count?: number }
        Returns: {
          business_name: string
          business_type: string
          id: string
          logo_url: string
          product_count: number
          serviceable_zones: string[]
        }[]
      }
      get_public_products_by_seller: {
        Args: { p_seller_id: string }
        Returns: {
          barcode: string
          brand_id: string
          brand_name: string
          carton_size: string
          category: string
          cover_image_url: string
          created_at: string
          description: string
          id: string
          items_per_carton: number
          name: string
          normal_price: number
          promotion_price: number
          safety_stock: number
          sub_category: string
        }[]
      }
      get_public_products_by_seller_paginated: {
        Args: {
          p_brand?: string
          p_category?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
          p_seller_id: string
          p_sort?: string
        }
        Returns: {
          rows: Json
          total: number
        }[]
      }
      get_public_seller_detail: {
        Args: { seller_id: string }
        Returns: {
          address: string
          business_name: string
          business_type: string
          certifications: string[]
          created_at: string
          description: string
          fulfillment_capability: string
          id: string
          payment_methods: string[]
          serviceable_zones: string[]
        }[]
      }
      get_public_seller_scores_ranked: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          average_days_late: number
          business_name: string
          business_type: string
          consistency_score: number
          custom_delivery_days: number
          last_calculated_at: string
          late_orders: number
          logo_url: string
          on_time_fulfillment_rate: number
          on_time_orders: number
          product_count: number
          rank: number
          seller_id: string
          serviceable_zones: string[]
          total_orders: number
          weighted_score: number
        }[]
      }
      get_public_sellers_basic: {
        Args: never
        Returns: {
          address: string
          business_type: string
          custom_delivery_days: number
          description: string
          featured_product_id: string
          featured_product_image: string
          featured_product_name: string
          featured_products: Json
          fulfillment_capability: string
          id: string
          is_verified: boolean
          items_sold: number
          logo_url: string
          name: string
          products_count: number
          sales_total: number
          shop_banner_image: string
        }[]
      }
      get_purchase_order_details: {
        Args: { p_purchase_order_id: string }
        Returns: {
          created_at: string
          order_id: string
          order_number: string
          purchase_order_id: string
          purchase_order_number: string
          seller_id: string
          seller_name: string
          status: string
          total_amount: number
        }[]
      }
      get_recommended_sellers: {
        Args: { current_seller_id: string; current_zones: string[] }
        Returns: {
          business_name: string
          created_at: string
          id: string
          rating: number
          serviceable_zones: string[]
          total_products: number
        }[]
      }
      get_remaining_buyers_count: { Args: never; Returns: number }
      get_sales_pic_commission_details: {
        Args: never
        Returns: {
          approved_amount: number
          commission_amount_earned: number
          commission_status: string
          commission_tier_number: number
          paid_amount: number
          pending_amount: number
          pic_id: string
          pic_name: string
          seller_performance_rm: number
          sellers_assigned: number
          sellers_onboarded: number
          subscription_tier: string
        }[]
      }
      get_sales_team_commission_summary: {
        Args: never
        Returns: {
          commission_paid_this_month: number
          commission_pending: number
          new_sellers_this_month: number
          top_performing_pics_count: number
          total_active_pics: number
        }[]
      }
      get_seller_brands: {
        Args: { seller_profile_id: string }
        Returns: {
          brand_code: string
          brand_name: string
          legacy_supplier_id: number
          product_count: number
        }[]
      }
      get_seller_by_supplier_code: {
        Args: { supplier_code: string }
        Returns: string
      }
      get_seller_category_sales: {
        Args: {
          p_end_date?: string
          p_seller_id: string
          p_start_date?: string
        }
        Returns: {
          category: string
          sales: number
        }[]
      }
      get_seller_credit_report: {
        Args: {
          p_period_end?: string
          p_period_start?: string
          p_seller_id: string
        }
        Returns: {
          available_credit: number
          credit_limit: number
          credit_settled: number
          credit_used: number
          last_payment_date: string
          month: string
          outstanding: number
          outstanding_credit: number
          repayment_rate: number
          retailer_id: string
          retailer_name: string
          status: string
          total_credit_extended: number
        }[]
      }
      get_seller_credits_for_buyer: {
        Args: { buyer_user_id: string }
        Returns: {
          available_amount: number
          credit_limit: number
          id: string
          next_due_date: string
          seller_name: string
          used_amount: number
        }[]
      }
      get_seller_dashboard_data: {
        Args: { p_seller_id: string }
        Returns: Json
      }
      get_seller_fast_moving_products: {
        Args: {
          input_seller_id: string
          limit_count?: number
          period_days?: number
        }
        Returns: {
          category: string
          product_id: string
          product_name: string
          rank_within_platform: number
          rank_within_seller: number
          sub_category: string
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_seller_featured_products: {
        Args: { input_seller_id: string }
        Returns: {
          category: string
          cover_image_url: string
          feature_order: number
          featured_since: string
          normal_price: number
          product_id: string
          product_name: string
          promotion_price: number
          sub_category: string
        }[]
      }
      get_seller_fulfillment_issues: {
        Args: {
          p_end_date?: string
          p_seller_id: string
          p_start_date?: string
        }
        Returns: {
          issue_count: number
          issue_percentage: number
          issue_type: string
        }[]
      }
      get_seller_fulfillment_summary: {
        Args: {
          p_end_date?: string
          p_seller_id: string
          p_start_date?: string
        }
        Returns: {
          average_fulfillment_days: number
          cancellation_rate: number
          cancelled_orders: number
          delayed_orders: number
          on_time_orders: number
          on_time_percentage: number
          total_orders: number
        }[]
      }
      get_seller_fulfillment_trends: {
        Args: {
          p_end_date?: string
          p_seller_id: string
          p_start_date?: string
        }
        Returns: {
          current_period_avg_days: number
          current_period_on_time_percentage: number
          days_improvement: number
          percentage_change: number
          previous_period_avg_days: number
          previous_period_on_time_percentage: number
        }[]
      }
      get_seller_invoice_aging_details:
        | {
            Args: { p_seller_id: string }
            Returns: {
              buyer_id: string
              current_0_30: number
              days_180_plus: number
              days_31_60: number
              days_61_90: number
              days_91_180: number
              retailer: string
              total: number
            }[]
          }
        | {
            Args: { p_payment_methods?: string[]; p_seller_id: string }
            Returns: {
              buyer_id: string
              current_0_30: number
              days_180_plus: number
              days_31_60: number
              days_61_90: number
              days_91_180: number
              retailer: string
              total: number
            }[]
          }
      get_seller_invoice_aging_summary:
        | {
            Args: { p_seller_id: string }
            Returns: {
              amount: number
              bucket: string
            }[]
          }
        | {
            Args: { p_payment_methods?: string[]; p_seller_id: string }
            Returns: {
              amount: number
              bucket: string
            }[]
          }
      get_seller_latest_fast_moving_products: {
        Args: { input_seller_id: string }
        Returns: {
          analysis_month: string
          category: string
          product_id: string
          product_name: string
          rank_within_platform: number
          rank_within_seller: number
          sub_category: string
          total_quantity_sold: number
        }[]
      }
      get_seller_monthly_sales: {
        Args: { p_seller_id: string; p_year?: number }
        Returns: {
          month_name: string
          month_num: number
          total_sales: number
        }[]
      }
      get_seller_monthly_sales_range: {
        Args: { p_end_date: string; p_seller_id: string; p_start_date: string }
        Returns: {
          month_name: string
          month_num: number
          total_sales: number
        }[]
      }
      get_seller_performance_metrics: {
        Args: never
        Returns: {
          new_sellers_this_month: number
          total_active_sellers: number
        }[]
      }
      get_seller_performance_trend: {
        Args: { p_months_back?: number; p_seller_id: string }
        Returns: {
          average_days_late: number
          calculated_at: string
          consistency_score: number
          custom_delivery_days: number
          late_orders: number
          month_end_date: string
          month_start_date: string
          on_time_fulfillment_rate: number
          on_time_orders: number
          total_orders: number
          weighted_score: number
          year_month: string
        }[]
      }
      get_seller_profiles_with_assignments: {
        Args: never
        Returns: {
          business_name: string
          contact_person: string
          current_subscription_id: string
          days_until_expiry: number
          email: string
          end_date: string
          followup_priority: string
          needs_followup: boolean
          pending_reminders_count: number
          phone: string
          pic_phone_number: string
          sales_person_email: string
          sales_person_id: string
          sales_person_name: string
          seller_profile_id: string
          sort_priority: number
          start_date: string
          subscription_amount: number
          subscription_name: string
          subscription_status: string
        }[]
      }
      get_seller_profiles_with_cities: {
        Args: never
        Returns: {
          address: string
          business_name: string
          business_type: string
          created_at: string
          email: string
          id: string
          phone: string
          pic_name: string
          serviceable_zones: Json
        }[]
      }
      get_seller_score_by_id: {
        Args: { p_seller_id: string }
        Returns: {
          average_days_late: number
          business_name: string
          consistency_score: number
          custom_delivery_days: number
          last_calculated_at: string
          late_orders: number
          on_time_fulfillment_rate: number
          on_time_orders: number
          seller_id: string
          total_orders: number
          weighted_score: number
        }[]
      }
      get_seller_scores: {
        Args: { p_seller_group_id?: string }
        Returns: {
          business_name: string
          last_order_at: string
          seller_id: string
          total_orders: number
          total_revenue: number
        }[]
      }
      get_seller_scores_ranked: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          average_days_late: number
          business_name: string
          consistency_score: number
          last_calculated_at: string
          late_orders: number
          on_time_fulfillment_rate: number
          on_time_orders: number
          rank: number
          seller_id: string
          total_orders: number
          weighted_score: number
        }[]
      }
      get_seller_scores_with_delivery_days: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: {
          average_days_late: number
          business_name: string
          consistency_score: number
          custom_delivery_days: number
          last_calculated_at: string
          late_orders: number
          on_time_fulfillment_rate: number
          on_time_orders: number
          rank: number
          seller_id: string
          total_orders: number
          weighted_score: number
        }[]
      }
      get_seller_settlements_search: {
        Args: {
          page_no?: number
          page_size?: number
          search_text?: string
          week_end: string
          week_start: string
        }
        Returns: {
          created_at: string
          credit_fee: number
          id: string
          invoice: Json
          invoice_id: string
          net_settlement_amount: number
          platform_fee: number
          seller: Json
          seller_id: string
          settlement_date: string
          settlement_status: string
          total_count: number
          total_invoice_amount: number
          week_end_date: string
          week_start_date: string
        }[]
      }
      get_seller_subscription_followup: {
        Args: never
        Returns: {
          business_name: string
          contact_person: string
          current_subscription_id: string
          days_until_expiry: number
          email: string
          end_date: string
          followup_priority: string
          needs_followup: boolean
          phone: string
          pic_phone_number: string
          seller_profile_id: string
          start_date: string
          subscription_amount: number
          subscription_name: string
          subscription_status: string
          subscription_type: string
        }[]
      }
      get_seller_top_products: {
        Args: {
          p_end_date?: string
          p_limit?: number
          p_seller_id: string
          p_start_date?: string
        }
        Returns: {
          product_id: string
          product_name: string
          revenue: number
          units_sold: number
        }[]
      }
      get_small_buyers: {
        Args: {
          p_limit?: number
          p_month?: number
          p_offset?: number
          p_year?: number
        }
        Returns: {
          business_name: string
          buyer_id: string
          created_at: string
          email: string
          phone: string
          purchase_order_number: string
          total_amount: number
          total_count: number
        }[]
      }
      get_subscription_dashboard_metrics: {
        Args: never
        Returns: {
          churned_sellers_last_30_days: number
          new_subscriptions_this_month: number
          pending_payments_overdue: number
          renewals_due_within_30_days: number
        }[]
      }
      get_subscription_distribution: {
        Args: never
        Returns: {
          count: number
          status: string
          subscription_name: string
          subscription_type: string
          total_revenue: number
        }[]
      }
      get_subscription_growth: {
        Args: never
        Returns: {
          month: string
          new_subscriptions: number
        }[]
      }
      get_subscription_metrics: {
        Args: never
        Returns: {
          active_subscriptions: number
          monthly_revenue: number
          pending_renewals: number
          total_subscriptions: number
        }[]
      }
      get_supplier_analytics: {
        Args: { p_lookback_days?: number; p_seller_profile_id: string }
        Returns: {
          total_add_to_cart: number
          total_checkout_starts: number
          total_page_views: number
          total_product_clicks: number
          total_product_impressions: number
          total_purchases: number
          unique_visitors: number
        }[]
      }
      get_test_payment_ids: {
        Args: never
        Returns: {
          amount: number
          order_number: string
          paid_at: string
          payment_id: string
          payment_method: string
          payment_status: string
          seller_name: string
        }[]
      }
      get_ticket_stats: {
        Args: never
        Returns: {
          average_resolution_time_hours: number
          closed_tickets: number
          high_priority_tickets: number
          in_progress_tickets: number
          open_tickets: number
          resolved_tickets: number
          total_tickets: number
          urgent_tickets: number
          waiting_for_response_tickets: number
        }[]
      }
      get_tickets_paginated: {
        Args: {
          p_assigned_to?: string
          p_category?: string[]
          p_created_by?: string
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_offset?: number
          p_priority?: string[]
          p_search?: string
          p_status?: string[]
        }
        Returns: {
          assigned_to: string
          assignee_business_name: string
          assignee_email: string
          category: string
          chat_room_id: string
          comment_count: number
          created_at: string
          created_by: string
          creator_business_name: string
          creator_email: string
          description: string
          id: string
          priority: string
          resolution_notes: string
          resolved_at: string
          status: string
          title: string
          updated_at: string
        }[]
      }
      get_top_buyers_by_order_volume: {
        Args: { p_limit?: number }
        Returns: {
          business_name: string
          buyer_id: string
          last_order_date: string
          total_orders: number
          total_revenue: number
        }[]
      }
      get_top_buyers_by_revenue: {
        Args: { p_limit?: number }
        Returns: {
          business_name: string
          buyer_id: string
          last_order_date: string
          total_orders: number
          total_revenue: number
        }[]
      }
      get_top_buying_categories: {
        Args: { p_limit?: number; p_month?: number; p_year?: number }
        Returns: {
          category: string
          total_orders: number
          total_revenue: number
          unique_buyers: number
        }[]
      }
      get_top_categories: {
        Args: {
          filter_month?: string
          filter_year?: string
          limit_count?: number
          offset_count?: number
          order_by?: string
        }
        Returns: {
          category: string
          total_quantity_sold: number
          total_revenue: number
        }[]
      }
      get_top_fast_moving_per_seller: {
        Args: { period_days?: number }
        Returns: {
          category: string
          product_id: string
          product_name: string
          rank_within_platform: number
          seller_id: string
          seller_name: string
          sub_category: string
          total_orders: number
          total_quantity_sold: number
          unique_buyers: number
        }[]
      }
      get_top_performing_sellers: {
        Args: {
          filter_month?: string
          filter_year?: string
          limit_count?: number
          offset_count?: number
          order_by_field?: string
          order_direction?: string
        }
        Returns: {
          avg_order_value: number
          business_name: string
          cancelled_orders: number
          completed_orders: number
          email: string
          first_order_date: string
          last_order_date: string
          pending_orders: number
          phone: string
          processing_orders: number
          sale_month: string
          sale_year: string
          seller_id: string
          seller_status: string
          total_orders: number
          total_quantity_sold: number
          total_revenue: number
          unique_buyers: number
          unique_products_sold: number
        }[]
      }
      get_top_products: {
        Args: {
          filter_month?: string
          filter_year?: string
          limit_count?: number
          offset_count?: number
          order_by?: string
        }
        Returns: {
          category: string
          product_id: string
          product_name: string
          seller_name: string
          total_quantity_sold: number
          total_revenue: number
        }[]
      }
      get_top_seller_performance: {
        Args: {
          p_has_service_area: boolean
          p_limit?: number
          p_seller_group_id?: string
        }
        Returns: {
          business_name: string
          seller_id: string
          service_area_count: number
          total_orders: number
          total_revenue: number
        }[]
      }
      get_top_sellers_by_order_volume: {
        Args: { p_limit?: number }
        Returns: {
          business_name: string
          last_order_date: string
          seller_id: string
          total_orders: number
          total_revenue: number
        }[]
      }
      get_top_sellers_by_revenue: {
        Args: { p_limit?: number }
        Returns: {
          business_name: string
          last_order_date: string
          seller_id: string
          total_orders: number
          total_revenue: number
        }[]
      }
      get_total_sellers_onboarded: { Args: never; Returns: number }
      get_total_subscription_value: {
        Args: { reporting_year: number }
        Returns: number
      }
      get_transactions_with_buyers: {
        Args: never
        Returns: {
          after_amt: number
          amount: number
          before_amt: number
          business_name: string
          created_at: string
          credit_application_id: string
          description: string
          due_date: string
          id: string
          invoice_date: string
          invoice_number: string
          order_id: string
          payment_method: string
          reference_id: string
          seller_id: string
          seller_name: string
          status: string
          transaction_type: string
          updated_at: string
          user_id: string
        }[]
      }
      get_user_daily_hourly_browsing_trail: {
        Args: { p_end_date?: string; p_start_date?: string; p_user_id?: string }
        Returns: {
          browsing_date: string
          browsing_hour: number
          event_types: string[]
          first_event_at: string
          hour_end: string
          hour_start: string
          last_event_at: string
          pages_visited: string[]
          products_viewed: number
          sellers_viewed: number
          session_ids: string[]
          total_events: number
          unique_sessions: number
          user_id: string
        }[]
      }
      get_user_email_by_id: { Args: { user_uuid: string }; Returns: string }
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["sales_role"]
      }
      get_user_role_simple: { Args: never; Returns: string }
      get_user_videos: {
        Args: never
        Returns: {
          bucket_id: string
          created_at: string
          id: string
          metadata: Json
          name: string
          owner: string
          path_tokens: string[]
          updated_at: string
        }[]
      }
      get_zones_basic: {
        Args: never
        Returns: {
          id: string
          name: string
          state: string
        }[]
      }
      gl_post_angkasa_receipt: {
        Args: { p_amount: number; p_order_id: string }
        Returns: string
      }
      gl_post_full_cycle: {
        Args: {
          p_bank_fee: number
          p_buyer_id: string
          p_facility_fee: number
          p_invoice_amount: number
          p_late_fee: number
          p_order_id: string
          p_seller_id: string
          p_share_angkasa: number
          p_share_jimatbiz: number
        }
        Returns: string
      }
      gl_post_seller_receipt: {
        Args: { p_amount: number; p_order_id: string; p_seller_id: string }
        Returns: string
      }
      gl_post_step1_accrue_and_payout: {
        Args: {
          p_bank_fee: number
          p_buyer_id: string
          p_facility_fee: number
          p_invoice_amount: number
          p_order_id: string
          p_seller_id: string
        }
        Returns: string
      }
      gl_post_step2_distribute_facility_fee: {
        Args: {
          p_buyer_id: string
          p_facility_fee: number
          p_order_id: string
          p_seller_id: string
          p_share_angkasa: number
          p_share_jimatbiz: number
        }
        Returns: string
      }
      gl_post_step3_buyer_payment: {
        Args: {
          p_buyer_id: string
          p_invoice_amount: number
          p_late_fee: number
          p_order_id: string
          p_seller_id: string
          p_share_angkasa: number
          p_share_jimatbiz: number
        }
        Returns: string
      }
      gl_post_step4_distribute_late_fee: {
        Args: {
          p_buyer_id: string
          p_late_fee: number
          p_order_id: string
          p_seller_id: string
          p_share_angkasa: number
          p_share_jimatbiz: number
        }
        Returns: string
      }
      gl_post_step5_remit_to_angkasa: {
        Args: {
          p_buyer_id: string
          p_facility_fee: number
          p_invoice_amount: number
          p_late_fee: number
          p_order_id: string
          p_seller_id: string
          p_share_angkasa: number
          p_share_jimatbiz: number
        }
        Returns: string
      }
      has_active_membership_subscription: {
        Args: { seller_profile_id_param: string }
        Returns: boolean
      }
      increment: { Args: { x: number }; Returns: number }
      ingest_credit_histories_and_migrate: {
        Args: { p_buyer_id: string; p_legacy_outlet_id: number; p_rows: Json }
        Returns: {
          adjustment_transactions: number
          buyer_created_at: string
          corrected_approved_amount: number
          credit_applications: number
          credit_history_dates: string
          payment_transactions: number
          purchase_transactions: number
        }[]
      }
      initialize_product_stocks: { Args: never; Returns: undefined }
      insert_basic_subscription: {
        Args: {
          amount: number
          bill_id: string
          collection_id: string
          plan_id_text: string
          profile_id?: string
        }
        Returns: Json
      }
      insert_seller_upload_product: {
        Args: {
          p_product_data: Json
          p_seller_upload_id: string
          p_status?: string
        }
        Returns: string
      }
      insert_seller_upload_products: {
        Args: { products: Json[] }
        Returns: undefined
      }
      insert_upload_products: {
        Args: { p_product_data: Json; p_status?: string; p_upload_id: string }
        Returns: string
      }
      is_admin: { Args: { user_id: string }; Returns: boolean }
      is_admin_simple: { Args: never; Returns: boolean }
      is_current_user_admin: { Args: never; Returns: boolean }
      is_development_mode: { Args: never; Returns: boolean }
      is_in_same_team: { Args: { check_id: string }; Returns: boolean }
      is_product_fast_moving: {
        Args: {
          input_product_id: string
          input_seller_id: string
          period_days?: number
        }
        Returns: boolean
      }
      is_product_fast_moving_latest: {
        Args: { input_product_id: string; input_seller_id: string }
        Returns: boolean
      }
      is_product_featured: {
        Args: { input_product_id: string; input_seller_id: string }
        Returns: boolean
      }
      issue_jimatcoins_for_refund: {
        Args: {
          p_amount: number
          p_buyer_id: string
          p_created_by?: string
          p_order_id: string
          p_order_number: string
          p_seller_id: string
        }
        Returns: string
      }
      log_high_risk_seller_login: {
        Args: {
          p_ip_address?: string
          p_user_agent?: string
          p_user_id: string
        }
        Returns: undefined
      }
      manage_brand_mapping: {
        Args: {
          p_action: string
          p_is_regex?: boolean
          p_normalized_name?: string
          p_original_pattern?: string
          p_priority?: number
        }
        Returns: string
      }
      mark_jimatbiz_credit_order: {
        Args: { p_order_id: string }
        Returns: Json
      }
      migrate_all_remaining_credit_transactions: {
        Args: { batch_size?: number; max_batches?: number }
        Returns: {
          batches_completed: number
          migration_completed: boolean
          remaining_buyers: number
          total_adjustment_transactions: number
          total_buyers_processed: number
          total_buyers_with_errors: number
          total_credit_applications: number
          total_payment_transactions: number
          total_purchase_transactions: number
        }[]
      }
      migrate_credit_transactions_batch_by_missing_applications: {
        Args: { batch_size?: number }
        Returns: {
          buyers_with_errors: number
          has_more_buyers: boolean
          total_adjustment_transactions: number
          total_buyers_processed: number
          total_credit_applications: number
          total_payment_transactions: number
          total_purchase_transactions: number
        }[]
      }
      migrate_credit_transactions_final_optimized: {
        Args: { batch_size?: number }
        Returns: {
          buyers_with_errors: number
          total_adjustment_transactions: number
          total_buyers_processed: number
          total_credit_applications: number
          total_payment_transactions: number
          total_purchase_transactions: number
        }[]
      }
      migrate_credit_transactions_final_range_optimized: {
        Args: {
          batch_size?: number
          max_buyers?: number
          start_buyer_offset?: number
        }
        Returns: {
          buyers_with_errors: number
          total_adjustment_transactions: number
          total_buyers_processed: number
          total_credit_applications: number
          total_payment_transactions: number
          total_purchase_transactions: number
        }[]
      }
      migrate_legacy_brand_logos: {
        Args: { p_dry_run?: boolean }
        Returns: Json
      }
      migrate_legacy_buyers: {
        Args: never
        Returns: {
          migrated_buyers: number
          migrated_profiles: number
        }[]
      }
      migrate_legacy_cities_to_zones: { Args: never; Returns: Json }
      migrate_legacy_credits: {
        Args: { legacy_outlet_ids: number[] }
        Returns: {
          credit_application_id: string
          outlet_id: number
          status: string
          transaction_count: number
        }[]
      }
      migrate_legacy_historical_products:
        | { Args: never; Returns: number }
        | { Args: { date_end: string; date_start: string }; Returns: number }
      migrate_legacy_invoices: {
        Args: never
        Returns: {
          error_messages: string[]
          migrated_count: number
          skipped_count: number
        }[]
      }
      migrate_legacy_invoices_by_month: {
        Args: { batch_size?: number; target_month: number; target_year: number }
        Returns: {
          migrated_delivery_orders: number
          migrated_invoice_items: number
          migrated_invoices: number
          skipped_unmapped_sellers: number
        }[]
      }
      migrate_legacy_invoices_by_quarter: {
        Args: {
          batch_size?: number
          target_quarter: number
          target_year: number
        }
        Returns: {
          migrated_invoices: number
          quarter: number
          skipped_invoices: number
          year: number
        }[]
      }
      migrate_legacy_orders: {
        Args: never
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_month:
        | {
            Args: { target_month: number; target_year: number }
            Returns: {
              migrated_order_items: number
              migrated_purchase_orders: number
              migrated_retail_orders: number
              skipped_unmapped_outlets: number
            }[]
          }
        | {
            Args: {
              batch_size?: number
              target_month: number
              target_year: number
            }
            Returns: {
              migrated_order_items: number
              migrated_purchase_orders: number
              migrated_retail_orders: number
              skipped_unmapped_outlets: number
            }[]
          }
      migrate_legacy_orders_by_quarter: {
        Args: {
          batch_size?: number
          target_quarter: number
          target_year: number
        }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          quarter: number
          skipped_unmapped_outlets: number
          year: number
        }[]
      }
      migrate_legacy_orders_by_year:
        | {
            Args: { target_year: number }
            Returns: {
              migrated_order_items: number
              migrated_purchase_orders: number
              migrated_retail_orders: number
              skipped_unmapped_outlets: number
            }[]
          }
        | {
            Args: { batch_size?: number; target_year: number }
            Returns: {
              migrated_order_items: number
              migrated_purchase_orders: number
              migrated_retail_orders: number
              skipped_unmapped_outlets: number
              year: number
            }[]
          }
      migrate_legacy_orders_by_year_v10: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v11: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v13: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          month_number: number
          processing_status: string
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v2: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v3: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v4: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v5: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v6: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v7: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v8: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_orders_by_year_v9: {
        Args: { target_year: number }
        Returns: {
          migrated_order_items: number
          migrated_purchase_orders: number
          migrated_retail_orders: number
          skipped_unmapped_outlets: number
        }[]
      }
      migrate_legacy_payments_by_month: {
        Args: { batch_size?: number; target_month: number; target_year: number }
        Returns: {
          migrated_credit_payments: number
          migrated_manual_payments: number
          migrated_payments: number
          skipped_unmapped_invoices: number
        }[]
      }
      migrate_legacy_products: {
        Args: never
        Returns: {
          migrated_brands: number
          migrated_categories: number
          migrated_products: number
          migrated_variants: number
        }[]
      }
      migrate_legacy_suppliers: {
        Args: never
        Returns: {
          migrated_suppliers: number
        }[]
      }
      migrate_seller_inventory_system:
        | {
            Args: { batch_size?: number; seller_id_filter?: string }
            Returns: {
              duplicates_removed: number
              error_message: string
              locations_created: number
              movements_created: number
              orphaned_records_cleaned: number
              phase_name: string
              sellers_processed: number
              stock_summaries_created: number
              success: boolean
            }[]
          }
        | {
            Args: {
              batch_size?: number
              max_cycles_per_phase?: number
              seller_id_filter?: string
            }
            Returns: {
              duplicates_removed: number
              error_message: string
              locations_created: number
              movements_created: number
              orphaned_records_cleaned: number
              phase_name: string
              sellers_processed: number
              stock_summaries_created: number
              success: boolean
            }[]
          }
      migrate_seller_stock_to_default_location: {
        Args: { p_seller_id: string }
        Returns: {
          products_moved: number
          rows_deleted: number
          rows_upserted: number
        }[]
      }
      migrate_single_buyer_credit_transactions_optimized: {
        Args: { p_buyer_id: string; p_legacy_outlet_id: number }
        Returns: {
          adjustment_transactions: number
          buyer_created_at: string
          corrected_approved_amount: number
          credit_applications: number
          credit_history_dates: string
          payment_transactions: number
          purchase_transactions: number
        }[]
      }
      migrate_single_buyer_credit_transactions_order_based: {
        Args: { p_buyer_id: string; p_legacy_outlet_id: number }
        Returns: {
          adjustment_transactions: number
          buyer_created_at: string
          corrected_approved_amount: number
          credit_applications: number
          credit_history_dates: string
          payment_transactions: number
          purchase_transactions: number
          refund_transactions: number
        }[]
      }
      normalize_brand_name: { Args: { product_name: string }; Returns: string }
      populate_seller_leads_from_profiles: { Args: never; Returns: undefined }
      process_refund_credit: {
        Args: {
          p_amount: number
          p_buyer_id: string
          p_credit_type?: string
          p_order_id: string
          p_order_number: string
          p_user_id: string
        }
        Returns: string
      }
      process_refunds_for_all_buyers_batch: {
        Args: never
        Returns: {
          buyer_id: string
          buyer_name: string
          errors: Json
          orders_processed: number
          refunds_created: number
          total_refund_amount: number
        }[]
      }
      rebuild_purchase_transactions: {
        Args: { p_buyer_id: string }
        Returns: Json
      }
      rebuild_transactions_for_buyer: {
        Args: { p_buyer_id: string }
        Returns: Json
      }
      rebuild_transactions_for_buyer_v2: {
        Args: { p_buyer_id: string }
        Returns: Json
      }
      rebuild_transactions_for_buyer_v3: {
        Args: { p_buyer_id: string }
        Returns: Json
      }
      rebuild_transactions_for_buyer_v4: {
        Args: { p_buyer_id: string }
        Returns: Json
      }
      recalculate_all_seller_scores: { Args: never; Returns: number }
      recalculate_buyer_credit_balances: {
        Args: { p_buyer_id: string; p_credit_type?: string }
        Returns: Json
      }
      receive_warehouse_purchase: {
        Args: { p_purchase_id: string; p_received_by: string }
        Returns: {
          qty_added: number
          warehouse_product_id: string
        }[]
      }
      reconcile_buyer_refund_items: {
        Args: { p_buyer_id: string }
        Returns: {
          billplz_refunds: number
          buyer_id: string
          items_partial_count: number
          jimatbiz_credit_refunds: number
          orders_processed: number
          total_refund_amount: number
        }[]
      }
      reconcile_order_refund_items: {
        Args: { p_order_id: string }
        Returns: {
          billplz_refunds: number
          items_partial_count: number
          jimatbiz_credit_refunds: number
          order_id: string
          total_refund_amount: number
        }[]
      }
      record_stock_movement: {
        Args: {
          p_created_by?: string
          p_delivery_order_id?: string
          p_movement_type: string
          p_order_item_id?: string
          p_quantity_changed: number
          p_reference_id?: string
          p_reference_type?: string
          p_remarks: string
          p_stock_summary_id: string
        }
        Returns: undefined
      }
      recover_buyer_profile: {
        Args: {
          buyer_id_param: string
          new_user_id_param: string
          reason_param?: string
        }
        Returns: Json
      }
      redo_cities_zones_per_state_regions: { Args: never; Returns: Json }
      refresh_all_credit_transaction_summaries: { Args: never; Returns: number }
      register_seller_with_referral: {
        Args: {
          p_business_name: string
          p_email: string
          p_first_name?: string
          p_last_name?: string
          p_referral_code?: string
          p_user_id: string
        }
        Returns: Json
      }
      reject_banner: {
        Args: {
          p_admin_notes?: string
          p_banner_id: string
          p_rejection_reason: string
        }
        Returns: boolean
      }
      reject_batch: {
        Args: { reason: string; upload_id: string }
        Returns: number
      }
      reject_brand_profile: {
        Args: {
          p_admin_notes?: string
          p_brand_profile_id: string
          p_rejection_reason: string
        }
        Returns: boolean
      }
      reject_buyer_ownership_transfer: {
        Args: { p_admin_notes?: string; p_request_id: string }
        Returns: Json
      }
      reject_jimatbiz_credit: {
        Args: {
          p_application_id: string
          p_rejected_by: string
          p_rejection_reason: string
        }
        Returns: boolean
      }
      reject_product: {
        Args: { reason: string; upload_product_id: string }
        Returns: undefined
      }
      release_reservation: {
        Args: { p_reservation_id: string }
        Returns: boolean
      }
      remove_from_cart: {
        Args: { p_buyer_id: string; p_product_id: string }
        Returns: Json
      }
      repair_credit_transactions_and_summary: {
        Args: never
        Returns: {
          created_summaries: number
          processed_buyers: number
          updated_summaries: number
          updated_transactions: number
        }[]
      }
      report_product_violation: {
        Args: {
          p_buyer_id: string
          p_notes?: string
          p_product_id: string
          p_reason: string
        }
        Returns: string
      }
      reserve_stock: {
        Args: {
          p_buyer_id: string
          p_expires_minutes?: number
          p_product_id: string
          p_quantity: number
          p_user_id: string
        }
        Returns: Json
      }
      reset_buyer_credit: {
        Args: {
          p_buyer_id: string
          p_credit_type?: Database["public"]["Enums"]["credit_type"]
          p_dry_run?: boolean
          p_seller_id?: string
        }
        Returns: Json
      }
      rls_summary: {
        Args: never
        Returns: {
          count: number
          metric: string
          percentage: number
        }[]
      }
      sanitize_historical_products: {
        Args: { similarity_threshold?: number }
        Returns: {
          deleted_count: number
          updated_count: number
        }[]
      }
      search_orders_by_supplier_and_product: {
        Args: { p_buyer_id: string; p_limit?: number; p_search_term?: string }
        Returns: {
          buyer_purchase_order_id: string
          created_at: string
          delivery_date: string
          first_product_image: string
          first_product_name: string
          order_id: string
          order_number: string
          purchase_order_number: string
          search_rank: number
          seller_id: string
          seller_name: string
          status: string
          total_amount: number
          total_items: number
        }[]
      }
      send_credit_application_creation_emails: {
        Args: { p_application_id: string }
        Returns: undefined
      }
      send_credit_application_email: {
        Args: {
          recipient_email: string
          template_data: Json
          template_name: string
        }
        Returns: undefined
      }
      send_seller_forgot_password_email: {
        Args: {
          reset_link: string
          reset_token: string
          seller_email: string
          seller_name: string
        }
        Returns: undefined
      }
      set_seller_featured_products: {
        Args: { input_seller_id: string; product_ids: string[] }
        Returns: boolean
      }
      sync_all_buyer_emails: {
        Args: never
        Returns: {
          buyer_id: string
          new_auth_email: string
          old_auth_email: string
          synced: boolean
          user_id: string
        }[]
      }
      test_create_settlement_on_payment_completed: {
        Args: { p_payment_id: string }
        Returns: Json
      }
      test_email_sending: { Args: never; Returns: string }
      test_legacy_invoice_migration: {
        Args: { test_limit?: number }
        Returns: {
          calculated_total: number
          external_id: string
          line_items_count: number
          sample_invoice_id: number
          seller_found: boolean
          status: string
          supplier_name: string
        }[]
      }
      test_order_delivery_workflow: {
        Args: { p_order_id: string }
        Returns: string
      }
      test_rls_policies: {
        Args: never
        Returns: {
          details: string
          operation: string
          status: string
          table_name: string
          test_name: string
        }[]
      }
      toggle_development_mode: { Args: { enabled: boolean }; Returns: boolean }
      update_all_product_embeddings: {
        Args: never
        Returns: {
          updated_count: number
        }[]
      }
      update_batch_status: { Args: { p_upload_id: string }; Returns: undefined }
      update_buyer_purchase_order_payments: {
        Args: never
        Returns: {
          cash_payments: number
          completed_payments: number
          credit_payments: number
          updated_count: number
        }[]
      }
      update_cart_item: {
        Args: { p_buyer_id: string; p_product_id: string; p_quantity: number }
        Returns: Json
      }
      update_credit_application: {
        Args: {
          p_application_id: string
          p_approved_credit_amount?: number
          p_approved_credit_terms?: number
          p_notes?: string
          p_rejection_reason?: string
          p_status?: string
        }
        Returns: Json
      }
      update_credit_application_status:
        | {
            Args: {
              p_application_id: string
              p_approved_amount?: number
              p_new_status: string
              p_rejection_reason?: string
            }
            Returns: boolean
          }
        | {
            Args: {
              p_application_id: string
              p_approved_amount?: number
              p_new_status: string
              p_rejection_reason?: string
              p_send_email?: boolean
            }
            Returns: boolean
          }
      update_credit_application_status_v2: {
        Args: {
          p_application_id: string
          p_approved_amount?: number
          p_new_status: string
          p_rejection_reason?: string
        }
        Returns: boolean
      }
      update_credit_transaction_summary:
        | {
            Args: {
              p_buyer_id: string
              p_credit_type: Database["public"]["Enums"]["credit_type"]
            }
            Returns: undefined
          }
        | {
            Args: { p_buyer_id: string; p_credit_type: string }
            Returns: undefined
          }
      update_legacy_invoice_totals: {
        Args: { invoice_id?: number }
        Returns: {
          new_total: number
          old_total: number
          updated_invoice_id: number
        }[]
      }
      update_product_base64_image: {
        Args: { base64_data: string; product_id: string }
        Returns: boolean
      }
      update_product_embedding: {
        Args: { product_id: string }
        Returns: undefined
      }
      update_product_embeddings: { Args: never; Returns: undefined }
      update_purchase_orders_checkout_method: {
        Args: never
        Returns: {
          new_checkout_method: string
          old_checkout_method: string
          purchase_order_id: number
          updated: boolean
        }[]
      }
      update_seller_delivery_days: {
        Args: { p_custom_delivery_days: number; p_seller_id: string }
        Returns: Json
      }
      update_seller_sales_person: {
        Args: { p_sales_person_id: string; p_seller_profile_id: string }
        Returns: undefined
      }
      update_ticket_status: {
        Args: {
          p_resolution_notes?: string
          p_status: string
          p_ticket_id: string
        }
        Returns: boolean
      }
      upsert_legacy_outlet_credit_transactions: {
        Args: { p_rows: Json }
        Returns: {
          upserted_count: number
        }[]
      }
      upsert_legacy_outlet_credit_transactions_with_mapping: {
        Args: { p_rows: Json }
        Returns: {
          client_id: string
          id: number
        }[]
      }
      use_credit: {
        Args: {
          p_amount: number
          p_buyer_id: string
          p_credit_application_id?: string
          p_credit_type: string
          p_due_date?: string
          p_order_id?: string
          p_order_number: string
          p_seller_id?: string
          p_seller_name?: string
          p_transaction_type?: string
          p_user_id: string
        }
        Returns: string
      }
      validate_and_cleanup_promotion_items: {
        Args: { p_buyer_id: string }
        Returns: Json
      }
      validate_cart_moq: {
        Args: { p_buyer_id: string }
        Returns: {
          current_order_total: number
          meets_moq: boolean
          minimum_order_quantity: number
          seller_id: string
          seller_name: string
          shortfall: number
        }[]
      }
      validate_credit_balance:
        | {
            Args: {
              p_amount: number
              p_buyer_id: string
              p_credit_type?: Database["public"]["Enums"]["credit_type"]
              p_seller_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              p_amount: number
              p_buyer_id: string
              p_credit_type?: string
              p_seller_id: string
            }
            Returns: boolean
          }
      validate_moq_for_cart_items: {
        Args: { p_cart_items: Json }
        Returns: {
          current_order_total: number
          meets_moq: boolean
          minimum_order_quantity: number
          seller_id: string
          seller_name: string
          shortfall: number
        }[]
      }
      validate_product_stock_inventory: {
        Args: { batch_size?: number; seller_id_filter?: string }
        Returns: {
          duplicates_removed: number
          products_processed: number
          quantity_mismatches_fixed: number
          stock_summaries_created: number
          stock_summaries_updated: number
        }[]
      }
      validate_stock_seller_alignment: {
        Args: { limit_results?: number; return_summary_only?: boolean }
        Returns: {
          current_stock: number
          location_name: string
          location_seller_id: string
          location_seller_name: string
          product_id: string
          product_name: string
          product_seller_id: string
          product_seller_name: string
          recommendation: string
          severity: string
          stock_location_id: string
          validation_status: string
          validation_type: string
        }[]
      }
      verify_seller_documents: {
        Args: {
          admin_user_id?: string
          seller_id: string
          verification_notes?: string
          verified: boolean
        }
        Returns: Json
      }
      verify_seller_sms_otp: {
        Args: { p_otp_code: string; p_seller_profile_id: string }
        Returns: boolean
      }
    }
    Enums: {
      banner_approval_status: "pending" | "approved" | "rejected"
      credit_type: "jimatbiz" | "seller" | "angkasa"
      digital_banner_placement:
        | "supplier_brand"
        | "featured_seller"
        | "top_landing_page"
        | "product_listing"
        | "category_banner"
        | "promotional_banner"
        | "featured_products"
        | "category_specific"
        | "seller_profile"
        | "checkout_promotional"
        | "dashboard_promotional"
        | "brand_showcase"
        | "special_deals"
        | "supplier_brand_showcase"
      jimatshop_order_status:
        | "pending"
        | "processing"
        | "completed"
        | "cancelled"
        | "ready"
      order_status:
        | "new_order"
        | "processing"
        | "delivery_date_set"
        | "shipping"
        | "delivered"
        | "upload_do"
        | "refunded"
        | "cancelled"
        | "pending_payment"
      payment_method:
        | "cash_online"
        | "jimatbiz_credit"
        | "bank_transfer"
        | "cheque"
        | "billplz"
        | "seller_credit"
      payment_status:
        | "pending"
        | "processing"
        | "partially_paid"
        | "completed"
        | "failed"
        | "refunded"
      payment_type: "manual_upload" | "billplz" | "other_gateway" | "order"
      sales_role: "sales_executive" | "team_lead" | "admin"
      subscription_reporting:
        | "sales_report"
        | "fulfillment_report"
        | "fast_moving_products_report"
        | "credit_report"
        | "aging_report"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
      subscription_type:
        | "membership"
        | "digital_banner"
        | "supplier_brand"
        | "featured_seller"
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
      banner_approval_status: ["pending", "approved", "rejected"],
      credit_type: ["jimatbiz", "seller", "angkasa"],
      digital_banner_placement: [
        "supplier_brand",
        "featured_seller",
        "top_landing_page",
        "product_listing",
        "category_banner",
        "promotional_banner",
        "featured_products",
        "category_specific",
        "seller_profile",
        "checkout_promotional",
        "dashboard_promotional",
        "brand_showcase",
        "special_deals",
        "supplier_brand_showcase",
      ],
      jimatshop_order_status: [
        "pending",
        "processing",
        "completed",
        "cancelled",
        "ready",
      ],
      order_status: [
        "new_order",
        "processing",
        "delivery_date_set",
        "shipping",
        "delivered",
        "upload_do",
        "refunded",
        "cancelled",
        "pending_payment",
      ],
      payment_method: [
        "cash_online",
        "jimatbiz_credit",
        "bank_transfer",
        "cheque",
        "billplz",
        "seller_credit",
      ],
      payment_status: [
        "pending",
        "processing",
        "partially_paid",
        "completed",
        "failed",
        "refunded",
      ],
      payment_type: ["manual_upload", "billplz", "other_gateway", "order"],
      sales_role: ["sales_executive", "team_lead", "admin"],
      subscription_reporting: [
        "sales_report",
        "fulfillment_report",
        "fast_moving_products_report",
        "credit_report",
        "aging_report",
      ],
      subscription_status: ["active", "expired", "cancelled", "pending"],
      subscription_type: [
        "membership",
        "digital_banner",
        "supplier_brand",
        "featured_seller",
      ],
    },
  },
} as const
