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
      contracts: {
        Row: {
          allowed_variance: string
          broker: Json | null
          buyer_id: string
          buyer_name: string
          created_at: string | null
          created_by: string | null
          currency: string
          delivery_country: string
          delivery_date: string
          delivery_port: string
          external_reference_id: string | null
          id: string
          incoterm: string
          loading_duration: string
          loading_period: string
          loading_start_date: string
          origin_country: string
          packing_standard: string
          payment_terms: string
          product_type: string
          quality_ffa: string
          quality_iv: string
          quality_m1: string
          quality_s: string
          quantity: string
          seller_id: string
          seller_name: string
          status: string
          type: string
          unit_price: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          allowed_variance: string
          broker?: Json | null
          buyer_id: string
          buyer_name: string
          created_at?: string | null
          created_by?: string | null
          currency: string
          delivery_country: string
          delivery_date: string
          delivery_port: string
          external_reference_id?: string | null
          id?: string
          incoterm: string
          loading_duration: string
          loading_period: string
          loading_start_date: string
          origin_country: string
          packing_standard: string
          payment_terms: string
          product_type: string
          quality_ffa: string
          quality_iv: string
          quality_m1: string
          quality_s: string
          quantity: string
          seller_id: string
          seller_name: string
          status: string
          type: string
          unit_price: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          allowed_variance?: string
          broker?: Json | null
          buyer_id?: string
          buyer_name?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string
          delivery_country?: string
          delivery_date?: string
          delivery_port?: string
          external_reference_id?: string | null
          id?: string
          incoterm?: string
          loading_duration?: string
          loading_period?: string
          loading_start_date?: string
          origin_country?: string
          packing_standard?: string
          payment_terms?: string
          product_type?: string
          quality_ffa?: string
          quality_iv?: string
          quality_m1?: string
          quality_s?: string
          quantity?: string
          seller_id?: string
          seller_name?: string
          status?: string
          type?: string
          unit_price?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string | null
          created_by: string | null
          entity_id: string
          entity_type: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entity_id: string
          entity_type: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entity_id?: string
          entity_type?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          address: string | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          postal_code: string | null
          type: string
          updated_at: string | null
          updated_by: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          type: string
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          postal_code?: string | null
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parties_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parties_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          arrival_date: string
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          departure_date: string
          destination_country: string
          destination_port: string
          id: string
          is_fulfilled: boolean | null
          origin_country: string
          quality: Json | null
          quantity: number
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          arrival_date: string
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          departure_date: string
          destination_country: string
          destination_port: string
          id?: string
          is_fulfilled?: boolean | null
          origin_country: string
          quality?: Json | null
          quantity: number
          status: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          arrival_date?: string
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          departure_date?: string
          destination_country?: string
          destination_port?: string
          id?: string
          is_fulfilled?: boolean | null
          origin_country?: string
          quality?: Json | null
          quantity?: number
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tanks: {
        Row: {
          arrival_date: string
          created_at: string | null
          created_by: string | null
          departure_date: string
          id: string
          quality: Json | null
          quantity: number
          shipment_id: string
          status: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          arrival_date: string
          created_at?: string | null
          created_by?: string | null
          departure_date: string
          id: string
          quality?: Json | null
          quantity: number
          shipment_id: string
          status: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          arrival_date?: string
          created_at?: string | null
          created_by?: string | null
          departure_date?: string
          id?: string
          quality?: Json | null
          quantity?: number
          shipment_id?: string
          status?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tanks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tanks_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tanks_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_permissions: {
        Row: {
          analytics: Json
          buyers: Json
          contracts: Json
          created_at: string | null
          dashboard: Json
          id: string
          routing: Json
          shipments: Json
          storage_tanks: Json
          suppliers: Json
          tanks: Json
          terminals: Json
          updated_at: string | null
          user_id: string
          user_management: Json
          warehouses: Json
        }
        Insert: {
          analytics?: Json
          buyers?: Json
          contracts?: Json
          created_at?: string | null
          dashboard?: Json
          id?: string
          routing?: Json
          shipments?: Json
          storage_tanks?: Json
          suppliers?: Json
          tanks?: Json
          terminals?: Json
          updated_at?: string | null
          user_id: string
          user_management?: Json
          warehouses?: Json
        }
        Update: {
          analytics?: Json
          buyers?: Json
          contracts?: Json
          created_at?: string | null
          dashboard?: Json
          id?: string
          routing?: Json
          shipments?: Json
          storage_tanks?: Json
          suppliers?: Json
          tanks?: Json
          terminals?: Json
          updated_at?: string | null
          user_id?: string
          user_management?: Json
          warehouses?: Json
        }
        Relationships: [
          {
            foreignKeyName: "user_permissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          photo_url: string | null
          role: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          name: string
          photo_url?: string | null
          role: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          photo_url?: string | null
          role?: string
          updated_at?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
