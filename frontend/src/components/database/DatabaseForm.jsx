import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Database, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { DATABASE_TYPES } from '../../utils/constants.js';
import { validateConnectionForm } from '../../utils/helpers.js';
import { databaseService } from '../../services/database.js';
import toast from 'react-hot-toast';

const DatabaseForm = ({ connection, onSubmit, onCancel, isLoading }) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useForm({
    defaultValues: {
      name: connection?.name || '',
      db_type: connection?.db_type || 'postgresql',
      host: connection?.host || 'localhost',
      port: connection?.port || 5432,
      username: connection?.username || '',
      password: connection?.password || '',
      database_name: connection?.database_name || '',
      ssl_enabled: connection?.ssl_enabled || false,
    },
  });

  const dbType = watch('db_type');

  useEffect(() => {
    // Set default ports based on database type
    const defaultPorts = {
      postgresql: 5432,
      mysql: 3306,
      sqlite: null,
    };
    
    if (defaultPorts[dbType] && !connection) {
      setValue('port', defaultPorts[dbType]);
    }
  }, [dbType, setValue, connection]);

  const testConnection = async () => {
    const formData = getValues();
    const validation = validateConnectionForm(formData);
    
    if (!validation.isValid) {
      toast.error('Please fill in all required fields');
      return;
    }

    setTestingConnection(true);
    setConnectionStatus(null);

    try {
      // Create a temporary connection object for testing
      const tempConnection = {
        ...formData,
        port: parseInt(formData.port),
      };

      const status = await databaseService.testConnection(tempConnection);
      setConnectionStatus(status);
      
      if (status === 'connected') {
        toast.success(t.connectionSuccess);
      } else {
        toast.error(t.connectionFailed);
      }
    } catch (error) {
      setConnectionStatus('failed');
      toast.error(error.response?.data?.detail || t.connectionFailed);
    } finally {
      setTestingConnection(false);
    }
  };

  const onFormSubmit = (data) => {
    const formattedData = {
      ...data,
      port: parseInt(data.port),
    };
    onSubmit(formattedData);
  };

  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg p-6`}>
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {connection ? t.editDatabase : t.addDatabase}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Connection Name */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.connectionName} *
            </label>
            <input
              {...register('name', { required: 'Connection name is required' })}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="My Database Connection"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          {/* Database Type */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.databaseType} *
            </label>
            <select
              {...register('db_type', { required: 'Database type is required' })}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            >
              {DATABASE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Host */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.host} *
            </label>
            <input
              {...register('host', { required: 'Host is required' })}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="localhost"
            />
            {errors.host && (
              <p className="text-red-500 text-sm mt-1">{errors.host.message}</p>
            )}
          </div>

          {/* Port */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.port} *
            </label>
            <input
              {...register('port', { 
                required: 'Port is required',
                min: { value: 1, message: 'Port must be greater than 0' },
                max: { value: 65535, message: 'Port must be less than 65536' }
              })}
              type="number"
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="5432"
            />
            {errors.port && (
              <p className="text-red-500 text-sm mt-1">{errors.port.message}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.username} *
            </label>
            <input
              {...register('username', { required: 'Username is required' })}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.password} *
            </label>
            <div className="relative">
              <input
                {...register('password', { required: 'Password is required' })}
                type={showPassword ? 'text' : 'password'}
                className={`w-full px-3 py-2 pr-10 border rounded-lg ${
                  isDark
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                placeholder="password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4 text-gray-500" />
                ) : (
                  <Eye className="w-4 h-4 text-gray-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          {/* Database Name */}
          <div className="md:col-span-2">
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.databaseName} *
            </label>
            <input
              {...register('database_name', { required: 'Database name is required' })}
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="my_database"
            />
            {errors.database_name && (
              <p className="text-red-500 text-sm mt-1">{errors.database_name.message}</p>
            )}
          </div>

          {/* SSL Enabled */}
          <div className="md:col-span-2">
            <label className="flex items-center space-x-2">
              <input
                {...register('ssl_enabled')}
                type="checkbox"
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {t.sslEnabled}
              </span>
            </label>
          </div>
        </div>

        {/* Test Connection */}
        <div className="flex items-center space-x-3 pt-4">
          <button
            type="button"
            onClick={testConnection}
            disabled={testingConnection}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {testingConnection ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : connectionStatus === 'connected' ? (
              <CheckCircle className="w-4 h-4" />
            ) : connectionStatus === 'failed' ? (
              <XCircle className="w-4 h-4" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            <span>{t.testConnection}</span>
          </button>

          {connectionStatus && (
            <span
              className={`text-sm ${
                connectionStatus === 'connected'
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {connectionStatus === 'connected' ? t.connectionSuccess : t.connectionFailed}
            </span>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
          <button
            type="button"
            onClick={onCancel}
            className={`px-4 py-2 border rounded-lg ${
              isDark
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } transition-colors`}
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            <span>{connection ? t.update : t.create}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DatabaseForm;