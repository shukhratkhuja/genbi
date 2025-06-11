import React, { useEffect, useRef } from 'react';

const PlotlyChart = ({ config }) => {
  const plotRef = useRef(null);
  const plotInstanceRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const loadPlotly = async () => {
      try {
        // Dynamically import Plotly to reduce bundle size
        const Plotly = await import('plotly.js-dist');
        
        if (!mounted || !plotRef.current || !config?.data) return;

        // Clear any existing plot
        if (plotInstanceRef.current) {
          Plotly.purge(plotRef.current);
        }

        // Create new plot
        await Plotly.newPlot(
          plotRef.current,
          config.data,
          {
            ...config.layout,
            responsive: true,
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: ['pan2d', 'lasso2d', 'select2d'],
          },
          {
            responsive: true,
            showTips: false,
          }
        );

        plotInstanceRef.current = plotRef.current;

      } catch (error) {
        console.error('Error loading Plotly:', error);
      }
    };

    loadPlotly();

    return () => {
      mounted = false;
      if (plotInstanceRef.current && window.Plotly) {
        window.Plotly.purge(plotInstanceRef.current);
        plotInstanceRef.current = null;
      }
    };
  }, [config]);

  if (!config || !config.data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
        No chart data available
      </div>
    );
  }

  return (
    <div className="w-full h-96">
      <div ref={plotRef} className="w-full h-full" />
    </div>
  );
};

export default PlotlyChart;

