import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SideNavigation from './SideNavigation';
import SearchBar from './SearchBar';
import Marcus from '../Marcus';
import { API_URL } from '../../config/api.js';
import { useSidebar } from '../../contexts/SidebarContext';

const DoctorsProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctorData, setDoctorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Marcus personalized messages state
  const [marcusMessage, setMarcusMessage] = useState("Hi! 👋");
  const [isSearching, setIsSearching] = useState(false);
  const [searchBarPosition, setSearchBarPosition] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const searchBarRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const lastInteractionRef = useRef(Date.now());
  
  // Slot booking states
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotsByPeriod, setSlotsByPeriod] = useState({
    Morning: [],
    Afternoon: [],
    Evening: [],
    Night: []
  });
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Initialize Marcus with personalized greeting
  useEffect(() => {
    try {
      const visited = localStorage.getItem('marcus_visited');
      const hour = new Date().getHours();
      
      if (!visited) {
        localStorage.setItem('marcus_visited', 'true');
        setMarcusMessage("Hi! I'm Marcus 👋 Welcome!");
      } else {
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

  // Handle search value change from SearchBar component
  const handleSearchChange = useCallback((value) => {
    if (value && value.trim().length > 0) {
      setIsSearching(true);
      setMarcusMessage("Got it! 🔍");
      lastInteractionRef.current = Date.now();
      
      // Update search bar position
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
      setIsSearching(false);
      // Reset to greeting after clearing
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
    }, 200); // Small delay to check if focus moved elsewhere

    return () => clearTimeout(blurTimeout);
  }, []);

  // Update search bar position when isSearching changes
  useEffect(() => {
    if (isSearching && searchBarRef.current) {
      const rect = searchBarRef.current.getBoundingClientRect();
      setSearchBarPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
  }, [isSearching]);

  // Update Marcus message when doctor data loads
  useEffect(() => {
    if (doctorData && !loading) {
      setMarcusMessage("Great doctor! ⭐");
      lastInteractionRef.current = Date.now();
    }
  }, [doctorData, loading]);

  // Update Marcus message when date is selected
  useEffect(() => {
    if (selectedDate) {
      const messages = [
        "Good choice! 📅",
        "Nice date! ✨",
        "Perfect timing! 💙"
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      setMarcusMessage(randomMessage);
      lastInteractionRef.current = Date.now();
    }
  }, [selectedDate]);

  // Update Marcus message when slot is selected
  useEffect(() => {
    if (selectedSlot) {
      setMarcusMessage("Ready to book? 🎯");
      lastInteractionRef.current = Date.now();
    }
  }, [selectedSlot]);

  // Update Marcus message when booking succeeds
  useEffect(() => {
    if (bookingSuccess) {
      setMarcusMessage("Booking confirmed! 🎉");
      lastInteractionRef.current = Date.now();
    }
  }, [bookingSuccess]);

  // Track user interactions for personalized messages
  useEffect(() => {
    const handleDateClick = (e) => {
      const target = e.target.closest('[class*="date"]') || e.target.closest('[class*="rounded-lg"]');
      if (target && target.textContent) {
        setMarcusMessage("Selecting a date? 📅");
        lastInteractionRef.current = Date.now();
      }
    };

    const handleSlotClick = (e) => {
      const target = e.target.closest('[class*="slot"]') || e.target.closest('[class*="rounded-lg"]');
      if (target && target.textContent && target.textContent.includes('AM') || target.textContent.includes('PM')) {
        setMarcusMessage("Great time slot! ⏰");
        lastInteractionRef.current = Date.now();
      }
    };

    const handlePeriodClick = (e) => {
      const target = e.target.closest('[class*="period"]') || e.target;
      if (target.textContent && (target.textContent.includes('Morning') || target.textContent.includes('Afternoon') || target.textContent.includes('Evening') || target.textContent.includes('Night'))) {
        setMarcusMessage("Checking availability! 🔍");
        lastInteractionRef.current = Date.now();
      }
    };

    const handleScroll = () => {
      lastInteractionRef.current = Date.now();
    };

    // Add event listeners
    document.addEventListener('click', handleDateClick);
    document.addEventListener('click', handleSlotClick);
    document.addEventListener('click', handlePeriodClick);
    window.addEventListener('scroll', handleScroll);

    // Inactivity check
    const checkInactivity = () => {
      const timeSinceLastInteraction = Date.now() - lastInteractionRef.current;
      if (timeSinceLastInteraction > 30000) {
        const messages = [
          "Need help booking? 💬",
          "I'm here if you need me! 💙",
          "Want some guidance? 😊"
        ];
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        setMarcusMessage(randomMessage);
        lastInteractionRef.current = Date.now();
      }
    };

    inactivityTimerRef.current = setInterval(checkInactivity, 5000);

    return () => {
      document.removeEventListener('click', handleDateClick);
      document.removeEventListener('click', handleSlotClick);
      document.removeEventListener('click', handlePeriodClick);
      window.removeEventListener('scroll', handleScroll);
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
    };
  }, []);

  // Fetch doctor data from API
  useEffect(() => {
    const fetchDoctor = async () => {
      if (!id) {
        setError('Doctor ID is required');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`${API_URL}/api/doctors/${id}`, {
          credentials: 'include',
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch doctor');
        }

        if (data.success && data.data) {
          // Map API data to component format
          const mappedData = {
            id: data.data._id || data.data.id,
            name: data.data.name || '',
            specialty: data.data.specialty || '',
            rating: data.data.rating || 0,
            badge: data.data.badge || null,
            price: `₹${data.data.fee || 0}`,
            priceType: 'Video',
            image: data.data.image,
            biography: data.data.biography || '',
            specializedIssues: data.data.specialization || [],
            license: data.data.qualifications || '',
            experience: data.data.experience || 0,
            totalConsultations: data.data.totalConsultations || 0,
            office: {
              location: `📍 ${data.data.location || ''}`,
              address: data.data.officeAddress || '',
              hours: '10:30-11:00 AM', // Default, can be updated later
              phone: data.data.officePhoneNumber || data.data.phoneNumber || '',
              mapImage: '/doctors-listing/c3ed3d621b062ce27e7e4595d21516110cce967b.png', // Default map image
              distance: '2.7km' // Default, can be calculated later
            },
            // Slots will be fetched separately
            timeSlots: [],
            timePeriods: [
              { label: 'Morning', count: 0, active: false },
              { label: 'Afternoon', count: 0, active: false },
              { label: 'Evening', count: 0, active: false },
              { label: 'Night', count: 0, active: false }
            ],
            slots: {
              Morning: [],
              Afternoon: [],
              Evening: [],
              Night: []
            }
          };
          setDoctorData(mappedData);
        }
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError(err.message || 'Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [id]);

  // Fetch available dates and slots
  useEffect(() => {
    const fetchSlots = async () => {
      if (!id) return;

      try {
        setLoadingSlots(true);
        
        // Generate dates for next 7 days
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          dates.push({
            date: date.toISOString().split('T')[0],
            displayDate: formatDateDisplay(date, i),
            dateObj: date
          });
        }

        setAvailableDates(dates);
        
        // Set first date as selected by default
        if (dates.length > 0 && !selectedDate) {
          setSelectedDate(dates[0].date);
        }
      } catch (err) {
        console.error('Error fetching dates:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [id]);

  // Fetch slots for selected date
  useEffect(() => {
    const fetchSlotsForDate = async () => {
      if (!id || !selectedDate) return;

      try {
        setLoadingSlots(true);
        const response = await fetch(
          `${API_URL}/api/slots/${id}?date=${selectedDate}`,
          { credentials: 'include' }
        );
        const data = await response.json();

        if (data.success && data.data) {
          const slots = data.data.availableSlots || [];
          
          // Group slots by period
          const grouped = {
            Morning: [],
            Afternoon: [],
            Evening: [],
            Night: []
          };

          slots.forEach(slot => {
            if (grouped[slot.period]) {
              grouped[slot.period].push({
                id: slot._id,
                startTime: slot.startTime,
                endTime: slot.endTime,
                period: slot.period,
                bookingType: slot.bookingType
              });
            }
          });

          // Sort slots by time within each period
          Object.keys(grouped).forEach(period => {
            grouped[period].sort((a, b) => {
              const timeA = a.startTime.split(':').map(Number);
              const timeB = b.startTime.split(':').map(Number);
              return timeA[0] * 60 + timeA[1] - (timeB[0] * 60 + timeB[1]);
            });
          });

          setSlotsByPeriod(grouped);

          // Update period counts in doctorData
          if (doctorData) {
            const updatedPeriods = doctorData.timePeriods.map(period => ({
              ...period,
              count: grouped[period.label]?.length || 0,
              active: period.label === selectedPeriod
            }));
            setDoctorData(prev => ({
              ...prev,
              timePeriods: updatedPeriods,
              slots: grouped
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching slots:', err);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlotsForDate();
  }, [id, selectedDate]);

  // Helper function to format date display
  const formatDateDisplay = (date, index) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateCopy = new Date(date);
    dateCopy.setHours(0, 0, 0, 0);

    if (index === 0) {
      return 'Today';
    } else if (index === 1) {
      return 'Tomorrow';
    } else {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]}`;
    }
  };

  // Helper function to format time (24h to 12h)
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  // Handle slot selection
  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setShowBookingPopup(true);
    setBookingError(null);
    setBookingSuccess(false);
  };

  // Handle booking confirmation
  const handleConfirmBooking = async () => {
    if (!selectedSlot || !id) return;

    try {
      setBookingInProgress(true);
      setBookingError(null);

      const response = await fetch(`${API_URL}/api/appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          doctorId: id,
          timeSlotId: selectedSlot.id,
          appointmentType: 'clinic_visit',
          notes: ''
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to book appointment');
      }

      if (data.success) {
        setBookingSuccess(true);
        // Refresh slots after booking
        setTimeout(() => {
          setShowBookingPopup(false);
          setSelectedSlot(null);
          // Refresh slots
          window.location.reload();
        }, 2000);
      }
    } catch (err) {
      console.error('Booking error:', err);
      setBookingError(err.message || 'Failed to book appointment. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  // All hooks must be called before any conditional returns
  // Find the active period from timePeriods (use default if doctorData not loaded yet)
  const activePeriod = doctorData?.timePeriods?.find(p => p.active)?.label || 'Evening';
  const [selectedPeriod, setSelectedPeriod] = useState(activePeriod);
  
  // Carousel state and refs
  const carouselRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Prepare doctor data with state (use default structure if not loaded)
  const doctorDataWithState = doctorData ? {
    ...doctorData,
    reviews: [
      {
        name: 'Sarah L.',
        rating: 5.0,
        comment: "The virtual consultation was so efficient. Dr. Sharma was empathetic and clearly explained the next steps based on the AI's initial findings. Highly recommend her for quick appointments.",
        avatar: '/doctors-listing/177d140e192caa63642ab9208e3afc0c6202a7cc.png'
      },
      {
        name: 'Sarah L.',
        rating: 5.0,
        comment: "The virtual consultation was so efficient. Dr. Sharma was empathetic and clearly explained the next steps based on the AI's initial findings. Highly recommend her for quick appointments.",
        avatar: '/doctors-listing/177d140e192caa63642ab9208e3afc0c6202a7cc.png'
      }
    ]
  } : null;

  // Check if carousel needs arrows - MUST be called before any conditional returns
  useEffect(() => {
    const checkScroll = () => {
      if (carouselRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
        const hasOverflow = scrollWidth > clientWidth;
        const tolerance = 1; // Small tolerance for rounding errors
        setShowLeftArrow(hasOverflow && scrollLeft > tolerance);
        setShowRightArrow(hasOverflow && scrollLeft < scrollWidth - clientWidth - tolerance);
      }
    };

    // Initial check with multiple attempts to ensure DOM is ready
    const timeouts = [
      setTimeout(checkScroll, 0),
      setTimeout(checkScroll, 100),
      setTimeout(checkScroll, 300)
    ];
    
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      if (carousel) {
        carousel.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      }
    };
  }, [doctorData?.timeSlots]); // Use doctorData instead of doctorDataWithState

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 200; // Adjust scroll amount as needed
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Show loading or error state AFTER all hooks are called
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doctorData || !doctorDataWithState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-red-500">{error || 'Doctor not found'}</p>
        <button
          onClick={() => navigate('/doctors')}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Back to Doctors
        </button>
      </div>
    );
  }

  const { isCollapsed, toggleMobileMenu, isMobile } = useSidebar();

  return (
    <>
    {/* Side Navigation - Rendered outside scrollable container for proper fixed positioning */}
    <SideNavigation />
    
    <div className="bg-white relative w-full min-h-screen flex overflow-x-auto">
      {/* Max width container and centering */}
      <div className="w-full mx-auto flex relative">
        {/* Main Content - Responsive spacing for fixed sidebar */}
        <main 
          className={`flex-1 flex flex-col p-4 lg:p-8 min-w-0 transition-all duration-300 ${
            !isMobile 
              ? (isCollapsed ? 'lg:pl-[104px]' : 'lg:pl-[280px]') 
              : ''
          }`}
        >
        {/* Mobile Hamburger Button */}
        {isMobile && (
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden fixed top-4 left-4 z-30 bg-white border border-[rgba(0,0,0,0.1)] rounded-lg p-2 shadow-md hover:bg-gray-50 transition-colors"
            aria-label="Toggle menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        )}

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 lg:mb-8 mt-12 lg:mt-0">
          <h1 className="font-semibold text-2xl lg:text-[28px] text-black whitespace-nowrap">Doctors Profile</h1>
          <div ref={searchBarRef}>
            <SearchBar 
              onSearchChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
          </div>
        </div>

        {/* Doctor Info and Content */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start w-full mb-8 min-w-0">
          {/* Doctor Card */}
          <div className="bg-white border border-[rgba(0,0,0,0.1)] flex gap-2.5 items-center p-5 rounded-2xl w-full lg:w-[350px] shrink-0">
            <div className="flex flex-col gap-9 items-start w-full">
              {/* Rating Badges */}
              <div className="flex items-end justify-between w-full">
                <div className="bg-[#edffea] flex gap-1.5 items-center px-2.5 py-1.5 rounded-md">
                  <div className="w-5 h-5">
                    <img 
                      alt="Star" 
                      className="w-full h-full object-contain" 
                      src="/doctors-listing/8aab98d13f950baa0aea072e0ea6782d67c7d58a.svg" 
                    />
                  </div>
                  <p className="font-semibold text-sm text-[#1fbd5c] whitespace-nowrap">
                    {typeof doctorDataWithState.rating === 'number' 
                      ? doctorDataWithState.rating.toFixed(1) 
                      : doctorDataWithState.rating}
                  </p>
                </div>
                <div className="bg-[#ffeff0] flex gap-1.5 items-center px-2.5 py-1.5 rounded-md">
                  <div className="w-5 h-5">
                    <img 
                      alt="Star" 
                      className="w-full h-full object-contain" 
                      src="/doctors-listing/a63e9aa33df2e8af9e1a9d698bcc4f5ceb2e2ca0.svg" 
                    />
                  </div>
                  <p className="font-semibold text-sm text-[#c44143] whitespace-nowrap">{doctorDataWithState.badge}</p>
                </div>
              </div>

              {/* Doctor Image and Info */}
              <div className="flex flex-col gap-5 items-center w-full">
                <div className="relative w-[122px] h-[122px]">
                  <div className="absolute inset-[-19.1%_-17.46%_-15.82%_-17.46%]">
                    <img 
                      alt={doctorDataWithState.name} 
                      className="w-full h-full object-cover rounded-full" 
                      src={doctorDataWithState.image} 
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-6 items-center w-full">
                  <div className="flex flex-col gap-2.5 items-center justify-center w-full">
                    <div className="bg-[rgba(240,238,255,0.6)] flex gap-2.5 items-center justify-center px-2 py-1 rounded-md">
                      <p className="font-normal text-base text-[#796bff] whitespace-nowrap">{doctorDataWithState.specialty}</p>
                    </div>
                    <div className="flex gap-2 items-center justify-center w-full">
                      <p className="font-semibold text-xl text-black text-center whitespace-nowrap">{doctorDataWithState.name}</p>
                      <div className="w-6 h-6">
                        <img 
                          alt="Verified" 
                          className="w-full h-full object-contain" 
                          src="/doctors-listing/verified-star.svg" 
                        />
                      </div>
                    </div>
                    <p className="font-normal text-sm text-[rgba(0,0,0,0.6)] whitespace-nowrap">
                      <span className="font-bold text-base">{doctorDataWithState.price}/</span>
                      <span className="text-sm"> {doctorDataWithState.priceType}</span>
                    </p>
                  </div>
                  <div className="flex gap-2.5 items-center">
                    <div className="bg-[#ebf4ff] flex gap-2.5 items-center justify-center p-3.5 rounded-xl w-12 h-12">
                      <div className="w-6 h-6">
                        <img 
                          alt="Video Call" 
                          className="w-full h-full object-contain" 
                          src="/doctors-listing/ed29c247d12ce4589e0ad52beaba45b95fb199a4.svg" 
                        />
                      </div>
                    </div>
                    <div className="bg-[#ebf4ff] flex gap-2.5 items-center justify-center p-3.5 rounded-xl w-12 h-12">
                      <div className="w-6 h-6">
                        <img 
                          alt="Message" 
                          className="w-full h-full object-contain" 
                          src="/doctors-listing/14eaec3a0a0793a0116873266449f0e443880203.svg" 
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Book Consultation Button */}
              <div className="bg-gradient-to-r from-[#796bff] to-[#4c9eff] border border-[rgba(255,255,255,0.2)] flex flex-col gap-2.5 h-12 items-center justify-center px-7 py-2.5 rounded-xl w-full cursor-pointer hover:opacity-90">
                <p className="font-medium text-lg text-white whitespace-nowrap">Book Consultation</p>
              </div>
            </div>
          </div>

          {/* Main Content Section */}
          <div className="flex flex-col gap-6 items-start flex-1 w-full min-w-0">
            {/* Biography */}
            <div className="flex flex-col gap-2.5 items-start w-full min-w-0">
              <p className="font-semibold text-xl text-black w-full">About Me</p>
              <p className="font-normal text-sm text-[rgba(0,0,0,0.6)] leading-relaxed w-full max-w-full lg:max-w-[712px] break-words">
                {doctorDataWithState.biography}
              </p>
            </div>

            {/* Specialized Issues */}
            <div className="flex flex-col gap-2.5 items-start w-full min-w-0">
              <p className="font-semibold text-base text-black w-full">Specialized/Issues</p>
              <div className="flex flex-wrap gap-1.5 items-center w-full min-w-0">
                {doctorDataWithState.specializedIssues.map((issue, index) => (
                  <div key={index} className="bg-[#f2f2f2] flex gap-2.5 items-center justify-center px-2.5 py-1.5 rounded-[18px] shrink-0">
                    <p className="font-normal text-sm text-[rgba(0,0,0,0.8)] whitespace-nowrap">{issue}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Qualifications/Experience */}
            <div className="flex flex-col gap-6 items-start w-full min-w-0">
              <div className="flex flex-col gap-2.5 items-start w-full text-base min-w-0">
                <p className="font-semibold text-black w-full">Qualifications/ Experience</p>
                <p className="text-sm font-normal text-[rgba(0,0,0,0.6)] w-full max-w-full lg:max-w-[712px] break-words">License: {doctorDataWithState.license}</p>
                <p className="text-sm font-normal text-[rgba(0,0,0,0.6)] w-full max-w-full lg:max-w-[712px] break-words">
                  {typeof doctorDataWithState.experience === 'number' 
                    ? `${doctorDataWithState.experience} years+` 
                    : doctorDataWithState.experience}
                </p>
              </div>
            </div>

            {/* Available Time Slots */}
            <div className="flex flex-col gap-5 items-start w-full">
              <div className="flex flex-col gap-2.5 items-start w-full">
                <p className="font-semibold text-base text-black w-full">Available Time Slots</p>
                <div className="relative w-full">
                  {/* Left Arrow */}
                  {showLeftArrow && (
                    <button
                      onClick={() => scrollCarousel('left')}
                      className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-[rgba(0,0,0,0.1)] rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
                      aria-label="Scroll left"
                    >
                      <div className="w-5 h-5">
                        <img 
                          alt="Left Arrow" 
                          className="w-full h-full object-contain" 
                          src="/doctors-listing/aafc664ae7b6389ca0381ecdd31ef18ef9bc967d.svg" 
                        />
                      </div>
                    </button>
                  )}
                  
                  {/* Carousel Container */}
                  <div 
                    ref={carouselRef}
                    className="flex gap-3.5 items-start w-full overflow-x-auto scrollbar-hide scroll-smooth"
                    style={{ 
                      scrollbarWidth: 'none', 
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch',
                      overflowY: 'hidden'
                    }}
                  >
                    {loadingSlots ? (
                      <div className="px-4 py-2.5 text-sm text-gray-500">Loading dates...</div>
                    ) : availableDates.length > 0 ? (
                      availableDates.map((dateItem, index) => {
                        // Count total available slots for this date
                        const totalSlots = Object.values(slotsByPeriod).reduce(
                          (sum, slots) => sum + slots.length, 0
                        );
                        const isSelected = selectedDate === dateItem.date;
                        
                        return (
                          <div 
                            key={dateItem.date}
                            onClick={() => setSelectedDate(dateItem.date)}
                            className={`border flex gap-2.5 items-center justify-center px-4 py-2.5 rounded-lg flex-shrink-0 min-w-fit cursor-pointer transition-colors ${
                              isSelected ? 'border-[#4c9eff] bg-[#f0f7ff]' : 'border-[rgba(0,0,0,0.1)] hover:border-[#4c9eff]'
                            }`}
                          >
                            <div className="flex flex-col gap-0.5 items-center justify-center font-medium whitespace-nowrap">
                              <p className="text-sm text-[rgba(0,0,0,0.6)] whitespace-nowrap">{dateItem.displayDate}</p>
                              {isSelected && totalSlots > 0 && (
                                <p className="text-[#1fbd5c] text-xs whitespace-nowrap">{totalSlots} slot{totalSlots !== 1 ? 's' : ''} available</p>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="px-4 py-2.5 text-sm text-gray-500">No dates available</div>
                    )}
                  </div>

                  {/* Right Arrow */}
                  {showRightArrow && (
                    <button
                      onClick={() => scrollCarousel('right')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white border border-[rgba(0,0,0,0.1)] rounded-full p-2 shadow-md hover:bg-gray-50 transition-colors"
                      aria-label="Scroll right"
                    >
                      <div className="w-5 h-5">
                        <img 
                          alt="Right Arrow" 
                          className="w-full h-full object-contain" 
                          src="/doctors-listing/95806cb8a1c66aff36977b4d9293a431b707edcb.svg" 
                        />
                      </div>
                    </button>
                  )}
                </div>
              </div>

              {/* Time Periods */}
              <div className="flex flex-col gap-4 items-start w-full">
                <div className="flex flex-nowrap lg:flex-wrap gap-6 items-start w-full overflow-x-auto lg:overflow-x-visible time-slots-scrollbar pb-2">
                  {doctorDataWithState.timePeriods.map((period, index) => (
                    <div 
                      key={index}
                      onClick={() => setSelectedPeriod(period.label)}
                      className={`border-b flex gap-2.5 h-10 items-center justify-center px-2.5 py-0 cursor-pointer transition-colors flex-shrink-0 ${
                        selectedPeriod === period.label ? 'border-[#4c9eff]' : 'border-[rgba(0,0,0,0.1)]'
                      }`}
                    >
                      <p className={`font-medium text-sm whitespace-nowrap ${
                        selectedPeriod === period.label ? 'text-[#4c9eff] font-semibold' : 'text-[rgba(0,0,0,0.6)]'
                      }`}>
                        {period.label}({period.count})
                      </p>
                    </div>
                  ))}
                </div>
                {/* Slots Display */}
                {loadingSlots ? (
                  <div className="w-full py-4">
                    <p className="font-normal text-base text-[rgba(0,0,0,0.6)]">Loading slots...</p>
                  </div>
                ) : slotsByPeriod[selectedPeriod] && slotsByPeriod[selectedPeriod].length > 0 ? (
                  <div className="flex gap-3 items-start w-full overflow-x-auto time-slots-scrollbar pb-2 flex-wrap">
                    {slotsByPeriod[selectedPeriod].map((slot, index) => {
                      const isSelected = selectedSlot?.id === slot.id;
                      return (
                        <div 
                          key={slot.id}
                          onClick={() => handleSlotClick(slot)}
                          className={`bg-[#f7f7f7] flex gap-2.5 items-center justify-center px-3.5 py-2.5 rounded-lg flex-shrink-0 cursor-pointer transition-colors hover:bg-[#e8f4ff] ${
                            isSelected ? 'bg-[#e8f4ff] text-[#4c9eff] border border-[#4c9eff]' : 'text-[rgba(0,0,0,0.6)]'
                          }`}
                        >
                          <p className="font-medium text-sm whitespace-nowrap">
                            {formatTime(slot.startTime)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full py-4">
                    <p className="font-normal text-base text-[rgba(0,0,0,0.6)]">
                      {selectedDate ? 'No slots available for this period. Please check other periods.' : 'Please select a date to view available slots.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Office Section */}
        <div className="flex flex-col gap-5 items-start w-full mb-8">
          <p className="font-semibold text-xl text-black w-full">Office</p>
          <div className="bg-white border border-[rgba(0,0,0,0.1)] flex flex-col gap-2.5 items-center justify-center p-6 lg:p-7 rounded-2xl w-full">
            <div className="flex flex-col lg:flex-row gap-5 items-center w-full">
              <div className="h-[193px] rounded-xl w-full lg:w-[316px] relative overflow-hidden">
                <img 
                  alt="Office" 
                  className="w-full h-full object-cover rounded-xl" 
                  src="/doctors-listing/office-img.png" 
                />
              </div>
              <div className="flex flex-col gap-2.5 items-start flex-1">
                <p className="font-semibold text-lg text-black w-full">{doctorDataWithState.office.location}</p>
                <p className="font-normal text-sm text-[rgba(0,0,0,0.6)] leading-relaxed w-full lg:w-[218px] whitespace-pre-line">
                  {doctorDataWithState.office.address}
                </p>
                <p className="font-medium text-base text-[rgba(0,0,0,0.8)]">{doctorDataWithState.office.hours}</p>
                <p className="font-medium text-base text-[rgba(0,0,0,0.8)]">{doctorDataWithState.office.phone}</p>
              </div>
              <div className="relative rounded-xl w-full lg:w-[466px] h-[193px] overflow-hidden">
                <img 
                  alt="Map" 
                  className="w-full h-full object-cover rounded-xl" 
                  src={doctorDataWithState.office.mapImage} 
                />
                <div className="absolute bg-white flex gap-1 items-center justify-center px-2.5 py-0.5 rounded-md top-[155px] left-4">
                  <p className="font-medium text-xs text-[rgba(0,0,0,0.8)] whitespace-nowrap">{doctorDataWithState.office.distance}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="flex flex-col gap-5 items-start w-full mb-8">
          <div className="flex items-start justify-between w-full">
            <p className="font-semibold text-xl text-black">Review</p>
            <p className="font-normal text-base text-[rgba(0,0,0,0.6)] cursor-pointer hover:underline">See All</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 items-start justify-between w-full">
            {doctorDataWithState.reviews.map((review, index) => (
              <div key={index} className="bg-white border border-[rgba(0,0,0,0.1)] flex flex-col gap-2.5 items-start p-6 lg:p-7 rounded-2xl w-full lg:w-[534px]">
                <div className="flex flex-col gap-3.5 items-start w-full">
                  <div className="flex gap-2.5 items-center">
                    <div className="relative w-12.5 h-12.5">
                      <img 
                        alt={review.name} 
                        className="w-full h-full object-cover rounded-full" 
                        src={review.avatar} 
                      />
                    </div>
                    <div className="flex flex-col items-start w-[124px]">
                      <p className="font-semibold text-base text-black w-full">{review.name}</p>
                      <div className="flex gap-1.5 items-center w-full">
                        <div className="flex gap-0.5 items-center">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-4 h-4">
                              <img 
                                alt="Star" 
                                className="w-full h-full object-contain" 
                                src="/doctors-listing/073c8576998304b0ed35ff5f6c63c77334a7d266.svg" 
                              />
                            </div>
                          ))}
                        </div>
                        <p className="font-medium text-base text-[rgba(0,0,0,0.8)] whitespace-nowrap">{review.rating}</p>
                      </div>
                    </div>
                  </div>
                  <p className="font-normal text-base text-[rgba(0,0,0,0.6)] leading-relaxed w-full">
                    {review.comment}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </main>

        {/* Booking Confirmation Popup */}
        {showBookingPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !bookingInProgress && !bookingSuccess) {
              setShowBookingPopup(false);
              setSelectedSlot(null);
            }
          }}
        >
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            {bookingSuccess ? (
              <div className="text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-green-600">
                    <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 26C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12z" fill="currentColor"/>
                    <path d="M13 18l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  </svg>
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Booking Confirmed!</h2>
                <p className="text-base text-gray-600">
                  Your appointment has been successfully booked. A confirmation email has been sent to you.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">Confirm Appointment</h2>
                  <p className="text-base text-gray-600">Please review your appointment details</p>
                </div>

                {selectedSlot && doctorDataWithState && (
                  <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Doctor:</span>
                      <span className="text-sm font-semibold text-gray-800">{doctorDataWithState.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Specialty:</span>
                      <span className="text-sm text-gray-800">{doctorDataWithState.specialty}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Date:</span>
                      <span className="text-sm text-gray-800">
                        {selectedDate && availableDates.find(d => d.date === selectedDate)?.displayDate}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Time:</span>
                      <span className="text-sm text-gray-800">
                        {formatTime(selectedSlot.startTime)} - {formatTime(selectedSlot.endTime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Type:</span>
                      <span className="text-sm text-gray-800">Clinic Visit</span>
                    </div>
                    <div className="flex justify-between border-t pt-3">
                      <span className="text-base font-semibold text-gray-800">Fee:</span>
                      <span className="text-base font-bold text-gray-800">{doctorDataWithState.price}</span>
                    </div>
                  </div>
                )}

                {bookingError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{bookingError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      if (!bookingInProgress) {
                        setShowBookingPopup(false);
                        setSelectedSlot(null);
                        setBookingError(null);
                      }
                    }}
                    disabled={bookingInProgress}
                    className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-full font-medium hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    disabled={bookingInProgress}
                    className="flex-1 bg-gradient-to-r from-[#796bff] to-[#4c9eff] text-white py-3 rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {bookingInProgress ? 'Booking...' : 'Confirm Booking'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
    </div>
    
    {/* Marcus - The Animated Floating Sphere - Reusable Component */}
    <Marcus
      size="sm"
      message={marcusMessage}
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

export default DoctorsProfile;
