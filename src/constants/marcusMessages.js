/**
 * Marcus personalized greeting messages
 * Centralized message templates and selection logic
 */

/**
 * Get time-based greeting based on current hour
 * @returns {Object} - Object with greeting, emoji, and isWeekend flag
 */
export const getTimeGreeting = () => {
  const hour = new Date().getHours();
  const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good morning', emoji: '☀️', isWeekend };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good afternoon', emoji: '🌤️', isWeekend };
  } else if (hour >= 17 && hour < 22) {
    return { greeting: 'Good evening', emoji: '🌆', isWeekend };
  } else {
    return { greeting: 'Hey', emoji: '🌙', isWeekend };
  }
};

/**
 * Get message array based on user state
 * @param {string} type - Message type: 'firstVisitWithName', 'firstVisitWithoutName', 'returningWithName', 'returningWithoutName'
 * @param {Object} timeGreeting - Object with greeting string
 * @param {string} timeEmoji - Time-based emoji
 * @param {string} firstName - User's first name (if available)
 * @param {boolean} isWeekend - Whether it's a weekend
 * @returns {Array<string>} - Array of message templates
 */
export const getMessages = (type, timeGreeting, timeEmoji, firstName, isWeekend) => {
  const { greeting } = timeGreeting;
  
  const messageTemplates = {
    firstVisitWithName: [
      `${greeting}! ${timeEmoji} Welcome!`,
      `Hi there! ${timeEmoji}`,
      `${greeting}! ${timeEmoji} Great to see you!`,
      `Hey! ${timeEmoji}`,
      // Keep some with name for personalization (about 40-50%)
      `${greeting} ${firstName}! ${timeEmoji}`,
      `Hi ${firstName}! ${timeEmoji} Welcome!`,
      `${greeting} ${firstName}! ${timeEmoji} So glad you're here!`,
    ],
    
    firstVisitWithoutName: [
      `${greeting}! ${timeEmoji} Welcome!`,
      `Hi there! ${timeEmoji}`,
      `${greeting}! ${timeEmoji} Great to see you!`,
      `Hey! ${timeEmoji}`,
      `${greeting}! ${timeEmoji} So glad you're here!`,
    ],
    
    returningWithName: [
      `${greeting}! ${timeEmoji} Welcome back!`,
      `${greeting}! ${timeEmoji} Good to see you!`,
      `Hey! ${timeEmoji} You're back!`,
      `${greeting}! ${timeEmoji} Hope you're well!`,
      `${greeting}! ${timeEmoji} Nice to see you!`,
      `Welcome back! ${timeEmoji}`,
      `${greeting}! ${timeEmoji} ${isWeekend ? 'Enjoying your weekend?' : "How's your day?"}`,
      `${greeting}! ${timeEmoji} ${isWeekend ? 'Weekend vibes!' : "Hope it's going well!"}`,
      `${greeting}! ${timeEmoji} Ready when you are!`,
      // Keep some with name for variety (about 40-50% should have name)
      `${greeting} ${firstName}! ${timeEmoji}`,
      `Hey ${firstName}! ${timeEmoji} Welcome back!`,
      `${firstName}! ${greeting}! ${timeEmoji}`,
      `Hi ${firstName}! ${timeEmoji} Great to see you again!`,
      `${greeting} ${firstName}! ${timeEmoji} Always happy to help!`,
      `${firstName}! ${timeEmoji} Welcome back!`,
    ],
    
    returningWithoutName: [
      `${greeting}! ${timeEmoji}`,
      `Hey there! ${timeEmoji} Welcome back!`,
      `${greeting}! ${timeEmoji} Good to see you!`,
      `Hi! ${timeEmoji} You're back!`,
      `${greeting}! ${timeEmoji} Hope you're well!`,
      `Welcome back! ${timeEmoji}`,
      `${greeting}! ${timeEmoji} How are you?`,
      `Hey! ${timeEmoji} Nice to see you!`,
      `${greeting}! ${timeEmoji} Great to see you again!`,
      `Hi! ${timeEmoji} Welcome back!`,
      `${greeting}! ${timeEmoji} ${isWeekend ? 'Enjoying your weekend?' : "How's your day?"}`,
      `Hey! ${timeEmoji} You're here!`,
      `${greeting}! ${timeEmoji} ${isWeekend ? 'Weekend vibes!' : "Hope it's going well!"}`,
      `Welcome back! ${timeEmoji} Always happy to help!`,
      `${greeting}! ${timeEmoji} Ready when you are!`,
    ],
  };

  return messageTemplates[type] || [];
};

/**
 * Select a message from array avoiding duplicates
 * @param {Array<string>} messages - Array of message templates
 * @param {number} lastIndex - Last selected index from localStorage
 * @param {number} currentSessionIndex - Current session's last selected index
 * @returns {Object} - Object with selected message and index
 */
export const selectMessage = (messages, lastIndex, currentSessionIndex) => {
  let selectedIndex = Math.floor(Math.random() * messages.length);
  
  if ((selectedIndex === lastIndex || selectedIndex === currentSessionIndex) && messages.length > 1) {
    selectedIndex = (selectedIndex + 1) % messages.length;
  }
  
  return { message: messages[selectedIndex], index: selectedIndex };
};
