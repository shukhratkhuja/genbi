import React, { useState, useEffect } from 'react';
import { Search, Send, BarChart3, Database, Brain, Loader2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useDatabase } from '../../hooks/useDatabase.js';
import { useQuery } from '../../hooks/useQuery.js';
import toast from 'react-hot-toast';

const QueryInterface = ({ onQueryResult }) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { connections } = useDatabase();
  const { executeQuery, loading } = useQuery();
  
  const [query, setQuery] = useState('');
  const [selectedConnection, setSelectedConnection] = useState(null);

  useEffect(() => {
    // Auto-select first connection if available
    if (connections.length > 0 && !selectedConnection) {
      setSelectedConnection(connections[0]);
    }
  }, [connections, selectedConnection]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }
    
    if (!selectedConnection) {
      toast.error('Please select a database connection');
      return;
    }

    const result = await executeQuery(query, selectedConnection.id);
    if (result.success) {
      onQueryResult?.(result.data);
      setQuery(''); // Clear query after successful execution
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const exampleQueries = [
    'Show me sales by month for this year',
    'What are the top 10 customers by revenue?',
    'Compare sales between regions',
    'Find products with declining sales',
    'Show revenue trends for last 6 months',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className={`text-4xl sm:text-5xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {t.subtitle}
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
          Ask questions about your data in plain language and get instant insights
        </p>
      </div>

      {/* Connection Selector */}
      {connections.length > 0 && (
        <div className="max-w-4xl mx-auto mb-6">
          <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Select Database Connection:
          </label>
          <select
            value={selectedConnection?.id || ''}
            onChange={(e) => {
              const connection = connections.find(c => c.id === parseInt(e.target.value));
              setSelectedConnection(connection);
            }}
            className={`w-full px-4 py-2 border rounded-lg ${
              isDark
                ? 'bg-gray-800 border-gray-600 text-white'
                : 'bg-white border-gray-300 text-gray-900'
            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
          >
            <option value="">Select a connection...</option>
            {connections.map((connection) => (
              <option key={connection.id} value={connection.id}>
                {connection.name} ({connection.db_type})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Query Input */}
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="relative">
            <div className="flex items-center">
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={t.queryPlaceholder}
                  rows={3}
                  className={`w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl resize-none ${
                    isDark
                      ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500'
                      : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500 focus:border-blue-500'
                  } focus:outline-none transition-colors`}
                />
              </div>
              <button
                type="submit"
                disabled={loading || !query.trim() || !selectedConnection}
                className="ml-4 bg-blue-500 text-white px-6 py-4 rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                <span className="hidden sm:block">{t.askButton}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* No Connections Warning */}
      {connections.length === 0 && (
        <div className={`max-w-4xl mx-auto p-6 rounded-lg border-2 border-dashed ${
          isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-gray-50'
        }`}>
          <div className="text-center">
            <Database className={`mx-auto w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
            <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
              No Database Connections
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-4`}>
              You need to connect a database before you can start querying your data.
            </p>
            <a
              href="/databases"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Database className="w-4 h-4" />
              <span>Connect Database</span>
            </a>
          </div>
        </div>
      )}

      {/* Example Queries */}
      {connections.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Example Queries:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {exampleQueries.map((example, index) => (
              <button
                key={index}
                onClick={() => setQuery(example)}
                className={`p-3 text-left rounded-lg border transition-colors ${
                  isDark
                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-sm">{example}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryInterface;