export type DocumentType = 
  | 'sustainability_declaration'
  | 'bill_of_lading'
  | 'contract'
  | 'other';

export interface Document {
  id: string;
  name: string;
  type: DocumentType;
  size: number;
  lastModified: number;
  content: string; // Base64 encoded content
  uploadedAt: string;
}

export interface DocumentStore {
  [entityId: string]: Document[];
}