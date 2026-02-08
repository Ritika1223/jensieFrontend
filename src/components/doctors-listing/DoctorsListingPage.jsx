import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import SideNavigation from './SideNavigation';
import SearchBar from './SearchBar';
import FilterBar from './FilterBar';
import DoctorCarousel from './DoctorCarousel';
import DoctorCard from './DoctorCard';
import Marcus from '../Marcus';
import { API_URL } from '../../config/api.js';
import { useSidebar } from '../../contexts/SidebarContext';
import { MapPinIcon, TagIcon } from '@heroicons/react/24/solid';

const DoctorsListingPage = () => {
  const { isCollapsed, toggleMobileMenu, isMobile } = useSidebar();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  // Marcus personalized messages state
  const [marcusMessage, setMarcusMessage] = useState("Hi! 👋");
  const [isSearching, setIsSearching] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const searchBarRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());
  const searchChangeTimeoutsRef = useRef([]); // Track timeouts to prevent memory leaks
  
  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Initialize Marcus with personalized greeting
  useEffect(() => {
    try {
      const visited = localStorage.getItem('marcus_visited');
      const hour = new Date().getHours();
      
      if (!visited) {
        // First visit
        localStorage.setItem('marcus_visited', 'true');
        setMarcusMessage("Hi! I'm Marcus 👋 Welcome!");
      } else {
        // Returning visitor - time-based greeting
        if (hour >= 6 && hour < 12) {
          setMarcusMessage("Good morning! 👋");
        } else if (hour >= 12 && hour < 18) {
          setMarcusMessage("Afternoon! 😊");
        } else if (hour >= 18 && hour < 22) {
          setMarcusMessage("Evening! 🌙");
        } else {
          setMarcusMessage("Hey! Late night? 🌙");
        }
      }
    } catch (error) {
      // localStorage not available (private browsing, disabled, etc.)
      // Use default greeting based on time
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        setMarcusMessage("Good morning! 👋");
      } else if (hour >= 12 && hour < 18) {
        setMarcusMessage("Afternoon! 😊");
      } else if (hour >= 18 && hour < 22) {
        setMarcusMessage("Evening! 🌙");
      } else {
        setMarcusMessage("Hey! Late night? 🌙");
      }
    }
  }, []);

  // Track search bar position for Marcus positioning (using getBoundingClientRect for fixed positioning)
  useEffect(() => {
    if (!isSearching) return;

    const updatePos = () => {
      if (searchBarRef.current) {
        const rect = searchBarRef.current.getBoundingClientRect();
        setSearchBarPosition({
          top: rect.top, // Use viewport coordinates for fixed positioning
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    // Initial update - use multiple attempts to ensure it catches
    updatePos();
    const timeout1 = setTimeout(updatePos, 10);
    const timeout2 = setTimeout(updatePos, 50);

    const handleScroll = () => {
      requestAnimationFrame(updatePos);
    };
    const handleResize = () => {
      requestAnimationFrame(updatePos);
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('resize', handleResize);
    };
  }, [isSearching]);

  // Handle search value change from SearchBar component
  const handleSearchChange = useCallback((value) => {
    // Clear any existing timeouts to prevent memory leaks
    if (searchChangeTimeoutsRef.current.length > 0) {
      searchChangeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      searchChangeTimeoutsRef.current = [];
    }

    const hasValue = value && value.trim().length > 0;
    
    if (hasValue) {
      setIsSearching(true);
      setMarcusMessage("Got it! 🔍");
      lastInteractionRef.current = Date.now();
      
      // Update search bar position - try multiple times to ensure it catches
      if (searchBarRef.current) {
        const updatePos = () => {
          if (searchBarRef.current) {
            const rect = searchBarRef.current.getBoundingClientRect();
            setSearchBarPosition({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            });
          }
        };
        updatePos();
        const timeout1 = setTimeout(updatePos, 10);
        const timeout2 = setTimeout(updatePos, 50);
        searchChangeTimeoutsRef.current.push(timeout1, timeout2);
      }
    } else {
      setIsSearching(false);
      // Reset to greeting after clearing
      const hour = new Date().getHours();
      if (hour >= 6 && hour < 12) {
        setMarcusMessage("Good morning! 👋");
      } else if (hour >= 12 && hour < 18) {
        setMarcusMessage("Afternoon! 😊");
      } else {
        setMarcusMessage("Evening! 🌙");
      }
    }
  }, []);

  // Handle search bar focus
  const handleSearchFocus = useCallback(() => {
    if (searchBarRef.current) {
      const rect = searchBarRef.current.getBoundingClientRect();
      const newPosition = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      };
      
      // Set position first, then use requestAnimationFrame to ensure it's committed
      setSearchBarPosition(newPosition);
      
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsSearching(true);
          const messages = [
            "How can I help? 🤗",
            "What are you looking for? 🔍",
            "I'm here to help! 💙",
            "Ready to search! ✨"
          ];
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          setMarcusMessage(randomMessage);
          lastInteractionRef.current = Date.now();
        });
      });
    } else {
      // Fallback if ref is not ready
      setIsSearching(true);
      const messages = [
        "How can I help? 🤗",
        "What are you looking for? 🔍",
        "I'm here to help! 💙",
        "Ready to search! ✨"
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMarcusMessage(randomMessage);
      lastInteractionRef.current = Date.now();
    }
  }, []);

  // Handle search bar blur
  const handleSearchBlur = useCallback(() => {
    // Don't immediately hide - wait a bit in case user is switching focus
    const blurTimeout = setTimeout(() => {
      if (!searchBarRef.current?.querySelector('input:focus')) {
        // Only hide if search value is empty
        const input = searchBarRef.current?.querySelector('input');
        if (input && !input.value.trim()) {
          setIsSearching(false);
          // Reset Marcus message based on time of day
          const hour = new Date().getHours();
          if (hour >= 6 && hour < 12) {
            setMarcusMessage("Good morning! 👋");
          } else if (hour >= 12 && hour < 18) {
            setMarcusMessage("Afternoon! 😊");
          } else if (hour >= 18 && hour < 22) {
            setMarcusMessage("Evening! 🌙");
          } else {
            setMarcusMessage("Hey! Late night? 🌙");
          }
        }
      }
    }, 200);
    
    // Store timeout for cleanup
    searchChangeTimeoutsRef.current.push(blurTimeout);
  }, []);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (searchChangeTimeoutsRef.current.length > 0) {
        searchChangeTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
        searchChangeTimeoutsRef.current = [];
      }
    };
  }, []);

  // Track user interactions for personalized messages
  useEffect(() => {
    const handleSearchInput = (e) => {
      const target = e.target;
      if (target.tagName === 'INPUT' && target.placeholder?.toLowerCase().includes('search')) {
        const value = target.value;
        if (value.length > 0) {
          // Move Marcus to search bar
          setIsSearching(true);
          setMarcusMessage("Got it! 🔍");
          lastInteractionRef.current = Date.now();
          
          // Update position
          if (searchBarRef.current) {
            const rect = searchBarRef.current.getBoundingClientRect();
            setSearchBarPosition({
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
            });
          }
        } else {
          // Move Marcus back when search is cleared
          setIsSearching(false);
          const hour = new Date().getHours();
          if (hour >= 6 && hour < 12) {
            setMarcusMessage("Good morning! 👋");
          } else if (hour >= 12 && hour < 18) {
            setMarcusMessage("Afternoon! 😊");
          } else {
            setMarcusMessage("Evening! 🌙");
          }
        }
      }
    };

    const handleFilterClick = (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      const buttonText = target.textContent || target.getAttribute('aria-label') || '';
      const ariaLabel = target.getAttribute('aria-label') || '';
      
      // More accurate filter detection
      if (ariaLabel.includes('Male') || buttonText.includes('Male')) {
        setMarcusMessage("Finding the perfect match! 👥");
        lastInteractionRef.current = Date.now();
      } else if (ariaLabel.includes('Female') || buttonText.includes('Female')) {
        setMarcusMessage("Finding the perfect match! 👥");
        lastInteractionRef.current = Date.now();
      } else if (ariaLabel.includes('All') && buttonText.includes('All')) {
        setMarcusMessage("Showing all doctors! 👥");
        lastInteractionRef.current = Date.now();
      } else if (ariaLabel.includes('Specialist') || buttonText.includes('Specialist')) {
        setMarcusMessage("Looking for specialists! 🩺");
        lastInteractionRef.current = Date.now();
      } else if (ariaLabel.includes('Location') || buttonText.includes('Location')) {
        setMarcusMessage("Searching nearby... 📍");
        lastInteractionRef.current = Date.now();
      } else if (ariaLabel.includes('Experience') || buttonText.includes('Experience') || buttonText.includes('Exp')) {
        setMarcusMessage("Finding experienced doctors! ⭐");
        lastInteractionRef.current = Date.now();
      }
    };

    const handleDoctorCardHover = (e) => {
      const card = e.target.closest('[class*="doctor"]') || e.target.closest('[class*="card"]');
      if (card) {
        setMarcusMessage("This one looks great! 👀");
        lastInteractionRef.current = Date.now();
      }
    };

    const handleDoctorCardClick = (e) => {
      const card = e.target.closest('[class*="doctor"]') || e.target.closest('[class*="card"]');
      if (card) {
        setMarcusMessage("Great pick! 🎉");
        lastInteractionRef.current = Date.now();
      }
    };

    const handleScroll = () => {
      lastInteractionRef.current = Date.now();
    };

    // Add event listeners
    document.addEventListener('input', handleSearchInput);
    document.addEventListener('click', handleFilterClick);
    document.addEventListener('mouseenter', handleDoctorCardHover, true);
    document.addEventListener('click', handleDoctorCardClick, true);
    window.addEventListener('scroll', handleScroll);

    // Inactivity check - show helpful message after 30 seconds
    const checkInactivity = () => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceLastInteraction > 30000) {
        const messages = [
          "Need help finding a doctor? 💬",
          "Stuck? I'm here to help! 💙",
          "Want some suggestions? 😊"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setMarcusMessage(randomMessage);
        lastInteractionRef.current = Date.now(); // Reset to prevent spam
      }
    };

    inactivityTimerRef.current = setInterval(checkInactivity, 5000);

    return () => {
      document.removeEventListener('input', handleSearchInput);
      document.removeEventListener('click', handleFilterClick);
      document.removeEventListener('mouseenter', handleDoctorCardHover, true);
      document.removeEventListener('click', handleDoctorCardClick, true);
      window.removeEventListener('scroll', handleScroll);
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, []);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [affordableDoctors, setAffordableDoctors] = useState([]);
  const [allDoctors, setAllDoctors] = useState([]);
  const [loading, setLoading] = useState({
    nearby: true,
    affordable: true,
    all: true,
  });
  const [error, setError] = useState({
    nearby: null,
    affordable: null,
    all: null,
  });

  // Use refs to prevent multiple API calls
  const hasFetchedNearby = useRef(false);
  const hasFetchedAffordable = useRef(false);
  const hasFetchedAll = useRef(false);

  // Fetch nearby doctors
  useEffect(() => {
    // Prevent multiple calls
    if (hasFetchedNearby.current) return;
    hasFetchedNearby.current = true;

    let currentAbortController = null;
    let currentTimeoutId = null;
    let geolocationTimeoutId = null;

    const fetchNearbyDoctorsWithLocation = async (params) => {
      // Abort previous request if still pending
      if (currentAbortController) {
        currentAbortController.abort();
      }
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
      }
      
      currentAbortController = new AbortController();
      currentTimeoutId = setTimeout(() => currentAbortController.abort(), 15000); // 15 second timeout
      
      try {
        const response = await fetch(`${API_URL}/api/doctors/nearby?${params}`, {
          credentials: 'include',
          signal: currentAbortController.signal,
        });
        if (currentTimeoutId) clearTimeout(currentTimeoutId);
        currentTimeoutId = null;
        
        const data = await response.json();
        if (data.success) {
          setNearbyDoctors(data.data);
        } else {
          setError((prev) => ({ ...prev, nearby: 'Failed to fetch nearby doctors' }));
        }
      } catch (err) {
        if (currentTimeoutId) clearTimeout(currentTimeoutId);
        currentTimeoutId = null;
        if (err.name === 'AbortError') {
          setError((prev) => ({ ...prev, nearby: 'Request timeout. Please check your connection.' }));
        } else {
          console.error('Error fetching nearby doctors:', err);
          setError((prev) => ({ ...prev, nearby: 'Error loading nearby doctors' }));
        }
      } finally {
        setLoading((prev) => ({ ...prev, nearby: false }));
        currentAbortController = null;
      }
    };

    const fetchNearbyDoctors = async () => {
      try {
        setLoading((prev) => ({ ...prev, nearby: true }));
        
        // Get user's location if available with timeout
        if (navigator.geolocation) {
          geolocationTimeoutId = setTimeout(() => {
            // Fallback if geolocation takes too long
            fetchNearbyDoctorsWithLocation('limit=8');
          }, 5000); // 5 second timeout for geolocation
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (geolocationTimeoutId) clearTimeout(geolocationTimeoutId);
              geolocationTimeoutId = null;
              const { latitude, longitude } = position.coords;
              const locationParams = `limit=8&latitude=${latitude}&longitude=${longitude}&maxDistance=25`;
              fetchNearbyDoctorsWithLocation(locationParams);
            },
            (error) => {
              if (geolocationTimeoutId) clearTimeout(geolocationTimeoutId);
              geolocationTimeoutId = null;
              console.warn('Geolocation error:', error);
              // Fallback: fetch without location
              fetchNearbyDoctorsWithLocation('limit=8');
            },
            {
              timeout: 5000,
              maximumAge: 300000, // 5 minutes
              enableHighAccuracy: false
            }
          );
        } else {
          // Fallback: fetch without location
          fetchNearbyDoctorsWithLocation('limit=8');
        }
      } catch (err) {
        if (geolocationTimeoutId) clearTimeout(geolocationTimeoutId);
        geolocationTimeoutId = null;
        console.error('Error fetching nearby doctors:', err);
        setError((prev) => ({ ...prev, nearby: 'Error loading nearby doctors' }));
        setLoading((prev) => ({ ...prev, nearby: false }));
      }
    };

    fetchNearbyDoctors();
    
    // Cleanup on unmount
    return () => {
      if (currentAbortController) {
        currentAbortController.abort();
      }
      if (currentTimeoutId) {
        clearTimeout(currentTimeoutId);
      }
      if (geolocationTimeoutId) {
        clearTimeout(geolocationTimeoutId);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Fetch affordable doctors
  useEffect(() => {
    // Prevent multiple calls
    if (hasFetchedAffordable.current) return;
    hasFetchedAffordable.current = true;

    let abortController = null;
    let timeoutId = null;

    const fetchAffordableDoctors = async () => {
      abortController = new AbortController();
      timeoutId = setTimeout(() => abortController.abort(), 15000); // 15 second timeout
      
      try {
        setLoading((prev) => ({ ...prev, affordable: true }));
        // Default max fee: 1000 (can be made configurable)
        const response = await fetch(`${API_URL}/api/doctors/affordable?limit=8&maxFee=1000`, {
          credentials: 'include',
          signal: abortController.signal,
        });
        if (timeoutId) clearTimeout(timeoutId);
        
        const data = await response.json();
        if (data.success) {
          setAffordableDoctors(data.data);
        } else {
          setError((prev) => ({ ...prev, affordable: 'Failed to fetch affordable doctors' }));
        }
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          setError((prev) => ({ ...prev, affordable: 'Request timeout. Please check your connection.' }));
        } else {
          console.error('Error fetching affordable doctors:', err);
          setError((prev) => ({ ...prev, affordable: 'Error loading affordable doctors' }));
        }
      } finally {
        setLoading((prev) => ({ ...prev, affordable: false }));
      }
    };

    fetchAffordableDoctors();
    
    // Cleanup on unmount
    return () => {
      if (abortController) {
        abortController.abort();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Fetch all doctors
  useEffect(() => {
    // Prevent multiple calls
    if (hasFetchedAll.current) return;
    hasFetchedAll.current = true;

    let abortController = null;
    let timeoutId = null;

    const fetchAllDoctors = async () => {
      abortController = new AbortController();
      timeoutId = setTimeout(() => abortController.abort(), 15000); // 15 second timeout
      
      try {
        setLoading((prev) => ({ ...prev, all: true }));
        const response = await fetch(`${API_URL}/api/doctors/all?limit=8`, {
          credentials: 'include',
          signal: abortController.signal,
        });
        if (timeoutId) clearTimeout(timeoutId);
        
        const data = await response.json();
        if (data.success) {
          setAllDoctors(data.data);
        } else {
          setError((prev) => ({ ...prev, all: 'Failed to fetch doctors' }));
        }
      } catch (err) {
        if (timeoutId) clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          setError((prev) => ({ ...prev, all: 'Request timeout. Please check your connection.' }));
        } else {
          console.error('Error fetching all doctors:', err);
          setError((prev) => ({ ...prev, all: 'Error loading doctors' }));
        }
      } finally {
        setLoading((prev) => ({ ...prev, all: false }));
      }
    };

    fetchAllDoctors();
    
    // Cleanup on unmount
    return () => {
      if (abortController) {
        abortController.abort();
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []); // Empty dependency array - only run once on mount

  // Transform doctor data to ensure id field exists (MongoDB uses _id)
  const transformDoctor = (doctor) => ({
    ...doctor,
    id: doctor._id || doctor.id,
  });

  // Memoize transformed doctors to prevent unnecessary re-renders
  const displayNearbyDoctors = useMemo(() => nearbyDoctors.map(transformDoctor), [nearbyDoctors]);
  const displayAffordableDoctors = useMemo(() => affordableDoctors.map(transformDoctor), [affordableDoctors]);
  const displayAllDoctors = useMemo(() => allDoctors.map(transformDoctor), [allDoctors]);

  // Update Marcus message when doctors are loaded
  useEffect(() => {
    if (!loading.nearby && displayNearbyDoctors.length > 0 && marcusMessage.includes("Looking for")) {
      const messages = [
        "Found some great matches! 🎉",
        "Perfect! Here are your options 💙",
        "These doctors look amazing! ⭐"
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMarcusMessage(randomMessage);
    }
  }, [loading.nearby, displayNearbyDoctors.length, marcusMessage]);

  // Update Marcus message based on result count
  useEffect(() => {
    const totalResults = displayAllDoctors.length;
    if (!loading.all && totalResults > 0) {
      if (totalResults > 10) {
        const messages = [
          "Lots of options! Take your time ⏰",
          "Plenty of great doctors! 🌟",
          "Explore at your own pace! 😊"
        ];
        if (!marcusMessage.includes("Lots") && !marcusMessage.includes("Plenty") && !marcusMessage.includes("Explore")) {
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          setMarcusMessage(randomMessage);
        }
      } else if (totalResults <= 5 && totalResults > 0) {
        const messages = [
          "Quality over quantity! ✨",
          "These are the best! ⭐",
          "Curated just for you! 💙"
        ];
        if (!marcusMessage.includes("Quality") && !marcusMessage.includes("Curated")) {
          const randomMessage = messages[Math.floor(Math.random() * messages.length)];
          setMarcusMessage(randomMessage);
        }
      }
    }
  }, [loading.all, displayAllDoctors.length, marcusMessage]);

  // Update Marcus message when no results found
  useEffect(() => {
    if (!loading.all && displayAllDoctors.length === 0 && !error.all) {
      const messages = [
        "No worries, let's try different filters 🔄",
        "Let me help you refine your search 💭",
        "Maybe try a different specialty? 🩺"
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMarcusMessage(randomMessage);
    }
  }, [loading.all, displayAllDoctors.length, error.all]);

  return (
    <>
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
        .doctors-listing-page {
          contain: layout style paint;
        }
        .doctors-listing-page * {
          will-change: auto;
        }
      `}</style>
      {/* Side Navigation - Rendered outside scrollable container for proper fixed positioning */}
      <SideNavigation />
      
      <div className="bg-white relative w-full min-h-screen flex overflow-x-auto doctors-listing-page">
        {/* Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 opacity-5">
            {/* Background pattern can be added here if needed */}
          </div>
        </div>

      {/* Max width container and centering */}
      <div className="w-full mx-auto flex relative">
        {/* Main Content - Responsive spacing for fixed sidebar */}
        <main 
          className={`flex-1 flex flex-col p-4 lg:p-8 min-w-0 transition-all ${prefersReducedMotion ? 'duration-0' : 'duration-500'} ease-[cubic-bezier(0.4,0,0.2,1)] ${
            !isMobile 
              ? (isCollapsed ? 'lg:pl-[104px]' : 'lg:pl-[280px]') 
              : ''
          }`}
        >
        {/* Mobile Hamburger Button */}
        {isMobile && (
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden fixed top-4 left-4 z-30 bg-white border border-[rgba(0,0,0,0.1)] rounded-lg p-2 shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] active:scale-[0.95] active:shadow-md"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 lg:mb-8 mt-12 lg:mt-0">
          <h1 className="font-semibold text-2xl lg:text-[28px] text-black whitespace-nowrap">Doctors</h1>
          <div ref={searchBarRef}>
            <SearchBar 
              onSearchChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mb-6 lg:mb-8">
          <FilterBar />
        </div>

        {/* Nearby Doctors Section - Only show if there are doctors */}
        {(!loading.nearby && !error.nearby && displayNearbyDoctors.length > 0) && (
          <div className="mb-12">
            <h2 className="font-semibold text-xl lg:text-[22px] text-black mb-6 flex items-center gap-2">
              <MapPinIcon className="w-5 h-5 text-red-500" />
              Nearby Doctor
            </h2>
            <DoctorCarousel doctors={displayNearbyDoctors} carouselId="nearby" />
          </div>
        )}

        {/* Affordable Doctors Section */}
        <div className="mb-12">
          <h2 className="font-semibold text-xl lg:text-[22px] text-black mb-6 flex items-center gap-2">
            <TagIcon className="w-5 h-5 text-emerald-500" />
            Affordable Doctor
          </h2>
          {loading.affordable ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col gap-3 items-center">
                <div className="w-8 h-8 border-2 border-[#796bff] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Loading affordable doctors...</p>
              </div>
            </div>
          ) : error.affordable ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-red-500">{error.affordable}</p>
            </div>
          ) : displayAffordableDoctors.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500">No affordable doctors found</p>
            </div>
          ) : (
            <DoctorCarousel doctors={displayAffordableDoctors} carouselId="affordable" />
          )}
        </div>

        {/* All Doctors Section */}
        <div className="mb-12">
          <h2 className="font-semibold text-xl lg:text-[22px] text-black mb-6">All Doctors</h2>
          {loading.all ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col gap-3 items-center">
                <div className="w-8 h-8 border-2 border-[#796bff] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-500 text-sm">Loading doctors...</p>
              </div>
            </div>
          ) : error.all ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-red-500">{error.all}</p>
            </div>
          ) : displayAllDoctors.length === 0 ? (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500">No doctors found</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 lg:gap-6 justify-center sm:justify-start">
              {displayAllDoctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>

        {/* Find Your Specialist Section */}
        <div className="bg-white border border-[rgba(0,0,0,0.1)] rounded-2xl p-6 lg:p-7 flex flex-col xl:flex-row gap-6 items-center justify-center">
          <div className="flex flex-col gap-4 items-start w-full lg:w-auto">
            <h3 className="font-semibold text-lg lg:text-xl text-black">Find Your Specialist</h3>
            <div className="flex flex-col gap-3.5 items-start w-full">
              {/* Search Inputs */}
              <div className="flex flex-col sm:flex-row gap-1.25 items-center w-full">
                <div className="border border-[rgba(0,0,0,0.08)] flex flex-col gap-2.5 h-12 items-start justify-center px-4 py-2.5 rounded-xl w-full sm:w-[223px] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-[rgba(121,107,255,0.2)] hover:shadow-[0_2px_8px_rgba(121,107,255,0.08)] active:scale-[0.98] active:shadow-[0_1px_4px_rgba(121,107,255,0.12)]">
                  <p className="font-normal text-base text-[rgba(0,0,0,0.2)] whitespace-nowrap">
                    Doctor's name, specialst...
                  </p>
                </div>
                <div className="border border-[rgba(0,0,0,0.08)] flex flex-col gap-2.5 h-12 items-start justify-center px-4 py-2.5 rounded-xl w-full sm:w-[223px] cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:border-[rgba(121,107,255,0.2)] hover:shadow-[0_2px_8px_rgba(121,107,255,0.08)] active:scale-[0.98] active:shadow-[0_1px_4px_rgba(121,107,255,0.12)]">
                  <p className="font-normal text-base text-[rgba(0,0,0,0.2)] whitespace-nowrap">Location</p>
                </div>
                <div className="bg-[#796bff] flex flex-col gap-2.5 items-center justify-center px-4 py-2.5 rounded-xl w-12 h-12 shrink-0 cursor-pointer transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:opacity-90 hover:shadow-[0_4px_12px_rgba(121,107,255,0.3)] active:scale-[0.95] active:shadow-[0_2px_6px_rgba(121,107,255,0.4)]">
                  <div className="w-5 h-5">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="9" cy="9" r="6" stroke="white" strokeWidth="1.5"/>
                      <path d="M13 13L17 17" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                </div>
              </div>
              {/* Filter Chips */}
              <div className="flex flex-wrap gap-1.5 items-center">
                <div className="bg-[#796bff] flex gap-3.5 items-center justify-center cursor-pointer px-3.5 py-1.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:shadow-[0_2px_8px_rgba(121,107,255,0.25)] active:scale-[0.96] active:shadow-[0_1px_4px_rgba(121,107,255,0.3)]">
                  <p className="font-normal text-sm text-white whitespace-nowrap">All</p>
                </div>
                <div className="bg-[#f4f4f4] flex gap-3.5 items-center justify-center cursor-pointer px-3.5 py-1.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#e8e8e8] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] active:scale-[0.96] active:shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                  <p className="font-normal text-sm text-[rgba(0,0,0,0.8)] whitespace-nowrap">Availability</p>
                </div>
                <div className="bg-[#f4f4f4] flex gap-3.5 items-center justify-center cursor-pointer px-3.5 py-1.5 rounded-lg transition-all duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:bg-[#e8e8e8] hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] active:scale-[0.96] active:shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
                  <p className="font-normal text-sm text-[rgba(0,0,0,0.8)] whitespace-nowrap">Sort by All Filters</p>
                </div>
              </div>
            </div>
          </div>
          {/* Map/Visual Section */}
          <div className="relative w-full lg:w-[515px] h-[335px] rounded-2xl overflow-hidden">
            <div className="absolute inset-0">
              <img 
                alt="Map visualization" 
                className="w-full h-full object-cover" 
                src="/doctors-listing/c3ed3d621b062ce27e7e4595d21516110cce967b.png"
                loading="lazy"
                decoding="async"
                style={{ willChange: 'auto' }}
              />
            </div>
          </div>
        </div>
        </main>
      </div>
    </div>
    
    {/* Marcus - The Animated Floating Sphere - Reusable Component */}
    <Marcus
      size="sm"
      isSearching={isSearching}
      searchBarPosition={searchBarPosition}
      style={{
        width: '48px',
        height: '48px',
      }}
    />
    </>
  );
};

export default DoctorsListingPage;
