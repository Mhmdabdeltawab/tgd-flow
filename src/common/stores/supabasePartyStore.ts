import { create } from "zustand";
import { supabase } from "../services/supabaseClient";
import { Party } from "../types/party";
import useSupabaseAuthStore from "./supabaseAuthStore";
import { logSupabaseError } from "./supabaseStoreUtils";

interface PartyState {
  getAll: (type: "suppliers" | "buyers") => Promise<Party[]>;
  getById: (
    type: "suppliers" | "buyers",
    id: string,
  ) => Promise<Party | undefined>;
  create: (
    data: Omit<Party, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Party>;
  update: (id: string, data: Partial<Party>) => Promise<Party>;
  delete: (id: string) => Promise<void>;
}

const useSupabasePartyStore = create<PartyState>(() => ({
  getAll: async (type) => {
    try {
      console.log(`supabasePartyStore: Fetching ${type} from Supabase...`);

      // First check if the table exists and has data
      const { count, error: countError } = await supabase
        .from("parties")
        .select("*", { count: "exact", head: true });

      if (countError) {
        logSupabaseError(`checking parties table`, countError);
        console.error(
          `supabasePartyStore: Error checking parties table:`,
          countError,
        );
        return [];
      }

      // If no data, return empty array
      if (count === 0) {
        console.log(`supabasePartyStore: No parties found in database`);
        return [];
      }

      console.log(
        `supabasePartyStore: Found ${count} parties, fetching ${type}...`,
      );
      const { data, error } = await supabase
        .from("parties")
        .select("*")
        .eq("type", type)
        .order("name", { ascending: true });

      if (error) {
        logSupabaseError(`fetching ${type}`, error);
        console.error(`supabasePartyStore: Error fetching ${type}:`, error);
        return [];
      }

      if (!data || data.length === 0) {
        console.log(`supabasePartyStore: No ${type} found in database`);
        return [];
      }

      console.log(
        `supabasePartyStore: Fetched ${data.length} ${type} data:`,
        data,
      );

      const mappedData = data.map(mapPartyFromSupabase);
      console.log(
        `supabasePartyStore: Mapped ${mappedData.length} ${type} data:`,
        mappedData,
      );
      return mappedData;
    } catch (error) {
      console.error(`supabasePartyStore: Error fetching ${type}:`, error);
      return [];
    }
  },

  getById: async (type, id) => {
    try {
      const { data, error } = await supabase
        .from("parties")
        .select("*")
        .eq("id", id)
        .eq("type", type)
        .single();

      if (error) {
        if (error.code === "PGRST116") return undefined; // No rows returned
        logSupabaseError(`fetching ${type} party ${id}`, error);
        return undefined;
      }

      return mapPartyFromSupabase(data);
    } catch (error) {
      console.error(`Error fetching ${type} party ${id}:`, error);
      return undefined;
    }
  },

  create: async (data) => {
    try {
      const user = useSupabaseAuthStore.getState().user;

      const { data: newParty, error } = await supabase
        .from("parties")
        .insert({
          type: data.type,
          name: data.name,
          email: data.email,
          phone: data.phone,
          website: data.website,
          address: data.address,
          country: data.country,
          city: data.city,
          postal_code: data.postalCode,
          contact_person: data.contactPerson,
          notes: data.notes,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        logSupabaseError("creating party", error);
        throw error;
      }

      return mapPartyFromSupabase(newParty);
    } catch (error) {
      console.error("Error creating party:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const user = useSupabaseAuthStore.getState().user;

      const updateData: any = {
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      // Map data to Supabase format
      if (data.type) updateData.type = data.type;
      if (data.name) updateData.name = data.name;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.website !== undefined) updateData.website = data.website;
      if (data.address !== undefined) updateData.address = data.address;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.postalCode !== undefined)
        updateData.postal_code = data.postalCode;
      if (data.contactPerson !== undefined)
        updateData.contact_person = data.contactPerson;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { data: updatedParty, error } = await supabase
        .from("parties")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logSupabaseError(`updating party ${id}`, error);
        throw error;
      }

      return mapPartyFromSupabase(updatedParty);
    } catch (error) {
      console.error(`Error updating party ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase.from("parties").delete().eq("id", id);

      if (error) {
        logSupabaseError(`deleting party ${id}`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting party ${id}:`, error);
      throw error;
    }
  },
}));

// Helper function to map Supabase party to our Party type
function mapPartyFromSupabase(data: any): Party {
  return {
    id: data.id,
    type: data.type,
    name: data.name,
    email: data.email,
    phone: data.phone,
    website: data.website,
    address: data.address,
    country: data.country,
    city: data.city,
    postalCode: data.postal_code,
    contactPerson: data.contact_person,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

export default useSupabasePartyStore;
