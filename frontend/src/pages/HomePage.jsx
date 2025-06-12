import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Database, Brain, Zap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useTheme } from '../contexts/ThemeContext.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const { t } = useLanguage();

  // **YANGILANDI**: Features uchun tarjimalar t objectidan olinadi
  const features = [
    {
      icon: Database,
      title: t.connectAnyDatabase || 'Connect Any Database',
      description: t.connectAnyDatabaseDesc || 'Connect to PostgreSQL, MySQL, SQLite and more with simple configuration',
    },
    {
      icon: Brain,
      title: t.aiPoweredInsights || 'AI-Powered Insights',
      description: t.aiPoweredInsightsDesc || 'Get intelligent insights and recommendations from your data automatically',
    },
    {
      icon: BarChart3,
      title: t.autoVisualizations || 'Auto Visualizations',
      description: t.autoVisualizationsDesc || 'Generate beautiful charts and graphs from your query results instantly',
    },
    {
      icon: Zap,
      title: t.naturalLanguage || 'Natural Language',
      description: t.naturalLanguageDesc || 'Ask questions in plain English and get SQL queries generated automatically',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className={`text-4xl sm:text-6xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-6`}>
              {t.subtitle}
            </h1>
            <p className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8 max-w-3xl mx-auto`}>
              {t.heroDescription || 'Transform your data into insights with AI-powered natural language queries, automatic visualizations, and intelligent analytics.'}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                  {t.goToDashboard || 'Go to Dashboard'}
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  >
                    {t.getStarted || 'Get Started'}
                  </Link>
                  <Link
                    to="/login"
                    className={`inline-flex items-center px-8 py-3 border-2 text-base font-medium rounded-lg transition-colors ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {t.login}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              {t.powerfulFeatures || 'Powerful Features'}
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.powerfulFeaturesDesc || 'Everything you need to analyze your data efficiently'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} p-6 rounded-lg border shadow-sm hover:shadow-md transition-shadow`}
              >
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                  {feature.title}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className={`${isDark ? 'bg-gray-800' : 'bg-blue-50'} py-16`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-4`}>
              {t.readyToStart || 'Ready to get started?'}
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-8`}>
              {t.readyToStartDesc || 'Join thousands of users who are already transforming their data analysis'}
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {t.startFreeTrial || 'Start Free Trial'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;