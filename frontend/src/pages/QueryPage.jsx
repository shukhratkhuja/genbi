import React, { useState, useEffect } from 'react';
import { useQuery } from '../hooks/useQuery.js';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import QueryInterface from '../components/query/QueryInterface.jsx';
import QueryResults from '../components/query/QueryResults.jsx';
import QueryHistory from '../components/query/QueryHistory.jsx';

const QueryPage = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { queryHistory, fetchQueryHistory, loading } = useQuery();
  const [currentResult, setCurrentResult] = useState(null);
  const [activeTab, setActiveTab] = useState('query');

  useEffect(() => {
    fetchQueryHistory();
  }, []);

  const handleQueryResult = (result) => {
    setCurrentResult(result);
    setActiveTab('results');
  };

  const handleSelectHistoryQuery = (query) => {
    setCurrentResult(query);
    setActiveTab('results');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('query')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'query'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                New Query
              </button>
              <button
                onClick={() => setActiveTab('results')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'results'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Results
                {currentResult && (
                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    1
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                History
                {queryHistory.length > 0 && (
                  <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {queryHistory.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-8">
          {activeTab === 'query' && (
            <QueryInterface onQueryResult={handleQueryResult} />
          )}

          {activeTab === 'results' && (
            <div>
              {currentResult ? (
                <QueryResults result={currentResult} />
              ) : (
                <div className="text-center py-12">
                  <div className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
                    No Results Yet
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-4`}>
                    Execute a query to see results here
                  </p>
                  <button
                    onClick={() => setActiveTab('query')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create New Query
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <QueryHistory
              queries={queryHistory}
              onSelectQuery={handleSelectHistoryQuery}
              loading={loading}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QueryPage;