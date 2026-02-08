import React, { memo, useMemo, useEffect, useState, useRef } from 'react';
import '../styles/marcus.css';

/**
 * Marcus - Optimized reusable animated floating sphere
 * Premium entry animation, dynamic sizing, exact visual match
 * 
 * @param {Object} props
 * @param {string} props.size - 'sm' | 'sm2' | 'sm3' | 'md' | 'md2' | 'md3' | 'lg' | 'lg2' | 'lg3' | 'responsive' (default: 'sm' for doctors pages, 'md' for chat)
 * @param {boolean} props.isSearching - Is search bar active (moves Marcus near search)
 * @param {Object} props.searchBarPosition - Position of search bar { top, left, width, height }
 * @param {string} props.message - Message to display
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles (position overrides)
 * @param {Function} props.onClick - Click handler
 */
const Marcus = memo(({
  size = 'sm',
  isSearching = false,
  searchBarPosition = { top: 0, left: 0, width: 0, height: 0 },
  message = '',
  className = '',
  style = {},
  onClick,
}) => {
  // Check for reduced motion preference using CSS media query
  const [shouldReduceAnimations, setShouldReduceAnimations] = useState(() => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleChange = (e) => setShouldReduceAnimations(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const [isVisible, setIsVisible] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [fadeScale, setFadeScale] = useState(1);
  const [isWiggling, setIsWiggling] = useState(false);
  const previousPositionRef = useRef(null);
  const fadeTimerRef = useRef(null);
  const marcusContainerRef = useRef(null);
  const wiggleTimerRef = useRef(null);
  const [messagePosition, setMessagePosition] = useState('top'); // 'top' or 'left'
  
  // Calculate position first (needed for displayPosition initialization)
  const position = useMemo(() => {
    // Check if searchBarPosition has valid values (not just initial {0,0,0,0})
    const hasValidSearchPosition = isSearching && 
                                   searchBarPosition && 
                                   searchBarPosition.left > 0 && 
                                   searchBarPosition.top >= 0 &&
                                   searchBarPosition.width > 0 &&
                                   searchBarPosition.height > 0;
    
    if (hasValidSearchPosition) {
      const sphereHalf = size === 'sm' ? 28 : size === 'sm2' ? 32 : size === 'sm3' ? 36 :
                         size === 'md' ? 40 : size === 'md2' ? 48 : size === 'md3' ? 56 :
                         size === 'lg' ? 60 : size === 'lg2' ? 70 : size === 'lg3' ? 80 : 28;
      return {
        top: `${searchBarPosition.top + (searchBarPosition.height / 2) - sphereHalf}px`,
        left: `${searchBarPosition.left - 70}px`,
      };
    }
    if (size === 'sm' || size === 'sm2' || size === 'sm3') {
      const sphereSize = size === 'sm' ? 56 : size === 'sm2' ? 64 : 72;
      return {
        top: `calc(100vh - 32px - ${sphereSize}px)`,
        left: `calc(100vw - 32px - ${sphereSize}px)`,
      };
    }
    const sphereSize = size === 'md' ? 80 : size === 'md2' ? 96 : size === 'md3' ? 112 :
                       size === 'lg' ? 120 : size === 'lg2' ? 140 : size === 'lg3' ? 160 : 80;
    return {
      top: `calc(100vh - 32px - ${sphereSize}px)`,
      left: `calc(100vw - 32px - ${sphereSize}px)`,
    };
  }, [isSearching, searchBarPosition, size]);
  
  // Display position state - maintains old position during fade out
  const [displayPosition, setDisplayPosition] = useState(position);

  // Premium entry animation - triggers immediately (no lazy loading)
  useEffect(() => {
    // Small delay for premium feel, but immediate (not lazy)
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Get size class - dynamic sizing
  const sizeClass = useMemo(() => {
    const sizeMap = {
      sm: 'marcus-size-sm',
      sm2: 'marcus-size-sm2',
      sm3: 'marcus-size-sm3',
      md: 'marcus-size-md',
      md2: 'marcus-size-md2',
      md3: 'marcus-size-md3',
      lg: 'marcus-size-lg',
      lg2: 'marcus-size-lg2',
      lg3: 'marcus-size-lg3',
      responsive: 'marcus-size-responsive',
    };
    return sizeMap[size] || sizeMap.sm;
  }, [size]);

  // Ref to track if we're currently fading (prevent displayPosition updates during fade)
  const isFadingRef = useRef(false);

  // Show message after Marcus appears (with delay and auto-hide)
  useEffect(() => {
    if (isVisible && message) {
      // Hide message first
      setMessageVisible(false);
      
      let messageTimer;
      let autoHideTimer;
      
      // Show message after Marcus is fully visible
      messageTimer = setTimeout(() => {
        setMessageVisible(true);
        
        // Auto-hide message after 25 seconds for comfortable reading
        autoHideTimer = setTimeout(() => {
          setMessageVisible(false);
        }, 25000); // 25 seconds - ultra-premium long display time
      }, 400); // Delay message appearance after Marcus appears
      
      return () => {
        if (messageTimer) clearTimeout(messageTimer);
        if (autoHideTimer) clearTimeout(autoHideTimer);
      };
    } else {
      setMessageVisible(false);
    }
  }, [isVisible, message]);

  // Calculate available space and determine message position dynamically
  useEffect(() => {
    if (!marcusContainerRef.current || !messageVisible) return;

    const calculatePosition = () => {
      const container = marcusContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();

      // Calculate available space above and to the left
      const spaceAbove = rect.top;
      const spaceLeft = rect.left;

      // Minimum space needed for message bubble (approximately 120px width, 60px height)
      const minSpaceNeeded = 120;
      const minHeightNeeded = 60;

      // Determine position based on available space
      // Prefer top if there's enough space, otherwise use left
      if (spaceAbove >= minHeightNeeded + 10) {
        setMessagePosition('top');
      } else if (spaceLeft >= minSpaceNeeded + 10) {
        setMessagePosition('left');
      } else {
        // Fallback: use whichever has more space
        setMessagePosition(spaceAbove > spaceLeft ? 'top' : 'left');
      }
    };

    // Calculate on mount and when position changes
    calculatePosition();

    // Recalculate on window resize and scroll
    window.addEventListener('resize', calculatePosition);
    window.addEventListener('scroll', calculatePosition, true);

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [messageVisible, displayPosition, isVisible]);

  // Message position class - dynamic based on available space
  const messagePositionClass = useMemo(() => {
    if (messagePosition === 'top') {
      return 'bottom-full mb-2 left-1/2 -translate-x-1/2';
    } else {
      return 'right-full mr-2 top-1/2 -translate-y-1/2';
    }
  }, [messagePosition]);

  // Speech bubble tail styles - dynamic based on position
  const tailStyles = useMemo(() => {
    if (messagePosition === 'top') {
      // Tail pointing down to Marcus
      return {
        position: 'absolute',
        bottom: '-6px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 0,
        height: 0,
        borderLeft: '6px solid transparent',
        borderRight: '6px solid transparent',
        borderTop: '6px solid rgba(255, 255, 255, 0.95)',
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
      };
    } else {
      // Tail pointing right to Marcus
      return {
        position: 'absolute',
        right: '-6px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: 0,
        height: 0,
        borderTop: '6px solid transparent',
        borderBottom: '6px solid transparent',
        borderLeft: '6px solid rgba(255, 255, 255, 0.95)',
        filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
      };
    }
  }, [messagePosition]);

  // Calculate orb sizes based on sphere size - maintains proportions
  const orbSizes = useMemo(() => {
    // Small sizes
    if (size === 'sm') return { orb1: '14px', orb2: '12px', orb3: '10px', highlight1: '10px', highlight2: '5px' };
    if (size === 'sm2') return { orb1: '16px', orb2: '14px', orb3: '12px', highlight1: '12px', highlight2: '6px' };
    if (size === 'sm3') return { orb1: '18px', orb2: '16px', orb3: '14px', highlight1: '14px', highlight2: '7px' };
    
    // Medium sizes
    if (size === 'md') return { orb1: '20px', orb2: '17px', orb3: '14px', highlight1: '14px', highlight2: '7px' };
    if (size === 'md2') return { orb1: '24px', orb2: '20px', orb3: '17px', highlight1: '17px', highlight2: '8.5px' };
    if (size === 'md3') return { orb1: '28px', orb2: '24px', orb3: '20px', highlight1: '20px', highlight2: '10px' };
    
    // Large sizes
    if (size === 'lg') return { orb1: '30px', orb2: '26px', orb3: '22px', highlight1: '22px', highlight2: '11px' };
    if (size === 'lg2') return { orb1: '35px', orb2: '30px', orb3: '26px', highlight1: '26px', highlight2: '13px' };
    if (size === 'lg3') return { orb1: '40px', orb2: '35px', orb3: '30px', highlight1: '30px', highlight2: '15px' };
    
    // responsive uses sm as base
    return { orb1: '14px', orb2: '12px', orb3: '10px', highlight1: '10px', highlight2: '5px' };
  }, [size]);

  // Calculate orb positions - scales proportionally (percentages stay the same)
  const orbPositions = useMemo(() => {
    return {
      orb1: { top: '25%', left: '20%' },
      orb2: { top: '55%', left: '60%' },
      orb3: { top: '65%', left: '25%' },
      highlight1: { top: '15%', left: '20%' },
      highlight2: { top: '28%', left: '35%' },
    };
  }, []);

  // Track position changes and trigger fade animation
  useEffect(() => {
    const currentPosition = JSON.stringify({
      top: position.top,
      left: position.left,
      isSearching,
      searchLeft: searchBarPosition?.left || 0,
      searchTop: searchBarPosition?.top || 0,
    });

    // Initial mount - just set the position
    if (previousPositionRef.current === null) {
      previousPositionRef.current = currentPosition;
      setDisplayPosition(position);
      return;
    }

    // Position changed - trigger fade animation
    if (previousPositionRef.current !== currentPosition) {
      // Clear any existing fade timer
      if (fadeTimerRef.current) {
        clearTimeout(fadeTimerRef.current);
      }

      // CRITICAL: Store the OLD displayPosition before starting fade
      // Keep displayPosition at OLD position during fade out, only change opacity
      isFadingRef.current = true;
      setIsFading(true);
      setFadeScale(0.86); // Set scale for fade out
      setMessageVisible(false);
      setIsVisible(false);
      // DON'T update previousPositionRef yet - we'll update it after fade completes

      // After fade out completes, update position and fade in
      fadeTimerRef.current = setTimeout(() => {
        // Now update displayPosition to NEW position (position useMemo already has new values)
        setDisplayPosition(position);
        // Update previousPositionRef to prevent re-triggering
        previousPositionRef.current = currentPosition;
        
        // Ultra-premium timing: Strategic pause before fade in for maximum elegance
        // This creates a moment of anticipation before the elegant entrance
        setTimeout(() => {
          // Start fade in from 0.95 scale for bounce effect
          setFadeScale(0.95);
          setIsVisible(true);
          
          // After a tiny delay, animate to 1.0 with slight overshoot effect
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              setFadeScale(1.05); // Slight overshoot for bounce
              setTimeout(() => {
                setFadeScale(1.0); // Settle to final size
              }, 300);
            });
          });
          
          // Reset fading flags after fade in completes (longer duration for ultra-smooth entrance)
          setTimeout(() => {
            isFadingRef.current = false;
            setIsFading(false);
            setFadeScale(1); // Reset to normal scale
            fadeTimerRef.current = null;
          }, 600); // Match fade in duration (600ms for ultra-smooth entrance with bounce)
        }, 100); // Strategic delay for premium feel - creates anticipation and elegance
      }, 450); // Match fade out duration (450ms for elegant, smooth exit)

      return () => {
        if (fadeTimerRef.current) {
          clearTimeout(fadeTimerRef.current);
          fadeTimerRef.current = null;
        }
      };
    }
  }, [position.top, position.left, isSearching, searchBarPosition?.left, searchBarPosition?.top, position]);

  // Cleanup wiggle timer on unmount
  useEffect(() => {
    return () => {
      if (wiggleTimerRef.current) {
        clearTimeout(wiggleTimerRef.current);
      }
    };
  }, []);

  // If style prop has bottom/right/top/left or position, use it exclusively (avoid conflicts with calculated position)
  const finalPosition = useMemo(() => {
    // Ultra-premium fade transforms and effects - only apply during fade
    let fadeBlur = undefined;
    let fadeShadow = undefined;
    let fadeRotation = undefined;
    
    if (isFading) {
      if (isVisible) {
        // Fade IN: Elegant entrance with bounce effect (uses fadeScale state)
        fadeBlur = fadeScale < 1 ? 2 : 0; // Blur during scale up
        fadeShadow = fadeScale < 1.05 ? '0 0 30px rgba(102, 126, 234, 0.3)' : '0 0 0 rgba(102, 126, 234, 0)';
        fadeRotation = 0;
      } else {
        // Fade OUT: Smooth exit with scale, blur, and shadow fade
        fadeBlur = 5; // Increased blur for ethereal, dreamy effect
        fadeShadow = '0 0 25px rgba(102, 126, 234, 0.5), 0 0 50px rgba(118, 75, 162, 0.3)';
        fadeRotation = -3; // Subtle rotation for extra depth and motion
      }
    }
    
    // Build style object
    const baseStyle = {
      ...displayPosition,
      opacity: isVisible ? 1 : 0,
      ...style,
    };
    
    // Only add premium effects during fade to avoid conflicts with CSS animations
    if (isFading) {
      // Build transform with scale and subtle rotation using fadeScale state
      const transforms = [];
      const scaleToUse = isVisible ? fadeScale : 0.86;
      
      transforms.push(`scale(${scaleToUse})`);
      
      if (fadeRotation !== undefined && fadeRotation !== 0 && !isVisible) {
        transforms.push(`rotate(${fadeRotation}deg)`);
      }
      
      if (transforms.length > 0) {
        baseStyle.transform = transforms.join(' ');
      }
      
      // Add blur filter
      if (fadeBlur !== undefined) {
        baseStyle.filter = fadeBlur > 0 ? `blur(${fadeBlur}px)` : 'none';
      }
      
      // Add premium shadow/glow effect
      if (isVisible) {
        // Fade IN: Dynamic glow based on scale
        baseStyle.boxShadow = fadeShadow || '0 0 30px rgba(102, 126, 234, 0.3)';
      } else if (fadeShadow !== undefined) {
        // Fade OUT: Stronger glow effect
        baseStyle.boxShadow = fadeShadow;
      }
      
      // Ultra-premium staggered transitions for ultra-smooth feel
      // Different easing for fade in (elastic) vs fade out (smooth deceleration)
      if (isVisible) {
        // Fade IN: Elegant entrance with slight bounce
        baseStyle.transition = 
          'opacity 500ms cubic-bezier(0.34, 1.56, 0.64, 1), ' +
          'transform 500ms cubic-bezier(0.34, 1.56, 0.64, 1), ' +
          'filter 450ms cubic-bezier(0.16, 1, 0.3, 1), ' +
          'box-shadow 500ms cubic-bezier(0.34, 1.56, 0.64, 1)';
      } else {
        // Fade OUT: Smooth, elegant exit
        baseStyle.transition = 
          'opacity 450ms cubic-bezier(0.32, 0, 0.67, 0), ' +
          'transform 500ms cubic-bezier(0.32, 0, 0.67, 0), ' +
          'filter 400ms cubic-bezier(0.32, 0, 0.67, 0), ' +
          'box-shadow 450ms cubic-bezier(0.32, 0, 0.67, 0)';
      }
    }
    
    // If style provides any positioning (position, top, left, bottom, right), use style exclusively
    if (style?.position !== undefined || style?.top !== undefined || style?.left !== undefined || style?.bottom !== undefined || style?.right !== undefined) {
      const exclusiveStyle = {
        opacity: isVisible ? 1 : 0,
        ...style,
      };
      
      if (isFading) {
        const exclusiveTransforms = [];
        const exclusiveScale = isVisible ? fadeScale : 0.86;
        exclusiveTransforms.push(`scale(${exclusiveScale})`);
        
        if (fadeRotation !== undefined && fadeRotation !== 0 && !isVisible) {
          exclusiveTransforms.push(`rotate(${fadeRotation}deg)`);
        }
        
        if (exclusiveTransforms.length > 0) {
          exclusiveStyle.transform = exclusiveTransforms.join(' ');
        }
        
        if (fadeBlur !== undefined) {
          exclusiveStyle.filter = fadeBlur > 0 ? `blur(${fadeBlur}px)` : 'none';
        }
        if (isVisible) {
          exclusiveStyle.boxShadow = '0 0 30px rgba(102, 126, 234, 0.3)';
        } else if (fadeShadow !== undefined) {
          exclusiveStyle.boxShadow = fadeShadow;
        }
      }
      
      return exclusiveStyle;
    }
    
    return baseStyle;
  }, [displayPosition, style, isVisible, isFading, fadeScale]);

  // Determine if we should use fixed positioning (default) or allow static/inline positioning
  const shouldUseFixed = useMemo(() => {
    return style?.position === undefined || style?.position === 'fixed';
  }, [style?.position]);

  // Check if position is static to disable animations
  const isStatic = useMemo(() => {
    return style?.position === 'static';
  }, [style?.position]);

  return (
    <div 
      ref={marcusContainerRef}
      className={`${shouldUseFixed ? 'fixed' : ''} z-[9999] ${shouldUseFixed ? 'hidden lg:block' : 'block'} ${isStatic ? '' : 'marcus-entry'} ${
        !isSearching && !isStatic ? 'marcus-float-wrapper' : ''
      } ${isSearching ? 'marcus-searching' : ''} marcus-container ${isFading ? 'marcus-fading' : ''} ${isWiggling ? 'marcus-wiggle' : ''} ${sizeClass} ${className}`}
      style={finalPosition}
      onClick={() => {
        // Trigger wiggle animation
        if (wiggleTimerRef.current) clearTimeout(wiggleTimerRef.current);
        setIsWiggling(true);
        wiggleTimerRef.current = setTimeout(() => setIsWiggling(false), 600);
        // Call original onClick if provided
        if (onClick) onClick();
      }}
    >
      {/* Marcus Body - Enhanced with realistic edge and color patterns */}
      <div 
        className="w-full h-full rounded-full marcus-vibe-sphere overflow-hidden cursor-pointer hover:scale-110 transition-transform duration-300 relative"
      >
        {/* Shimmer ring - exact from original, scales with size */}
        {!shouldReduceAnimations && (
          <div 
            className="absolute inset-[-10%] marcus-shimmer-ring pointer-events-none"
            style={{
              background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.4) 10%, transparent 20%, transparent 50%, rgba(255, 255, 255, 0.3) 60%, transparent 70%)',
              borderRadius: '50%',
              filter: 'blur(2px)',
            }}
          />
        )}

        {/* Dreamy inner layer - exact from original */}
        {!shouldReduceAnimations && (
          <div 
            className="absolute inset-[15%] rounded-full marcus-inner-glow pointer-events-none"
            style={{
              background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.5) 0%, rgba(240, 147, 251, 0.3) 40%, rgba(102, 126, 234, 0.2) 70%, transparent 100%)',
              filter: 'blur(4px)',
            }}
          />
        )}

        {/* Orb 1 - Lavender/Pink - dynamic size */}
        {!shouldReduceAnimations && (
          <div 
            className="absolute marcus-orb-1 rounded-full pointer-events-none"
            style={{
              width: orbSizes.orb1,
              height: orbSizes.orb1,
              ...orbPositions.orb1,
              background: 'radial-gradient(circle, rgba(240, 147, 251, 0.95) 0%, rgba(245, 87, 108, 0.6) 50%, transparent 80%)',
              boxShadow: '0 0 10px rgba(240, 147, 251, 0.8)',
              filter: 'blur(1px)',
            }}
          />
        )}

        {/* Orb 2 - Blue/Purple - dynamic size */}
        {!shouldReduceAnimations && (
          <div 
            className="absolute marcus-orb-2 rounded-full pointer-events-none"
            style={{
              width: orbSizes.orb2,
              height: orbSizes.orb2,
              ...orbPositions.orb2,
              background: 'radial-gradient(circle, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.6) 50%, transparent 80%)',
              boxShadow: '0 0 10px rgba(102, 126, 234, 0.8)',
              filter: 'blur(1px)',
            }}
          />
        )}

        {/* Orb 3 - Coral/Peach - dynamic size */}
        {!shouldReduceAnimations && (
          <div 
            className="absolute marcus-orb-3 rounded-full pointer-events-none"
            style={{
              width: orbSizes.orb3,
              height: orbSizes.orb3,
              ...orbPositions.orb3,
              background: 'radial-gradient(circle, rgba(79, 172, 254, 0.9) 0%, rgba(102, 126, 234, 0.5) 50%, transparent 80%)',
              boxShadow: '0 0 10px rgba(79, 172, 254, 0.8)',
              filter: 'blur(1px)',
            }}
          />
        )}

        {/* Soft highlight - top left - dynamic size */}
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orbSizes.highlight1,
            height: orbSizes.highlight1,
            ...orbPositions.highlight1,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 60%, transparent 100%)',
            boxShadow: '0 0 8px rgba(255, 255, 255, 0.9)',
          }}
        />

        {/* Secondary highlight - dynamic size */}
        <div 
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orbSizes.highlight2,
            height: orbSizes.highlight2,
            ...orbPositions.highlight2,
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 100%)',
            boxShadow: '0 0 4px rgba(255, 255, 255, 0.7)',
          }}
        />
      </div>
      
      {/* Message Bubble - Dynamic position based on available space */}
      {message && (
        <div 
          className={`absolute marcus-msg pointer-events-none ${messagePositionClass}`}
          style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 12px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            whiteSpace: 'nowrap',
            fontSize: '13px',
            fontWeight: '500',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            opacity: messageVisible ? 1 : 0,
            transform: messagePosition === 'top' 
              ? (messageVisible ? 'translateX(-50%)' : 'translateX(-50%) translateY(4px)')
              : (messageVisible ? 'translateY(-50%)' : 'translateY(-50%) translateX(4px)'),
            transition: 'opacity 400ms ease-out, transform 400ms ease-out',
            willChange: messageVisible ? 'auto' : 'opacity, transform',
            position: 'absolute',
          }}
        >
          {/* Dynamic speech bubble tail */}
          <div style={tailStyles} />
          <span key={message} style={{ 
            fontWeight: '500', 
            color: '#1a1a1a',
            whiteSpace: 'nowrap',
          }}>
            {message}
          </span>
        </div>
      )}
    </div>
  );
});

Marcus.displayName = 'Marcus';

export default Marcus;

