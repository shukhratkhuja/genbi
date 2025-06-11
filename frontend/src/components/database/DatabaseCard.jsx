import React from 'react';
import { Database, Edit, Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { getConnectionStatusColor, formatDate } from '../../utils/helpers.js';

const DatabaseCard = ({ connection, onEdit, onDelete, onSelect }) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div
      className={`${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => onSelect?.(connection)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {connection.name}
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {connection.db_type} • {connection.host}:{connection.port}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(connection);
            }}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } transition-colors`}
          >
            <Edit className="w-4 h-4 text-gray-500" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(connection.id);
            }}
            className={`p-2 rounded-lg ${
              isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
            } transition-colors`}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {getStatusIcon(connection.connection_status)}
          <span className={`text-sm capitalize ${getConnectionStatusColor(connection.connection_status)}`}>
            {connection.connection_status}
          </span>
        </div>
        
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {formatDate(connection.created_at)}
        </span>
      </div>

      <div className="mt-3 text-sm">
        <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Database: {connection.database_name}
        </span>
      </div>
    </div>
  );
};

export default DatabaseCard;
