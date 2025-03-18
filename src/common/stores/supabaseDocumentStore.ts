import { create } from "zustand";
import { supabase } from "../services/supabaseClient";
import { Document } from "../types/document";
import useSupabaseAuthStore from "./supabaseAuthStore";

interface DocumentState {
  getAll: () => Promise<Document[]>;
  getById: (id: string) => Promise<Document | undefined>;
  getByEntityId: (entityId: string) => Promise<Document[]>;
  create: (
    data: Omit<Document, "id" | "createdAt" | "updatedAt">,
  ) => Promise<Document>;
  update: (id: string, data: Partial<Document>) => Promise<Document>;
  delete: (id: string) => Promise<void>;
}

const useSupabaseDocumentStore = create<DocumentState>(() => ({
  getAll: async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching all documents:", error);
        throw error;
      }

      return data.map(mapDocumentFromSupabase);
    } catch (error) {
      console.error("Error fetching documents:", error);
      return [];
    }
  },

  getById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        if (error.code === "PGRST116") return undefined; // No rows returned
        console.error(`Error fetching document ${id}:`, error);
        throw error;
      }

      return mapDocumentFromSupabase(data);
    } catch (error) {
      console.error(`Error fetching document ${id}:`, error);
      return undefined;
    }
  },

  getByEntityId: async (entityId: string) => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("entity_id", entityId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          `Error fetching documents for entity ${entityId}:`,
          error,
        );
        throw error;
      }

      return data.map(mapDocumentFromSupabase);
    } catch (error) {
      console.error(`Error fetching documents for entity ${entityId}:`, error);
      return [];
    }
  },

  create: async (data) => {
    try {
      const user = useSupabaseAuthStore.getState().user;

      const { data: newDocument, error } = await supabase
        .from("documents")
        .insert({
          entity_id: data.entityId,
          entity_type: data.entityType,
          name: data.name,
          type: data.type,
          file_path: data.filePath,
          file_size: data.fileSize,
          mime_type: data.mimeType,
          uploaded_at: data.uploadedAt,
          uploaded_by: data.uploadedBy || user?.id,
          created_by: user?.id,
          updated_by: user?.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating document:", error);
        throw error;
      }

      return mapDocumentFromSupabase(newDocument);
    } catch (error) {
      console.error("Error creating document:", error);
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
      if (data.entityId) updateData.entity_id = data.entityId;
      if (data.entityType) updateData.entity_type = data.entityType;
      if (data.name) updateData.name = data.name;
      if (data.type) updateData.type = data.type;
      if (data.filePath) updateData.file_path = data.filePath;
      if (data.fileSize !== undefined) updateData.file_size = data.fileSize;
      if (data.mimeType) updateData.mime_type = data.mimeType;
      if (data.uploadedAt) updateData.uploaded_at = data.uploadedAt;
      if (data.uploadedBy) updateData.uploaded_by = data.uploadedBy;

      const { data: updatedDocument, error } = await supabase
        .from("documents")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating document ${id}:`, error);
        throw error;
      }

      return mapDocumentFromSupabase(updatedDocument);
    } catch (error) {
      console.error(`Error updating document ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id);

      if (error) {
        console.error(`Error deleting document ${id}:`, error);
        throw error;
      }
    } catch (error) {
      console.error(`Error deleting document ${id}:`, error);
      throw error;
    }
  },
}));

// Helper function to map Supabase document to our Document type
function mapDocumentFromSupabase(data: any): Document {
  return {
    id: data.id,
    entityId: data.entity_id,
    entityType: data.entity_type,
    name: data.name,
    type: data.type,
    filePath: data.file_path,
    fileSize: data.file_size,
    mimeType: data.mime_type,
    uploadedAt: data.uploaded_at,
    uploadedBy: data.uploaded_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

export default useSupabaseDocumentStore;
