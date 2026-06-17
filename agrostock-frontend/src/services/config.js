const DEFAULT_API_BASE_URL = 'http://localhost:8000';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/$/, '');

export const API_URL = `${API_BASE_URL}/api`;
export const STORAGE_URL = `${API_BASE_URL}/storage`;

