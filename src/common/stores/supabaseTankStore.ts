import { create } from "zustand";
import { supabase } from "../services/supabaseClient";
import { Tank, TankQuality } from "../types/tank";
import useSupabaseAuthStore from "./supabaseAuthStore";
import useSupabaseShipmentStore from "./supabaseShipmentStore";
import {
  validateQualityRanges,
  validateQualityAgainstContract,
} from "../utils/qualityValidation";

interface TankState {
  getAll: () => Promise<Tank[]>;
  getById: (id: string) => Promise<Tank | undefined>;
  getByShipmentId: (shipmentId: string) => Promise<Tank[]>;
  create: (data: Omit<Tank, "id" | "createdAt" | "updatedAt">) => Promise<Tank>;
  update: (id: string, data: Partial<Tank>) => Promise<Tank>;
  delete: (id: string) => Promise<void>;
  getShipmentQuality: (shipmentId: string) => Promise<TankQuality | null>;
}

const useSupabaseTankStore = create<TankState>(() => ({
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from("tanks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all tanks:", error);
        throw error;
      }

      return data.map(mapTankFromSupabase);
    } catch (error) {
      console.error("Error fetching tanks:", error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("tanks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return undefined; // No rows returned
        console.error(`Error fetching tank ${id}:", error);
        throw error;
      }

      return mapTankFromSupabase(data);
    } catch (error) {
      console.error(`Error fetching tank ${id}:`, error);
      return undefined;
    }
  },

  getByShipmentId: async (shipmentId: string) => {
    try {
      const { data, error } = await supabase
        .from("tanks")
        .select("*")
        .eq("shipment_id", shipmentId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(`Error fetching tanks for shipment ${shipmentId}:`, error);
        throw error;
      }

      return data.map(mapTankFromSupabase);
    } catch (error) {
      console.error(`Error fetching tanks for shipment ${shipmentId}:`, error);
      return [];
    }
  },

  create: async (data) => {
    try {
      const user = useSupabaseAuthStore.getState().user;

      // Validate quality if provided
      if (data.quality) {
        const { isValid, errors } = validateQualityRanges(data.quality);
        if (!isValid) {
          throw new Error(
            `Invalid quality parameters: ${Object.values(errors).join(", ")}`,
          );
        }
      }

      // Get shipment to validate
      const shipment = await useSupabaseShipmentStore.getById(data.shipmentId);
      if (!shipment) {
        throw new Error("Shipment not found");
      }

      if (shipment.status === "cancelled") {
        throw new Error("Cannot add tanks to cancelled shipment");
      }

      if (shipment.isFulfilled) {
        throw new Error("Cannot add tanks to fulfilled shipment");
      }

      // Validate quantity against remaining shipment quantity
      const existingTanks = await useSupabaseTankStore.getByShipmentId(
        data.shipmentId,
      );
      const totalTankQuantity = existingTanks.reduce(
        (sum, tank) => sum + tank.quantity,
        0,
      );
      const remainingQuantity = shipment.quantity - totalTankQuantity;

      if (data.quantity > remainingQuantity) {
        throw new Error(
          `Tank quantity exceeds remaining shipment quantity (${remainingQuantity.toLocaleString()} MT)`,
        );
      }

      // Validate dates are within shipment range
      const departureDate = new Date(data.departureDate);
      const arrivalDate = new Date(data.arrivalDate);
      const shipmentDepartureDate = new Date(shipment.departureDate);
      const shipmentArrivalDate = new Date(shipment.arrivalDate);

      if (
        departureDate < shipmentDepartureDate ||
        arrivalDate > shipmentArrivalDate
      ) {
        throw new Error("Tank dates must be within shipment date range");
      }

      if (arrivalDate < departureDate) {
        throw new Error("Arrival date must be after departure date");
      }

      // Generate sequence for ID
      const sequence = (existingTanks.length + 1).toString().padStart(3, "0");
      const tankId = `${data.shipmentId}-TNK-${sequence}`;

      const { data: newTank, error } = await supabase
        .from("tanks")
        .insert({
          id: tankId,
          shipment_id: data.shipmentId,
          status: data.status,
          quantity: data.quantity,
          quality: data.quality,
          departure_date: data.departureDate,
          arrival_date: data.arrivalDate,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating tank:", error);
        throw error;
      }

      // Update shipment quality
      await updateShipmentQualityAfterTankChange(data.shipmentId);

      return mapTankFromSupabase(newTank);
    } catch (error) {
      console.error("Error creating tank:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const user = useSupabaseAuthStore.getState().user;

      // Get the current tank
      const tank = await useSupabaseTankStore.getById(id);
      if (!tank) {
        throw new Error(`Tank with ID ${id} not found`);
      }

      // Validate quality if being updated
      if (data.quality) {
        const { isValid, errors } = validateQualityRanges(data.quality);
        if (!isValid) {
          throw new Error(
            `Invalid quality parameters: ${Object.values(errors).join(", ")}`,
          );
        }
      }

      // Get shipment to validate
      const shipment = await useSupabaseShipmentStore.getById(tank.shipmentId);
      if (!shipment) {
        throw new Error("Shipment not found");
      }

      // Validate quantity if being updated
      if (data.quantity !== undefined) {
        const otherTanks = (
          await useSupabaseTankStore.getByShipmentId(tank.shipmentId)
        ).filter((t) => t.id !== id);
        const totalOtherQuantity = otherTanks.reduce(
          (sum, t) => sum + t.quantity,
          0,
        );
        const remainingQuantity = shipment.quantity - totalOtherQuantity;

        if (data.quantity > remainingQuantity) {
          throw new Error(
            `Tank quantity exceeds remaining shipment quantity (${remainingQuantity.toLocaleString()} MT)`,
          );
        }
      }

      // Validate dates if being updated
      if (data.departureDate || data.arrivalDate) {
        const departureDate = new Date(
          data.departureDate || tank.departureDate,
        );
        const arrivalDate = new Date(data.arrivalDate || tank.arrivalDate);
        const shipmentDepartureDate = new Date(shipment.departureDate);
        const shipmentArrivalDate = new Date(shipment.arrivalDate);

        if (
          departureDate < shipmentDepartureDate ||
          arrivalDate > shipmentArrivalDate
        ) {
          throw new Error("Tank dates must be within shipment date range");
        }

        if (arrivalDate < departureDate) {
          throw new Error("Arrival date must be after departure date");
        }
      }

      const updateData: any = {
        updated_by: user?.id,
        updated_at: new Date().toISOString(),
      };

      // Map data to Supabase format
      if (data.status) updateData.status = data.status;
      if (data.quantity !== undefined) updateData.quantity = data.quantity;
      if (data.quality !== undefined) updateData.quality = data.quality;
      if (data.departureDate) updateData.departure_date = data.departureDate;
      if (data.arrivalDate) updateData.arrival_date = data.arrivalDate;

      const { data: updatedTank, error } = await supabase
        .from("tanks")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating tank ${id}:`, error);
        throw error;
      }

      // Update shipment quality if quality changed
      if (data.quality) {
        await updateShipmentQualityAfterTankChange(tank.shipmentId);
      }

      return mapTankFromSupabase(updatedTank);
    } catch (error) {
      console.error(`Error updating tank ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      // Get the tank before deletion to get the shipment ID
      const tank = await useSupabaseTankStore.getById(id);
      if (!tank) return;

      const shipmentId = tank.shipmentId;

      // Validate tank can be deleted
      const shipment = await useSupabaseShipmentStore.getById(shipmentId);
      if (shipment?.isFulfilled) {
        throw new Error("Cannot delete tank from fulfilled shipment");
      }

      const { error } = await supabase.from("tanks").delete().eq("id", id);

      if (error) {
        console.error(`Error deleting tank ${id}:`, error);
        throw error;
      }

      // Update shipment quality after tank deletion
      await updateShipmentQualityAfterTankChange(shipmentId);
    } catch (error) {
      console.error(`Error deleting tank ${id}:`, error);
      throw error;
    }
  },

  getShipmentQuality: async (shipmentId) => {
    try {
      const tanks = await useSupabaseTankStore.getByShipmentId(shipmentId);
      return calculateWeightedQuality(tanks);
    } catch (error) {
      console.error(`Error getting shipment quality for ${shipmentId}:`, error);
      return null;
    }
  },
}));

// Helper function to map Supabase tank to our Tank type
function mapTankFromSupabase(data: any): Tank {
  return {
    id: data.id,
    shipmentId: data.shipment_id,
    status: data.status,
    quantity: data.quantity,
    quality: data.quality,
    departureDate: data.departure_date,
    arrivalDate: data.arrival_date,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

// Helper to calculate weighted average quality
function calculateWeightedQuality(tanks: Tank[]): TankQuality | null {
  const tanksWithQuality = tanks.filter((tank) => tank.quality !== null);

  if (tanksWithQuality.length === 0) {
    return null;
  }

  const totalQuantity = tanksWithQuality.reduce(
    (sum, tank) => sum + tank.quantity,
    0,
  );

  const weightedQuality: TankQuality = {
    FFA: 0,
    IV: 0,
    S: 0,
    MI: 0,
  };

  tanksWithQuality.forEach((tank) => {
    if (tank.quality) {
      const weight = tank.quantity / totalQuantity;
      weightedQuality.FFA += tank.quality.FFA * weight;
      weightedQuality.IV += tank.quality.IV * weight;
      weightedQuality.S += tank.quality.S * weight;
      weightedQuality.MI += tank.quality.MI * weight;
    }
  });

  return weightedQuality;
}

// Helper to update shipment quality
async function updateShipmentQualityAfterTankChange(
  shipmentId: string,
): Promise<void> {
  try {
    // Get updated quality from tanks
    const tanks = await useSupabaseTankStore.getByShipmentId(shipmentId);
    const quality = calculateWeightedQuality(tanks);

    // Update shipment quality
    await useSupabaseShipmentStore.updateQuality(shipmentId, quality);
  } catch (error) {
    console.error(`Error updating shipment quality for ${shipmentId}:`, error);
  }
}

export default useSupabaseTankStore;