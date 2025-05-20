import { useState } from 'react';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll
} from 'firebase/storage';
import { useFirebase } from '../contexts/FirebaseContext';

export function useStorage() {
  const { storage } = useFirebase();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Upload a file
  const uploadFile = async (file, path) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a storage reference
      const storageRef = ref(storage, path);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return downloadURL;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Delete a file
  const deleteFile = async (path) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a reference to the file
      const fileRef = ref(storage, path);
      
      // Delete the file
      await deleteObject(fileRef);
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // List files in a directory
  const listFiles = async (path) => {
    try {
      setLoading(true);
      setError(null);
      
      // Create a reference to the directory
      const directoryRef = ref(storage, path);
      
      // List all files in the directory
      const result = await listAll(directoryRef);
      
      // Get download URLs for all files
      const files = await Promise.all(
        result.items.map(async (item) => {
          const url = await getDownloadURL(item);
          return {
            name: item.name,
            path: item.fullPath,
            url
          };
        })
      );
      
      return files;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadFile,
    deleteFile,
    listFiles,
    error,
    loading
  };
} 