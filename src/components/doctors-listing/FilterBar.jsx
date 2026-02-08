import React, { useState, useEffect, useLayoutEffect, useRef, useCallback, useMemo, memo } from 'react';
import { createPortal } from 'react-dom';
import { API_URL } from '../../config/api.js';

// Memoized Chevron Icon
const ChevronIcon = memo(({ isOpen }) => (
  <svg 
    width="12" 
    height="24" 
    viewBox="0 0 12 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isOpen ? 'rotate-180' : ''}`}
  >
    <path d="M3 9L6 12L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));
ChevronIcon.displayName = 'ChevronIcon';

// Men Symbol Icon - Standard Mars Symbol (♂)
const MenSymbol = memo(({ className }) => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Circle */}
    <circle cx="10" cy="14" r="6" className="stroke-current" strokeWidth="2.5"/>
    {/* Arrow pointing up-right */}
    <path d="M14.5 9.5L20 4M20 4V9M20 4H15" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));
MenSymbol.displayName = 'MenSymbol';

// Women Symbol Icon - Standard Venus Symbol (♀)
const WomenSymbol = memo(({ className }) => (
  <svg 
    width="14" 
    height="14" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Circle */}
    <circle cx="12" cy="9" r="6" className="stroke-current" strokeWidth="2.5"/>
    {/* Cross below */}
    <path d="M12 15V22M9 19H15" className="stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
));
WomenSymbol.displayName = 'WomenSymbol';

// Premium Tri-State Gender Toggle - Symmetrical Design
const GenderToggle = memo(({ value, onChange }) => {
  const options = ['All', 'Male', 'Female'];
  const currentIndex = value === null || value === 'All' ? 0 : value === 'Male' ? 1 : 2;
  
  // Fixed widths for symmetry: All (text) is wider, icons are equal
  const buttonWidths = [38, 34, 34]; // All, Male icon, Female icon
  const totalWidth = buttonWidths.reduce((a, b) => a + b, 0) + 4; // +4 for padding
  
  const handleClick = useCallback((option) => {
    const newValue = option === 'All' ? null : option;
    onChange(newValue);
  }, [onChange]);

  // Calculate indicator position based on fixed widths
  const getIndicatorLeft = () => {
    let left = 2; // Initial padding
    for (let i = 0; i < currentIndex; i++) {
      left += buttonWidths[i];
    }
    return left;
  };

  return (
    <div 
      className="relative flex items-center bg-[#f0f0f0] rounded-full p-0.5" 
      style={{ width: `${totalWidth}px`, height: '34px' }}
    >
      {/* Sliding indicator */}
      <div
        className="absolute top-0.5 bottom-0.5 bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08)] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{
          left: `${getIndicatorLeft()}px`,
          width: `${buttonWidths[currentIndex]}px`,
          willChange: 'left, width'
        }}
      />
      
      {/* Option buttons - fixed widths for symmetry */}
      {options.map((option, index) => {
        const isSelected = index === currentIndex;
        
        return (
          <button
            key={option}
            type="button"
            onClick={() => handleClick(option)}
            className={`relative z-10 h-full text-xs font-medium transition-colors duration-200 ease-out rounded-full flex items-center justify-center ${
              isSelected
                ? 'text-[rgba(0,0,0,0.9)]'
                : 'text-[rgba(0,0,0,0.5)] hover:text-[rgba(0,0,0,0.7)]'
            }`}
            style={{ width: `${buttonWidths[index]}px` }}
            aria-label={`Filter by ${option}`}
            aria-pressed={isSelected}
          >
            {option === 'Male' ? <MenSymbol /> : option === 'Female' ? <WomenSymbol /> : option}
          </button>
        );
      })}
    </div>
  );
});
GenderToggle.displayName = 'GenderToggle';

// Premium Experience Slider - Optimized for low-speed internet
const ExperienceSlider = memo(({ value, onChange }) => {
  const [localValue, setLocalValue] = useState(() => 
    value === null || value === undefined ? 0 : value
  );
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Sync with prop value
  useEffect(() => {
    const propValue = value === null || value === undefined ? 0 : value;
    if (localValue !== propValue) setLocalValue(propValue);
  }, [value, localValue]);

  const handleChange = useCallback((e) => {
    const newValue = parseInt(e.target.value, 10);
    setLocalValue(newValue);
    onChange(newValue === 0 ? null : newValue);
  }, [onChange]);

  const handleClear = useCallback((e) => {
    e.stopPropagation();
    setLocalValue(0);
    onChange(null);
  }, [onChange]);

  const displayValue = localValue === 0 ? 'All' : `${localValue}+`;
  const hasValue = localValue > 0;
  const percentage = (localValue / 30) * 100;
  const isActive = isHovered || isDragging;

  return (
    <div className="relative flex flex-col" style={{ minWidth: '120px' }}>
      {/* Top row: Star icon, label, value, and clear button */}
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          {/* Experience Star Icon */}
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0">
            <path 
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
              stroke={hasValue ? '#796bff' : 'rgba(0,0,0,0.4)'} 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              fill={hasValue ? '#796bff' : 'none'}
            />
          </svg>
          <span className="text-xs font-medium text-[rgba(0,0,0,0.6)]">Exp</span>
        </div>
        
        {/* Value and Clear */}
        <div className="flex items-center gap-1">
          <span className={`text-xs font-semibold tabular-nums ${hasValue ? 'text-[#796bff]' : 'text-[rgba(0,0,0,0.5)]'}`}>
            {displayValue}
          </span>
          {hasValue && (
            <>
              <span className="text-[10px] text-[rgba(0,0,0,0.4)]">yrs</span>
              <button
                type="button"
                onClick={handleClear}
                className="w-3.5 h-3.5 flex items-center justify-center rounded-full bg-[rgba(121,107,255,0.1)] hover:bg-[rgba(121,107,255,0.2)] text-[#796bff] transition-colors duration-150"
                aria-label="Clear"
              >
                <svg width="7" height="7" viewBox="0 0 8 8" fill="none">
                  <path d="M6 2L2 6M2 2L6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Slider Container - extra height for knob */}
      <div 
        className="relative w-full flex items-center" 
        style={{ height: '20px' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Track */}
        <div className="absolute left-0 right-0 h-2 bg-[#e5e7eb] rounded-full">
          {/* Progress Fill */}
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-[#796bff] to-[#6366f1] rounded-full"
            style={{ 
              width: `${percentage}%`,
              willChange: 'width',
              transition: 'width 80ms ease-out'
            }}
          />
        </div>
        
        {/* Knob/Thumb - grows on hover/drag */}
        <div 
          className="absolute bg-white rounded-full border-2 border-[#796bff]"
          style={{ 
            width: isActive ? '20px' : '16px',
            height: isActive ? '20px' : '16px',
            left: `calc(${percentage}% - ${isActive ? 10 : 8}px)`,
            top: '50%',
            transform: 'translateY(-50%)',
            willChange: 'left, width, height, box-shadow',
            transition: 'left 80ms ease-out, width 150ms ease-out, height 150ms ease-out, box-shadow 150ms ease-out',
            boxShadow: isActive 
              ? '0 4px 12px rgba(121,107,255,0.5), 0 0 0 4px rgba(121,107,255,0.15)' 
              : '0 2px 6px rgba(121,107,255,0.35)',
            pointerEvents: 'none',
            zIndex: 2
          }}
        />
        
        {/* Native Range Input - invisible but functional */}
        <input
          type="range"
          min="0"
          max="30"
          step="1"
          value={localValue}
          onChange={handleChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          onTouchStart={() => setIsDragging(true)}
          onTouchEnd={() => setIsDragging(false)}
          className="absolute inset-0 w-full opacity-0 cursor-pointer z-10"
          style={{ height: '24px', marginTop: '-4px' }}
          aria-label="Experience filter"
          aria-valuemin={0}
          aria-valuemax={30}
          aria-valuenow={localValue}
          aria-valuetext={localValue === 0 ? 'All' : `${localValue}+ years`}
        />
      </div>
    </div>
  );
});
ExperienceSlider.displayName = 'ExperienceSlider';

const FilterBar = ({ filters: filtersProp, onFiltersChange }) => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [openDropdown, setOpenDropdown] = useState(null);
  // Initialize selectedValues from props, with fallback to default
  const [selectedValues, setSelectedValues] = useState(() => 
    filtersProp || {
    specialist: null,
    location: null,
    experience: null,
    gender: null
    }
  );
  const [sortBy, setSortBy] = useState('Relevance');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [dropdownOptions, setDropdownOptions] = useState({
    specialist: [],
    location: [],
    experience: [],
    gender: []
  });
  const [loadingFilters, setLoadingFilters] = useState(true);
  const [errorFilters, setErrorFilters] = useState(false);
  const dropdownRefs = useRef({});
  const dropdownElementRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const fetchTimeoutRef = useRef(null);
  // Refs to store current values for event handlers to avoid memory leaks
  const selectedValuesRef = useRef(selectedValues);
  const openDropdownRef = useRef(openDropdown);
  // Ref to track if we're syncing from props to avoid triggering onChange unnecessarily
  const isSyncingFromPropsRef = useRef(false);

  // Renamed from 'filters' to 'filterDefinitions' to avoid shadowing the prop
  const filterDefinitions = useMemo(() => [
    { id: 'all', label: 'All', isActive: true },
    { id: 'specialist', label: 'Specialist' },
    { id: 'location', label: 'Location' },
    { id: 'experience', label: 'Experience' },
    { id: 'gender', label: 'Gender' }
  ], []);

  // Fetch filter values from API with timeout for slow connections
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        setLoadingFilters(true);
        setErrorFilters(false);
        
        // Create AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        fetchTimeoutRef.current = timeoutId;
        
        const response = await fetch(`${API_URL}/api/filters`, {
          credentials: 'include',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error('Failed to fetch filters');
        }
        
        const data = await response.json();
        if (data.success && data.data) {
          setDropdownOptions({
            specialist: data.data.specialist || [],
            location: data.data.location || [],
            experience: data.data.experience || [],
            gender: data.data.gender || []
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        if (error.name === 'AbortError') {
          console.warn('Filter fetch timeout - using fallback');
        } else {
        console.error('Error fetching filters:', error);
        }
        setErrorFilters(true);
        // Fallback to empty arrays if API fails - component still works
        setDropdownOptions({
          specialist: [],
          location: [],
          experience: [],
          gender: []
        });
      } finally {
        setLoadingFilters(false);
      }
    };

    fetchFilters();

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  // Sync selectedValues with filters prop when it changes (only if different to prevent loops)
  useEffect(() => {
    if (filtersProp) {
      // Only update if the prop is actually different from current state
      const hasChanges = Object.keys(filtersProp).some(
        key => filtersProp[key] !== selectedValues[key]
      );
      if (hasChanges) {
        isSyncingFromPropsRef.current = true;
        setSelectedValues(filtersProp);
      }
    }
  }, [filtersProp, selectedValues]);

  // Notify parent when selectedValues changes (but not when syncing from props)
  useEffect(() => {
    // Skip if we're syncing from props or if values match the prop (to prevent loops)
    if (onFiltersChange && !isSyncingFromPropsRef.current) {
      // Check if values differ from prop to avoid unnecessary calls
      if (!filtersProp || Object.keys(selectedValues).some(
        key => selectedValues[key] !== filtersProp[key]
      )) {
        onFiltersChange(selectedValues);
      }
    }
    // Reset sync flag after effect runs
    if (isSyncingFromPropsRef.current) {
      isSyncingFromPropsRef.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedValues]); // Only depend on selectedValues, not onFiltersChange to avoid re-running

  // Update refs when values change to keep them in sync
  // Use useLayoutEffect to ensure refs are updated before other effects run
  useLayoutEffect(() => {
    selectedValuesRef.current = selectedValues;
  }, [selectedValues]);

  useLayoutEffect(() => {
    openDropdownRef.current = openDropdown;
  }, [openDropdown]);

  // Memoized event handlers with stable references to prevent memory leaks
  const handleClickOutside = useCallback((event) => {
    const currentOpenDropdown = openDropdownRef.current;
    if (currentOpenDropdown && dropdownRefs.current[currentOpenDropdown]) {
      const buttonElement = dropdownRefs.current[currentOpenDropdown];
      const dropdownElement = dropdownElementRef.current;
      
      if (
        !buttonElement.contains(event.target) &&
        (!dropdownElement || !dropdownElement.contains(event.target))
      ) {
          // Reset active filter if no value is selected
        if (!selectedValuesRef.current[currentOpenDropdown]) {
            setActiveFilter('all');
          }
          setOpenDropdown(null);
        }
      }
    
    // Close sort popover if clicking outside
    if (isSortOpen && sortRef.current && sortPopoverRef.current) {
      if (
        !sortRef.current.contains(event.target) &&
        !sortPopoverRef.current.contains(event.target)
      ) {
        setIsSortOpen(false);
      }
    }
  }, [isSortOpen]); // Include isSortOpen to access current value

  const handleScroll = useCallback((event) => {
    const currentOpenDropdown = openDropdownRef.current;
    if (currentOpenDropdown) {
        const target = event.target;
        if (dropdownElementRef.current && dropdownElementRef.current.contains(target)) {
        return; // Scroll is inside dropdown, don't close
        }
        // Scroll is on the page, close the dropdown
      if (!selectedValuesRef.current[currentOpenDropdown]) {
          setActiveFilter('all');
        }
        setOpenDropdown(null);
    }
  }, []); // Empty deps - uses refs for current values

  // Close dropdown when clicking outside
  useEffect(() => {
    if (openDropdown || isSortOpen) {
      // Use setTimeout to avoid immediate closure
      const timeoutId = setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [openDropdown, isSortOpen, handleClickOutside]);

  // Close dropdown when page is scrolled (but not when scrolling inside dropdown)
  useEffect(() => {
    if (openDropdown) {
      window.addEventListener('scroll', handleScroll, true);
      document.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('scroll', handleScroll, true);
    };
  }, [openDropdown, handleScroll]);

  const handleFilterClick = useCallback((filterId, e) => {
    e?.stopPropagation();
    if (filterId === 'all') {
      setActiveFilter('all');
      setOpenDropdown(null);
    } else if (['specialist', 'location'].includes(filterId)) {
      // Gender and Experience are now toggles/sliders, not dropdowns
      const isOpening = openDropdown !== filterId;
      if (isOpening && dropdownRefs.current[filterId]) {
        const rect = dropdownRefs.current[filterId].getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8,
          left: rect.left,
          width: rect.width
        });
        setActiveFilter(filterId);
      } else {
        // Closing dropdown - reset active filter if no value is selected
        if (!selectedValues[filterId]) {
          setActiveFilter('all');
        }
      }
      setOpenDropdown(isOpening ? filterId : null);
    } else {
      setActiveFilter(filterId);
      setOpenDropdown(null);
    }
  }, [openDropdown, selectedValues]);

  const handleOptionSelect = useCallback((filterId, option) => {
    setSelectedValues(prev => ({
      ...prev,
      [filterId]: option
    }));
    setOpenDropdown(null);
    dropdownElementRef.current = null;
  }, []);

  const handleGenderChange = useCallback((value) => {
    // Optimistic UI update - instant response
    setSelectedValues(prev => ({
      ...prev,
      gender: value
    }));
    // Close any open dropdowns
    if (openDropdown === 'gender') {
      setOpenDropdown(null);
    }
  }, [openDropdown]);

  const handleExperienceChange = useCallback((value) => {
    // Optimistic UI update - instant response
    setSelectedValues(prev => ({
      ...prev,
      experience: value
    }));
    // Close any open dropdowns
    if (openDropdown === 'experience') {
      setOpenDropdown(null);
    }
  }, [openDropdown]);

  const sortOptions = useMemo(() => [
    'Relevance',
    'Rating',
    'Distance',
    'Price: Low to High',
    'Price: High to Low',
    'Experience'
  ], []);

  const handleSortSelect = useCallback((option) => {
    // Optimistic UI update - instant response
    setSortBy(option);
    setIsSortOpen(false);
    // TODO: Trigger sort API call here
    // This would be handled by parent component or context
  }, []);

  const sortRef = useRef(null);
  const sortPopoverRef = useRef(null);

  const getButtonClasses = useCallback((filter) => {
    const isActive = (activeFilter === filter.id && openDropdown === filter.id) || 
                     (filter.isActive && activeFilter === 'all') || 
                     selectedValues[filter.id];
    
    const isLocation = filter.id === 'location';
    const isSpecialist = filter.id === 'specialist';
    
    if (isLocation || isSpecialist) {
      // Premium pill format for Location and Specialist buttons - matching GenderToggle height (34px)
      const baseClasses = `flex items-center gap-1.5 justify-center px-3 py-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`;
      return `${baseClasses} rounded-full text-xs font-medium ${
        isActive
          ? 'bg-gradient-to-r from-[#796bff] to-[#6366f1] text-white shadow-[0_4px_12px_rgba(121,107,255,0.3)] hover:shadow-[0_6px_16px_rgba(121,107,255,0.4)]'
          : 'bg-white text-[rgba(0,0,0,0.8)] border border-[rgba(0,0,0,0.08)] hover:border-[rgba(121,107,255,0.3)] hover:text-[#796bff] hover:bg-gradient-to-r hover:from-[rgba(121,107,255,0.05)] hover:to-[rgba(99,102,241,0.05)] shadow-sm hover:shadow-md'
      }`;
    }
    
    const baseClasses = `flex items-center gap-2 h-10 justify-center px-4 py-2 whitespace-nowrap flex-shrink-0 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]`;
    return `${baseClasses} ${
      isActive
        ? 'sm:border-b-2 sm:border-[#796bff] text-[#4c9eff] text-base font-medium'
        : 'text-base text-[rgba(0,0,0,0.8)] hover:bg-[rgba(0,0,0,0.05)] hover:text-[rgba(0,0,0,0.9)]'
    }`;
  }, [activeFilter, openDropdown, selectedValues]);

  return (
    <div className="relative flex flex-row items-center justify-start sm:justify-between gap-3 w-full overflow-x-auto filter-scrollbar">
      {filterDefinitions.map((filter) => {
        // Render gender toggle instead of dropdown button
        if (filter.id === 'gender') {
          return (
            <div key={filter.id} className="relative flex-shrink-0">
              <GenderToggle
                value={selectedValues.gender}
                onChange={handleGenderChange}
              />
            </div>
          );
        }
        
        // Render experience slider instead of dropdown button
        if (filter.id === 'experience') {
          return (
            <div key={filter.id} className="relative flex-shrink-0">
              <ExperienceSlider
                value={selectedValues.experience}
                onChange={handleExperienceChange}
              />
            </div>
          );
        }
        
        // Render other filters as dropdown buttons
        return (
        <div 
          key={filter.id} 
          className="relative flex-shrink-0" 
          ref={(el) => {
            if (el) {
              dropdownRefs.current[filter.id] = el;
            }
          }}
        >
          <button
            onClick={(e) => handleFilterClick(filter.id, e)}
              className={getButtonClasses(filter)}
              style={(filter.id === 'location' || filter.id === 'specialist') ? { height: '34px' } : undefined}
              aria-label={`Filter by ${filter.label}`}
              aria-expanded={openDropdown === filter.id}
          >
            {filter.id === 'location' && (
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                {/* Classic map pin - clean and recognizable */}
                <path 
                  d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  fill="none"
                />
                {/* Center dot */}
                <circle 
                  cx="12" 
                  cy="9" 
                  r="2.5" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            )}
            {filter.id === 'specialist' && (
              <svg 
                width="12" 
                height="12" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="flex-shrink-0"
              >
                <circle 
                  cx="12" 
                  cy="8" 
                  r="4" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                />
                <path 
                  d="M6 21C6 17 9 14 12 14C15 14 18 17 18 21" 
                  stroke="currentColor" 
                  strokeWidth="1.5" 
                  strokeLinecap="round"
                />
              </svg>
            )}
            <span>{selectedValues[filter.id] || filter.label}</span>
            {filter.id !== 'all' && (
              <div className="w-3 h-3 flex items-center">
                  <ChevronIcon isOpen={openDropdown === filter.id} />
              </div>
            )}
          </button>
          
          {/* Dropdown - Using Portal to avoid overflow clipping */}
            {openDropdown === filter.id && typeof document !== 'undefined' && createPortal(
            <div 
              ref={dropdownElementRef}
                className="fixed bg-white border border-[rgba(0,0,0,0.1)] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] z-[100] min-w-[180px] max-h-[200px] overflow-y-auto dropdown-scrollbar animate-[fadeIn_200ms_ease-out]"
              style={{ 
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                width: `${Math.max(dropdownPosition.width, 180)}px`
              }}
            >
              {loadingFilters ? (
                  <div className="px-4 py-3 text-sm text-[rgba(0,0,0,0.6)] flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-[#796bff] border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : errorFilters ? (
                <div className="px-4 py-2.5 text-sm text-[rgba(0,0,0,0.6)]">
                    Unable to load options
                </div>
              ) : dropdownOptions[filter.id].length === 0 ? (
                <div className="px-4 py-2.5 text-sm text-[rgba(0,0,0,0.6)]">
                  No options available
                </div>
              ) : (
                dropdownOptions[filter.id].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptionSelect(filter.id, option);
                    }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-all duration-200 ease-out hover:bg-[rgba(121,107,255,0.08)] ${
                        selectedValues[filter.id] === option 
                          ? 'bg-[rgba(121,107,255,0.1)] text-[#4c9eff] font-medium' 
                          : 'text-[rgba(0,0,0,0.8)] hover:text-[rgba(0,0,0,0.9)]'
                      }`}
                  >
                    {option}
                  </button>
                ))
              )}
            </div>,
            document.body
          )}
        </div>
        );
      })}
      {/* Premium Inline Sort Control */}
      <div 
        ref={sortRef}
        className="relative flex-shrink-0 sm:ml-6"
      >
        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="flex items-center gap-1.5 px-2 py-1.5 text-sm text-[rgba(0,0,0,0.7)] hover:text-[rgba(0,0,0,0.9)] transition-colors duration-200 ease-out rounded-md hover:bg-[rgba(0,0,0,0.03)]"
          aria-label="Sort options"
          aria-expanded={isSortOpen}
        >
          <span className="text-[rgba(0,0,0,0.5)]">Sort:</span>
          <span className="font-medium">{sortBy}</span>
          <div className="w-3 h-3 flex items-center justify-center">
            <ChevronIcon isOpen={isSortOpen} />
          </div>
        </button>

        {/* Compact Sort Popover */}
        {isSortOpen && typeof document !== 'undefined' && createPortal(
          <div 
            ref={sortPopoverRef}
            className="fixed bg-white border border-[rgba(0,0,0,0.08)] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.12)] z-[100] min-w-[180px] max-w-[220px] py-1.5 animate-[fadeIn_150ms_ease-out]"
            style={{
              top: sortRef.current ? `${sortRef.current.getBoundingClientRect().bottom + 6}px` : '0',
              left: sortRef.current ? `${sortRef.current.getBoundingClientRect().left}px` : '0'
            }}
          >
            {sortOptions.map((option) => (
      <button
                key={option}
                type="button"
                onClick={() => handleSortSelect(option)}
                className={`w-full text-left px-3 py-2 text-sm transition-colors duration-150 ease-out ${
                  sortBy === option
                    ? 'bg-[rgba(121,107,255,0.08)] text-[#796bff] font-medium'
                    : 'text-[rgba(0,0,0,0.8)] hover:bg-[rgba(0,0,0,0.04)] hover:text-[rgba(0,0,0,0.9)]'
                }`}
              >
                {option}
      </button>
            ))}
          </div>,
          document.body
        )}
      </div>
    </div>
  );
};

export default memo(FilterBar);