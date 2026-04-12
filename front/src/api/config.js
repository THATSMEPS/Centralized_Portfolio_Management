/**
 * API Configuration
 * Uses environment variable or falls back to local dev server.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';
