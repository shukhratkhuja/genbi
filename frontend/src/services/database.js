import api from './api';

export const databaseService = {
  async getConnections() {
    const response = await api.get('/api/connections/');
    return response.data;
  },

  async createConnection(connectionData) {
    const response = await api.post('/api/connections/', connectionData);
    return response.data;
  },

  async updateConnection(connectionId, connectionData) {
    const response = await api.put(`/api/connections/${connectionId}`, connectionData);
    return response.data;
  },

  async deleteConnection(connectionId) {
    const response = await api.delete(`/api/connections/${connectionId}`);
    return response.data;
  },

  async getAvailableTables(connectionId) {
    const response = await api.get(`/api/connections/${connectionId}/tables`);
    return response.data;
  },

  async selectTables(connectionId, tables) {
    const response = await api.post(`/api/connections/${connectionId}/tables`, tables);
    return response.data;
  },

  async getSelectedTables(connectionId) {
    const response = await api.get(`/api/connections/${connectionId}/selected-tables`);
    return response.data;
  }
};

