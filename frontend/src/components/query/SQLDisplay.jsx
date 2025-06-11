import React, { useState } from 'react';
import { Copy, Eye, EyeOff } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { copyToClipboard } from '../../utils/helpers.js';
import toast from 'react-hot-toast';

const SQLDisplay = ({ sql }) => {
  const { isDark } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(sql);
    if (success) {
      toast.success('SQL copied to clipboard');
    } else {
      toast.error('Failed to copy SQL');
    }
  };

  // Format SQL for better readability
  const formatSQL = (sqlString) => {
    return sqlString
      .replace(/\bSELECT\b/gi, '\nSELECT')
      .replace(/\bFROM\b/gi, '\nFROM')
      .replace(/\bWHERE\b/gi, '\nWHERE')
      .replace(/\bGROUP BY\b/gi, '\nGROUP BY')
      .replace(/\bORDER BY\b/gi, '\nORDER BY')
      .replace(/\bHAVING\b/gi, '\nHAVING')
      .replace(/\bJOIN\b/gi, '\nJOIN')
      .replace(/\bLEFT JOIN\b/gi, '\nLEFT JOIN')
      .replace(/\bRIGHT JOIN\b/gi, '\nRIGHT JOIN')
      .replace(/\bINNER JOIN\b/gi, '\nINNER JOIN')
      .trim();
  };

  const formattedSQL = formatSQL(sql);
  const displaySQL = isExpanded ? formattedSQL : formattedSQL.split('\n').slice(0, 5).join('\n');
  const shouldShowToggle = formattedSQL.split('\n').length > 5;

  return (
    <div className="relative">
      <div className={`${isDark ? 'bg-gray-900 border-gray-600' : 'bg-gray-50 border-gray-200'} border rounded-lg p-4 font-mono text-sm overflow-x-auto`}>
        <pre className={`${isDark ? 'text-gray-300' : 'text-gray-700'} whitespace-pre-wrap`}>
          {displaySQL}
          {!isExpanded && shouldShowToggle && '...'}
        </pre>
      </div>
      
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center space-x-2">
          {shouldShowToggle && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center space-x-1 px-2 py-1 text-xs rounded ${
                isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-700'
              } transition-colors`}
            >
              {isExpanded ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              <span>{isExpanded ? 'Show Less' : 'Show More'}</span>
            </button>
          )}
        </div>
        
        <button
          onClick={handleCopy}
          className={`flex items-center space-x-1 px-2 py-1 text-xs rounded ${
            isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100'
          } transition-colors`}
        >
          <Copy className="w-3 h-3" />
          <span>Copy</span>
        </button>
      </div>
    </div>
  );
};

export default SQLDisplay;
