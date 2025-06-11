import { useState, useEffect } from 'react';
import { databaseService } from '../services/database.js';
import toast from 'react-hot-toast';

export const useDatabase = () => {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const data = await databaseService.getConnections();
      setConnections(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch connections');
      toast.error('Failed to fetch connections');
    } finally {
      setLoading(false);
    }
  };

  const createConnection = async (connectionData) => {
    try {
      setLoading(true);
      const newConnection = await databaseService.createConnection(connectionData);
      setConnections(prev => [...prev, newConnection]);
      toast.success('Database connection created successfully!');
      return { success: true, data: newConnection };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to create connection';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const updateConnection = async (id, connectionData) => {
    try {
      setLoading(true);
      const updatedConnection = await databaseService.updateConnection(id, connectionData);
      setConnections(prev => 
        prev.map(conn => conn.id === id ? updatedConnection : conn)
      );
      toast.success('Connection updated successfully!');
      return { success: true, data: updatedConnection };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to update connection';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const deleteConnection = async (id) => {
    try {
      setLoading(true);
      await databaseService.deleteConnection(id);
      setConnections(prev => prev.filter(conn => conn.id !== id));
      toast.success('Connection deleted successfully!');
      return { success: true };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to delete connection';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  return {
    connections,
    loading,
    error,
    fetchConnections,
    createConnection,
    updateConnection,
    deleteConnection,
  };
};