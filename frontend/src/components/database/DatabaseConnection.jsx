import React, { useState, useEffect } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { Database, Plus, Settings, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import ConnectionForm from './ConnectionForm';
import ConnectionSettings from './ConnectionSettings';

const DatabaseConnection = () => {
  const {
    connections,
    currentConnection,
    loadConnections,
    deleteConnection,
    canAddConnection,
    hasConnection
  } = useDatabase();
  
  const [showForm, setShowForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleDelete = async () => {
    if (currentConnection) {
      await deleteConnection(currentConnection.id);
      setDeleteConfirm(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'failed':
        return 'Connection Failed';
      default:
        return 'Connecting...';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Database Connection
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your database connection. You can have one active connection at a time.
        </p>
      </div>

      {!hasConnection ? (
        // No connection state
        <div className="text-center py-12">
          <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No database connected
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect your first data source to start analyzing your data with AI.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Connect Database
          </button>
        </div>
      ) : (
        // Has connection state
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8 text-blue-500" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currentConnection?.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(currentConnection?.connection_status)}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {getStatusText(currentConnection?.connection_status)}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <label className="text-gray-500 dark:text-gray-400">Type</label>
                <p className="font-medium text-gray-900 dark:text-white capitalize">
                  {currentConnection?.db_type}
                </p>
              </div>
              <div>
                <label className="text-gray-500 dark:text-gray-400">Host</label>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentConnection?.host}
                </p>
              </div>
              <div>
                <label className="text-gray-500 dark:text-gray-400">Port</label>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentConnection?.port}
                </p>
              </div>
              <div>
                <label className="text-gray-500 dark:text-gray-400">Database</label>
                <p className="font-medium text-gray-900 dark:text-white">
                  {currentConnection?.database_name}
                </p>
              </div>
            </div>

            {currentConnection?.last_tested && (
              <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                Last tested: {new Date(currentConnection.last_tested).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Connection Form Modal */}
      {showForm && (
        <ConnectionForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            loadConnections();
          }}
        />
      )}

      {/* Settings Modal */}
      {showSettings && currentConnection && (
        <ConnectionSettings
          connection={currentConnection}
          onClose={() => setShowSettings(false)}
          onSuccess={() => {
            setShowSettings(false);
            loadConnections();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Delete Database Connection
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this connection? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseConnection;