import React from 'react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';

const Loading = ({ size = 'md', text = null }) => {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={`${sizeClasses[size]} border-4 ${isDark ? 'border-gray-600' : 'border-gray-200'} border-t-blue-500 rounded-full animate-spin`}></div>
      {text && (
        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {text || t.loading}
        </p>
      )}
    </div>
  );
};

export default Loading;