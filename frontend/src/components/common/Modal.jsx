import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext.jsx';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const { isDark } = useTheme();

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className={`inline-block align-bottom ${isDark ? 'bg-gray-900' : 'bg-white'} rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]}`}>
          {/* Header */}
          {title && (
            <div className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} px-6 py-4 border-b`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'} transition-colors`}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;