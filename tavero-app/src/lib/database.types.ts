export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          user_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          is_active: boolean
          menu_font: string | null
          menu_accent_color: string | null
          phone: string | null
          address: string | null
          latitude: number | null
          longitude: number | null
          wifi_name: string | null
          wifi_password: string | null
          instagram_url: string | null
          facebook_url: string | null
          tiktok_url: string | null
          twitter_url: string | null
          website_url: string | null
          whatsapp_number: string | null
          menu_banner_url: string | null
          theme_preference: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          is_active?: boolean
          menu_font?: string | null
          menu_accent_color?: string | null
          phone?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          wifi_name?: string | null
          wifi_password?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
          menu_banner_url?: string | null
          theme_preference?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
        Update: {
          id?: string
          user_id?: string
          name?: string
          slug?: string
          description?: string | null
          logo_url?: string | null
          is_active?: boolean
          menu_font?: string | null
          menu_accent_color?: string | null
          phone?: string | null
          address?: string | null
          latitude?: number | null
          longitude?: number | null
          wifi_name?: string | null
          wifi_password?: string | null
          instagram_url?: string | null
          facebook_url?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          website_url?: string | null
          whatsapp_number?: string | null
          menu_banner_url?: string | null
          theme_preference?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          restaurant_id: string
          menu_id: string | null
          name: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          menu_id?: string | null
          name: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
        Update: {
          id?: string
          restaurant_id?: string
          menu_id?: string | null
          name?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          category_id: string
          restaurant_id: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_active: boolean
          out_of_stock: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category_id: string
          restaurant_id: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_active?: boolean
          out_of_stock?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
        Update: {
          id?: string
          category_id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_active?: boolean
          out_of_stock?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_availability: {
        Row: {
          id: string
          product_id: string
          day_of_week: number
        }
        Insert: {
          id?: string
          product_id: string
          day_of_week: number
        }
        Relationships: []
        Update: {
          id?: string
          product_id?: string
          day_of_week?: number
        }
      }
      allergens: {
        Row: {
          id: string
          name: string
          icon: string
        }
        Insert: {
          id: string
          name: string
          icon: string
        }
        Relationships: []
        Update: {
          id?: string
          name?: string
          icon?: string
        }
      }
      product_allergens: {
        Row: {
          id: string
          product_id: string
          allergen_id: string
          type: string
        }
        Insert: {
          id?: string
          product_id: string
          allergen_id: string
          type?: string
        }
        Relationships: []
        Update: {
          id?: string
          product_id?: string
          allergen_id?: string
          type?: string
        }
      }
      product_labels: {
        Row: {
          id: string
          product_id: string
          label: string
        }
        Insert: {
          id?: string
          product_id: string
          label: string
        }
        Relationships: []
        Update: {
          id?: string
          product_id?: string
          label?: string
        }
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          name: string
          price: number
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          price: number
          sort_order?: number
          created_at?: string
        }
        Relationships: []
        Update: {
          id?: string
          product_id?: string
          name?: string
          price?: number
          sort_order?: number
          created_at?: string
        }
      }
      menu_visits: {
        Row: {
          id: string
          restaurant_id: string
          visited_at: string
          user_agent: string | null
          referer: string | null
        }
        Insert: {
          id?: string
          restaurant_id: string
          visited_at?: string
          user_agent?: string | null
          referer?: string | null
        }
        Relationships: []
        Update: {
          id?: string
          restaurant_id?: string
          visited_at?: string
          user_agent?: string | null
          referer?: string | null
        }
      }
      menus: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          is_active: boolean
          sort_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: []
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
          updated_at?: string
        }
      }
      restaurant_banners: {
        Row: {
          id: string
          restaurant_id: string
          text: string
          link_url: string | null
          bg_color: string
          text_color: string
          is_active: boolean
          sort_order: number
          starts_at: string | null
          ends_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          restaurant_id: string
          text: string
          link_url?: string | null
          bg_color?: string
          text_color?: string
          is_active?: boolean
          sort_order?: number
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
        }
        Relationships: []
        Update: {
          id?: string
          restaurant_id?: string
          text?: string
          link_url?: string | null
          bg_color?: string
          text_color?: string
          is_active?: boolean
          sort_order?: number
          starts_at?: string | null
          ends_at?: string | null
          created_at?: string
        }
      }
      menu_schedules: {
        Row: {
          id: string
          menu_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Insert: {
          id?: string
          menu_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Relationships: []
        Update: {
          id?: string
          menu_id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
