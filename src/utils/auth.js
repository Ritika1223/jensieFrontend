/**
 * Authentication utility functions
 */

import { API_URL } from '../config/api.js';

/**
 * Check if user is authenticated by verifying token with backend
 */
export const checkAuth = async () => {
  try {
    // Check if we have a token in localStorage (for mobile/API clients)
    const token = localStorage.getItem('token');
    
    // For web clients, token is in HTTP-only cookie, so we need to verify with backend
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'GET',
      credentials: 'include', // Important for cookies
      headers: token ? {
        'Authorization': `Bearer ${token}`,
      } : {},
    });

    if (response.ok) {
      const data = await response.json();
      return { authenticated: true, user: data.user };
    }

    // If 401, clear any stored tokens
    if (response.status === 401) {
      await clearAuth(true); // Skip API call since we already got 401
      return { authenticated: false, user: null };
    }

    return { authenticated: false, user: null };
  } catch (error) {
    console.error('Auth check error:', error);
    await clearAuth(true); // Skip API call on network errors
    return { authenticated: false, user: null };
  }
};

/**
 * Clear authentication data
 * @param {boolean} skipApiCall - If true, skip calling the logout API (useful for error cases)
 */
export const clearAuth = async (skipApiCall = false) => {
  // Clear local storage first
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Clear auth cookies by calling logout endpoint (if not skipped)
  if (!skipApiCall) {
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout API error:', err);
      // Continue even if API call fails - local storage is already cleared
    }
  }
};

/**
 * Handle 401 unauthorized responses
 */
export const handleUnauthorized = async () => {
  await clearAuth(true); // Skip API call since we already got 401
  // Redirect to landing page
  window.location.href = '/';
};

/**
 * Get stored user data
 */
export const getStoredUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Get stored token
 */
export const getStoredToken = () => {
  return localStorage.getItem('token');
};

