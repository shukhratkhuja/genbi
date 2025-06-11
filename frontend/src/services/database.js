import api from './api.js';

export const databaseService = {
  // Get all user connections
  async getConnections() {
    const response = await api.get('/api/connections/');
    return response.data;
  },

  // Create new database connection
  async createConnection(connectionData) {
    const response = await api.post('/api/connections/', connectionData);
    return response.data;
  },

  // Get specific connection
  async getConnection(id) {
    const response = await api.get(`/api/connections/${id}`);
    return response.data;
  },

  // Update connection
  async updateConnection(id, connectionData) {
    const response = await api.put(`/api/connections/${id}`, connectionData);
    return response.data;
  },

  // Delete connection
  async deleteConnection(id) {
    const response = await api.delete(`/api/connections/${id}`);
    return response.data;
  },

  // Get available tables for connection
  async getTables(connectionId) {
    const response = await api.get(`/api/connections/${connectionId}/tables`);
    return response.data;
  },

  // Select tables for modeling
  async selectTables(connectionId, tables) {
    const response = await api.post(`/api/connections/${connectionId}/tables`, tables);
    return response.data;
  },

  // Get selected tables
  async getSelectedTables(connectionId) {
    const response = await api.get(`/api/connections/${connectionId}/selected-tables`);
    return response.data;
  },
};