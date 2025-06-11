import { useCallback } from 'react';
import { queryService } from '../services/query';
import { useApp } from '../contexts/AppContext';
import { useApi } from './useApi';

export function useQuery() {
  const { queryHistory, stats, dispatch } = useApp();
  const { executeRequest } = useApi();

  const executeQuery = useCallback(async (naturalLanguageQuery, connectionId) => {
    const result = await executeRequest(
      () => queryService.executeQuery({
        natural_language_query: naturalLanguageQuery,
        connection_id: connectionId
      }),
      {
        onSuccess: (queryResult) => {
          dispatch({ type: 'ADD_QUERY', payload: queryResult });
        }
      }
    );
    return result;
  }, [executeRequest, dispatch]);

  const loadQueryHistory = useCallback(async (limit = 50) => {
    await executeRequest(
      () => queryService.getQueryHistory(limit),
      {
        onSuccess: (history) => {
          dispatch({ type: 'SET_QUERY_HISTORY', payload: history });
        }
      }
    );
  }, [executeRequest, dispatch]);

  const loadStats = useCallback(async () => {
    await executeRequest(
      () => queryService.getQueryStats(),
      {
        onSuccess: (stats) => {
          dispatch({ type: 'SET_STATS', payload: stats });
        }
      }
    );
  }, [executeRequest, dispatch]);

  return {
    queryHistory,
    stats,
    executeQuery,
    loadQueryHistory,
    loadStats,
  };
}
