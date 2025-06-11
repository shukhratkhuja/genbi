import { useCallback } from 'react';
import { databaseService } from '../services/database';
import { useApp } from '../contexts/AppContext';
import { useApi } from './useApi';

export function useDatabase() {
  const { connections, currentConnection, dispatch } = useApp();
  const { executeRequest } = useApi();

  const loadConnections = useCallback(async () => {
    await executeRequest(
      () => databaseService.getConnections(),
      {
        onSuccess: (connections) => {
          dispatch({ type: 'SET_CONNECTIONS', payload: connections });
          if (connections.length > 0 && !currentConnection) {
            dispatch({ type: 'SET_CURRENT_CONNECTION', payload: connections[0] });
          }
        }
      }
    );
  }, [executeRequest, dispatch, currentConnection]);

  const createConnection = useCallback(async (connectionData) => {
    const newConnection = await executeRequest(
      () => databaseService.createConnection(connectionData),
      {
        onSuccess: (connection) => {
          dispatch({ type: 'ADD_CONNECTION', payload: connection });
          dispatch({ type: 'SET_CURRENT_CONNECTION', payload: connection });
        }
      }
    );
    return newConnection;
  }, [executeRequest, dispatch]);

  const updateConnection = useCallback(async (connectionId, connectionData) => {
    const updatedConnection = await executeRequest(
      () => databaseService.updateConnection(connectionId, connectionData),
      {
        onSuccess: (connection) => {
          dispatch({ type: 'UPDATE_CONNECTION', payload: connection });
          if (currentConnection?.id === connectionId) {
            dispatch({ type: 'SET_CURRENT_CONNECTION', payload: connection });
          }
        }
      }
    );
    return updatedConnection;
  }, [executeRequest, dispatch, currentConnection]);

  const deleteConnection = useCallback(async (connectionId) => {
    await executeRequest(
      () => databaseService.deleteConnection(connectionId),
      {
        onSuccess: () => {
          dispatch({ type: 'REMOVE_CONNECTION', payload: connectionId });
        }
      }
    );
  }, [executeRequest, dispatch]);

  const testConnection = useCallback(async (connectionData) => {
    // This would be handled by the create/update connection endpoints
    // which automatically test the connection
    return await executeRequest(() => databaseService.createConnection(connectionData));
  }, [executeRequest]);

  return {
    connections,
    currentConnection,
    loadConnections,
    createConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    hasConnection: connections.length > 0,
    canAddConnection: connections.length === 0, // Max 1 connection per user
  };
}
