import { useState, useRef, useEffect } from 'react';
import MagneticButton from '../MagneticButton';

export default function PrecisionSection({ onButtonClick }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const animationFrameRef = useRef(null);
  const currentPosition = useRef({ x: 0, y: 0 });

  // Smooth interpolation for magnetic effect
  useEffect(() => {
    if (!isHovered) {
      // Smooth snap-back when not hovered
      const animate = () => {
        const dx = 0 - currentPosition.current.x;
        const dy = 0 - currentPosition.current.y;
        
        // Easing factor for smooth return
        const easing = 0.15;
        currentPosition.current.x += dx * easing;
        currentPosition.current.y += dy * easing;
        
        // Update state if there's still movement
        if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
          setMousePosition({ 
            x: currentPosition.current.x, 
            y: currentPosition.current.y 
          });
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Snap to exact position when close enough
          currentPosition.current = { x: 0, y: 0 };
          setMousePosition({ x: 0, y: 0 });
        }
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered]);

  const handleMouseMove = (e) => {
    if (!imageRef.current || !containerRef.current || !isHovered) return;
    
    const imageRect = imageRef.current.getBoundingClientRect();
    const centerX = imageRect.left + imageRect.width / 2;
    const centerY = imageRect.top + imageRect.height / 2;
    
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    // Limit the movement to a small radius (8px for subtle effect on larger image)
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 8;
    
    let targetX, targetY;
    
    if (distance > maxDistance) {
      const angle = Math.atan2(y, x);
      targetX = Math.cos(angle) * maxDistance;
      targetY = Math.sin(angle) * maxDistance;
    } else {
      // Apply magnetic attraction - stronger when closer
      const attraction = 1 - (distance / maxDistance) * 0.3; // 30% stronger attraction
      targetX = x * attraction;
      targetY = y * attraction;
    }
    
    // Smooth interpolation for following effect
    const easing = 0.2;
    currentPosition.current.x += (targetX - currentPosition.current.x) * easing;
    currentPosition.current.y += (targetY - currentPosition.current.y) * easing;
    
    setMousePosition({ 
      x: currentPosition.current.x, 
      y: currentPosition.current.y 
    });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    // Don't reset immediately - let the useEffect handle smooth snap-back
  };

  // Calculate stretch based on cursor direction (stretches toward cursor)
  const distance = Math.sqrt(mousePosition.x ** 2 + mousePosition.y ** 2);
  const maxStretch = 0.06; // 6% max stretch for subtle effect
  const stretchAmount = Math.min(distance / 8, 1) * maxStretch;
  
  // Calculate stretch direction
  const angle = Math.atan2(mousePosition.y, mousePosition.x);
  const stretchX = 1 + Math.abs(Math.cos(angle)) * stretchAmount;
  const stretchY = 1 + Math.abs(Math.sin(angle)) * stretchAmount;

  return (
    <section className="relative w-full pt-16 sm:pt-20 lg:pt-28 pb-8 sm:pb-12 lg:pb-16 px-4" data-name="About">
      {/* Performance optimizations for low-speed internet and all screen sizes */}
      <style>{`
        /* Reduce motion for accessibility */
        @media (prefers-reduced-motion: reduce) {
          [class*="animate-dot-float"] {
            animation: none !important;
          }
        }
        /* Optimize dots container for performance */
        .dots-container {
          will-change: transform;
          transform: translateZ(0);
        }
        /* Hardware acceleration and responsive optimizations for all dots */
        .premium-dot {
          transform: translateZ(0);
          backface-visibility: hidden;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        /* Mobile optimizations - simpler shadows, smaller sizes */
        @media (max-width: 640px) {
          .premium-dot {
            box-shadow: 0 0 6px rgba(99,102,241,0.6) !important;
          }
        }
        /* Tablet optimizations */
        @media (min-width: 641px) and (max-width: 1024px) {
          .premium-dot {
            box-shadow: 0 0 10px rgba(99,102,241,0.7), 0 0 20px rgba(79,70,229,0.3) !important;
          }
        }
        /* Ensure dots work on all screen sizes */
        @media (min-width: 1025px) {
          .premium-dot {
            /* Full premium shadows on desktop */
          }
        }
      `}</style>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Main Title */}
        <div className="flex justify-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-['Poppins'] font-normal leading-tight text-[#232629] max-w-3xl px-4">
            Precision Health With Intelligence
          </h2>
        </div>

        <div 
          ref={containerRef}
          className="relative w-full h-150"
          onMouseEnter={handleMouseEnter}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="absolute left-1/2 top-75 z-0 transform -translate-x-1/2 -translate-y-1/2">
            <div 
              ref={imageRef}
              className="relative"
              style={{
                transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(${isHovered ? stretchX : 1}, ${isHovered ? stretchY : 1})`,
                transformOrigin: 'center center',
                transition: isHovered ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                willChange: 'transform',
              }}
            >
              {/* Premium Moving Dots - Connection-aware rendering */}
              {/* Full set (90 dots) when connection is fast, reduced set (60 edge dots) when slow but animations not reduced */}
              <div className="dots-container absolute inset-0 overflow-visible pointer-events-none" style={{ zIndex: -1 }}>
                {/* Top Edge - 15 dots - Optimized for all screen sizes */}
                <div className="premium-dot absolute top-[-2%] left-[5%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_4px_rgba(99,102,241,0.6)] sm:shadow-[0_0_8px_rgba(99,102,241,0.8),0_0_16px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-1" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-3%] left-[12%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.7)] sm:shadow-[0_0_10px_rgba(99,102,241,0.9),0_0_20px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-2" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-1%] left-[20%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-3" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-3%] left-[28%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-4" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-2%] left-[36%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-5" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-4%] left-[44%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-6" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-2.5%] left-[52%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-61" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-3%] left-[60%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-62" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-2%] left-[68%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-63" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-3.5%] left-[76%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-64" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-1%] left-[84%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-65" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[-2%] left-[92%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-66" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[2%] left-[16%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-67" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[4%] left-[48%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-68" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute top-[1%] left-[80%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-69" style={{ willChange: 'transform' }}></div>
                
                {/* Bottom Edge - 15 dots */}
                <div className="premium-dot absolute bottom-[-2%] left-[8%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-7" style={{ willChange: 'transform' }}></div>
                <div className="premium-dot absolute bottom-[-3%] left-[16%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-8"></div>
                <div className="premium-dot absolute bottom-[-1%] left-[24%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-9"></div>
                <div className="premium-dot absolute bottom-[-3%] left-[32%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-10"></div>
                <div className="premium-dot absolute bottom-[-2%] left-[40%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-11"></div>
                <div className="premium-dot absolute bottom-[-1.5%] left-[48%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-12"></div>
                <div className="premium-dot absolute bottom-[-2.5%] left-[56%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-70"></div>
                <div className="premium-dot absolute bottom-[-3%] left-[64%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-71"></div>
                <div className="premium-dot absolute bottom-[-2%] left-[72%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-72"></div>
                <div className="premium-dot absolute bottom-[-3.5%] left-[80%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-73"></div>
                <div className="premium-dot absolute bottom-[-1%] left-[88%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-74"></div>
                <div className="premium-dot absolute bottom-[-2%] left-[96%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-75"></div>
                <div className="premium-dot absolute bottom-[2%] left-[20%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-76"></div>
                <div className="premium-dot absolute bottom-[4%] left-[52%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-77"></div>
                <div className="premium-dot absolute bottom-[1%] left-[84%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-78"></div>
                
                {/* Left Edge - 15 dots */}
                <div className="premium-dot absolute top-[8%] left-[-2%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-13"></div>
                <div className="premium-dot absolute top-[14%] left-[-1%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-14"></div>
                <div className="premium-dot absolute top-[20%] left-[-1%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-15"></div>
                <div className="premium-dot absolute top-[26%] left-[-3%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-16"></div>
                <div className="premium-dot absolute top-[32%] left-[-2%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-17"></div>
                <div className="premium-dot absolute top-[38%] left-[-1.5%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-18"></div>
                <div className="premium-dot absolute top-[44%] left-[-2.5%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-79"></div>
                <div className="premium-dot absolute top-[50%] left-[-3%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-80"></div>
                <div className="premium-dot absolute top-[56%] left-[-2%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-81"></div>
                <div className="premium-dot absolute top-[62%] left-[-3.5%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-82"></div>
                <div className="premium-dot absolute top-[68%] left-[-1%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-83"></div>
                <div className="premium-dot absolute top-[74%] left-[-1%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-84"></div>
                <div className="premium-dot absolute top-[80%] left-[-2%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-85"></div>
                <div className="premium-dot absolute top-[86%] left-[-1.5%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-86"></div>
                <div className="premium-dot absolute top-[92%] left-[-2.5%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-87"></div>
                
                {/* Right Edge - 15 dots */}
                <div className="premium-dot absolute top-[6%] right-[-2%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-19"></div>
                <div className="premium-dot absolute top-[12%] right-[-1%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-20"></div>
                <div className="premium-dot absolute top-[18%] right-[-1%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-21"></div>
                <div className="premium-dot absolute top-[24%] right-[-3%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-22"></div>
                <div className="premium-dot absolute top-[30%] right-[-2%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-23"></div>
                <div className="premium-dot absolute top-[36%] right-[-1.5%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-24"></div>
                <div className="premium-dot absolute top-[42%] right-[-2.5%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-88"></div>
                <div className="premium-dot absolute top-[48%] right-[-3%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-89"></div>
                <div className="premium-dot absolute top-[54%] right-[-2%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-90"></div>
                <div className="premium-dot absolute top-[60%] right-[-3.5%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-31"></div>
                <div className="premium-dot absolute top-[66%] right-[-1%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-32"></div>
                <div className="premium-dot absolute top-[72%] right-[-1%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-33"></div>
                <div className="premium-dot absolute top-[78%] right-[-2%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-34"></div>
                <div className="premium-dot absolute top-[84%] right-[-1.5%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-35"></div>
                <div className="premium-dot absolute top-[90%] right-[-2.5%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-36"></div>
                
                {/* Inner Scattered - 30 dots - Always show */}
                <>
                  <div className="premium-dot absolute top-[15%] left-[15%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-25"></div>
                    <div className="premium-dot absolute top-[22%] left-[22%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-26"></div>
                    <div className="premium-dot absolute top-[28%] left-[85%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-27"></div>
                    <div className="premium-dot absolute top-[35%] left-[78%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-28"></div>
                    <div className="premium-dot absolute top-[42%] left-[28%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-29"></div>
                    <div className="premium-dot absolute top-[48%] left-[72%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-30"></div>
                    <div className="premium-dot absolute top-[55%] left-[35%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-37"></div>
                    <div className="premium-dot absolute top-[62%] left-[65%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-38"></div>
                    <div className="premium-dot absolute top-[68%] left-[42%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-39"></div>
                    <div className="premium-dot absolute top-[75%] left-[58%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-40"></div>
                    <div className="premium-dot absolute top-[82%] left-[25%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-41"></div>
                    <div className="premium-dot absolute top-[88%] left-[75%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-42"></div>
                    <div className="premium-dot absolute top-[12%] left-[48%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-43"></div>
                    <div className="premium-dot absolute top-[18%] left-[62%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-44"></div>
                    <div className="premium-dot absolute top-[25%] left-[38%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-45"></div>
                    <div className="premium-dot absolute top-[32%] left-[52%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-46"></div>
                    <div className="premium-dot absolute top-[38%] left-[18%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-47"></div>
                    <div className="premium-dot absolute top-[45%] left-[82%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-48"></div>
                    <div className="premium-dot absolute top-[52%] left-[12%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-49"></div>
                    <div className="premium-dot absolute top-[58%] left-[88%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-50"></div>
                    <div className="premium-dot absolute top-[65%] left-[55%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-51"></div>
                    <div className="premium-dot absolute top-[72%] left-[32%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-52"></div>
                    <div className="premium-dot absolute top-[78%] left-[68%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-53"></div>
                    <div className="premium-dot absolute top-[85%] left-[45%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-54"></div>
                    <div className="premium-dot absolute top-[8%] left-[32%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-55"></div>
                    <div className="premium-dot absolute top-[92%] left-[58%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-56"></div>
                    <div className="premium-dot absolute top-[16%] left-[92%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-57"></div>
                    <div className="premium-dot absolute top-[24%] left-[8%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-58"></div>
                    <div className="premium-dot absolute top-[95%] left-[35%] w-[2px] h-[2px] sm:w-[3px] sm:h-[3px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_6px_rgba(99,102,241,0.6)] sm:shadow-[0_0_12px_rgba(99,102,241,0.8),0_0_24px_rgba(79,70,229,0.4),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-59"></div>
                  <div className="premium-dot absolute top-[5%] left-[65%] w-[3px] h-[3px] sm:w-[4px] sm:h-[4px] rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.7)] sm:shadow-[0_0_14px_rgba(99,102,241,0.9),0_0_28px_rgba(79,70,229,0.5),inset_0_1px_2px_rgba(255,255,255,0.3)] animate-dot-float-60"></div>
                </>
              </div>

              {/* Premium Image Container with Enhanced Effects */}
              <div className="premium-precision-image relative z-10">
                <img
                  src="landing-page/precision-health-bg.png"
                  alt="Precision Health Background"
                  className="w-150 h-auto lg:h-150"
                  loading="lazy"
                  decoding="async"
                />
                
                {/* Premium overlay effects */}
                <div className="premium-dot absolute inset-0 pointer-events-none premium-image-overlay"></div>
                <div className="premium-dot absolute inset-0 pointer-events-none premium-image-glow"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row h-full">
            {/* Left Column - Service Features - Takes only the width it needs */}
            <div className="flex flex-col justify-between flex-shrink-0 lg:pt-12 mb-8 lg:mb-0">
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <MagneticButton className="w-full sm:w-fit rounded-full px-4 sm:px-6 py-2 border border-indigo-500 inline-block cursor-pointer">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-['Poppins'] text-sm sm:text-base lg:text-lg text-[#222222]">Check Your Doctor's Available Time</span>
                    <svg width="13" height="9" viewBox="0 0 13 9" fill="none" className="ml-2 sm:ml-4 flex-shrink-0">
                      <path d="M1 4.5L5 8L12 1" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </MagneticButton>

                <MagneticButton className="w-full sm:w-fit rounded-full px-4 sm:px-6 py-2 border border-indigo-500 inline-block cursor-pointer">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-['Poppins'] text-sm sm:text-base lg:text-lg text-[#222222]">Urgent Medical Services</span>
                    <svg width="13" height="9" viewBox="0 0 13 9" fill="none" className="ml-2 sm:ml-4 flex-shrink-0">
                      <path d="M1 4.5L5 8L12 1" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </MagneticButton>

                <MagneticButton className="w-full sm:w-fit rounded-full px-4 sm:px-6 py-2 border border-indigo-500 inline-block cursor-pointer">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-['Poppins'] text-sm sm:text-base lg:text-lg text-[#222222]">Health Buddy AI</span>
                    <svg width="13" height="9" viewBox="0 0 13 9" fill="none" className="ml-2 sm:ml-4 flex-shrink-0">
                      <path d="M1 4.5L5 8L12 1" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </MagneticButton>
              </div>

              <div className="mt-6 lg:mt-0">
                <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-['Poppins'] font-normal text-[#232629] max-w-md pb-8 sm:pb-12 lg:pb-[5rem]">
                  AI for a Healthier Tomorrow
                </h3>
              </div>
            </div>

            {/* Right Column - Takes remaining space */}
            <div className="flex-1 relative min-h-[400px]">
              {/* Health Metrics - positioned on the right */}
              <div className="relative flex flex-col items-end justify-center h-full z-1 space-y-6 max-w-[700px]">
                {/* Oxygen Level Card */}
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2">
                    <div className="px-4 py-1">
                      <span className="font-['Poppins'] text-sm text-[#454545]">Better Health</span>
                    </div>
                    <div className="px-4 py-1">
                      <span className="font-['Poppins'] text-sm text-[#454545]">AI-Powered Care</span>
                    </div>
                  </div>
                </div>

                <div className="hidden sm:block absolute top-[0px] right-[0px]">
                  <img 
                    className="max-h-[180px] animate-premium-float-reverse" 
                    src="landing-page/precision-icon-container.png"
                    loading="lazy"
                    decoding="async"
                    alt="Precision Health Icon"
                    style={{ willChange: 'transform' }}
                  />
                </div>

                <div className="realative sm:absolute w-auto bottom-[60px] right-[-40px] w-100">
                  <img 
                    src="landing-page/metric-container.png" 
                    className="animate-premium-float"
                    loading="lazy"
                    decoding="async"
                    alt="Health Metrics"
                    style={{ willChange: 'transform' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
