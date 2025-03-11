// Common Types
export interface BaseItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
  onClick?: () => void;
}

export interface DocumentStatus {
  status: 'uploaded';
  date: string;
}

export interface Document {
  label: string;
  document: DocumentStatus | null;
  required?: boolean;
}

export interface DetailSection {
  title: string;
  rows: DetailRow[];
}

export interface DetailRow {
  label: string;
  value: React.ReactNode;
}

export interface RelatedItemGroup {
  title: string;
  items: BaseItem[];
}

// Status Types
export type StatusType = 
  | 'in_transit'
  | 'discharged'
  | 'pending'
  | 'active'
  | 'closed';

export interface StatusConfig {
  bgColor: string;
  textColor: string;
  borderColor: string;
}