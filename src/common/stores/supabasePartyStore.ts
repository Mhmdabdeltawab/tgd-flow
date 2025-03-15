import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { Party } from '../types/party';
import useSupabaseAuthStore from './supabaseAuthStore';

interface PartyState {
  getAll: (type: 'suppliers' | 'buyers') => Promise<Party[]>;
  getById: (id: string) => Promise<Party | undefined>;
  create: (data: Omit<Party, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Party>;
  update: (id: string, data: Partial<Party>) => Promise<Party>;
  delete: (id: string) => Promise<void>;
}

const useSupabasePartyStore = create<PartyState>(() => ({
  getAll: async (type) => {
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('type', type)
        .order('name', { ascending: true });

      if (error) throw error;

      return data.map(mapPartyFromSupabase);
    } catch (error) {
      console.error(`Error fetching ${type}:`, error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('parties')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return undefined; // No rows returned
        throw error;
      }

      return mapPartyFromSupabase(data);
    } catch (error) {
      console.error(`Error fetching party ${id}:`, error);
      return undefined;
    }
  },

  create: async (data) => {
    try {
      const user = useSupabaseAuthStore.getState().user;
      
      const { data: newParty, error } = await supabase
        .from('parties')
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
          updated_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      return mapPartyFromSupabase(newParty);
    } catch (error) {
      console.error('Error creating party:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const user = useSupabaseAuthStore.getState().user;
      
      const updateData: any = {
        updated_by: user?.id,
        updated_at: new Date().toISOString()
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
      if (data.postalCode !== undefined) updateData.postal_code = data.postalCode;
      if (data.contactPerson !== undefined) updateData.contact_person = data.contactPerson;
      if (data.notes !== undefined) updateData.notes = data.notes;

      const { data: updatedParty, error } = await supabase
        .from('parties')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return mapPartyFromSupabase(updatedParty);
    } catch (error) {
      console.error(`Error updating party ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase
        .from('parties')
        .delete()
        .eq('id', id);

      if (error) throw error;
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
    city: data.city