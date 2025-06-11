import React, { useState } from 'react';
import DatabaseList from '../components/database/DatabaseList.jsx';
import { useLanguage } from '../contexts/LanguageContext.jsx';

const DatabasePage = () => {
  const { t } = useLanguage();
  const [selectedConnection, setSelectedConnection] = useState(null);

  const handleSelectConnection = (connection) => {
    setSelectedConnection(connection);
    // Here you could navigate to query page or show table selection
    console.log('Selected connection:', connection);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DatabaseList onSelectConnection={handleSelectConnection} />
      </div>
    </div>
  );
};

export default DatabasePage;