import React from 'react';
import { Database, Brain, BarChart3, Download, Copy, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { formatDuration, copyToClipboard, downloadJSON } from '../../utils/helpers.js';
import SQLDisplay from './SQLDisplay.jsx';
import ChartDisplay from '../charts/ChartDisplay.jsx';
import toast from 'react-hot-toast';

const QueryResults = ({ result }) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  if (!result) return null;

  const handleCopySQL = async () => {
    const success = await copyToClipboard(result.generated_sql);
    if (success) {
      toast.success('SQL copied to clipboard');
    } else {
      toast.error('Failed to copy SQL');
    }
  };

  const handleDownloadData = () => {
    downloadJSON(result.execution_result, `query_result_${Date.now()}.json`);
    toast.success('Data downloaded');
  };

  return (
    <div className="space-y-8">
      {/* Query Info */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Query Executed Successfully
          </h3>
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <CheckCircle className="w-4 h-4" />
            <span>{formatDuration(result.execution_time_ms)}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Records Found:
            </span>
            <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {result.execution_result?.length || 0}
            </span>
          </div>
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Execution Time:
            </span>
            <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {formatDuration(result.execution_time_ms)}
            </span>
          </div>
          <div>
            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Query:
            </span>
            <span className={`ml-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {result.natural_language_query.substring(0, 50)}...
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SQL Query */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.sqlQuery}
              </h3>
            </div>
            <button
              onClick={handleCopySQL}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              title="Copy SQL"
            >
              <Copy className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <SQLDisplay sql={result.generated_sql} />
        </div>

        {/* Chart Visualization */}
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.chartVisualization}
              </h3>
            </div>
            <button
              onClick={handleDownloadData}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              title="Download Data"
            >
              <Download className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <ChartDisplay 
            data={result.execution_result} 
            config={result.chart_config}
          />
        </div>
      </div>

      {/* AI Insights */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-purple-500" />
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.dataInsights}
          </h3>
        </div>
        <div className={`${isDark ? 'bg-gray-900 border-gray-600' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}>
            {result.ai_insights || 'No insights available for this query.'}
          </p>
        </div>
      </div>

      {/* Data Table */}
      {result.execution_result && result.execution_result.length > 0 && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 shadow-sm border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Query Results ({result.execution_result.length} rows)
            </h3>
            <button
              onClick={handleDownloadData}
              className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                  {Object.keys(result.execution_result[0]).map((column) => (
                    <th
                      key={column}
                      className={`text-left py-3 px-4 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.execution_result.slice(0, 100).map((row, index) => (
                  <tr
                    key={index}
                    className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} hover:${isDark ? 'bg-gray-700' : 'bg-gray-50'} transition-colors`}
                  >
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`py-3 px-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                      >
                        {value?.toString() || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {result.execution_result.length > 100 && (
              <div className={`text-center py-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Showing first 100 rows of {result.execution_result.length} total rows
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryResults;