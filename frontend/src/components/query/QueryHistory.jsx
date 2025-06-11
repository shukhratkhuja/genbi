import React, { useEffect } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { Clock, BarChart3, AlertCircle } from 'lucide-react';

const QueryHistory = ({ onSelectQuery }) => {
  const { queryHistory, loadQueryHistory } = useQuery();

  useEffect(() => {
    loadQueryHistory();
  }, [loadQueryHistory]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!queryHistory || queryHistory.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Query History
        </h3>
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">
            No queries executed yet. Start by asking a question about your data!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Queries ({queryHistory.length})
        </h3>
      </div>
      
      <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-96 overflow-y-auto">
        {queryHistory.map((query) => (
          <div
            key={query.id}
            onClick={() => onSelectQuery(query)}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                  {query.natural_language_query}
                </p>
                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  <span>{formatTime(query.created_at)}</span>
                  <span>{query.execution_time_ms?.toFixed(2)}ms</span>
                  <span>{query.execution_result?.length || 0} rows</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {query.is_successful ? (
                  <BarChart3 className="w-4 h-4 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryHistory;
