import { create } from "zustand";
import { supabase } from "../services/supabaseClient";
import { Shipment } from "../types/shipment";
import useSupabaseAuthStore from "./supabaseAuthStore";
import { logSupabaseError } from "./supabaseStoreUtils";

interface ShipmentState {
  getAll: () => Promise<Shipment[]>;
  getById: (id: string) => Promise<Shipment | undefined>;
  getByContractId: (contractId: string) => Promise<Shipment[]>;
  create: (
    data: Omit<Shipment, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Shipment>;
  update: (id: string, data: Partial<Shipment>) => Promise<Shipment>;
  updateQuality: (id: string, quality?: any) => Promise<void>;
  delete: (id: string) => Promise<void>;
}

const useSupabaseShipmentStore = create<ShipmentState>(() => ({
  getAll: async () => {
    try {
      // First check if the table exists and has data
      const { count, error: countError } = await supabase
        .from("shipments")
        .select("*", { count: "exact", head: true });

      if (countError) {
        logSupabaseError(`checking shipments table`, countError);
        return [];
      }

      // If no data, return empty array
      if (count === 0) {
        console.log(`No shipments found in database`);
        return [];
      }

      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        logSupabaseError("fetching shipments", error);
        return [];
      }

      return data.map(mapShipmentFromSupabase);
    } catch (error) {
      console.error("Error fetching shipments:", error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return undefined; // No rows returned
        logSupabaseError(`fetching shipment ${id}`, error);
        return undefined;
      }

      return mapShipmentFromSupabase(data);
    } catch (error) {
      console.error(`Error fetching shipment ${id}:`, error);
      return undefined;
    }
  },

  getByContractId: async (contractId: string) => {
    try {
      const { data, error } = await supabase
        .from("shipments")
        .select("*")
        .eq("contract_id", contractId)
        .order("created_at", { ascending: false });

      if (error) {
        logSupabaseError(
          `fetching shipments for contract ${contractId}`,
          error,
        );
        return [];
      }

      return data.map(mapShipmentFromSupabase);
    } catch (error) {
      console.error(
        `Error fetching shipments for contract ${contractId}:`,
        error,
      );
      return [];
    }
  },

  create: async (data) => {
    try {
      const user = useSupabaseAuthStore.getState().user;

      const { data: newShipment, error } = await supabase
        .from("shipments")
        .insert({
          contract_id: data.contractId,
          status: data.status,
          quantity: data.quantity,
          departure_date: data.departureDate,
          arrival_date: data.arrivalDate,
          origin_country: data.originCountry,
          destination_country: data.destinationCountry,
          destination_port: data.destinationPort,
          is_fulfilled: data.isFulfilled,
          quality: data.quality,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        logSupabaseError("creating shipment", error);
        throw error;
      }

      return mapShipmentFromSupabase(newShipment);
    } catch (error) {
      console.error("Error creating shipment:", error);
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
      if (data.contractId !== undefined)
        updateData.contract_id = data.contractId;
      if (data.status) updateData.status = data.status;
      if (data.quantity !== undefined) updateData.quantity = data.quantity;
      if (data.departureDate) updateData.departure_date = data.departureDate;
      if (data.arrivalDate) updateData.arrival_date = data.arrivalDate;
      if (data.originCountry) updateData.origin_country = data.originCountry;
      if (data.destinationCountry)
        updateData.destination_country = data.destinationCountry;
      if (data.destinationPort)
        updateData.destination_port = data.destinationPort;
      if (data.isFulfilled !== undefined)
        updateData.is_fulfilled = data.isFulfilled;
      if (data.quality !== undefined) updateData.quality = data.quality;

      const { data: updatedShipment, error } = await supabase
        .from("shipments")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        logSupabaseError(`updating shipment ${id}`, error);
        throw error;
      }

      return mapShipmentFromSupabase(updatedShipment);
    } catch (error) {
      console.error(`Error updating shipment ${id}:`, error);
      throw error;
    }
  },

  updateQuality: async (id, quality) => {
    try {
      const user = useSupabaseAuthStore.getState().user;

      const { error } = await supabase
        .from("shipments")
        .update({
          quality,
          updated_by: user?.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) {
        logSupabaseError(`updating shipment quality ${id}`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error updating shipment quality ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase.from("shipments").delete().eq("id", id);

      if (error) {
        logSupabaseError(`deleting shipment ${id}`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting shipment ${id}:`, error);
      throw error;
    }
  },
}));

// Helper function to map Supabase shipment to our Shipment type
function mapShipmentFromSupabase(data: any): Shipment {
  return {
    id: data.id,
    contractId: data.contract_id,
    status: data.status,
    quantity: data.quantity,
    departureDate: data.departure_date,
    arrivalDate: data.arrival_date,
    originCountry: data.origin_country,
    destinationCountry: data.destination_country,
    destinationPort: data.destination_port,
    isFulfilled: data.is_fulfilled,
    quality: data.quality,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export default useSupabaseShipmentStore;
