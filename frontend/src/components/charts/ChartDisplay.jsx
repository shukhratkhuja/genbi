// src/components/charts/ChartDisplay.jsx
import React from 'react';
import { BarChart3, TrendingUp, PieChart, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const ChartDisplay = ({ data, config }) => {
  const { isDark } = useTheme();

  // Debug: добавим консоль логи
  console.log('ChartDisplay - data:', data);
  console.log('ChartDisplay - config:', config);

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

  // Enhanced Bar Chart с лучшим форматированием
  const EnhancedBarChart = ({ data }) => {
    const columns = Object.keys(data[0]);
    const xColumn = columns[0]; // обычно категория (group)
    const yColumn = columns[1]; // обычно значение (total_production)
    
    console.log('Chart columns:', columns);
    console.log('X column:', xColumn, 'Y column:', yColumn);
    
    // Подготовка данных
    const chartData = data.map(item => ({
      label: String(item[xColumn] || 'Unknown'),
      value: Number(item[yColumn]) || 0,
      originalData: item
    }));
    
    console.log('Chart data:', chartData);
    
    const maxValue = Math.max(...chartData.map(item => item.value));
    const minValue = Math.min(...chartData.map(item => item.value));
    
    console.log('Max value:', maxValue, 'Min value:', minValue);
    
    // Форматирование значений
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

    // Форматирование лейблов
    const formatLabel = (label) => {
      if (label.length > 12) {
        return label.substring(0, 12) + '...';
      }
      return label;
    };
    
    return (
      <div className="h-64 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-12 w-16 flex flex-col justify-between text-xs text-gray-500 py-4">
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(maxValue * 0.75)}</span>
          <span>{formatValue(maxValue * 0.5)}</span>
          <span>{formatValue(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className="ml-16 mr-4 h-full flex items-end justify-between space-x-1 py-4">
          {chartData.slice(0, 12).map((item, index) => {
            const height = maxValue > 0 ? Math.max((item.value / maxValue) * 85, 2) : 2;
            const barWidth = Math.max(100 / Math.min(chartData.length, 12) - 2, 8);
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center group relative h-full"
                style={{ width: `${barWidth}%` }}
              >
                {/* Bar container */}
                <div className="flex-1 flex items-end w-full justify-center">
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    <div className="font-medium">{item.label}</div>
                    <div className="text-gray-300">{formatValue(item.value)}</div>
                  </div>

                  {/* Bar */}
                  <div
                    className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-sm transition-all duration-300 hover:from-blue-700 hover:to-blue-500 cursor-pointer shadow-sm"
                    style={{ height: `${height}%`, minHeight: '4px' }}
                  />
                </div>
                
                {/* Label */}
                <div className="mt-2 h-8 flex items-center justify-center">
                  <span 
                    className={`text-xs text-center leading-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    style={{ 
                      transform: chartData.length > 6 ? 'rotate(-45deg)' : 'none',
                      transformOrigin: 'center',
                      maxWidth: '80px'
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

  // Enhanced Pie Chart
  const EnhancedPieChart = ({ data }) => {
    const columns = Object.keys(data[0]);
    const labelColumn = columns[0];
    const valueColumn = columns[1];
    
    const chartData = data.slice(0, 8).map(item => ({
      label: String(item[labelColumn] || 'Unknown'),
      value: Number(item[valueColumn]) || 0
    }));
    
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316'
    ];
    
    let cumulativePercentage = 0;
    
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="flex items-center space-x-8">
          {/* Pie Chart */}
          <div className="relative w-40 h-40">
            <svg width="160" height="160" className="transform -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke={isDark ? '#374151' : '#E5E7EB'}
                strokeWidth="2"
              />
              {chartData.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const dashArray = `${percentage * 4.4} 440`; // 2 * π * 70 ≈ 440
                const dashOffset = -cumulativePercentage * 4.4;
                
                cumulativePercentage += percentage;
                
                return (
                  <circle
                    key={index}
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth="12"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-300 hover:stroke-opacity-80"
                  />
                );
              })}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="space-y-2 max-w-xs">
            {chartData.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: colors[index] }}
                  />
                  <div className="text-sm flex-1">
                    <div className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item.label.length > 20 ? item.label.substring(0, 20) + '...' : item.label}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
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

  // Fallback простой чарт если что-то пойдет не так
  const FallbackChart = ({ data }) => {
    return (
      <div className="h-64 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className={`mx-auto w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
          <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
            Chart Rendering
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-4`}>
            Found {data.length} records with {Object.keys(data[0]).length} columns
          </p>
          <div className="text-xs text-gray-400">
            Columns: {Object.keys(data[0]).join(', ')}
          </div>
        </div>
      </div>
    );
  };

  // Определение типа графика
  const renderChart = () => {
    try {
      // Автоматическое определение типа графика
      const columns = Object.keys(data[0]);
      
      // Если мало данных, используем pie chart
      if (data.length <= 6) {
        return <EnhancedPieChart data={data} />;
      }
      
      // Иначе bar chart
      return <EnhancedBarChart data={data} />;
      
    } catch (error) {
      console.error('Chart rendering error:', error);
      return <FallbackChart data={data} />;
    }
  };

  // Определение иконки
  const getChartIcon = () => {
    if (data.length <= 6) {
      return PieChart;
    }
    return BarChart3;
  };

  const ChartIcon = getChartIcon();

  return (
    <div className="relative">
      {renderChart()}
      
      {/* Chart type indicator */}
      <div className="absolute top-2 right-2">
        <div className={`p-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <ChartIcon className="w-4 h-4 text-gray-500" />
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