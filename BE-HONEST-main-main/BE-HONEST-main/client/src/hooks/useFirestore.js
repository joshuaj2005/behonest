import { useState } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { useFirebase } from '../contexts/FirebaseContext';

export function useFirestore() {
  const { db } = useFirebase();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Get a single document
  const getDocument = async (collectionName, docId) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Get multiple documents
  const getDocuments = async (collectionName, conditions = [], orderByField = null, limitCount = null) => {
    try {
      setLoading(true);
      setError(null);
      let q = collection(db, collectionName);
      
      if (conditions.length > 0) {
        q = query(q, ...conditions.map(condition => where(condition.field, condition.operator, condition.value)));
      }
      
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction));
      }
      
      if (limitCount) {
        q = query(q, limit(limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Add a document
  const addDocument = async (collectionName, data) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      return docRef.id;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Update a document
  const updateDocument = async (collectionName, docId, data) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a document
  const deleteDocument = async (collectionName, docId) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Subscribe to real-time updates
  const subscribeToCollection = (collectionName, callback, conditions = [], orderByField = null) => {
    try {
      let q = collection(db, collectionName);
      
      if (conditions.length > 0) {
        q = query(q, ...conditions.map(condition => where(condition.field, condition.operator, condition.value)));
      }
      
      if (orderByField) {
        q = query(q, orderBy(orderByField.field, orderByField.direction));
      }

      return onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
      });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  return {
    getDocument,
    getDocuments,
    addDocument,
    updateDocument,
    deleteDocument,
    subscribeToCollection,
    error,
    loading
  };
} 