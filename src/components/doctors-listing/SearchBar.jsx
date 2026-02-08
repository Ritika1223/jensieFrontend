import React, { useState, useCallback, useRef, useEffect, memo } from 'react';
import './SearchBar.css';

const SearchBar = memo(({ onSearchChange, onFocus, onBlur }) => {
  const [searchValue, setSearchValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const debounceTimerRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search handler
  const handleSearch = useCallback((value) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (value.trim()) {
        // Cache the search
        try {
          const cached = JSON.parse(localStorage.getItem('jensei_recent_searches') || '[]');
          const updated = [value.trim(), ...cached.filter(s => s !== value.trim())].slice(0, 5);
          localStorage.setItem('jensei_recent_searches', JSON.stringify(updated));
        } catch {
          // Silently fail if localStorage is unavailable
        }
        
        // TODO: Trigger search API call here
        // This would be handled by parent component or context
        console.log('Searching for:', value.trim());
      }
    }, 400); // 400ms debounce
  }, []);

  const handleChange = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);
    handleSearch(value);
    // Notify parent component about search value change
    if (onSearchChange) {
      onSearchChange(value);
    }
  }, [handleSearch, onSearchChange]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  }, [onFocus]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  }, [onBlur]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`search-bar-wrapper ${isFocused ? 'search-bar-focused' : ''}`}>
      <div className="search-bar-inner">
        {/* Search Icon - Left side */}
        <div className="w-5 h-5 shrink-0 opacity-40">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="9" cy="9" r="6" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5"/>
            <path d="M13 13L17 17" stroke="rgba(0,0,0,0.4)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="Search doctors..."
          className="flex-1 min-w-0 bg-transparent border-none outline-none font-normal text-base text-[rgba(0,0,0,0.8)] placeholder:text-[rgba(0,0,0,0.3)]"
          aria-label="Search for doctors"
        />
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';

export default SearchBar;
