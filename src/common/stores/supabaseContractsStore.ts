import { create } from "zustand";
import { supabase } from "../services/supabaseClient";
import { Contract } from "../types/contract";
import useSupabaseAuthStore from "./supabaseAuthStore";

interface ContractsState {
  getAll: () => Promise<Contract[]>;
  getById: (id: string) => Promise<Contract | undefined>;
  create: (
    data: Omit<Contract, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Contract>;
  update: (id: string, data: Partial<Contract>) => Promise<Contract>;
  delete: (id: string) => Promise<void>;
}

const useSupabaseContractsStore = create<ContractsState>(() => ({
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      return data.map(mapContractFromSupabase);
    } catch (error) {
      console.error("Error fetching contracts:", error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return undefined; // No rows returned
        throw error;
      }

      return mapContractFromSupabase(data);
    } catch (error) {
      console.error(`Error fetching contract ${id}:`, error);
      return undefined;
    }
  },

  create: async (data) => {
    try {
      const user = useSupabaseAuthStore.getState().user;

      const { data: newContract, error } = await supabase
        .from("contracts")
        .insert({
          type: data.type,
          status: data.status,
          buyer_id: data.buyerId,
          seller_id: data.sellerId,
          buyer_name: data.buyerName,
          seller_name: data.sellerName,
          product_type: data.productType,
          incoterm: data.incoterm,
          quantity: data.quantity,
          allowed_variance: data.allowedVariance,
          unit_price: data.unitPrice,
          currency: data.currency,
          payment_terms: data.paymentTerms,
          quality_ffa: data.qualityFFA,
          quality_iv: data.qualityIV,
          quality_s: data.qualityS,
          quality_m1: data.qualityM1,
          packing_standard: data.packingStandard,
          origin_country: data.originCountry,
          delivery_country: data.deliveryCountry,
          delivery_port: data.deliveryPort,
          loading_start_date: data.loadingStartDate,
          loading_period: data.loadingPeriod,
          loading_duration: data.loadingDuration,
          delivery_date: data.deliveryDate,
          external_reference_id: data.externalReferenceId,
          broker: data.broker,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      return mapContractFromSupabase(newContract);
    } catch (error) {
      console.error("Error creating contract:", error);
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
      if (data.status) updateData.status = data.status;
      if (data.buyerId) updateData.buyer_id = data.buyerId;
      if (data.sellerId) updateData.seller_id = data.sellerId;
      if (data.buyerName) updateData.buyer_name = data.buyerName;
      if (data.sellerName) updateData.seller_name = data.sellerName;
      if (data.productType) updateData.product_type = data.productType;
      if (data.incoterm) updateData.incoterm = data.incoterm;
      if (data.quantity) updateData.quantity = data.quantity;
      if (data.allowedVariance)
        updateData.allowed_variance = data.allowedVariance;
      if (data.unitPrice) updateData.unit_price = data.unitPrice;
      if (data.currency) updateData.currency = data.currency;
      if (data.paymentTerms) updateData.payment_terms = data.paymentTerms;
      if (data.qualityFFA) updateData.quality_ffa = data.qualityFFA;
      if (data.qualityIV) updateData.quality_iv = data.qualityIV;
      if (data.qualityS) updateData.quality_s = data.qualityS;
      if (data.qualityM1) updateData.quality_m1 = data.qualityM1;
      if (data.packingStandard)
        updateData.packing_standard = data.packingStandard;
      if (data.originCountry) updateData.origin_country = data.originCountry;
      if (data.deliveryCountry)
        updateData.delivery_country = data.deliveryCountry;
      if (data.deliveryPort) updateData.delivery_port = data.deliveryPort;
      if (data.loadingStartDate)
        updateData.loading_start_date = data.loadingStartDate;
      if (data.loadingPeriod) updateData.loading_period = data.loadingPeriod;
      if (data.loadingDuration)
        updateData.loading_duration = data.loadingDuration;
      if (data.deliveryDate) updateData.delivery_date = data.deliveryDate;
      if (data.externalReferenceId !== undefined)
        updateData.external_reference_id = data.externalReferenceId;
      if (data.broker !== undefined) updateData.broker = data.broker;

      const { data: updatedContract, error } = await supabase
        .from("contracts")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      return mapContractFromSupabase(updatedContract);
    } catch (error) {
      console.error(`Error updating contract ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase.from("contracts").delete().eq("id", id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting contract ${id}:`, error);
      throw error;
    }
  },
}));

// Helper function to map Supabase contract to our Contract type
function mapContractFromSupabase(data: any): Contract {
  return {
    id: data.id,
    type: data.type,
    status: data.status,
    buyerId: data.buyer_id,
    sellerId: data.seller_id,
    buyerName: data.buyer_name,
    sellerName: data.seller_name,
    productType: data.product_type,
    incoterm: data.incoterm,
    quantity: data.quantity,
    allowedVariance: data.allowed_variance,
    unitPrice: data.unit_price,
    currency: data.currency,
    paymentTerms: data.payment_terms,
    qualityFFA: data.quality_ffa,
    qualityIV: data.quality_iv,
    qualityS: data.quality_s,
    qualityM1: data.quality_m1,
    packingStandard: data.packing_standard,
    originCountry: data.origin_country,
    deliveryCountry: data.delivery_country,
    deliveryPort: data.delivery_port,
    loadingStartDate: data.loading_start_date,
    loadingPeriod: data.loading_period,
    loadingDuration: data.loading_duration,
    deliveryDate: data.delivery_date,
    externalReferenceId: data.external_reference_id,
    broker: data.broker,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export default useSupabaseContractsStore;
