// Centralized configuration for full-stack API URLs in both local and production environments
export const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001';
export const API_URL = `${BASE_URL}/api`;
