import api from './api.js';

export const queryService = {
  // Execute natural language query
  async executeQuery(naturalQuery, connectionId) {
    const response = await api.post('/api/queries/', {
      natural_language_query: naturalQuery,
      connection_id: connectionId,
    });
    return response.data;
  },

  // Get query history
  async getQueryHistory(limit = 50) {
    const response = await api.get(`/api/queries/?limit=${limit}`);
    return response.data;
  },

  // Get query statistics
  async getQueryStats() {
    const response = await api.get('/api/queries/stats');
    return response.data;
  },
};
