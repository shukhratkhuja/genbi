import React from 'react';
import { Clock, Database, TrendingUp, RotateCcw } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { formatDate, formatDuration, truncateText } from '../../utils/helpers.js';

const QueryHistory = ({ queries, onSelectQuery, loading }) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className={`w-8 h-8 border-4 ${isDark ? 'border-gray-600' : 'border-gray-200'} border-t-blue-500 rounded-full animate-spin mb-4`}></div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading query history...
          </p>
        </div>
      </div>
    );
  }

  if (!queries || queries.length === 0) {
    return (
      <div className="text-center py-12">
        <Database className={`mx-auto w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
        <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
          No Query History
        </h3>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          Start by asking questions about your data
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
        {t.queryHistory}
      </h3>
      
      <div className="space-y-3">
        {queries.map((query) => (
          <div
            key={query.id}
            onClick={() => onSelectQuery?.(query)}
            className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
              isDark
                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                : 'bg-white border-gray-200 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                  {truncateText(query.natural_language_query, 80)}
                </p>
                
                <div className="flex items-center space-x-4 text-xs">
                  <div className="flex items-center space-x-1">
                    <Clock className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {formatDate(query.created_at)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <TrendingUp className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {formatDuration(query.execution_time_ms)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Database className={`w-3 h-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      {query.execution_result?.length || 0} rows
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                {query.is_successful ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectQuery?.(query);
                  }}
                  className={`p-1 rounded ${
                    isDark ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                  } transition-colors`}
                  title="Rerun query"
                >
                  <RotateCcw className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QueryHistory;