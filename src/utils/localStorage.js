/**
 * Safe localStorage access with error handling
 * Provides a wrapper around localStorage that gracefully handles
 * cases where localStorage is unavailable (e.g., private browsing mode)
 */

export const safeLocalStorage = {
  /**
   * Safely get an item from localStorage
   * @param {string} key - The key to retrieve
   * @param {any} defaultValue - Default value if key not found or error occurs
   * @returns {string|null} - The stored value or defaultValue
   */
  getItem(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      return value !== null ? value : defaultValue;
    } catch (e) {
      console.warn('localStorage.getItem failed:', e);
      return defaultValue;
    }
  },

  /**
   * Safely set an item in localStorage
   * @param {string} key - The key to set
   * @param {string} value - The value to store
   * @returns {boolean} - True if successful, false otherwise
   */
  setItem(key, value) {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage.setItem failed:', e);
      return false;
    }
  },

  /**
   * Safely remove an item from localStorage
   * @param {string} key - The key to remove
   * @returns {boolean} - True if successful, false otherwise
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.warn('localStorage.removeItem failed:', e);
      return false;
    }
  },
};
