// src/components/charts/FullscreenChartModal.jsx
import React from 'react';
import { X, Download, Maximize2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

const FullscreenChartModal = ({ isOpen, onClose, data, config, title }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  if (!isOpen) return null;

  // Enhanced Bar Chart для полноэкранного режима
  const FullscreenBarChart = ({ data }) => {
    const columns = Object.keys(data[0]);
    const xColumn = columns[0];
    const yColumn = columns[1];
    
    const chartData = data.map(item => ({
      label: String(item[xColumn] || 'Unknown'),
      value: Number(item[yColumn]) || 0,
      originalData: item
    }));
    
    const maxValue = Math.max(...chartData.map(item => item.value));
    
    const formatValue = (value) => {
      if (value >= 1000000000) {
        return `${(value / 1000000000).toFixed(1)}B`;
      } else if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      } else if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
    };

    const formatLabel = (label) => {
      return label.length > 20 ? label.substring(0, 20) + '...' : label;
    };
    
    return (
      <div className="h-96 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-16 w-20 flex flex-col justify-between text-sm text-gray-500 py-4">
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(maxValue * 0.75)}</span>
          <span>{formatValue(maxValue * 0.5)}</span>
          <span>{formatValue(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className="ml-20 mr-4 h-full flex items-end justify-between space-x-2 py-4">
          {chartData.map((item, index) => {
            const height = maxValue > 0 ? Math.max((item.value / maxValue) * 85, 2) : 2;
            const barWidth = Math.max(100 / chartData.length - 1, 5);
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center group relative h-full"
                style={{ width: `${barWidth}%` }}
              >
                {/* Bar container */}
                <div className="flex-1 flex items-end w-full justify-center">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                    <div className="font-medium text-base">{item.label}</div>
                    <div className="text-gray-300 text-lg">{formatValue(item.value)}</div>
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer shadow-lg hover:shadow-xl"
                    style={{ height: `${height}%`, minHeight: '8px' }}
                  />
                </div>
                
                {/* Label */}
                <div className="mt-3 h-12 flex items-center justify-center">
                  <span 
                    className={`text-sm text-center leading-tight ${isDark ? 'text-gray-300' : 'text-gray-700'} font-medium`}
                    style={{ 
                      transform: chartData.length > 8 ? 'rotate(-45deg)' : 'none',
                      transformOrigin: 'center',
                      maxWidth: '120px'
                    }}
                  >
                    {formatLabel(item.label)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Enhanced Pie Chart для полноэкранного режима
  const FullscreenPieChart = ({ data }) => {
    const columns = Object.keys(data[0]);
    const labelColumn = columns[0];
    const valueColumn = columns[1];
    
    const chartData = data.map(item => ({
      label: String(item[labelColumn] || 'Unknown'),
      value: Number(item[valueColumn]) || 0
    }));
    
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1'
    ];
    
    let cumulativePercentage = 0;
    
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="flex items-center space-x-12">
          {/* Pie Chart */}
          <div className="relative">
            <svg width="280" height="280" className="transform -rotate-90">
              <circle
                cx="140"
                cy="140"
                r="120"
                fill="none"
                stroke={isDark ? '#374151' : '#E5E7EB'}
                strokeWidth="3"
              />
              {chartData.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const circumference = 2 * Math.PI * 120;
                const dashArray = `${(percentage / 100) * circumference} ${circumference}`;
                const dashOffset = -(cumulativePercentage / 100) * circumference;
                
                cumulativePercentage += percentage;
                
                return (
                  <circle
                    key={index}
                    cx="140"
                    cy="140"
                    r="120"
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth="20"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-300 hover:stroke-opacity-80"
                  />
                );
              })}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="space-y-4 max-w-md">
            {chartData.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={index} className="flex items-center space-x-4">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <div className="flex-1">
                    <div className={`font-medium text-base ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                      {item.label}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {item.value.toLocaleString()} ({percentage}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const handleDownload = () => {
    // Здесь можно добавить логику для экспорта графика как изображение
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1200;
    canvas.height = 800;
    
    // Простой экспорт данных как JSON
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chart-data-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const renderChart = () => {
    if (data.length <= 6) {
      return <FullscreenPieChart data={data} />;
    }
    return <FullscreenBarChart data={data} />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className={`relative w-full max-w-6xl ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-xl shadow-2xl`}>
          {/* Header */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} px-6 py-4 border-b rounded-t-xl`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Maximize2 className="w-6 h-6 text-blue-500" />
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {title || 'Chart Visualization'}
                </h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleDownload}
                  className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'} transition-colors`}
                  title="Download data"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg ${isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'} transition-colors`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {renderChart()}
          </div>

          {/* Footer */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} px-6 py-4 border-t rounded-b-xl`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {data.length} records • {Object.keys(data[0]).length} columns
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
                <button
                  onClick={onClose}
                  className={`px-4 py-2 border rounded-lg ${
                    isDark
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  } transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullscreenChartModal;