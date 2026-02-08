import { useState, useEffect, useRef, useMemo } from 'react';
import { getStoredUser, checkAuth } from '../utils/auth';
import { safeLocalStorage } from '../utils/localStorage';
import { getTimeGreeting, getMessages, selectMessage } from '../constants/marcusMessages';

/**
 * Custom hook for Marcus personalized greeting messages
 * Handles user fetching, message generation, rotation, and localStorage
 * 
 * @returns {string} - Current Marcus greeting message
 */
export const useMarcusGreeting = () => {
  const [user, setUser] = useState(null);
  const [marcusMessage, setMarcusMessage] = useState('');
  
  const messageGeneratedRef = useRef(false);
  const lastUserNameRef = useRef('');
  const messageRotationTimerRef = useRef(null);
  const currentMessageIndexRef = useRef(-1);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }

        const authResult = await checkAuth();
        if (authResult.authenticated && authResult.user) {
          setUser(authResult.user);
          safeLocalStorage.setItem('user', JSON.stringify(authResult.user));
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };

    fetchUser();
  }, []);

  // Get stable user identifier for dependency - only changes when actual name values change
  const userIdentifier = useMemo(() => {
    if (!user) return null;
    const name = user?.name || user?.displayName || user?.username || '';
    return name.split(' ')[0] || 'anonymous';
  }, [user?.name, user?.displayName, user?.username]);

  // Generate personalized greeting message - only once per user or when user name actually changes
  useEffect(() => {
    const generatePersonalizedMessage = (rotateMessage = false) => {
      const userName = user?.name || user?.displayName || user?.username || '';
      const firstName = userName.split(' ')[0] || '';
      const currentUserName = firstName || 'anonymous';
      
      // Only prevent regeneration on initial load, allow rotation for returning users
      if (!rotateMessage && messageGeneratedRef.current && lastUserNameRef.current === currentUserName) {
        return; // Already generated for this user, don't regenerate unless rotating
      }
      
      // Mark as generated and track the user name (only on first generation)
      if (!messageGeneratedRef.current) {
        messageGeneratedRef.current = true;
        lastUserNameRef.current = currentUserName;
      }
      
      // Get time-based greeting
      const { greeting: timeGreeting, emoji: timeEmoji, isWeekend } = getTimeGreeting();
      
      // Check if first visit
      const visited = safeLocalStorage.getItem('marcus_chat_visited') === 'true';
      
      // Get last message index to avoid repeating the same message
      const lastMessageIndexStr = safeLocalStorage.getItem('marcus_last_message_index');
      const lastMessageIndex = lastMessageIndexStr !== null ? parseInt(lastMessageIndexStr, 10) : -1;
      
      // Determine message type and generate
      let messages, messageType;
      
      if (!visited && firstName) {
        messageType = 'firstVisitWithName';
      } else if (!visited) {
        messageType = 'firstVisitWithoutName';
      } else if (firstName) {
        messageType = 'returningWithName';
      } else {
        messageType = 'returningWithoutName';
      }
      
      messages = getMessages(messageType, { greeting: timeGreeting }, timeEmoji, firstName, isWeekend);
      
      // Select message avoiding duplicates
      const { message: personalizedMessage, index: selectedIndex } = selectMessage(
        messages,
        lastMessageIndex,
        currentMessageIndexRef.current
      );
      
      currentMessageIndexRef.current = selectedIndex;
      setMarcusMessage(personalizedMessage);
      
      // Store state in localStorage
      if (!visited) {
        safeLocalStorage.setItem('marcus_chat_visited', 'true');
      }
      safeLocalStorage.setItem('marcus_last_message_index', selectedIndex.toString());
      
      // Set up message rotation for returning users (rotate every 27 seconds after message is set)
      // Only rotate if this is a returning user (not first visit)
      if (visited) {
        // Clear any existing rotation timer first
        if (messageRotationTimerRef.current) {
          clearTimeout(messageRotationTimerRef.current);
          messageRotationTimerRef.current = null;
        }
        
        // Set up next rotation
        messageRotationTimerRef.current = setTimeout(() => {
          messageRotationTimerRef.current = null;
          generatePersonalizedMessage(true); // Continue rotation with new message
        }, 27000); // 27 seconds = 25s display + 2s gap before next message
      }
    };

    // Generate message on initial load or when user changes
    // Only generate if we have a user identifier or haven't generated yet
    if (userIdentifier !== null || !messageGeneratedRef.current) {
      generatePersonalizedMessage(false);
    }

    // Cleanup rotation timer on unmount or user change
    return () => {
      if (messageRotationTimerRef.current) {
        clearTimeout(messageRotationTimerRef.current);
        messageRotationTimerRef.current = null;
      }
    };
  }, [userIdentifier, user]);

  // Reset message generation flag when component unmounts (new session)
  useEffect(() => {
    return () => {
      messageGeneratedRef.current = false;
      lastUserNameRef.current = '';
      currentMessageIndexRef.current = -1;
      if (messageRotationTimerRef.current) {
        clearTimeout(messageRotationTimerRef.current);
        messageRotationTimerRef.current = null;
      }
    };
  }, []);

  return marcusMessage;
};
