// src/components/charts/ChartDisplay.jsx
import React, { useState } from 'react';
import { BarChart3, TrendingUp, PieChart, AlertCircle, Maximize2, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const ChartDisplay = ({ data, config }) => {
  const { isDark } = useTheme();
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Улучшенная логика определения типа графика
  const getChartType = () => {
    const columns = Object.keys(data[0]);
    const xColumn = columns[0].toLowerCase();
    const yColumn = columns[1].toLowerCase();
    const firstValue = String(data[0][columns[0]]).toLowerCase();
    
    console.log('Chart type analysis:');
    console.log('- X column:', xColumn);
    console.log('- Y column:', yColumn);
    console.log('- First value:', firstValue);
    console.log('- Data length:', data.length);
    
    // 1. ВРЕМЕННЫЕ ДАННЫЕ - Line Chart
    if (xColumn.includes('date') || 
        xColumn.includes('month') || 
        xColumn.includes('year') ||
        xColumn.includes('time')) {
      
      // Проверяем содержимое
      if (firstValue.includes('-') || 
          firstValue.includes('/') || 
          /^\d{4}$/.test(firstValue) ||
          /^\d{1,2}$/.test(firstValue) || // месяцы как числа 1-12
          firstValue.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/) ||
          firstValue.match(/янв|фев|мар|апр|май|июн|июл|авг|сен|окт|ноя|дек/)) {
        console.log('-> Line chart (time data detected)');
        return 'line';
      }
    }
    
    // 2. PIE CHART - только для очень специфичных случаев
    if (data.length <= 5 && 
        (xColumn.includes('group') || xColumn.includes('category')) &&
        (yColumn.includes('share') || 
         yColumn.includes('percent') || 
         yColumn.includes('distribution'))) {
      console.log('-> Pie chart (small data + share analysis)');
      return 'pie';
    }
    
    // 3. PIE CHART - если данных очень мало и это явно доли
    if (data.length <= 4) {
      console.log('-> Pie chart (very small dataset)');
      return 'pie';
    }
    
    // 4. BAR CHART - по умолчанию для всех сравнений и агрегаций
    console.log('-> Bar chart (default for comparisons)');
    return 'bar';
  };

  // Enhanced Bar Chart с лучшим форматированием
  const EnhancedBarChart = ({ data, isFullscreen = false }) => {
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
      if (isFullscreen) {
        return label.length > 20 ? label.substring(0, 20) + '...' : label;
      }
      return label.length > 12 ? label.substring(0, 12) + '...' : label;
    };
    
    // Размеры в зависимости от режима
    const chartHeight = isFullscreen ? 'h-96' : 'h-80'; // Увеличили с h-64
    const yAxisWidth = isFullscreen ? 'w-20' : 'w-16';
    const fontSize = isFullscreen ? 'text-sm' : 'text-xs';
    const barMinWidth = isFullscreen ? 12 : 8;
    
    return (
      <div className={`${chartHeight} relative`}>
        {/* Y-axis labels */}
        <div className={`absolute left-0 top-0 bottom-12 ${yAxisWidth} flex flex-col justify-between ${fontSize} text-gray-500 py-4`}>
          <span>{formatValue(maxValue)}</span>
          <span>{formatValue(maxValue * 0.75)}</span>
          <span>{formatValue(maxValue * 0.5)}</span>
          <span>{formatValue(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart Area */}
        <div className={`${isFullscreen ? 'ml-20' : 'ml-16'} mr-4 h-full flex items-end justify-between space-x-1 py-4`}>
          {chartData.slice(0, isFullscreen ? 20 : 12).map((item, index) => {
            const height = maxValue > 0 ? Math.max((item.value / maxValue) * 85, 2) : 2;
            const barWidth = Math.max(100 / Math.min(chartData.length, isFullscreen ? 20 : 12) - 2, barMinWidth);
            
            return (
              <div 
                key={index} 
                className="flex flex-col items-center group relative h-full"
                style={{ width: `${barWidth}%` }}
              >
                {/* Bar container */}
                <div className="flex-1 flex items-end w-full justify-center">
                  {/* Tooltip */}
                  <div className={`absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white ${isFullscreen ? 'text-sm' : 'text-xs'} rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none`}>
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
                <div className={`mt-2 ${isFullscreen ? 'h-12' : 'h-8'} flex items-center justify-center`}>
                  <span 
                    className={`${fontSize} text-center leading-tight ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                    style={{ 
                      transform: chartData.length > (isFullscreen ? 8 : 6) ? 'rotate(-45deg)' : 'none',
                      transformOrigin: 'center',
                      maxWidth: isFullscreen ? '120px' : '80px'
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
  const EnhancedPieChart = ({ data, isFullscreen = false }) => {
    const columns = Object.keys(data[0]);
    const labelColumn = columns[0];
    const valueColumn = columns[1];
    
    const chartData = data.slice(0, isFullscreen ? 12 : 8).map(item => ({
      label: String(item[labelColumn] || 'Unknown'),
      value: Number(item[valueColumn]) || 0
    }));
    
    const total = chartData.reduce((sum, item) => sum + item.value, 0);
    
    const colors = [
      '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
      '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
      '#14B8A6', '#F59E0B'
    ];
    
    let cumulativePercentage = 0;
    
    // Размеры для разных режимов
    const svgSize = isFullscreen ? 320 : 200;
    const radius = isFullscreen ? 140 : 85;
    const strokeWidth = isFullscreen ? 20 : 16;
    const center = svgSize / 2;
    
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
    
    return (
      <div className={`${isFullscreen ? 'h-96' : 'h-64'} flex items-center justify-center`}>
        <div className={`flex items-center ${isFullscreen ? 'space-x-16' : 'space-x-8'}`}>
          {/* Pie Chart */}
          <div className="relative" style={{ width: svgSize, height: svgSize }}>
            <svg width={svgSize} height={svgSize} className="transform -rotate-90">
              {/* Background circle */}
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={isDark ? '#374151' : '#E5E7EB'}
                strokeWidth="2"
              />
              
              {/* Data segments */}
              {chartData.map((item, index) => {
                const percentage = total > 0 ? (item.value / total) * 100 : 0;
                const circumference = 2 * Math.PI * radius;
                const dashLength = (percentage / 100) * circumference;
                const dashOffset = -(cumulativePercentage / 100) * circumference;
                
                cumulativePercentage += percentage;
                
                return (
                  <circle
                    key={index}
                    cx={center}
                    cy={center}
                    r={radius}
                    fill="none"
                    stroke={colors[index]}
                    strokeWidth={strokeWidth}
                    strokeDasharray={`${dashLength} ${circumference}`}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-300 hover:stroke-opacity-80 cursor-pointer"
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                    }}
                  />
                );
              })}
            </svg>
            
            {/* Center label */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`${isFullscreen ? 'text-2xl' : 'text-lg'} font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {chartData.length}
                </div>
                <div className={`${isFullscreen ? 'text-sm' : 'text-xs'} ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Groups
                </div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className={`space-y-${isFullscreen ? '4' : '2'} ${isFullscreen ? 'max-w-md' : 'max-w-xs'}`}>
            {chartData.map((item, index) => {
              const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
              
              return (
                <div key={index} className="flex items-center space-x-3 group cursor-pointer">
                  <div
                    className={`${isFullscreen ? 'w-6 h-6' : 'w-4 h-4'} rounded-full transition-transform group-hover:scale-110`}
                    style={{ backgroundColor: colors[index] }}
                  />
                  <div className={`${isFullscreen ? 'text-base' : 'text-sm'} flex-1`}>
                    <div className={`font-medium ${isDark ? 'text-gray-300 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'} transition-colors`}>
                      {item.label.length > (isFullscreen ? 40 : 25) ? 
                        item.label.substring(0, isFullscreen ? 40 : 25) + '...' : 
                        item.label}
                    </div>
                    <div className={`${isFullscreen ? 'text-sm' : 'text-xs'} ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {formatValue(item.value)} ({percentage}%)
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Total */}
            {isFullscreen && (
              <div className={`pt-4 mt-4 border-t ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <div className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Total: {formatValue(total)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Line Chart for time series data
  const LineChart = ({ data, isFullscreen = false }) => {
    const columns = Object.keys(data[0]);
    const xColumn = columns[0];
    const yColumn = columns[1];
    
    const chartData = data.map(item => ({
      x: String(item[xColumn]),
      y: Number(item[yColumn]) || 0,
      label: String(item[xColumn])
    }));
    
    const maxValue = Math.max(...chartData.map(item => item.y));
    const minValue = Math.min(...chartData.map(item => item.y));
    const range = maxValue - minValue || 1;
    
    // Generate SVG path
    const width = isFullscreen ? 600 : 450;
    const height = isFullscreen ? 300 : 260;
    const padding = isFullscreen ? 40 : 20;
    
    const points = chartData.map((item, index) => {
      const x = padding + (index / Math.max(chartData.length - 1, 1)) * (width - 2 * padding);
      const y = height - padding - ((item.y - minValue) / range) * (height - 2 * padding);
      return { x, y, data: item };
    });
    
    const pathData = points.length > 1 ? `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
    
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
    
    return (
      <div className={`${isFullscreen ? 'h-96' : 'h-64'} flex items-center justify-center`}>
        <div className="relative">
          <svg width={width} height={height} className={`border ${isDark ? 'border-gray-700' : 'border-gray-200'} rounded`}>
            {/* Grid lines */}
            {[0, 1, 2, 3, 4].map(i => (
              <line
                key={i}
                x1={padding}
                y1={padding + (i * (height - 2 * padding)) / 4}
                x2={width - padding}
                y2={padding + (i * (height - 2 * padding)) / 4}
                stroke={isDark ? '#374151' : '#E5E7EB'}
                strokeWidth="1"
              />
            ))}
            
            {/* Y-axis labels */}
            {[0, 1, 2, 3, 4].map(i => {
              const value = minValue + (maxValue - minValue) * (4 - i) / 4;
              return (
                <text
                  key={i}
                  x={padding - 5}
                  y={padding + (i * (height - 2 * padding)) / 4 + 4}
                  textAnchor="end"
                  className={`${isFullscreen ? 'text-xs' : 'text-xs'} fill-current ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  {formatValue(value)}
                </text>
              );
            })}
            
            {/* Line */}
            {pathData && (
              <path
                d={pathData}
                fill="none"
                stroke="#3B82F6"
                strokeWidth={isFullscreen ? "4" : "3"}
                className="transition-all duration-300"
              />
            )}
            
            {/* Points */}
            {points.map((point, index) => (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isFullscreen ? "6" : "4"}
                  fill="#3B82F6"
                  className="hover:r-8 transition-all duration-200 cursor-pointer"
                />
                {/* Tooltip on hover */}
                <text
                  x={point.x}
                  y={point.y - (isFullscreen ? 15 : 10)}
                  textAnchor="middle"
                  className={`${isFullscreen ? 'text-xs' : 'text-xs'} fill-current ${isDark ? 'text-white' : 'text-gray-900'} opacity-0 hover:opacity-100 transition-opacity pointer-events-none`}
                >
                  {formatValue(point.data.y)}
                </text>
              </g>
            ))}
            
            {/* X-axis labels */}
            {points.map((point, index) => {
              if (index % Math.max(1, Math.floor(points.length / 6)) === 0) {
                return (
                  <text
                    key={index}
                    x={point.x}
                    y={height - 5}
                    textAnchor="middle"
                    className={`${isFullscreen ? 'text-xs' : 'text-xs'} fill-current ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                  >
                    {point.data.label.length > 8 ? point.data.label.substring(0, 8) + '...' : point.data.label}
                  </text>
                );
              }
              return null;
            })}
          </svg>
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

  // Обновленная функция renderChart
  const renderChart = (isFullscreen = false) => {
    try {
      const chartType = getChartType(); // Определяем тип один раз
      
      console.log('Chart type:', chartType, 'Fullscreen:', isFullscreen);
      
      switch (chartType) {
        case 'pie':
          return <EnhancedPieChart data={data} isFullscreen={isFullscreen} />;
        case 'line':
          return <LineChart data={data} isFullscreen={isFullscreen} />;
        case 'bar':
        default:
          return <EnhancedBarChart data={data} isFullscreen={isFullscreen} />;
      }
      
    } catch (error) {
      console.error('Chart rendering error:', error);
      return <FallbackChart data={data} />;
    }
  };

  // Обновленная функция getChartIcon
  const getChartIcon = () => {
    const chartType = getChartType();
    
    switch (chartType) {
      case 'pie':
        return PieChart;
      case 'line':
        return TrendingUp;
      case 'bar':
      default:
        return BarChart3;
    }
  };

  const ChartIcon = getChartIcon();

  // Fullscreen Modal
  const FullscreenModal = () => {
    if (!isFullscreen) return null;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-75">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center">
          {/* Background overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-75 transition-opacity"
            onClick={() => setIsFullscreen(false)}
          />

          {/* Modal panel */}
          <div className={`relative inline-block w-full max-w-7xl p-6 my-8 text-left transition-all transform ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow-xl`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Data Visualization - Full Screen
              </h3>
              <button
                onClick={() => setIsFullscreen(false)}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Chart */}
            <div className="relative">
              {renderChart(true)}
              
              {/* Chart type indicator */}
              <div className="absolute top-2 right-2">
                <div className={`p-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  <ChartIcon className="w-5 h-5 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Data summary */}
            <div className={`mt-6 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {data.length} records • {Object.keys(data[0]).length} columns
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative">
        {renderChart(false)}
        
        {/* Controls */}
        <div className="absolute top-2 right-2 flex space-x-2">
          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className={`p-1 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-colors`}
            title="Full Screen"
          >
            <Maximize2 className="w-4 h-4 text-gray-500" />
          </button>
          
          {/* Chart type indicator */}
          <div className={`p-1 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
            <ChartIcon className="w-4 h-4 text-gray-500" />
          </div>
        </div>
        
        {/* Data summary */}
        <div className={`mt-4 text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {data.length} records • {Object.keys(data[0]).length} columns
        </div>
      </div>

      {/* Fullscreen Modal */}
      <FullscreenModal />
    </>
  );
};

export default ChartDisplay;