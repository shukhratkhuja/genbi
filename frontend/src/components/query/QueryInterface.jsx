import React, { useState } from 'react';
import { useQuery } from '../../hooks/useQuery';
import { useDatabase } from '../../hooks/useDatabase';
import { Search, BarChart3, Send } from 'lucide-react';

const QueryInterface = ({ onQueryResult }) => {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { executeQuery } = useQuery();
  const { currentConnection } = useDatabase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || !currentConnection) return;
    
    setIsLoading(true);
    try {
      const result = await executeQuery(query, currentConnection.id);
      onQueryResult(result);
      setQuery(''); // Clear query after successful execution
    } catch (error) {
      console.error('Query failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const sampleQueries = [
    "Show me sales data for the last quarter",
    "What are the top 10 customers by revenue?",
    "Give me monthly sales trends for 2024",
    "Show inventory levels by product category",
    "What's the average order value this year?"
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Main Query Interface */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 mb-6">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask your data questions in natural language..."
              className="w-full pl-12 pr-4 py-4 text-lg rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors resize-none"
              rows="3"
              disabled={!currentConnection}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim() || !currentConnection}
            className="bg-blue-600 text-white px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 min-w-[120px]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Ask</span>
              </>
            )}
          </button>
        </form>
        
        {!currentConnection && (
          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-700 dark:text-yellow-400 text-sm">
              Please connect a database first to start querying your data.
            </p>
          </div>
        )}
      </div>

      {/* Sample Queries */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Sample Queries
        </h3>
        <div className="grid gap-2">
          {sampleQueries.map((sampleQuery, index) => (
            <button
              key={index}
              onClick={() => setQuery(sampleQuery)}
              disabled={!currentConnection}
              className="text-left p-3 rounded-lg bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sampleQuery}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QueryInterface;
