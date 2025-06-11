import { useState } from 'react';
import { queryService } from '../services/query.js';
import toast from 'react-hot-toast';

export const useQuery = () => {
  const [queryHistory, setQueryHistory] = useState([]);
  const [queryStats, setQueryStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeQuery = async (naturalQuery, connectionId) => {
    try {
      setLoading(true);
      setError(null);
      const result = await queryService.executeQuery(naturalQuery, connectionId);
      setQueryHistory(prev => [result, ...prev]);
      toast.success('Query executed successfully!');
      return { success: true, data: result };
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Failed to execute query';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryHistory = async () => {
    try {
      setLoading(true);
      const data = await queryService.getQueryHistory();
      setQueryHistory(data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch query history');
    } finally {
      setLoading(false);
    }
  };

  const fetchQueryStats = async () => {
    try {
      const stats = await queryService.getQueryStats();
      setQueryStats(stats);
    } catch (err) {
      console.error('Failed to fetch query stats:', err);
    }
  };

  return {
    queryHistory,
    queryStats,
    loading,
    error,
    executeQuery,
    fetchQueryHistory,
    fetchQueryStats,
  };
};