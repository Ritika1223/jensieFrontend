import { useEffect } from 'react';

/**
 * Hook to detect clicks outside an element
 * @param {React.RefObject} ref - Ref to the element
 * @param {Function} handler - Callback when click outside is detected
 * @param {boolean} enabled - Whether the listener is active
 */
export const useClickOutside = (ref, handler, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        handler(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, enabled]);
};
