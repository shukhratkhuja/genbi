import api from './api';

export const queryService = {
  async executeQuery(queryData) {
    const response = await api.post('/api/queries/', queryData);
    return response.data;
  },

  async getQueryHistory(limit = 50) {
    const response = await api.get(`/api/queries/?limit=${limit}`);
    return response.data;
  },

  async getQueryStats() {
    const response = await api.get('/api/queries/stats');
    return response.data;
  }
};