/**
 * API Client
 * Centralized HTTP client for all backend API calls with token-aware authentication
 */

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000';

// ============================================================================
// Auth Storage Helpers
// ============================================================================

/**
 * Get auth token and user from storage
 * @returns {{ token: string | null, user: object | null }}
 */
export function getAuth() {
  // Check localStorage first (persistent "Remember me")
  let stored = localStorage.getItem('auth');
  
  // Fall back to sessionStorage (temporary)
  if (!stored) {
    stored = sessionStorage.getItem('auth');
  }
  
  if (!stored) {
    return { token: null, user: null };
  }
  
  try {
    const auth = JSON.parse(stored);
    return { token: auth.token || null, user: auth.user || null };
  } catch (e) {
    console.warn('Failed to parse stored auth:', e);
    return { token: null, user: null };
  }
}

/**
 * Save auth token and user to storage
 * @param {{ token: string, user: object }} auth - Auth object with token and user
 * @param {boolean} rememberMe - If true, use localStorage; otherwise sessionStorage
 */
export function setAuth(auth, rememberMe = false) {
  const storage = rememberMe ? localStorage : sessionStorage;
  try {
    storage.setItem('auth', JSON.stringify(auth));
    // Dispatch custom event to notify components of auth change
    window.dispatchEvent(new Event('authChanged'));
  } catch (e) {
    console.error('Failed to save auth to storage:', e);
  }
}

/**
 * Clear auth from both storages
 */
export function clearAuth() {
  try {
    localStorage.removeItem('auth');
    sessionStorage.removeItem('auth');
  } catch (e) {
    console.error('Failed to clear auth from storage:', e);
  }
}

// ============================================================================
// HTTP Helpers
// ============================================================================

/**
 * Helper to build request headers with optional authorization
 * @param {boolean} auth - If true, include Authorization header with JWT token
 * @returns {object} Headers object
 */
function buildHeaders(auth = false) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (auth) {
    const { token } = getAuth();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('Authorization requested but no token found in storage');
    }
  }
  
  return headers;
}

/**
 * Make a GET request
 * @param {string} path - API path (e.g., '/api/patient/me')
 * @param {object} options - Options object
 * @param {boolean} options.auth - Include Authorization header
 * @returns {Promise<any>} Response JSON
 * @throws {Error} Error with message from backend or fallback message
 */
export async function apiGet(path, { auth = false } = {}) {
  try {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: buildHeaders(auth),
    });
    
    const json = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const errorMessage = json.error || json.message || response.statusText || 'Request failed';
      throw new Error(errorMessage);
    }
    
    return json;
  } catch (error) {
    throw error;
  }
}

/**
 * Make a POST request
 * @param {string} path - API path (e.g., '/api/auth/login')
 * @param {object} body - Request body (will be JSON stringified)
 * @param {object} options - Options object
 * @param {boolean} options.auth - Include Authorization header
 * @returns {Promise<any>} Response JSON
 * @throws {Error} Error with message from backend or fallback message
 */
export async function apiPost(path, body = {}, { auth = false } = {}) {
  try {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    
    const json = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const errorMessage = json.error || json.message || response.statusText || 'Request failed';
      throw new Error(errorMessage);
    }
    
    return json;
  } catch (error) {
    throw error;
  }
}

/**
 * Make a PATCH request
 * @param {string} path - API path (e.g., '/api/patient/me')
 * @param {object} body - Request body (will be JSON stringified)
 * @param {object} options - Options object
 * @param {boolean} options.auth - Include Authorization header
 * @returns {Promise<any>} Response JSON
 * @throws {Error} Error with message from backend or fallback message
 */
export async function apiPatch(path, body = {}, { auth = false } = {}) {
  try {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: buildHeaders(auth),
      body: JSON.stringify(body),
    });
    
    const json = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const errorMessage = json.error || json.message || response.statusText || 'Request failed';
      throw new Error(errorMessage);
    }
    
    return json;
  } catch (error) {
    throw error;
  }
}

/**
 * Make a DELETE request
 * @param {string} path - API path (e.g., '/api/doctors/availability/123')
 * @param {object} options - Options object
 * @param {boolean} options.auth - Include Authorization header
 * @returns {Promise<any>} Response JSON
 * @throws {Error} Error with message from backend or fallback message
 */
export async function apiDelete(path, { auth = false } = {}) {
  try {
    const url = `${API_BASE_URL}${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: buildHeaders(auth),
    });
    
    const json = await response.json().catch(() => ({}));
    
    if (!response.ok) {
      const errorMessage = json.error || json.message || response.statusText || 'Request failed';
      throw new Error(errorMessage);
    }
    
    return json;
  } catch (error) {
    throw error;
  }
}
