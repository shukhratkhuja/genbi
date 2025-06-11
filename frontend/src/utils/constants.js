export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  CONNECTIONS: {
    LIST: '/api/connections/',
    CREATE: '/api/connections/',
    DETAIL: (id) => `/api/connections/${id}`,
    UPDATE: (id) => `/api/connections/${id}`,
    DELETE: (id) => `/api/connections/${id}`,
    TABLES: (id) => `/api/connections/${id}/tables`,
    SELECT_TABLES: (id) => `/api/connections/${id}/tables`,
    SELECTED_TABLES: (id) => `/api/connections/${id}/selected-tables`,
  },
  QUERIES: {
    EXECUTE: '/api/queries/',
    HISTORY: '/api/queries/',
    STATS: '/api/queries/stats',
  },
  TABLES: {
    MODELS: (connectionId) => `/api/tables/${connectionId}/models`,
    RELATIONSHIPS: '/api/tables/relationships',
    CALCULATED_FIELDS: '/api/tables/calculated-fields',
  },
};

export const DATABASE_TYPES = [
  { value: 'postgresql', label: 'PostgreSQL' },
  { value: 'mysql', label: 'MySQL' },
  { value: 'sqlite', label: 'SQLite' },
];

export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  SCATTER: 'scatter',
  AREA: 'area',
};

export const QUERY_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  ERROR: 'error',
};