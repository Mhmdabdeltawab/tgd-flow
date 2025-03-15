export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          photo_url: string | null;
          role: "admin" | "user";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          photo_url?: string | null;
          role: "admin" | "user";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          photo_url?: string | null;
          role?: "admin" | "user";
          created_at?: string;
          updated_at?: string;
        };
      };
      user_permissions: {
        Row: {
          id: string;
          user_id: string;
          dashboard: Json;
          contracts: Json;
          routing: Json;
          shipments: Json;
          suppliers: Json;
          tanks: Json;
          buyers: Json;
          warehouses: Json;
          terminals: Json;
          storage_tanks: Json;
          analytics: Json;
          user_management: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          dashboard?: Json;
          contracts?: Json;
          routing?: Json;
          shipments?: Json;
          suppliers?: Json;
          tanks?: Json;
          buyers?: Json;
          warehouses?: Json;
          terminals?: Json;
          storage_tanks?: Json;
          analytics?: Json;
          user_management?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          dashboard?: Json;
          contracts?: Json;
          routing?: Json;
          shipments?: Json;
          suppliers?: Json;
          tanks?: Json;
          buyers?: Json;
          warehouses?: Json;
          terminals?: Json;
          storage_tanks?: Json;
          analytics?: Json;
          user_management?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };
      contracts: {
        Row: {
          id: string;
          type: string;
          status: string;
          buyer_id: string;
          seller_id: string;
          buyer_name: string;
          seller_name: string;
          product_type: string;
          incoterm: string;
          quantity: string;
          allowed_variance: string;
          unit_price: string;
          currency: string;
          payment_terms: string;
          quality_ffa: string;
          quality_iv: string;
          quality_s: string;
          quality_m1: string;
          packing_standard: string;
          origin_country: string;
          delivery_country: string;
          delivery_port: string;
          loading_start_date: string;
          loading_period: string;
          loading_duration: string;
          delivery_date: string;
          external_reference_id: string | null;
          broker: Json | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          type: string;
          status: string;
          buyer_id: string;
          seller_id: string;
          buyer_name: string;
          seller_name: string;
          product_type: string;
          incoterm: string;
          quantity: string;
          allowed_variance: string;
          unit_price: string;
          currency: string;
          payment_terms: string;
          quality_ffa: string;
          quality_iv: string;
          quality_s: string;
          quality_m1: string;
          packing_standard: string;
          origin_country: string;
          delivery_country: string;
          delivery_port: string;
          loading_start_date: string;
          loading_period: string;
          loading_duration: string;
          delivery_date: string;
          external_reference_id?: string | null;
          broker?: Json | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          type?: string;
          status?: string;
          buyer_id?: string;
          seller_id?: string;
          buyer_name?: string;
          seller_name?: string;
          product_type?: string;
          incoterm?: string;
          quantity?: string;
          allowed_variance?: string;
          unit_price?: string;
          currency?: string;
          payment_terms?: string;
          quality_ffa?: string;
          quality_iv?: string;
          quality_s?: string;
          quality_m1?: string;
          packing_standard?: string;
          origin_country?: string;
          delivery_country?: string;
          delivery_port?: string;
          loading_start_date?: string;
          loading_period?: string;
          loading_duration?: string;
          delivery_date?: string;
          external_reference_id?: string | null;
          broker?: Json | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      shipments: {
        Row: {
          id: string;
          contract_id: string | null;
          status: string;
          quantity: number;
          departure_date: string;
          arrival_date: string;
          origin_country: string;
          destination_country: string;
          destination_port: string;
          is_fulfilled: boolean | null;
          quality: Json | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          contract_id?: string | null;
          status: string;
          quantity: number;
          departure_date: string;
          arrival_date: string;
          origin_country: string;
          destination_country: string;
          destination_port: string;
          is_fulfilled?: boolean | null;
          quality?: Json | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          contract_id?: string | null;
          status?: string;
          quantity?: number;
          departure_date?: string;
          arrival_date?: string;
          origin_country?: string;
          destination_country?: string;
          destination_port?: string;
          is_fulfilled?: boolean | null;
          quality?: Json | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      tanks: {
        Row: {
          id: string;
          shipment_id: string;
          status: string;
          quantity: number;
          quality: Json | null;
          departure_date: string;
          arrival_date: string;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          shipment_id: string;
          status: string;
          quantity: number;
          quality?: Json | null;
          departure_date: string;
          arrival_date: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          shipment_id?: string;
          status?: string;
          quantity?: number;
          quality?: Json | null;
          departure_date?: string;
          arrival_date?: string;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      parties: {
        Row: {
          id: string;
          type: string;
          name: string;
          email: string | null;
          phone: string | null;
          website: string | null;
          address: string | null;
          country: string | null;
          city: string | null;
          postal_code: string | null;
          contact_person: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
          created_by: string | null;
          updated_by: string | null;
        };
        Insert: {
          id?: string;
          type: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          address?: string | null;
          country?: string | null;
          city?: string | null;
          postal_code?: string | null;
          contact_person?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          id?: string;
          type?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          website?: string | null;
          address?: string | null;
          country?: string | null;
          city?: string | null;
          postal_code?: string | null;
          contact_person?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
          created_by?: string | null;
          updated_by?: string | null;
        };
      };
      documents: {
        Row: {
          id: string;
          entity_id: string;
          entity_type: string;
          name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at: string;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          entity_id: string;
          entity_type: string;
          name: string;
          file_path: string;
          file_type: string;
          file_size: number;
          created_at?: string;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          entity_id?: string;
          entity_type?: string;
          name?: string;
          file_path?: string;
          file_type?: string;
          file_size?: number;
          created_at?: string;
          created_by?: string | null;
        };
      };
    };
    Views: {};
    Functions: {};
  };
}
