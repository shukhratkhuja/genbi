import React, { useState } from 'react';
import { BarChart3, Moon, Sun, User, LogOut, Menu, X, Globe } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navigation = [
    { name: t.home, href: '/', icon: BarChart3 },
    { name: t.dashboard, href: '/dashboard', icon: BarChart3 },
    { name: t.databases, href: '/databases', icon: BarChart3 },
    { name: t.queries, href: '/queries', icon: BarChart3 },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'ru', name: 'Русский' },
    { code: 'uz', name: "O'zbekcha" },
  ];

  const isActive = (href) => location.pathname === href;

  return (
    <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b shadow-sm sticky top-0 z-40`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t.title}
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : `${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className={`text-sm border-0 bg-transparent ${isDark ? 'text-gray-300' : 'text-gray-700'} focus:ring-0 cursor-pointer`}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className={isDark ? 'bg-gray-800' : 'bg-white'}>
                  {lang.name}
                </option>
              ))}
            </select>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* User Menu */}
            {user && (
              <div className="flex items-center space-x-3">
                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} hidden sm:block`}>
                  {user.username}
                </span>
                <button
                  onClick={logout}
                  className={`flex items-center space-x-2 p-2 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'} transition-colors`}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:block">{t.logout}</span>
                </button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className={`md:hidden p-2 rounded-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className={`md:hidden border-t ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
          <div className="px-4 py-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setShowMobileMenu(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    : `${isDark ? 'text-gray-300 hover:bg-gray-700 hover:text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;