import { useState, useCallback, useEffect } from 'react';
import { Document, DocumentType } from '../types/document';
import { documentStore } from '../stores/documentStore';

interface DocumentsState {
  documents: Document[];
  selectedDocument: Document | null;
}

export function useDocuments(entityId: string) {
  const [state, setState] = useState<DocumentsState>(() => ({
    documents: documentStore.getByEntityId(entityId),
    selectedDocument: null
  }));

  // Listen for storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedDocs = documentStore.getByEntityId(entityId);
      setState(prev => ({ ...prev, documents: updatedDocs }));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [entityId]);

  // Update documents when entityId changes
  useEffect(() => {
    setState(prev => ({ ...prev, documents: documentStore.getByEntityId(entityId) }));
  }, [entityId]);

  const handleUpload = useCallback(async (file: File, type: DocumentType = 'other') => {
    const reader = new FileReader();
    
    return new Promise<void>((resolve, reject) => {
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          
          const newDoc = documentStore.add(entityId, {
            name: file.name,
            type,
            size: file.size,
            lastModified: file.lastModified,
            content
          });

          setState(prev => ({ ...prev, documents: [...prev.documents, newDoc] }));
          resolve();
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  }, [entityId]);

  const handleDelete = useCallback((documentId: string) => {
    documentStore.remove(entityId, documentId);
    setState(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }));
  }, [entityId]);

  const handleView = useCallback((document: Document) => {
    setState(prev => ({ ...prev, selectedDocument: document }));
  }, []);

  const closeViewer = useCallback(() => {
    setState(prev => ({ ...prev, selectedDocument: null }));
  }, []);

  return {
    documents: state.documents,
    selectedDocument: state.selectedDocument,
    setDocuments: useCallback((docs: Document[]) => {
      setState(prev => ({ ...prev, documents: docs }));
    }, []),
    handleUpload,
    handleDelete,
    handleView,
    closeViewer
  };
}