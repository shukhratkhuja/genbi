import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { LanguageProvider } from './contexts/LanguageContext.jsx';
import Header from './components/common/Header.jsx';
import Loading from './components/common/Loading.jsx';
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DatabasePage from './pages/DatabasePage.jsx';
// import DashboardPage from './pages/DashboardPage.jsx';
// import QueryPage from './pages/QueryPage.jsx';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loading size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Layout Component
const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {isAuthenticated && <Header />}
      <main className={isAuthenticated ? '' : ''}>
        {children}
      </main>
    </div>
  );
};

// App Content Component
const AppContent = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route 
            path="/databases" 
            element={
              <ProtectedRoute>
                <DatabasePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Dashboard Coming Soon
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      This page is under development
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/queries" 
            element={
              <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Queries Coming Soon
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                      This page is under development
                    </p>
                  </div>
                </div>
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'var(--toast-bg)',
            color: 'var(--toast-color)',
            border: '1px solid var(--toast-border)',
          },
        }}
      />
    </Router>
  );
};

// Main App Component
const App = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
