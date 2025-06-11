import api from './api';

export const tableService = {
  async getTableModels(connectionId) {
    const response = await api.get(`/api/tables/${connectionId}/models`);
    return response.data;
  },

  async createTableModel(connectionId, modelData) {
    const response = await api.post(`/api/tables/${connectionId}/models`, modelData);
    return response.data;
  },

  async createRelationship(relationshipData) {
    const response = await api.post('/api/tables/relationships', relationshipData);
    return response.data;
  },

  async createCalculatedField(fieldData) {
    const response = await api.post('/api/tables/calculated-fields', fieldData);
    return response.data;
  }
};