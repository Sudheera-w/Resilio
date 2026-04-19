/**
 * api.js — Central API base URL for Resilio frontend.
 *
 * - Local dev:  VITE_API_BASE_URL=http://localhost:5209  → full URL (different port)
 * - Staging:    VITE_API_BASE_URL=                       → empty → relative paths
 * - Production: VITE_API_BASE_URL=                       → empty → relative paths
 *
 * When empty, fetch(`${API_BASE}/api/requests`) becomes fetch("/api/requests"),
 * which works perfectly when frontend and backend share the same domain/App Service.
 */

export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5209';
