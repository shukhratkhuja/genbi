import React, { useState } from 'react';
import { Plus, Search, Database, AlertCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext.jsx';
import { useTheme } from '../../contexts/ThemeContext.jsx';
import { useDatabase } from '../../hooks/useDatabase.js';
import DatabaseCard from './DatabaseCard.jsx';
import DatabaseForm from './DatabaseForm.jsx';
import Modal from '../common/Modal.jsx';
import Loading from '../common/Loading.jsx';
import toast from 'react-hot-toast';

const DatabaseList = ({ onSelectConnection }) => {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const { connections, loading, createConnection, updateConnection, deleteConnection } = useDatabase();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingConnection, setEditingConnection] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const filteredConnections = connections.filter(conn =>
    conn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.db_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conn.host.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateConnection = async (connectionData) => {
    setFormLoading(true);
    const result = await createConnection(connectionData);
    setFormLoading(false);
    
    if (result.success) {
      setShowForm(false);
      setEditingConnection(null);
    }
  };

  const handleUpdateConnection = async (connectionData) => {
    if (!editingConnection) return;
    
    setFormLoading(true);
    const result = await updateConnection(editingConnection.id, connectionData);
    setFormLoading(false);
    
    if (result.success) {
      setShowForm(false);
      setEditingConnection(null);
    }
  };

  const handleDeleteConnection = async (id) => {
    const result = await deleteConnection(id);
    if (result.success) {
      setShowDeleteConfirm(null);
    }
  };

  const openEditForm = (connection) => {
    setEditingConnection(connection);
    setShowForm(true);
  };

  const openCreateForm = () => {
    setEditingConnection(null);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingConnection(null);
  };

  if (loading && connections.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="lg" text={t.loading} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.databases}
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage your database connections
          </p>
        </div>
        
        <button
          onClick={openCreateForm}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>{t.addDatabase}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        <input
          type="text"
          placeholder={`${t.search} ${t.databases.toLowerCase()}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-10 pr-4 py-3 border rounded-lg ${
            isDark
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
        />
      </div>

      {/* Connections Grid */}
      {filteredConnections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredConnections.map((connection) => (
            <DatabaseCard
              key={connection.id}
              connection={connection}
              onEdit={openEditForm}
              onDelete={(id) => setShowDeleteConfirm(id)}
              onSelect={onSelectConnection}
            />
          ))}
        </div>
      ) : connections.length === 0 ? (
        // Empty state
        <div className="text-center py-12">
          <Database className={`mx-auto w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
          <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
            No database connections
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'} mb-6`}>
            Get started by creating your first database connection
          </p>
          <button
            onClick={openCreateForm}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>{t.addDatabase}</span>
          </button>
        </div>
      ) : (
        // No search results
        <div className="text-center py-12">
          <Search className={`mx-auto w-12 h-12 ${isDark ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
          <h3 className={`text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-900'} mb-2`}>
            {t.searchNoResults}
          </h3>
          <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
            Try adjusting your search terms
          </p>
        </div>
      )}

      {/* Database Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={closeForm}
        title={editingConnection ? t.editDatabase : t.addDatabase}
        size="lg"
      >
        <DatabaseForm
          connection={editingConnection}
          onSubmit={editingConnection ? handleUpdateConnection : handleCreateConnection}
          onCancel={closeForm}
          isLoading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title={t.deleteDatabase}
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.confirmDelete}
            </p>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteConfirm(null)}
              className={`px-4 py-2 border rounded-lg ${
                isDark
                  ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              } transition-colors`}
            >
              {t.cancel}
            </button>
            <button
              onClick={() => handleDeleteConnection(showDeleteConfirm)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {t.delete}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DatabaseList;