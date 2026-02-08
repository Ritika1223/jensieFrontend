import React, { useState, useEffect, useMemo, useCallback, memo, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useSidebar } from '../../contexts/SidebarContext';
import { clearAuth, getStoredUser, checkAuth } from '../../utils/auth';
import { useParams } from "react-router";
import { CHAT_API_URL } from "../../config/api";

// Memoized SVG Icons for better performance
const MenuIcon = memo(({ isDarkMode = false }) => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2.5 5H17.5M2.5 10H17.5M2.5 15H17.5" stroke={isDarkMode ? 'rgba(255,255,255,0.9)' : 'currentColor'} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
));
MenuIcon.displayName = 'MenuIcon';

const DoctorIcon = memo(() => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M6 21C6 17 9 14 12 14C15 14 18 17 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
));
DoctorIcon.displayName = 'DoctorIcon';

const ChevronDownIcon = memo(() => (
  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));
ChevronDownIcon.displayName = 'ChevronDownIcon';

// Optimized Image component with error handling
const OptimizedImage = memo(({ src, alt, className, loading = 'lazy', isDarkMode = false }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const handleError = useCallback(() => {
    setImgError(true);
  }, []);

  const handleLoad = useCallback(() => {
    setImgLoaded(true);
  }, []);

  if (imgError) {
    return (
      <div className={`${className} bg-[rgba(0,0,0,0.05)] flex items-center justify-center`}>
        <div className="w-4 h-4 border-2 border-[rgba(0,0,0,0.2)] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Apply white filter in dark mode for main logo (not favicon) and Private Mode icon
  const shouldApplyFilter = isDarkMode && (
    (src.includes('jensei-logo') && !src.includes('jensei-favicon')) ||
    src.includes('a15ebe8edc9e3a75a9dc9f38418a63e8d1164028')
  );

  return (
    <img 
      alt={alt}
      className={`${className} ${imgLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
      src={src}
      loading={loading}
      decoding="async"
      onError={handleError}
      onLoad={handleLoad}
      style={{
        filter: shouldApplyFilter ? 'brightness(0) invert(1)' : 'none',
        transition: 'filter 0.15s ease-out',
        willChange: 'opacity, filter'
      }}
    />
  );
});
OptimizedImage.displayName = 'OptimizedImage';

// Generate a colored sphere avatar SVG based on user's name/email
const generateAvatarSphere = (name = 'User') => {
  // Generate a hash from the name for consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate colors based on hash
  const hue1 = Math.abs(hash % 360);
  const hue2 = (hue1 + 60) % 360;
  const hue3 = (hue1 + 120) % 360;
  
  // Get initials
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  // Create gradient colors
  const colors = [
    `hsl(${hue1}, 70%, 60%)`,
    `hsl(${hue2}, 70%, 60%)`,
    `hsl(${hue3}, 70%, 60%)`,
  ];
  
  const svg = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="avatarGradient-${Math.abs(hash)}" cx="30%" cy="30%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="50%" stop-color="${colors[1]}" />
          <stop offset="100%" stop-color="${colors[2]}" />
        </radialGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#avatarGradient-${Math.abs(hash)})" />
      <text x="20" y="20" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="600" fill="white" text-anchor="middle" dominant-baseline="central">${initials}</text>
    </svg>
  `.trim();
  
  // Use encodeURIComponent for proper SVG encoding
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
};

const SideNavigation = () => {
  let params = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isCollapsed, toggleCollapse, isMobileMenuOpen, closeMobileMenu, isMobile } = useSidebar();
  const { isDarkMode, toggleTheme } = useTheme();
  const [isDoctorExpanded, setIsDoctorExpanded] = useState(false);
  const [isRecentExpanded, setIsRecentExpanded] = useState(params.thread_id != null && location.pathname.split("/")[1] === "chat");
  const [threads, setThreads] = useState([]);
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const clickTimeoutRef = useRef(null);
  const prevCollapsedRef = useRef(isCollapsed);
  
  // Check if we're on the doctors listing page
  const isDoctorsPage = location.pathname === '/doctors';

  async function getThreads() {
  const threadListResponse = await fetch(
        `${CHAT_API_URL}/threads`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
  
      const threadList = await threadListResponse.json();
      if (!threadListResponse.ok) {
        throw new Error(threadList?.error || "Failed to create thread");
      }
      setThreads(threadList);
}

useEffect(() => {
  getThreads()
}, [])

  // Fetch user data on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        // First try to get from localStorage (fast)
        const storedUser = getStoredUser();
        if (storedUser) {
          console.log('Stored user data:', storedUser);
          setUser(storedUser);
          setLoadingUser(false);
        }

        // Then verify/refresh from API (in background)
        const authResult = await checkAuth();
        if (authResult.authenticated && authResult.user) {
          console.log('User data from API:', authResult.user);
          setUser(authResult.user);
          // Update localStorage with fresh data
          try {
            localStorage.setItem('user', JSON.stringify(authResult.user));
          } catch (e) {
            console.warn('Failed to update localStorage:', e);
          }
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        // Fallback to stored user if available
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
        }
      } finally {
        setLoadingUser(false);
      }
    };

    fetchUser();
  }, []);


  // Reset expanded states when sidebar collapses
  // Note: This is a valid use case - resetting child component state when parent state changes
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const wasExpanded = !prevCollapsedRef.current;
    if (isCollapsed && wasExpanded) {
      // Only reset when transitioning from expanded to collapsed
      setIsDoctorExpanded(false);
      setIsRecentExpanded(false);
    }
    prevCollapsedRef.current = isCollapsed;
  }, [isCollapsed]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Debounced toggle to prevent rapid clicks on slow connections
  const debouncedToggle = useCallback((toggleFn) => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    clickTimeoutRef.current = setTimeout(() => {
      toggleFn();
    }, 50); // Small debounce to prevent rapid state changes
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await clearAuth();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate even if clearAuth fails
      navigate('/');
    }
  }, [navigate]);

  const toggleDoctorExpanded = useCallback(() => {
    debouncedToggle(() => setIsDoctorExpanded(prev => !prev));
  }, [debouncedToggle]);

  const toggleRecentExpanded = useCallback(() => {
    debouncedToggle(() => setIsRecentExpanded(prev => !prev));
  }, [debouncedToggle]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  // On mobile, hide sidebar by default and show as overlay when open
  // On desktop, show sidebar normally
  const isVisible = isMobile ? isMobileMenuOpen : true;
  const isOverlay = isMobile && isMobileMenuOpen;

  // Memoized class names for better performance
  const sidebarClasses = useMemo(() => 
    `${isDarkMode ? 'bg-[#111111] border-r border-[rgba(255,255,255,0.1)]' : 'bg-[#f8f8f8] border-r border-[rgba(0,0,0,0.06)]'} flex flex-col h-screen items-center transition-[background-color,border-color] duration-100 ease-out shrink-0 fixed left-0 top-0 z-50 overflow-hidden ${
      isCollapsed ? 'px-6 py-6 w-[80px]' : 'px-4 sm:px-6 py-6 sm:py-8 w-56 sm:w-64'
    } ${
      isMobile 
        ? (isVisible ? 'translate-x-0' : '-translate-x-full') 
        : ''
    }`, [isCollapsed, isMobile, isVisible, isDarkMode]
  );

  const logoSize = useMemo(() => isCollapsed ? 'w-6 h-6' : 'w-7 h-7', [isCollapsed]);

  // Get user display values with fallbacks
  const userName = useMemo(() => {
    if (!user) return 'User';
    return user.name || user.displayName || user.username || 'User';
  }, [user]);

  const userPlan = useMemo(() => {
    if (!user) return 'Free';
    return user.plan || user.subscription || 'Free';
  }, [user]);

  const userPicture = useMemo(() => {
    if (!user) {
      // Generate sphere avatar for no user
      return generateAvatarSphere('User');
    }
    
    // Try multiple possible field names for Google profile picture
    const picture = user.picture || user.photoURL || user.image || user.profilePicture || user.avatar || user.profileImage;
    
    if (picture && picture !== '/doctors-listing/9788f70d54e0c3c708e99a3ad2a4297a099e19f9.png') {
      return picture;
    }
    
    // Generate colored sphere avatar based on user's name or email
    const nameForAvatar = user.name || user.displayName || user.username || user.email || 'User';
    return generateAvatarSphere(nameForAvatar);
  }, [user]);

  return (
    <>
      {/* Backdrop for mobile overlay */}
      {isOverlay && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div 
        className={sidebarClasses}
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          height: '100vh',
          maxHeight: '100vh',
          minHeight: '100vh',
          zIndex: 50,
          overflow: 'hidden',
          flexGrow: 0,
          flexShrink: 0,
        }}
      >
      {/* Top Section - Fixed at top */}
      <div className={`flex flex-col gap-10 items-center justify-start w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0 ${isCollapsed ? 'gap-8' : ''}`}>
        {/* Logo Section */}
        <div className={`flex items-center justify-between w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'flex-col gap-2' : 'justify-between'}`}>
          <div className={`flex gap-2 items-center transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'flex-col' : ''}`}>
            {/* Collapse button when collapsed - smooth fade in/out */}
            <div 
              className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isCollapsed 
                  ? 'max-h-6 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              <button 
                onClick={toggleCollapse}
                className="w-5 h-5 shrink-0 cursor-pointer hover:opacity-70 transition-all duration-300 ease-out hover:scale-110 active:scale-95"
                aria-label="Expand sidebar"
              >
                <MenuIcon isDarkMode={isDarkMode} />
              </button>
            </div>
            
            {/* Logo - always visible, smoothly transitions size and position */}
            <Link 
              to="/" 
              className={`shrink-0 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${logoSize}`}
              onClick={isMobile ? closeMobileMenu : undefined}
            >
              <OptimizedImage
                src="/jensei-favicon.svg"
                alt="Logo"
                className="w-full h-full object-contain"
                loading="eager"
                isDarkMode={isDarkMode}
              />
            </Link>
            
            {/* Text logo - only when expanded, with smooth fade */}
            <div 
              className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                !isCollapsed 
                  ? 'max-h-12 opacity-100' 
                  : 'max-h-0 opacity-0'
              }`}
            >
              {!isCollapsed && (
              <Link 
                to="/" 
                className="h-11 w-18 relative cursor-pointer block"
                onClick={isMobile ? closeMobileMenu : undefined}
              >
                <OptimizedImage
                  src="/jensei-logo.png"
                  alt="Jensei"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  isDarkMode={isDarkMode}
                />
              </Link>
              )}
            </div>
          </div>
          
          {/* Expand button when expanded - smooth fade in/out */}
          <div 
            className={`overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
              !isCollapsed 
                ? 'max-h-6 opacity-100' 
                : 'max-h-0 opacity-0'
            }`}
          >
            {!isCollapsed && (
              <button 
                onClick={toggleCollapse}
                className="w-5 h-5 shrink-0 cursor-pointer hover:opacity-70 transition-all duration-300 ease-out hover:scale-110 active:scale-95"
                aria-label="Collapse sidebar"
              >
                <MenuIcon isDarkMode={isDarkMode} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation Items - Scrollable if needed */}
        <div 
          className={`flex flex-col gap-2 items-center w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-y-auto flex-1 min-h-0 ${isCollapsed ? 'gap-6 px-0' : 'items-start'}`} 
          style={{ 
            scrollbarWidth: 'thin',
            paddingTop: isCollapsed ? '0.5rem' : '0',
            paddingBottom: isCollapsed ? '0.5rem' : '0',
            overflowX: 'hidden'
          }}
        >
          {/* New Chat */}
          <div onClick={() => navigate('/chat', { replace: true })}>
          {!isCollapsed ? (
            <button className={`relative flex gap-2 items-center px-3 py-2 rounded-lg w-full cursor-pointer transition-all duration-200 ease-out border border-transparent hover:shadow-[0_2px_8px_${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}] active:scale-[0.98] ${
              isDarkMode 
                ? 'bg-[rgba(255,255,255,0.06)] text-white' 
                : 'bg-[#f8f8f8] text-[#22212c]'
            }`}>
              <div className={`w-5 h-5 shrink-0 transition-colors duration-100 ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <p className={`font-medium text-sm whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>New Chat</p>
            </button>
          ) : (
            <div className="flex items-center justify-center w-full py-2">
              <div className="w-5 h-5 cursor-pointer flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 5V19M5 12H19" stroke={isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          )}
          </div>

          {/* Doctor Section */}
          {!isCollapsed ? (
            <div className="relative w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
              <button
                onClick={() => navigate('/doctors')}
                className={`relative flex gap-2 items-center justify-between px-3 py-2 rounded-lg w-full cursor-pointer transition-[background-color,color,border-color,box-shadow] duration-100 ease-out border border-transparent hover:shadow-[0_2px_8px_${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}] active:scale-[0.98] ${
                  isDoctorsPage 
                    ? 'bg-[rgba(121,107,255,0.08)]' 
                    : isDarkMode ? 'bg-[rgba(255,255,255,0.06)]' : 'bg-[#f8f8f8]'
                } ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}
                aria-label="Go to Doctors page"
              >
                <div className="flex gap-2 items-center">
                  <div className={`w-5 h-5 shrink-0 transition-colors duration-100 ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>
                    <DoctorIcon />
                  </div>
                  <p className={`font-medium text-sm whitespace-nowrap transition-colors duration-100 ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>Doctor</p>
                </div>
                <div 
                  className={`w-4 h-4 shrink-0 transition-all duration-300 ease-out rotate-0 ${isDarkMode ? 'text-white' : 'text-[#22212c]'} ${isDoctorExpanded ? 'rotate-180' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDoctorExpanded();
                  }}
                >
                  <ChevronDownIcon />
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-out ${isDoctorExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-2 items-start ml-3 mt-2 w-full pb-1.5">
                  <div className="flex gap-2 items-center cursor-pointer hover:opacity-70 transition-opacity duration-200 px-1 py-0.5 rounded">
                    <div className="w-2 h-2 rounded-full bg-[#FFD700]"></div>
                    <p className={`font-normal text-xs whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>Clinics</p>
                  </div>
                  <div className="flex gap-2 items-center cursor-pointer hover:opacity-70 transition-opacity duration-200 px-1 py-0.5 rounded">
                    <div className="w-2 h-2 rounded-full bg-[#796bff]"></div>
                    <p className={`font-normal text-xs whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>Hospitals</p>
                  </div>
                  <div className="flex gap-2 items-center cursor-pointer hover:opacity-70 transition-opacity duration-200 px-1 py-0.5 rounded">
                    <div className="w-2 h-2 rounded-full bg-[#22c55e]"></div>
                    <p className={`font-normal text-xs whitespace-nowrap ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>Surgeries</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div 
              className="flex items-center justify-center w-full cursor-pointer" 
              style={{ minHeight: '40px', padding: '0.5rem 0' }}
              onClick={() => navigate('/doctors')}
            >
              <div className={`flex items-center justify-center p-2.5 rounded-lg w-[42px] h-[40px] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                isDarkMode ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-[rgba(0,0,0,0.01)]'
              }`} style={{ overflow: 'visible' }}>
                <div className={`w-5 h-5 shrink-0 flex items-center justify-center ${isDarkMode ? 'text-white' : ''}`} style={{ overflow: 'visible' }}>
                  <DoctorIcon />
                </div>
              </div>
            </div>
          )}

          {/* Lab Test */}
          {!isCollapsed ? (
            <button className={`relative flex gap-2 items-center px-3 py-2 rounded-lg w-full cursor-pointer transition-all duration-200 ease-out border border-transparent hover:shadow-[0_2px_8px_${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}] active:scale-[0.98] ${
              isDarkMode 
                ? 'bg-[rgba(255,255,255,0.06)] text-white' 
                : 'bg-[#f8f8f8] text-[#22212c]'
            }`}>
              <div className={`w-5 h-5 shrink-0 transition-colors duration-100 ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3V8L4.5 17.5C3.5 19.5 5 22 7.5 22H16.5C19 22 20.5 19.5 19.5 17.5L15 8V3M9 3H15M9 3H7M15 3H17M9 13H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className={`font-medium text-sm whitespace-nowrap transition-colors duration-100 ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>Lab Test</p>
            </button>
          ) : (
            <div className="flex items-center justify-center w-full py-2">
              <div className="w-5 h-5 cursor-pointer flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 3V8L4.5 17.5C3.5 19.5 5 22 7.5 22H16.5C19 22 20.5 19.5 19.5 17.5L15 8V3M9 3H15M9 3H7M15 3H17M9 13H15" stroke={isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          )}

          {/* Recent Section */}
          {!isCollapsed ? (
            <div className="relative w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
              <button
                onClick={toggleRecentExpanded}
                className={`relative flex gap-2 items-center justify-between px-3 py-2 rounded-lg w-full cursor-pointer transition-[background-color,color,box-shadow] duration-150 ease-out border border-transparent hover:shadow-[0_2px_8px_${isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}] active:scale-[0.98] ${
                  isDarkMode 
                    ? 'bg-[rgba(255,255,255,0.06)] text-white' 
                    : 'bg-[#f8f8f8] text-[#22212c]'
                }`}
                aria-label={isRecentExpanded ? 'Collapse Recent menu' : 'Expand Recent menu'}
              >
                <div className="flex gap-2 items-center">
                  <div className={`w-5 h-5 shrink-0 transition-colors duration-100 ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <p className={`font-medium text-sm whitespace-nowrap transition-colors duration-100 ${isDarkMode ? 'text-white' : 'text-[#22212c]'}`}>Recent</p>
                </div>
                <div className={`w-4 h-4 shrink-0 transition-[color,transform] duration-100 ease-out rotate-0 ${isDarkMode ? 'text-white' : 'text-[#22212c]'} ${isRecentExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDownIcon />
                </div>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-out ${isRecentExpanded ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="flex flex-col gap-1.5 items-start mt-2 w-full">
                  {threads.length > 0 &&
                    threads.map(thread => (
                      <div 
                      key={thread.thread_id}
                      onClick={() => navigate(`/chat/${thread.thread_id}`, { replace: true })}
                       className="flex gap-2 items-center justify-center px-2 py-1.5 rounded-lg w-full min-w-0"
                       style={{
                        cursor: 'pointer',
                        background: `${params.thread_id == thread.thread_id ? "#ddd" : "transparent"}`
                       }}
                       >
                        <p className={`flex-1 font-normal text-xs truncate min-w-0 transition-colors duration-100 ${isDarkMode ? 'text-white' : 'text-[rgba(0,0,0,0.8)]'}`}>Dummy text</p>
                        <div className="w-4 h-4 shrink-0">
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="4" r="1.5" fill={isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}/>
                            <circle cx="10" cy="10" r="1.5" fill={isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}/>
                            <circle cx="10" cy="16" r="1.5" fill={isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}/>
                          </svg>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
          ) : null}
          
          {/* History Icon (shown when collapsed) */}
          {isCollapsed && (
            <div className="flex items-center justify-center w-full" style={{ minHeight: '40px', padding: '0.5rem 0' }}>
              <div className="w-5 h-5 shrink-0 cursor-pointer flex items-center justify-center" style={{ overflow: 'visible' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', overflow: 'visible' }}>
                  <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke={isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'} strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section - Fixed at bottom */}
      <div className={`flex flex-col gap-3 items-center justify-center w-full transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex-shrink-0 mt-auto ${isCollapsed ? 'gap-9' : ''}`}>
        {/* Private Mode */}
        <div onClick={() => navigate('/private', { replace: true })} className={`flex gap-2 items-center justify-center px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ease-out ${
          isCollapsed 
            ? 'w-5 h-5 p-0 border-0' 
            : `w-full border ${
                isDarkMode 
                  ? 'bg-[rgba(255,255,255,0.06)] border-[rgba(255,255,255,0.1)] hover:shadow-[0_2px_8px_rgba(255,255,255,0.1)]' 
                  : 'bg-[#f8f8f8] border-[rgba(0,0,0,0.08)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
              }`
        }`}>
          <div className={`shrink-0 ${isCollapsed ? 'w-5 h-5' : 'w-5 h-5'}`}>
            <OptimizedImage
              src="/doctors-listing/a15ebe8edc9e3a75a9dc9f38418a63e8d1164028.svg"
              alt="Private Mode"
              className="w-full h-full object-contain"
              loading="lazy"
              isDarkMode={isDarkMode}
            />
          </div>
          {!isCollapsed && (
            <p className={`font-medium text-sm text-center whitespace-nowrap transition-[opacity,color] duration-100 ease-out ${
              isDarkMode ? 'text-white' : 'text-[rgba(0,0,0,0.8)]'
            }`}>Private Mode</p>
          )}
        </div>

        {/* Dark Mode / Sun Icon (shown when collapsed) */}
        {isCollapsed && (
          <button 
            onClick={toggleTheme}
            className="w-6 h-6 shrink-0 cursor-pointer hover:opacity-70 transition-opacity duration-200"
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <OptimizedImage
              src="/doctors-listing/89a062784942952e8419eb87a5269cf1d6553597.svg"
              alt={isDarkMode ? 'Light Mode' : 'Dark Mode'}
              className="w-full h-full object-contain"
              loading="lazy"
              isDarkMode={isDarkMode}
            />
          </button>
        )}

        {/* Separator */}
        {!isCollapsed && (
          <div className={`h-px w-full transition-[background-color,opacity] duration-100 ${isDarkMode ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-[rgba(0,0,0,0.08)]'}`}></div>
        )}

        {/* User Profile */}
        <div className={`flex items-center justify-between transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${isCollapsed ? 'w-9 h-9' : 'w-full'}`}>
          {isCollapsed ? (
            <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
              {loadingUser ? (
                <div className={`w-full h-full animate-pulse ${isDarkMode ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-[rgba(0,0,0,0.05)]'}`} />
              ) : (
                <OptimizedImage
                  src={userPicture}
                  alt={userName}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
            </div>
          ) : (
            <>
              <div className="flex gap-2.5 items-center">
                <div className="w-9 h-9 shrink-0 rounded-full overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                  {loadingUser ? (
                    <div className={`w-full h-full animate-pulse ${isDarkMode ? 'bg-[rgba(255,255,255,0.1)]' : 'bg-[rgba(0,0,0,0.05)]'}`} />
                  ) : (
                    <OptimizedImage
                      src={userPicture}
                      alt={userName}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  )}
                </div>
                <div className="flex flex-col gap-0.5 justify-center transition-opacity duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                  <p className={`font-medium text-sm leading-tight ${isDarkMode ? 'text-white' : 'text-[rgba(0,0,0,0.8)]'}`}>
                    {loadingUser ? 'Loading...' : userName}
                  </p>
                  <p className={`font-normal text-xs leading-tight ${isDarkMode ? 'text-white' : 'text-[rgba(0,0,0,0.8)]'}`}>
                    {loadingUser ? '...' : userPlan}
                  </p>
                </div>
              </div>
              <button 
                onClick={toggleTheme}
                className={`bg-[#d9d9d9] flex h-4.5 items-center px-0 py-0.5 rounded-3xl w-10 cursor-pointer transition-[justify-content,transform] duration-100 ease-out ${
                  isDarkMode ? 'justify-start' : 'justify-end'
                }`}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                <div className="bg-white flex items-center justify-center p-0.5 rounded-2xl w-5 h-5 transition-transform duration-300">
                  <div className={`w-4 h-4 transition-all duration-300 ${isDarkMode ? 'rotate-0 scale-100' : 'rotate-180 scale-110'}`}>
                    {isDarkMode ? (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-opacity duration-300">
                        <path d="M8 14C6.33333 14 4.91667 13.4167 3.75 12.25C2.58333 11.0833 2 9.66667 2 8C2 6.33333 2.58333 4.91667 3.75 3.75C4.91667 2.58333 6.33333 2 8 2C8.15556 2 8.30844 2.00556 8.45867 2.01667C8.60889 2.02778 8.756 2.04444 8.9 2.06667C8.44444 2.38889 8.08044 2.80844 7.808 3.32533C7.53556 3.84222 7.39956 4.40044 7.4 5C7.4 6 7.75 6.85 8.45 7.55C9.15 8.25 10 8.6 11 8.6C11.6111 8.6 12.1722 8.46378 12.6833 8.19133C13.1944 7.91889 13.6111 7.55511 13.9333 7.1C13.9556 7.24444 13.9722 7.39156 13.9833 7.54133C13.9944 7.69111 14 7.844 14 8C14 9.66667 13.4167 11.0833 12.25 12.25C11.0833 13.4167 9.66667 14 8 14ZM8 12.6667C8.97778 12.6667 9.85556 12.3971 10.6333 11.858C11.4111 11.3189 11.9778 10.6162 12.3333 9.75C12.1111 9.80556 11.8889 9.85 11.6667 9.88333C11.4444 9.91667 11.2222 9.93333 11 9.93333C9.63333 9.93333 8.46933 9.45267 7.508 8.49133C6.54667 7.53 6.06622 6.36622 6.06667 5C6.06667 4.77778 6.08333 4.55556 6.11667 4.33333C6.15 4.11111 6.19444 3.88889 6.25 3.66667C5.38333 4.02222 4.68044 4.58889 4.14133 5.36667C3.60222 6.14444 3.33289 7.02222 3.33333 8C3.33333 9.28889 3.78889 10.3889 4.7 11.3C5.61111 12.2111 6.71111 12.6667 8 12.6667Z" fill="rgba(0,0,0,0.8)"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="transition-opacity duration-300">
                        <circle cx="8" cy="8" r="3" stroke="rgba(0,0,0,0.8)" strokeWidth="1.5"/>
                        <path d="M8 1V2M8 14V15M1 8H2M14 8H15M2.93 2.93L3.64 3.64M12.36 12.36L13.07 13.07M2.93 13.07L3.64 12.36M12.36 3.64L13.07 2.93" stroke="rgba(0,0,0,0.8)" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            </>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className={`flex gap-2.5 items-center justify-center px-3 py-2 rounded-xl cursor-pointer transition-[background-color,color] duration-100 mt-2 ${
            isCollapsed ? 'w-10 h-10 p-0' : 'w-full'
          } ${isDarkMode ? 'hover:bg-[rgba(255,255,255,0.1)]' : 'hover:bg-[rgba(0,0,0,0.05)]'}`}
          aria-label="Logout"
        >
          <div className="w-5 h-5 shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5"
                stroke={isDarkMode ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          {!isCollapsed && (
            <p className={`font-normal text-base whitespace-nowrap transition-[color,opacity] duration-100 ease-out ${isDarkMode ? 'text-white' : 'text-[rgba(0,0,0,0.8)]'}`}>Logout</p>
          )}
        </button>
      </div>
    </div>
    </>
  );
};

export default memo(SideNavigation);