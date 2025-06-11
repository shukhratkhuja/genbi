import React, { useState } from 'react';
import { useDatabase } from '../../hooks/useDatabase';
import { X, Database, Loader } from 'lucide-react';

const ConnectionForm = ({ onClose, onSuccess }) => {
  const { createConnection } = useDatabase();
  const [isLoading, setIsLoading] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    db_type: 'postgresql',
    host: '',
    port: 5432,
    username: '',
    password: '',
    database_name: '',
    ssl_enabled: false,
  });

  const dbTypes = [
    { value: 'postgresql', label: 'PostgreSQL', icon: '🐘', defaultPort: 5432 },
    { value: 'mysql', label: 'MySQL', icon: '🐬', defaultPort: 3306 },
    { value: 'sqlite', label: 'SQLite', icon: '📁', defaultPort: null },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'db_type') {
      const selectedDb = dbTypes.find(db => db.value === value);
      setFormData({
        ...formData,
        [name]: value,
        port: selectedDb.defaultPort || formData.port,
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTestStatus(null);
    
    try {
      await createConnection(formData);
      setTestStatus('success');
      setTimeout(() => {
        onSuccess();
      }, 1000);
    } catch (error) {
      setTestStatus('error');
      console.error('Connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Connect Database
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Connection Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Connection Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="My Database"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Database Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Database Type *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {dbTypes.map((db) => (
                <label
                  key={db.value}
                  className={`flex flex-col items-center p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    formData.db_type === db.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="db_type"
                    value={db.value}
                    checked={formData.db_type === db.value}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <span className="text-2xl mb-1">{db.icon}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {db.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Host and Port */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Host *
              </label>
              <input
                type="text"
                name="host"
                required
                value={formData.host}
                onChange={handleChange}
                placeholder="localhost"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Port *
              </label>
              <input
                type="number"
                name="port"
                required
                value={formData.port}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Username *
            </label>
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password *
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Database Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Database Name *
            </label>
            <input
              type="text"
              name="database_name"
              required
              value={formData.database_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* SSL */}
          {formData.db_type === 'postgresql' && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="ssl_enabled"
                id="ssl_enabled"
                checked={formData.ssl_enabled}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <label
                htmlFor="ssl_enabled"
                className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Enable SSL
              </label>
            </div>
          )}

          {/* Status Messages */}
          {testStatus && (
            <div className={`p-3 rounded-lg ${
              testStatus === 'success' 
                ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {testStatus === 'success' 
                ? '✅ Connection successful!' 
                : '❌ Connection failed. Please check your credentials.'
              }
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Connect
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConnectionForm;
