/**
 * API utility with automatic 401 handling
 */

import { API_URL } from '../config/api.js';

/**
 * Enhanced fetch with automatic 401 handling
 */
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  // Add Authorization header if token exists
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  };

  try {
    const response = await fetch(`${API_URL}${url}`, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Call logout endpoint to clear cookies
      fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      }).catch(err => console.error('Logout error:', err));

      // Redirect to landing page
      if (window.location.pathname !== '/' && 
          window.location.pathname !== '/login' && 
          window.location.pathname !== '/signup') {
        window.location.href = '/';
      }

      // Return error response
      return {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' }),
      };
    }

    return response;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

/**
 * GET request
 */
export const apiGet = async (url, options = {}) => {
  return apiFetch(url, { ...options, method: 'GET' });
};

/**
 * POST request
 */
export const apiPost = async (url, data, options = {}) => {
  return apiFetch(url, {
    ...options,
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * PUT request
 */
export const apiPut = async (url, data, options = {}) => {
  return apiFetch(url, {
    ...options,
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

/**
 * DELETE request
 */
export const apiDelete = async (url, options = {}) => {
  return apiFetch(url, { ...options, method: 'DELETE' });
};

