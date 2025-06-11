export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

export const DB_TYPES = [
  { value: 'postgresql', label: 'PostgreSQL', icon: '🐘', defaultPort: 5432 },
  { value: 'mysql', label: 'MySQL', icon: '🐬', defaultPort: 3306 },
  { value: 'sqlite', label: 'SQLite', icon: '📁', defaultPort: null },
];

export const THEME_OPTIONS = {
  LIGHT: 'light',
  DARK: 'dark',
};

export const LANGUAGES = {
  EN: 'en',
  RU: 'ru',
  UZ: 'uz',
};

export const MAX_CONNECTIONS_PER_USER = 1;
export const MAX_QUERY_HISTORY = 100;
export const DEFAULT_QUERY_LIMIT = 50;
