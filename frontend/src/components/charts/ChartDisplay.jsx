import React from 'react';
import { BarChart3, TrendingUp, PieChart, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const ChartDisplay = ({ data, config }) => {
  const { isDark } = useTheme();

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className={`mx-auto w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-2`} />
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            No data available for visualization
          </p>
        </div>
      </div>
    );
  }

  // Simple chart implementation for now
  // In production, you would use a proper charting library like Chart.js, Recharts, or Plotly
  const SimpleBarChart = ({ data }) => {
    const columns = Object.keys(data[0]);
    const xColumn = columns[0];
    const yColumn = columns[1] || columns[0];
    
    const maxValue = Math.max(...data.map(item => Number(item[yColumn]) || 0));
    
    return (
      <div className="h-64 flex items-end justify-around p-4 space-x-2">
        {data.slice(0, 10).map((item, index) => {
          const value = Number(item[yColumn]) || 0;
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex flex-col items-center flex-1 max-w-16">
              <div className="relative group">
                <div
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-600 hover:to-blue-500 min-h-1"
                  style={{ height: `${Math.max(height, 4)}%` }}
                ></div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {value.toLocaleString()}
                </div>
              </div>
              
              <span className={`text-xs mt-2 text-center ${isDark ? 'text-gray-400' : 'text-gray-600'} transform -rotate-45 origin-center`}>
                {String(item[xColumn]).substring(0, 8)}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const SimplePieChart = ({ data }) => {
    const columns = Object.keys(data[0]);
    const labelColumn = columns[0];
    const valueColumn = columns[1] || columns[0];
    
    const total = data.reduce((sum, item) => sum + (Number(item[valueColumn]) || 0), 0);
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="grid grid-cols-2 gap-8 items-center">
          {/* Simple pie representation */}
          <div className="relative w-32 h-32">
            <div className="w-full h-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              {data.slice(0, 5).map((item, index) => {
                const value = Number(item[valueColumn]) || 0;
                const percentage = total > 0 ? (value / total) * 100 : 0;
                
                return (
                  <div
                    key={index}
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `conic-gradient(${colors[index]} ${percentage}%, transparent ${percentage}%)`,
                      transform: `rotate(${data.slice(0, index).reduce((sum, prev) => sum + ((Number(prev[valueColumn]) || 0) / total) * 360, 0)}deg)`,
                    }}
                  />
                );
              })}
            </div>
          </div>
          
          {/* Legend */}
          <div className="space-y-2">
            {data.slice(0, 5).map((item, index) => {
              const value = Number(item[valueColumn]) || 0;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={index} className="flex items-center space-x-2 text-xs">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                    {String(item[labelColumn]).substring(0, 15)} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Determine chart type based on data structure
  const renderChart = () => {
    if (!config || Object.keys(config).length === 0) {
      // Default to bar chart
      return <SimpleBarChart data={data} />;
    }

    // If config specifies pie chart
    if (config.data?.[0]?.type === 'pie') {
      return <SimplePieChart data={data} />;
    }

    // Default to bar chart
    return <SimpleBarChart data={data} />;
  };

  return (
    <div className="relative">
      {renderChart()}
      
      {/* Chart type indicator */}
      <div className="absolute top-2 right-2">
        <div className={`p-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          {config?.data?.[0]?.type === 'pie' ? (
            <PieChart className="w-4 h-4 text-gray-500" />
          ) : (
            <BarChart3 className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </div>
      
      {/* Data summary */}
      <div className={`mt-4 text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {data.length} records • {Object.keys(data[0]).length} columns
      </div>
    </div>
  );
};

export default ChartDisplay;
