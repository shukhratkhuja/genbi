import React, { useState, useEffect } from 'react';
import { BarChart3, Database, TrendingUp, Clock, Users, Activity } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useQuery } from '../hooks/useQuery.js';
import { useDatabase } from '../hooks/useDatabase.js';
import { formatDuration } from '../utils/helpers.js';

const DashboardPage = () => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { queryStats, fetchQueryStats, queryHistory, fetchQueryHistory } = useQuery();
  const { connections } = useDatabase();

  useEffect(() => {
    fetchQueryStats();
    fetchQueryHistory();
  }, []);

  const statsCards = [
    {
      title: t.totalQueries,
      value: queryStats?.total_queries || 0,
      icon: BarChart3,
      color: 'blue',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: t.successfulQueries,
      value: queryStats?.success_rate ? `${queryStats.success_rate}%` : '0%',
      icon: TrendingUp,
      color: 'green',
      change: '+2.3%',
      changeType: 'positive'
    },
    {
      title: t.avgResponseTime,
      value: queryStats?.avg_response_time ? formatDuration(queryStats.avg_response_time) : '0ms',
      icon: Clock,
      color: 'yellow',
      change: '-0.5s',
      changeType: 'positive'
    },
    {
      title: t.dataSourcesConnected,
      value: queryStats?.data_sources_connected || 0,
      icon: Database,
      color: 'purple',
      change: '+1',
      changeType: 'positive'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      green: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      yellow: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
      purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    };
    return colors[color] || colors.blue;
  };

  const recentQueries = queryHistory.slice(0, 5);

  // **YANGI**: Status uchun tarjimalar
  const getStatusText = (status) => {
    switch (status) {
      case 'connected':
        return t.statusConnected || 'Connected';
      case 'failed':
        return t.statusFailed || 'Failed';
      case 'pending':
        return t.statusPending || 'Pending';
      default:
        return t.statusUnknown || 'Unknown';
    }
  };

  const getSuccessStatusText = (isSuccessful) => {
    return isSuccessful ? (t.statusSuccess || 'Success') : (t.statusFailed || 'Failed');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.dashboard}
          </h1>
          <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.dashboardOverview || 'Overview of your data analytics activity'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsCards.map((stat, index) => (
            <div
              key={index}
              className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {stat.title}
                  </p>
                  <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mt-1`}>
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    <span className={`text-xs font-medium ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} ml-1`}>
                      {t.vsLastMonth || 'vs last month'}
                    </span>
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Queries */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.recentQueries}
              </h3>
              <a
                href="/queries"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t.viewAll || 'View all'}
              </a>
            </div>
            
            <div className="space-y-3">
              {recentQueries.length > 0 ? (
                recentQueries.map((query) => (
                  <div
                    key={query.id}
                    className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} hover:opacity-80 transition-opacity cursor-pointer`}
                  >
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
                      {query.natural_language_query.substring(0, 100)}
                      {query.natural_language_query.length > 100 && '...'}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDuration(query.execution_time_ms)}
                      </span>
                      <span className={`${
                        query.is_successful ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {getSuccessStatusText(query.is_successful)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Activity className={`mx-auto w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-2`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {t.noQueriesExecuted || 'No queries executed yet'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Connected Databases */}
          <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border shadow-sm`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {t.databaseConnections || 'Database Connections'}
              </h3>
              <a
                href="/databases"
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                {t.manage || 'Manage'}
              </a>
            </div>
            
            <div className="space-y-3">
              {connections.length > 0 ? (
                connections.map((connection) => (
                  <div
                    key={connection.id}
                    className={`p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-50'} hover:opacity-80 transition-opacity cursor-pointer`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          {connection.name}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {connection.db_type} • {connection.host}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          connection.connection_status === 'connected' 
                            ? 'bg-green-500' 
                            : connection.connection_status === 'failed'
                            ? 'bg-red-500'
                            : 'bg-yellow-500'
                        }`}></div>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          {getStatusText(connection.connection_status)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Database className={`mx-auto w-8 h-8 ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-2`} />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-3`}>
                    {t.noDatabasesConnected || 'No databases connected'}
                  </p>
                  <a
                    href="/databases"
                    className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Database className="w-3 h-3" />
                    <span>{t.connectDatabase || 'Connect Database'}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`mt-8 ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg p-6 border shadow-sm`}>
          <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
            {t.quickActions || 'Quick Actions'}
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a
              href="/queries"
              className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                isDark 
                  ? 'border-gray-600 hover:border-blue-500 hover:bg-gray-700' 
                  : 'border-gray-300 hover:border-blue-500 hover:bg-blue-50'
              }`}
            >
              <BarChart3 className="w-8 h-8 text-blue-500 mb-2" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                {t.newQuery || 'New Query'}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.askQuestionsAboutData || 'Ask questions about your data'}
              </p>
            </a>
            
            <a
              href="/databases"
              className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                isDark 
                  ? 'border-gray-600 hover:border-green-500 hover:bg-gray-700' 
                  : 'border-gray-300 hover:border-green-500 hover:bg-green-50'
              }`}
            >
              <Database className="w-8 h-8 text-green-500 mb-2" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                {t.connectDatabase || 'Connect Database'}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.addNewDataSources || 'Add new data sources'}
              </p>
            </a>
            
            <a
              href="/queries?tab=history"
              className={`p-4 rounded-lg border-2 border-dashed transition-colors ${
                isDark 
                  ? 'border-gray-600 hover:border-purple-500 hover:bg-gray-700' 
                  : 'border-gray-300 hover:border-purple-500 hover:bg-purple-50'
              }`}
            >
              <Clock className="w-8 h-8 text-purple-500 mb-2" />
              <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'} mb-1`}>
                {t.viewHistory || 'View History'}
              </h4>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {t.browsePastQueries || 'Browse past queries'}
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;