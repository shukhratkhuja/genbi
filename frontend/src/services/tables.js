import api from './api.js';

export const tablesService = {
  // Create table model
  async createTableModel(connectionId, modelData) {
    const response = await api.post(`/api/tables/${connectionId}/models`, modelData);
    return response.data;
  },

  // Get table models
  async getTableModels(connectionId) {
    const response = await api.get(`/api/tables/${connectionId}/models`);
    return response.data;
  },

  // Create relationship
  async createRelationship(relationshipData) {
    const response = await api.post('/api/tables/relationships', relationshipData);
    return response.data;
  },

  // Create calculated field
  async createCalculatedField(fieldData) {
    const response = await api.post('/api/tables/calculated-fields', fieldData);
    return response.data;
  },
};