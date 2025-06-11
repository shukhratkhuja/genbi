import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { BarChart3, Moon, Sun, LogOut, Menu, X, Settings, Database } from 'lucide-react';

const Header = ({ showMobileMenu, setShowMobileMenu }) => {
  const { user, logout } = useAuth();
  const { theme, language, dispatch } = useApp();

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch({ type: 'SET_THEME', payload: newTheme });
  };

  const changeLanguage = (newLanguage) => {
    dispatch({ type: 'SET_LANGUAGE', payload: newLanguage });
  };

  const translations = {
    en: {
      title: 'DataBI',
      home: 'Home',
      database: 'Database',
      settings: 'Settings',
      logout: 'Logout'
    },
    ru: {
      title: 'DataBI',
      home: 'Главная',
      database: 'База данных',
      settings: 'Настройки',
      logout: 'Выйти'
    },
    uz: {
      title: 'DataBI',
      home: 'Bosh sahifa',
      database: 'Ma\'lumotlar bazasi',
      settings: 'Sozlamalar',
      logout: 'Chiqish'
    }
  };

  const t = translations[language];

  const languageNames = {
    en: 'English',
    ru: 'Русский',
    uz: 'O\'zbekcha'
  };

  return (
    <header className={`${
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'
    } border-b shadow-sm`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 
