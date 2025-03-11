import { Document, DocumentType } from '../types/document';

const STORAGE_KEY = 'documents';

// Initialize storage if empty
const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({}));
  }
};

initializeStorage();

export const documentStore = {
  getAll: (): Record<string, Document[]> => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  },

  getByEntityId: (entityId: string): Document[] => {
    const documents = documentStore.getAll();
    return documents[entityId] || [];
  },

  add: (entityId: string, document: Omit<Document, 'id' | 'uploadedAt'>): Document => {
    const documents = documentStore.getAll();
    const entityDocuments = documents[entityId] || [];

    const newDocument: Document = {
      ...document,
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString(),
    };

    documents[entityId] = [...entityDocuments, newDocument];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));

    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(documents)
    }));

    return newDocument;
  },

  remove: (entityId: string, documentId: string): void => {
    const documents = documentStore.getAll();
    const entityDocuments = documents[entityId] || [];
    
    documents[entityId] = entityDocuments.filter(doc => doc.id !== documentId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));

    // Dispatch storage event for cross-tab sync
    window.dispatchEvent(new StorageEvent('storage', {
      key: STORAGE_KEY,
      newValue: JSON.stringify(documents)
    }));
  }
};