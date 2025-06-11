import { useState, useCallback } from 'react';
import { useApp } from '../contexts/AppContext';

export function useApi() {
  const { dispatch } = useApp();
  const [loading, setLoading] = useState(false);

  const executeRequest = useCallback(async (requestFn, options = {}) => {
    const { showLoading = true, onSuccess, onError } = options;
    
    try {
      if (showLoading) {
        setLoading(true);
        dispatch({ type: 'SET_LOADING', payload: true });
      }
      
      const result = await requestFn();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'An error occurred';
      
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      if (onError) {
        onError(error);
      }
      
      throw error;
    } finally {
      setLoading(false);
      if (showLoading) {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [dispatch]);

  return { executeRequest, loading };
}