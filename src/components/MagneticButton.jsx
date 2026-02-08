import { useState, useRef, useEffect } from 'react';

/**
 * MagneticButton - A button with magnetic hover effect
 * The button follows the cursor with elastic stretch and smooth snap-back
 */
function MagneticButton({ children, className, onClick, ...props }) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef(null);
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
    if (!buttonRef.current || !isHovered) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const x = e.clientX - centerX;
    const y = e.clientY - centerY;
    
    // Limit the movement to a small radius (6px for subtle effect)
    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = 6;
    
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
  const maxStretch = 0.08; // 8% max stretch
  const stretchAmount = Math.min(distance / 6, 1) * maxStretch;
  
  // Calculate stretch direction
  const angle = Math.atan2(mousePosition.y, mousePosition.x);
  const stretchX = 1 + Math.abs(Math.cos(angle)) * stretchAmount;
  const stretchY = 1 + Math.abs(Math.sin(angle)) * stretchAmount;

  return (
    <div
      ref={buttonRef}
      className={className}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px) scale(${isHovered ? stretchX : 1}, ${isHovered ? stretchY : 1})`,
        transformOrigin: 'center',
        transition: isHovered ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        willChange: 'transform',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default MagneticButton;
