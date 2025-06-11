import React from 'react';
import { Database, BarChart3, Brain, Copy, Download } from 'lucide-react';
import PlotlyChart from '../charts/PlotlyChart';

const QueryResults = ({ result }) => {
  if (!result) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadData = () => {
    const csv = convertToCSV(result.execution_result);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query_results.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data) => {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => 
          JSON.stringify(row[header] || '')
        ).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Query Metadata */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Query Results
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Execution time: {result.execution_time_ms?.toFixed(2)}ms</span>
            <span>•</span>
            <span>{result.execution_result?.length || 0} rows</span>
          </div>
        </div>
        
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          Natural Language Query:
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-gray-900 dark:text-white">
          {result.natural_language_query}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SQL Query */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generated SQL
              </h3>
            </div>
            <button
              onClick={() => copyToClipboard(result.generated_sql)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Copy SQL"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">
            <pre className="text-sm bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-300 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {result.generated_sql}
            </pre>
          </div>
        </div>

        {/* Chart Visualization */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Data Visualization
              </h3>
            </div>
            <button
              onClick={downloadData}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
          <div className="p-6">
            {result.chart_config && Object.keys(result.chart_config).length > 0 ? (
              <PlotlyChart config={result.chart_config} />
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                No chart data available
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center space-x-2 p-6 border-b border-gray-200 dark:border-gray-700">
          <Brain className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            AI-Generated Insights
          </h3>
        </div>
        <div className="p-6">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {result.ai_insights}
          </p>
        </div>
      </div>

      {/* Data Table */}
      {result.execution_result && result.execution_result.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Raw Data ({result.execution_result.length} rows)
            </h3>
            <button
              onClick={downloadData}
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Export CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {Object.keys(result.execution_result[0]).map((header) => (
                    <th
                      key={header}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {result.execution_result.slice(0, 100).map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300"
                      >
                        {value !== null && value !== undefined ? String(value) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {result.execution_result.length > 100 && (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
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
