import { useState, useCallback, useMemo, memo, useRef, useEffect } from 'react';
import MagneticButton from '../MagneticButton';

function FeaturesSection({ onButtonClick }) {
  const [activeLabel, setActiveLabel] = useState('features');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [sphereMagnet, setSphereMagnet] = useState({ x: 0, y: 0 });
  const sectionRef = useRef(null);
  const sphereRef = useRef(null);
  const isMobile = useRef(false);

  // Detect mobile/touch devices
  useEffect(() => {
    const checkMobile = () => {
      isMobile.current = window.matchMedia('(max-width: 1024px)').matches || 
                         'ontouchstart' in window || 
                         navigator.maxTouchPoints > 0;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseMove = useCallback((e) => {
    if (isMobile.current || !sectionRef.current) return;
    
    requestAnimationFrame(() => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const x = ((e.clientX - centerX) / rect.width) * 3; // Max 3px
      const y = ((e.clientY - centerY) / rect.height) * 3; // Max 3px
      
      setMousePosition({ 
        x: Math.max(-3, Math.min(3, x)), 
        y: Math.max(-3, Math.min(3, y)) 
      });
      
      // Magnetic effect for sphere - gentle pull toward cursor (optimized)
      if (sphereRef.current) {
        const sphereRect = sphereRef.current.getBoundingClientRect();
        const sphereCenterX = sphereRect.left + sphereRect.width / 2;
        const sphereCenterY = sphereRect.top + sphereRect.height / 2;
        
        const distX = e.clientX - sphereCenterX;
        const distY = e.clientY - sphereCenterY;
        const distance = Math.sqrt(distX * distX + distY * distY);
        
        // Only apply magnetic effect when cursor is within 250px
        if (distance < 250 && distance > 0) {
          const strength = Math.pow((250 - distance) / 250, 2); // Quadratic falloff for smoother feel
          const magnetX = (distX / distance) * strength * 12; // Max 12px pull
          const magnetY = (distY / distance) * strength * 12;
          setSphereMagnet({ x: magnetX, y: magnetY });
        } else {
          setSphereMagnet(prev => prev.x !== 0 || prev.y !== 0 ? { x: 0, y: 0 } : prev);
        }
      }
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMousePosition({ x: 0, y: 0 });
    setSphereMagnet({ x: 0, y: 0 });
  }, []);

  const handleLabelClick = useCallback((label) => {
    if (activeLabel !== label) {
      setActiveLabel(label);
    }
  }, [activeLabel]);

  return (
    <section 
      ref={sectionRef}
      className="relative w-full py-12 sm:py-24 px-4" 
      data-name="Features Section"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-20">
          {/* Left Column - Title */}
          <div className="space-y-8">
            {/* Features Label */}
            <div className="flex items-center justify-center lg:justify-start space-x-4">
              <div 
                className={`rounded-full px-4 py-2 cursor-pointer transition-all duration-300 ease-out ${
                  activeLabel === 'features' 
                    ? 'bg-white shadow-sm scale-105' 
                    : 'bg-transparent hover:opacity-80'
                }`}
                onClick={() => handleLabelClick('features')}
                style={{ transform: 'translateZ(0)', willChange: activeLabel === 'features' ? 'transform' : 'auto' }}
              >
                <span className={`text-base font-['Poppins'] transition-colors duration-300 ${
                  activeLabel === 'features' 
                    ? 'text-purple-600 font-medium' 
                    : 'text-gray-800'
                }`}>
                  Features
                </span>
              </div>
              <div 
                className={`rounded-full px-4 py-2 cursor-pointer transition-all duration-300 ease-out ${
                  activeLabel === 'neuai' 
                    ? 'bg-white shadow-sm scale-105' 
                    : 'bg-transparent hover:opacity-80'
                }`}
                onClick={() => handleLabelClick('neuai')}
                style={{ transform: 'translateZ(0)', willChange: activeLabel === 'neuai' ? 'transform' : 'auto' }}
              >
                <span className={`text-base font-['Poppins'] transition-colors duration-300 ${
                  activeLabel === 'neuai' 
                    ? 'text-purple-600 font-medium' 
                    : 'text-gray-800'
                }`}>
                  Buddy Ai
                </span>
              </div>
            </div>

            {/* Main Title */}
            <div className="relative">
              <h2 
                key={activeLabel}
                className="text-2xl md:text-3xl lg:text-4xl text-center lg:text-left font-['Montserrat'] font-normal leading-tight text-gray-800 transition-opacity duration-300 max-w-2xl"
                style={{ 
                  transform: 'translateZ(0)'
                }}
              >
                {activeLabel === 'neuai' ? (
                  <>
                    You can talk freely here.<br />I'm listening.
                  </>
                ) : (
                  <>
                    To democratize healthcare<br />access with AI.
                  </>
                )}
              </h2>
              {/* Marcus - The Animated Floating Sphere - Smooth Random Movement & Magnetic Effect */}
              <div 
                ref={sphereRef}
                className="absolute -right-8 top-1/2 -translate-y-1/2 hidden lg:block sphere-float-wrapper"
                style={{
                  width: '64px',
                  height: '64px',
                }}
              >
                {/* Inner container for fade/visibility sync */}
                <div 
                  className="floating-sphere-container"
                  style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    willChange: 'transform, opacity',
                    overflow: 'visible',
                  }}
                >
                <style>{`
                  @keyframes sphereFloat {
                    /* Viby smooth wave-like floating */
                    0% { transform: translate3d(80px, 0, 0) scale(1) rotate(0deg); }
                    10% { transform: translate3d(150px, -30px, 0) scale(1.02) rotate(3deg); }
                    20% { transform: translate3d(200px, 10px, 0) scale(1.04) rotate(-2deg); }
                    30% { transform: translate3d(160px, 40px, 0) scale(1.02) rotate(4deg); }
                    40% { transform: translate3d(100px, 20px, 0) scale(1.03) rotate(-3deg); }
                    50% { transform: translate3d(180px, -20px, 0) scale(1.05) rotate(2deg); }
                    60% { transform: translate3d(220px, 30px, 0) scale(1.02) rotate(-4deg); }
                    70% { transform: translate3d(130px, -10px, 0) scale(1.04) rotate(3deg); }
                    80% { transform: translate3d(170px, 35px, 0) scale(1.02) rotate(-2deg); }
                    90% { transform: translate3d(120px, -25px, 0) scale(1.03) rotate(2deg); }
                    100% { transform: translate3d(80px, 0, 0) scale(1) rotate(0deg); }
                  }
                  @keyframes sphereFadeSync {
                    /* Premium Entry - Magical appearance */
                    0% { 
                      opacity: 0; 
                      transform: scale(0) rotate(-180deg) translateY(60px); 
                      filter: blur(20px) brightness(3);
                      visibility: hidden; 
                    }
                    0.3% { 
                      opacity: 0; 
                      transform: scale(0) rotate(-180deg) translateY(60px); 
                      filter: blur(20px) brightness(3);
                      visibility: visible; 
                    }
                    0.8% { 
                      opacity: 0.3; 
                      transform: scale(0.3) rotate(-90deg) translateY(40px); 
                      filter: blur(12px) brightness(2.5);
                    }
                    1.3% { 
                      opacity: 0.6; 
                      transform: scale(0.7) rotate(-30deg) translateY(20px); 
                      filter: blur(6px) brightness(2);
                    }
                    1.8% { 
                      opacity: 0.9; 
                      transform: scale(1.15) rotate(10deg) translateY(-5px); 
                      filter: blur(2px) brightness(1.5);
                    }
                    2.3% { 
                      opacity: 1; 
                      transform: scale(0.95) rotate(-5deg) translateY(3px); 
                      filter: blur(0px) brightness(1.2);
                    }
                    2.8% { 
                      opacity: 1; 
                      transform: scale(1.05) rotate(2deg) translateY(-2px); 
                      filter: blur(0px) brightness(1.1);
                    }
                    3.3% { 
                      opacity: 1; 
                      transform: scale(1) rotate(0deg) translateY(0); 
                      filter: blur(0px) brightness(1);
                    }
                    /* Visible during all messages (3.3-90%) */
                    90% { 
                      opacity: 1; 
                      transform: scale(1) rotate(0deg) translateY(0); 
                      filter: blur(0px) brightness(1);
                    }
                    /* Premium Exit - Magical disappearance */
                    91% { 
                      opacity: 1; 
                      transform: scale(1.1) rotate(5deg) translateY(-10px); 
                      filter: blur(0px) brightness(1.3);
                    }
                    92% { 
                      opacity: 0.9; 
                      transform: scale(1.2) rotate(15deg) translateY(-25px); 
                      filter: blur(2px) brightness(1.6);
                    }
                    93% { 
                      opacity: 0.7; 
                      transform: scale(1.1) rotate(45deg) translateY(-50px); 
                      filter: blur(4px) brightness(2);
                    }
                    94% { 
                      opacity: 0.5; 
                      transform: scale(0.8) rotate(90deg) translateY(-80px); 
                      filter: blur(8px) brightness(2.5);
                    }
                    95% { 
                      opacity: 0.2; 
                      transform: scale(0.4) rotate(150deg) translateY(-120px); 
                      filter: blur(15px) brightness(3);
                    }
                    96% { 
                      opacity: 0; 
                      transform: scale(0) rotate(180deg) translateY(-150px); 
                      filter: blur(25px) brightness(4);
                      visibility: hidden; 
                    }
                    /* Completely invisible until next cycle */
                    96.01%, 100% { 
                      opacity: 0; 
                      transform: scale(0) rotate(-180deg) translateY(60px); 
                      filter: blur(20px) brightness(3);
                      visibility: hidden; 
                    }
                  }
                  @keyframes entrySparkle {
                    0%, 3% { opacity: 1; transform: scale(1); }
                    3.5% { opacity: 0; transform: scale(2); }
                    3.51%, 100% { opacity: 0; transform: scale(0); }
                  }
                  @keyframes exitSparkle {
                    0%, 90% { opacity: 0; transform: scale(0); }
                    91% { opacity: 1; transform: scale(1); }
                    96% { opacity: 0; transform: scale(3); }
                    96.01%, 100% { opacity: 0; transform: scale(0); }
                  }
                  @keyframes spherePulse {
                    0%, 100% {
                      box-shadow: 0 0 40px rgba(76, 239, 255, 0.9), 
                                  0 0 80px rgba(25, 246, 220, 0.7), 
                                  0 0 120px rgba(76, 239, 255, 0.5);
                    }
                    50% {
                      box-shadow: 0 0 60px rgba(76, 239, 255, 1), 
                                  0 0 100px rgba(25, 246, 220, 0.9), 
                                  0 0 150px rgba(76, 239, 255, 0.7);
                    }
                  }
                  @keyframes glowRotate {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                  /* Pleasant body movements synced with messages (22s cycle) */
                  @keyframes bodyMovement {
                    /* Hi 👋 (0-14%) - Excited bouncing and tilting */
                    0% { transform: rotate(0deg) scale(1); }
                    1% { transform: rotate(-5deg) scale(1.05) translateY(-3px); }
                    3% { transform: rotate(5deg) scale(1.02) translateY(0); }
                    5% { transform: rotate(-4deg) scale(1.04) translateY(-2px); }
                    7% { transform: rotate(4deg) scale(1.02) translateY(0); }
                    9% { transform: rotate(-3deg) scale(1.03) translateY(-2px); }
                    11% { transform: rotate(3deg) scale(1.01) translateY(0); }
                    14% { transform: rotate(0deg) scale(1) translateY(0); }
                    
                    /* Transition */
                    17% { transform: rotate(0deg) scale(1); }
                    
                    /* Hope you're good 😊 (18-32%) - Gentle swaying, caring nod */
                    18% { transform: rotate(0deg) scale(1); }
                    20% { transform: rotate(-3deg) scale(1.02) translateY(-2px); }
                    23% { transform: rotate(0deg) scale(1) translateY(2px); }
                    26% { transform: rotate(3deg) scale(1.02) translateY(-1px); }
                    29% { transform: rotate(0deg) scale(1) translateY(1px); }
                    32% { transform: rotate(0deg) scale(1) translateY(0); }
                    
                    /* Transition */
                    35% { transform: rotate(0deg) scale(1); }
                    
                    /* I'm here to listen 👂 (36-50%) - Leaning forward attentively */
                    36% { transform: rotate(0deg) scale(1); }
                    38% { transform: rotate(5deg) scale(1.02) translateX(3px); }
                    42% { transform: rotate(6deg) scale(1.03) translateX(4px); }
                    46% { transform: rotate(5deg) scale(1.02) translateX(3px); }
                    50% { transform: rotate(0deg) scale(1) translateX(0); }
                    
                    /* Transition */
                    53% { transform: rotate(0deg) scale(1); }
                    
                    /* Understand 🤝 (54-68%) - Understanding nods */
                    54% { transform: rotate(0deg) scale(1); }
                    56% { transform: rotate(0deg) scale(1.02) translateY(3px); }
                    58% { transform: rotate(0deg) scale(1) translateY(-2px); }
                    60% { transform: rotate(0deg) scale(1.02) translateY(3px); }
                    62% { transform: rotate(0deg) scale(1) translateY(-2px); }
                    64% { transform: rotate(0deg) scale(1.02) translateY(2px); }
                    66% { transform: rotate(0deg) scale(1) translateY(-1px); }
                    68% { transform: rotate(0deg) scale(1) translateY(0); }
                    
                    /* Transition */
                    71% { transform: rotate(0deg) scale(1); }
                    
                    /* And take care of you 💙 (72-84%) - Warm embracing lean */
                    72% { transform: rotate(0deg) scale(1); }
                    74% { transform: rotate(-4deg) scale(1.05) translateY(-3px); }
                    77% { transform: rotate(0deg) scale(1.08) translateY(-5px); }
                    80% { transform: rotate(4deg) scale(1.05) translateY(-3px); }
                    83% { transform: rotate(0deg) scale(1.02) translateY(-1px); }
                    84% { transform: rotate(0deg) scale(1) translateY(0); }
                    
                    /* Byeee 👋💫 (86-96%) - Happy bouncy goodbye */
                    86% { transform: rotate(0deg) scale(1); }
                    87% { transform: rotate(-6deg) scale(1.06) translateY(-4px); }
                    88.5% { transform: rotate(6deg) scale(1.03) translateY(0); }
                    90% { transform: rotate(-5deg) scale(1.05) translateY(-3px); }
                    91.5% { transform: rotate(5deg) scale(1.02) translateY(0); }
                    93% { transform: rotate(-4deg) scale(1.04) translateY(-2px); }
                    94.5% { transform: rotate(4deg) scale(1.01) translateY(0); }
                    96% { transform: rotate(0deg) scale(1) translateY(0); }
                    
                    /* Rest/hidden */
                    96.01%, 100% { transform: rotate(0deg) scale(1); }
                  }
                  @keyframes vibeBreath {
                    0%, 100% { filter: brightness(1) drop-shadow(0 0 15px rgba(102, 126, 234, 0.6)); }
                    25% { filter: brightness(1.05) drop-shadow(0 0 25px rgba(240, 147, 251, 0.7)); }
                    50% { filter: brightness(1.1) drop-shadow(0 0 35px rgba(79, 172, 254, 0.8)); }
                    75% { filter: brightness(1.05) drop-shadow(0 0 25px rgba(245, 87, 108, 0.7)); }
                  }
                  .sphere-float-wrapper {
                    animation: sphereFloat 30s cubic-bezier(0.37, 0, 0.63, 1) infinite, vibeBreath 8s ease-in-out infinite;
                    animation-fill-mode: both;
                  }
                  .floating-sphere-container {
                    animation: sphereFadeSync 22s ease-in-out infinite;
                    animation-fill-mode: both;
                  }
                  .sphere-main {
                    animation: spherePulse 2s ease-in-out infinite, bodyMovement 22s ease-in-out infinite;
                    animation-fill-mode: both;
                  }
                  .sphere-glow-ring {
                    animation: glowRotate 10s linear infinite;
                  }
                `}</style>
                
                {/* Rotating Glow Ring - Multi-color */}
                <div 
                  className="absolute inset-[-16px] rounded-full sphere-glow-ring pointer-events-none"
                  style={{
                    background: 'conic-gradient(from 0deg, rgba(76, 239, 255, 0.6), rgba(255, 150, 200, 0.5), rgba(150, 255, 180, 0.6), rgba(255, 200, 100, 0.5), rgba(180, 150, 255, 0.6), rgba(255, 180, 150, 0.5), rgba(76, 239, 255, 0.6))',
                    filter: 'blur(16px)',
                    opacity: 0.7,
                  }}
                />
                {/* Outer Glow - Cyan */}
                <div 
                  className="absolute inset-[-12px] rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(76, 239, 255, 0.7) 0%, rgba(25, 246, 220, 0.5) 40%, transparent 70%)',
                    filter: 'blur(14px)',
                  }}
                />
                {/* Marcus Body - Viby Multicolor Effect */}
                <style>{`
                  @keyframes vibeFlow {
                    0% { background-position: 0% 0%; filter: hue-rotate(0deg); }
                    25% { background-position: 100% 50%; filter: hue-rotate(30deg); }
                    50% { background-position: 50% 100%; filter: hue-rotate(0deg); }
                    75% { background-position: 0% 50%; filter: hue-rotate(-30deg); }
                    100% { background-position: 0% 0%; filter: hue-rotate(0deg); }
                  }
                  @keyframes auraGlow {
                    0%, 100% { 
                      box-shadow: 0 0 25px rgba(255, 107, 157, 0.9), 
                                  0 0 50px rgba(196, 76, 224, 0.7), 
                                  0 0 75px rgba(76, 201, 240, 0.5),
                                  inset 0 0 20px rgba(255, 255, 255, 0.4); 
                    }
                    33% { 
                      box-shadow: 0 0 30px rgba(76, 201, 240, 0.9), 
                                  0 0 60px rgba(128, 237, 153, 0.7), 
                                  0 0 90px rgba(249, 199, 79, 0.5),
                                  inset 0 0 25px rgba(255, 255, 255, 0.5); 
                    }
                    66% { 
                      box-shadow: 0 0 35px rgba(196, 76, 224, 0.9), 
                                  0 0 70px rgba(255, 107, 157, 0.7), 
                                  0 0 100px rgba(128, 237, 153, 0.5),
                                  inset 0 0 30px rgba(255, 255, 255, 0.45); 
                    }
                  }
                  @keyframes orbFloat1 {
                    0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.9; }
                    20% { transform: translate(15px, -12px) scale(1.2); opacity: 1; }
                    40% { transform: translate(-8px, 18px) scale(0.9); opacity: 0.8; }
                    60% { transform: translate(20px, 10px) scale(1.1); opacity: 1; }
                    80% { transform: translate(-12px, -8px) scale(1.05); opacity: 0.85; }
                  }
                  @keyframes orbFloat2 {
                    0%, 100% { transform: translate(0, 0) scale(1.1); opacity: 0.85; }
                    25% { transform: translate(-18px, 8px) scale(0.95); opacity: 1; }
                    50% { transform: translate(12px, -15px) scale(1.25); opacity: 0.9; }
                    75% { transform: translate(-5px, 12px) scale(1); opacity: 0.95; }
                  }
                  @keyframes orbFloat3 {
                    0%, 100% { transform: translate(0, 0) scale(0.95); opacity: 0.9; }
                    33% { transform: translate(10px, 15px) scale(1.15); opacity: 1; }
                    66% { transform: translate(-15px, -10px) scale(1.05); opacity: 0.85; }
                  }
                  @keyframes innerGlow {
                    0%, 100% { opacity: 0.6; transform: scale(1); }
                    50% { opacity: 0.9; transform: scale(1.1); }
                  }
                  @keyframes shimmer {
                    0% { transform: rotate(0deg); opacity: 0.5; }
                    50% { opacity: 0.8; }
                    100% { transform: rotate(360deg); opacity: 0.5; }
                  }
                  .vibe-sphere {
                    animation: vibeFlow 12s ease-in-out infinite, auraGlow 6s ease-in-out infinite;
                    background-size: 300% 300%;
                  }
                  .orb-1 { animation: orbFloat1 8s ease-in-out infinite; }
                  .orb-2 { animation: orbFloat2 10s ease-in-out infinite; }
                  .orb-3 { animation: orbFloat3 7s ease-in-out infinite; }
                  .inner-glow { animation: innerGlow 4s ease-in-out infinite; }
                  .shimmer-ring { animation: shimmer 20s linear infinite; }
                `}</style>
                <div 
                  className="absolute inset-0 rounded-full sphere-main vibe-sphere overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 20%, #f093fb 40%, #f5576c 60%, #4facfe 80%, #667eea 100%)',
                    backgroundSize: '300% 300%',
                    border: '1.5px solid rgba(255, 255, 255, 0.3)',
                    zIndex: 10,
                  }}
                >
                  {/* Shimmer ring */}
                  <div 
                    className="absolute inset-[-10%] shimmer-ring pointer-events-none"
                    style={{
                      background: 'conic-gradient(from 0deg, transparent 0%, rgba(255, 255, 255, 0.4) 10%, transparent 20%, transparent 50%, rgba(255, 255, 255, 0.3) 60%, transparent 70%)',
                      borderRadius: '50%',
                      filter: 'blur(2px)',
                    }}
                  />
                  {/* Dreamy inner layer */}
                  <div 
                    className="absolute inset-[15%] rounded-full inner-glow pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.5) 0%, rgba(240, 147, 251, 0.3) 40%, rgba(102, 126, 234, 0.2) 70%, transparent 100%)',
                      filter: 'blur(4px)',
                    }}
                  />
                  {/* Orb 1 - Lavender/Pink */}
                  <div 
                    className="absolute orb-1 rounded-full pointer-events-none"
                    style={{
                      width: '20px',
                      height: '20px',
                      top: '25%',
                      left: '20%',
                      background: 'radial-gradient(circle, rgba(240, 147, 251, 0.95) 0%, rgba(245, 87, 108, 0.6) 50%, transparent 80%)',
                      boxShadow: '0 0 15px rgba(240, 147, 251, 0.8)',
                      filter: 'blur(2px)',
                    }}
                  />
                  {/* Orb 2 - Blue/Purple */}
                  <div 
                    className="absolute orb-2 rounded-full pointer-events-none"
                    style={{
                      width: '18px',
                      height: '18px',
                      top: '55%',
                      left: '60%',
                      background: 'radial-gradient(circle, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.6) 50%, transparent 80%)',
                      boxShadow: '0 0 15px rgba(102, 126, 234, 0.8)',
                      filter: 'blur(2px)',
                    }}
                  />
                  {/* Orb 3 - Coral/Peach */}
                  <div 
                    className="absolute orb-3 rounded-full pointer-events-none"
                    style={{
                      width: '16px',
                      height: '16px',
                      top: '65%',
                      left: '25%',
                      background: 'radial-gradient(circle, rgba(79, 172, 254, 0.9) 0%, rgba(102, 126, 234, 0.5) 50%, transparent 80%)',
                      boxShadow: '0 0 15px rgba(79, 172, 254, 0.8)',
                      filter: 'blur(2px)',
                    }}
                  />
                  {/* Soft highlight - top left */}
                  <div 
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: '12px',
                      height: '12px',
                      top: '15%',
                      left: '20%',
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.4) 60%, transparent 100%)',
                      boxShadow: '0 0 10px rgba(255, 255, 255, 0.9)',
                    }}
                  />
                  {/* Secondary highlight */}
                  <div 
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: '6px',
                      height: '6px',
                      top: '28%',
                      left: '35%',
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 100%)',
                      boxShadow: '0 0 6px rgba(255, 255, 255, 0.7)',
                    }}
                  />
                </div>
                {/* Inner Highlight - White/Cyan */}
                <div 
                  className="absolute inset-[18%] rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 40% 40%, rgba(255, 255, 255, 0.9) 0%, rgba(76, 239, 255, 0.5) 50%, transparent 100%)',
                    filter: 'blur(4px)',
                  }}
                />
                
                {/* Premium Entry/Exit Sparkles */}
                <style>{`
                  @keyframes sparkle1 {
                    0%, 2% { opacity: 0; transform: translate(0, 0) scale(0); }
                    2.2% { opacity: 1; transform: translate(-30px, -20px) scale(1.2); }
                    3% { opacity: 0; transform: translate(-50px, -35px) scale(0); }
                    90%, 91% { opacity: 0; transform: translate(0, 0) scale(0); }
                    92% { opacity: 1; transform: translate(-25px, -30px) scale(1); }
                    94% { opacity: 0; transform: translate(-60px, -70px) scale(0); }
                    94.01%, 100% { opacity: 0; }
                  }
                  @keyframes sparkle2 {
                    0%, 1.8% { opacity: 0; transform: translate(0, 0) scale(0); }
                    2% { opacity: 1; transform: translate(25px, -25px) scale(1); }
                    2.8% { opacity: 0; transform: translate(45px, -50px) scale(0); }
                    90%, 91.5% { opacity: 0; transform: translate(0, 0) scale(0); }
                    92.5% { opacity: 1; transform: translate(30px, -20px) scale(1.1); }
                    94.5% { opacity: 0; transform: translate(70px, -60px) scale(0); }
                    94.51%, 100% { opacity: 0; }
                  }
                  @keyframes sparkle3 {
                    0%, 2.2% { opacity: 0; transform: translate(0, 0) scale(0); }
                    2.4% { opacity: 1; transform: translate(-20px, 20px) scale(0.9); }
                    3.2% { opacity: 0; transform: translate(-40px, 40px) scale(0); }
                    90%, 92% { opacity: 0; transform: translate(0, 0) scale(0); }
                    93% { opacity: 1; transform: translate(-35px, 15px) scale(1.2); }
                    95% { opacity: 0; transform: translate(-80px, 50px) scale(0); }
                    95.01%, 100% { opacity: 0; }
                  }
                  @keyframes sparkle4 {
                    0%, 1.5% { opacity: 0; transform: translate(0, 0) scale(0); }
                    1.8% { opacity: 1; transform: translate(15px, 25px) scale(1.1); }
                    2.6% { opacity: 0; transform: translate(35px, 55px) scale(0); }
                    90%, 91.8% { opacity: 0; transform: translate(0, 0) scale(0); }
                    92.8% { opacity: 1; transform: translate(20px, 30px) scale(0.9); }
                    94.8% { opacity: 0; transform: translate(55px, 80px) scale(0); }
                    94.81%, 100% { opacity: 0; }
                  }
                  @keyframes sparkle5 {
                    0%, 2.5% { opacity: 0; transform: translate(0, 0) scale(0) rotate(0deg); }
                    2.7% { opacity: 1; transform: translate(0, -30px) scale(1.3) rotate(45deg); }
                    3.5% { opacity: 0; transform: translate(0, -60px) scale(0) rotate(90deg); }
                    90%, 92.2% { opacity: 0; transform: translate(0, 0) scale(0) rotate(0deg); }
                    93.2% { opacity: 1; transform: translate(0, -25px) scale(1.4) rotate(45deg); }
                    95.2% { opacity: 0; transform: translate(0, -90px) scale(0) rotate(180deg); }
                    95.21%, 100% { opacity: 0; }
                  }
                  .entry-sparkle-1 { animation: sparkle1 22s ease-out infinite; }
                  .entry-sparkle-2 { animation: sparkle2 22s ease-out infinite; }
                  .entry-sparkle-3 { animation: sparkle3 22s ease-out infinite; }
                  .entry-sparkle-4 { animation: sparkle4 22s ease-out infinite; }
                  .entry-sparkle-5 { animation: sparkle5 22s ease-out infinite; }
                `}</style>
                {/* Sparkle 1 */}
                <div className="absolute entry-sparkle-1 pointer-events-none" style={{
                  top: '50%', left: '50%', width: '8px', height: '8px',
                  background: 'radial-gradient(circle, #fff 0%, #ff6b9d 50%, transparent 100%)',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #fff, 0 0 20px #ff6b9d',
                }} />
                {/* Sparkle 2 */}
                <div className="absolute entry-sparkle-2 pointer-events-none" style={{
                  top: '50%', left: '50%', width: '6px', height: '6px',
                  background: 'radial-gradient(circle, #fff 0%, #4cc9f0 50%, transparent 100%)',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #fff, 0 0 20px #4cc9f0',
                }} />
                {/* Sparkle 3 */}
                <div className="absolute entry-sparkle-3 pointer-events-none" style={{
                  top: '50%', left: '50%', width: '7px', height: '7px',
                  background: 'radial-gradient(circle, #fff 0%, #80ed99 50%, transparent 100%)',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #fff, 0 0 20px #80ed99',
                }} />
                {/* Sparkle 4 */}
                <div className="absolute entry-sparkle-4 pointer-events-none" style={{
                  top: '50%', left: '50%', width: '5px', height: '5px',
                  background: 'radial-gradient(circle, #fff 0%, #f9c74f 50%, transparent 100%)',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #fff, 0 0 20px #f9c74f',
                }} />
                {/* Sparkle 5 - Star shape */}
                <div className="absolute entry-sparkle-5 pointer-events-none" style={{
                  top: '50%', left: '50%', width: '10px', height: '10px',
                  background: 'radial-gradient(circle, #fff 0%, #c44ce0 50%, transparent 100%)',
                  borderRadius: '50%',
                  boxShadow: '0 0 15px #fff, 0 0 30px #c44ce0, 0 0 45px #ff6b9d',
                }} />
                
                {/* Expressive Eyes - Emotions synced with messages (22s cycle) */}
                {/* Marcus's Speech Bubbles - Messages he says */}
                <style>{`
                  @keyframes msg1 {
                    /* Hi 👋 (0-14%) */
                    0% { opacity: 0; transform: translateY(8px) scale(0.8); }
                    1% { opacity: 1; transform: translateY(0) scale(1); }
                    2% { opacity: 1; transform: translateY(-2px) scale(1.02); }
                    3%, 12% { opacity: 1; transform: translateY(0) scale(1); }
                    14% { opacity: 0; transform: translateY(-5px) scale(0.95); }
                    14.01%, 100% { opacity: 0; transform: translateY(8px) scale(0.8); }
                  }
                  @keyframes msg2 {
                    /* Hope you're good 😊 (18-32%) */
                    0%, 17% { opacity: 0; transform: translateY(8px) scale(0.8); }
                    18% { opacity: 1; transform: translateY(0) scale(1); }
                    19% { opacity: 1; transform: translateY(-2px) scale(1.02); }
                    20%, 30% { opacity: 1; transform: translateY(0) scale(1); }
                    32% { opacity: 0; transform: translateY(-5px) scale(0.95); }
                    32.01%, 100% { opacity: 0; transform: translateY(8px) scale(0.8); }
                  }
                  @keyframes msg3 {
                    /* I'm here to listen 👂 (36-50%) */
                    0%, 35% { opacity: 0; transform: translateY(8px) scale(0.8); }
                    36% { opacity: 1; transform: translateY(0) scale(1); }
                    37% { opacity: 1; transform: translateY(-2px) scale(1.02); }
                    38%, 48% { opacity: 1; transform: translateY(0) scale(1); }
                    50% { opacity: 0; transform: translateY(-5px) scale(0.95); }
                    50.01%, 100% { opacity: 0; transform: translateY(8px) scale(0.8); }
                  }
                  @keyframes msg4 {
                    /* I understand 🤝 (54-68%) */
                    0%, 53% { opacity: 0; transform: translateY(8px) scale(0.8); }
                    54% { opacity: 1; transform: translateY(0) scale(1); }
                    55% { opacity: 1; transform: translateY(-2px) scale(1.02); }
                    56%, 66% { opacity: 1; transform: translateY(0) scale(1); }
                    68% { opacity: 0; transform: translateY(-5px) scale(0.95); }
                    68.01%, 100% { opacity: 0; transform: translateY(8px) scale(0.8); }
                  }
                  @keyframes msg5 {
                    /* And take care of you 💙 (72-84%) */
                    0%, 71% { opacity: 0; transform: translateY(8px) scale(0.8); }
                    72% { opacity: 1; transform: translateY(0) scale(1); }
                    73% { opacity: 1; transform: translateY(-2px) scale(1.02); }
                    74%, 82% { opacity: 1; transform: translateY(0) scale(1); }
                    84% { opacity: 0; transform: translateY(-5px) scale(0.95); }
                    84.01%, 100% { opacity: 0; transform: translateY(8px) scale(0.8); }
                  }
                  @keyframes msg6 {
                    /* Bye 👋 (86-96%) - Long goodbye */
                    0%, 85% { opacity: 0; transform: translateY(8px) scale(0.8); }
                    86% { opacity: 1; transform: translateY(0) scale(1); }
                    87% { opacity: 1; transform: translateY(-2px) scale(1.02); }
                    88%, 94% { opacity: 1; transform: translateY(0) scale(1); }
                    96% { opacity: 0; transform: translateY(-5px) scale(0.95); }
                    96.01%, 100% { opacity: 0; transform: translateY(8px) scale(0.8); }
                  }
                  .msg-1 { animation: msg1 22s ease-in-out infinite; animation-fill-mode: both; }
                  .msg-2 { animation: msg2 22s ease-in-out infinite; animation-fill-mode: both; }
                  .msg-3 { animation: msg3 22s ease-in-out infinite; animation-fill-mode: both; }
                  .msg-4 { animation: msg4 22s ease-in-out infinite; animation-fill-mode: both; }
                  .msg-5 { animation: msg5 22s ease-in-out infinite; animation-fill-mode: both; }
                  .msg-6 { animation: msg6 22s ease-in-out infinite; animation-fill-mode: both; }
                `}</style>
                {/* Message 1: Hi */}
                <div 
                  className="absolute right-0 -top-12 msg-1 pointer-events-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(76, 239, 255, 0.3), 0 2px 6px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(76, 239, 255, 0.4)',
                    overflow: 'visible',
                  }}
                >
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '12px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                    Hi 👋
                  </span>
                  <div className="absolute -bottom-1.5 left-3" style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.95)', transform: 'rotate(45deg)', borderRight: '1px solid rgba(76, 239, 255, 0.4)', borderBottom: '1px solid rgba(76, 239, 255, 0.4)' }} />
                </div>
                {/* Message 2: Hope you're good */}
                <div 
                  className="absolute -right-8 -top-12 msg-2 pointer-events-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(76, 239, 255, 0.3), 0 2px 6px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(76, 239, 255, 0.4)',
                  }}
                >
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                    Hope you're good 😊
                  </span>
                  <div className="absolute -bottom-1.5 left-3" style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.95)', transform: 'rotate(45deg)', borderRight: '1px solid rgba(76, 239, 255, 0.4)', borderBottom: '1px solid rgba(76, 239, 255, 0.4)' }} />
                </div>
                {/* Message 3: I'm here to listen */}
                <div 
                  className="absolute -right-10 -top-12 msg-3 pointer-events-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(76, 239, 255, 0.3), 0 2px 6px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(76, 239, 255, 0.4)',
                  }}
                >
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                    I'm here to listen 👂
                  </span>
                  <div className="absolute -bottom-1.5 left-3" style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.95)', transform: 'rotate(45deg)', borderRight: '1px solid rgba(76, 239, 255, 0.4)', borderBottom: '1px solid rgba(76, 239, 255, 0.4)' }} />
                </div>
                {/* Message 4: I understand */}
                <div 
                  className="absolute -right-4 -top-12 msg-4 pointer-events-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(76, 239, 255, 0.3), 0 2px 6px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(76, 239, 255, 0.4)',
                  }}
                >
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                    Understand 🤝
                  </span>
                  <div className="absolute -bottom-1.5 left-3" style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.95)', transform: 'rotate(45deg)', borderRight: '1px solid rgba(76, 239, 255, 0.4)', borderBottom: '1px solid rgba(76, 239, 255, 0.4)' }} />
                </div>
                {/* Message 5: And take care of you */}
                <div 
                  className="absolute -right-12 -top-12 msg-5 pointer-events-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '6px 10px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(76, 239, 255, 0.3), 0 2px 6px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(76, 239, 255, 0.4)',
                  }}
                >
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '11px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                    And take care of you 💙
                  </span>
                  <div className="absolute -bottom-1.5 left-3" style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.95)', transform: 'rotate(45deg)', borderRight: '1px solid rgba(76, 239, 255, 0.4)', borderBottom: '1px solid rgba(76, 239, 255, 0.4)' }} />
                </div>
                {/* Message 6: Bye - Long goodbye */}
                <div 
                  className="absolute -right-6 -top-12 msg-6 pointer-events-none"
                  style={{
                    background: 'rgba(255, 255, 255, 0.95)',
                    padding: '6px 12px',
                    borderRadius: '12px',
                    boxShadow: '0 4px 12px rgba(76, 239, 255, 0.3), 0 2px 6px rgba(0,0,0,0.1)',
                    border: '1px solid rgba(76, 239, 255, 0.4)',
                  }}
                >
                  <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: '12px', fontWeight: '600', color: '#1a1a1a', whiteSpace: 'nowrap' }}>
                    Byeee 👋💫
                  </span>
                  <div className="absolute -bottom-1.5 left-3" style={{ width: '8px', height: '8px', background: 'rgba(255, 255, 255, 0.95)', transform: 'rotate(45deg)', borderRight: '1px solid rgba(76, 239, 255, 0.4)', borderBottom: '1px solid rgba(76, 239, 255, 0.4)' }} />
                </div>
                </div>{/* End Marcus (floating-sphere-container) */}
              </div>
            </div>
          </div>

          {/* Right Column - Description */}
          <div className="flex justify-center lg:justify-end items-end h-full lg:pt-16">
            <p 
              key={`desc-${activeLabel}`}
              className="font-['Poppins'] text-lg leading-relaxed text-gray-600 max-w-[310px] transition-opacity duration-300"
              style={{ transform: 'translateZ(0)' }}
            >
              {activeLabel === 'neuai' 
                ? 'Removing barriers to healthcare with intelligent systems'
                : 'Missed checkups. Missed chances. Because timely medical advice shouldn\'t be a luxury.'}
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="flex flex-col items-center justify-center lg:grid lg:grid-cols-3 gap-3">
          <style>{`
            .card-transition {
              animation: fadeInScale 0.4s ease-out forwards;
              transform: translateZ(0);
            }
            .card-transition-delay-1 {
              animation-delay: 0.05s;
              opacity: 0;
            }
            .card-transition-delay-2 {
              animation-delay: 0.1s;
              opacity: 0;
            }
            .card-transition-delay-3 {
              animation-delay: 0.15s;
              opacity: 0;
            }
            @keyframes fadeInScale {
              from {
                opacity: 0;
                transform: scale(0.98) translateZ(0);
              }
              to {
                opacity: 1;
                transform: scale(1) translateZ(0);
              }
            }
            /* Disable parallax on mobile/touch devices */
            @media (max-width: 1024px), (hover: none), (pointer: coarse) {
              [style*="translate("] {
                transform: translate(0, 0) !important;
              }
            }
          `}</style>
          {activeLabel === 'features' ? (
            <>
              {/* Features Mode - Left Card */}
              <div className="w-full max-w-[360px] card-transition card-transition-delay-1">
                <MagneticButton 
                  className="bg-neutral-100 border border-zinc-300/0 rounded-3xl space-y-5 p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)] transition-shadow duration-300 cursor-pointer"
                >
                  <h3 className="text-gray-800 text-xl font-normal font-['Poppins'] mb-30">
                    Doctor & Test Direction
                  </h3>

                  <div className="flex items-end justify-between">
                    <div className="flex-1"></div>
                    <button
                      onClick={onButtonClick}
                      className="inline-flex items-center text-gray-800 text-sm font-['Poppins']">
                      <span>Learn more</span>
                      <div className="ml-2 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-800">
                          <path d="M3 6L9 6M6 3L9 6L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </MagneticButton>
              </div>

              {/* Features Mode - Center */}
              <div className="w-full max-w-[360px] space-y-6 card-transition card-transition-delay-2">
                {/* Feature Image - Neomorphism */}
                <MagneticButton 
                  className="w-full h-64 rounded-3xl overflow-hidden bg-neutral-100 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)] transition-shadow duration-300 cursor-pointer"
                >
                  <img
                    src="landing-page/feature-card-bg.png"
                    alt="AI Technology Visualization"
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    fetchpriority="low"
                  />
                </MagneticButton>

                {/* Smart Health Guidance Card - Neomorphism */}
                <MagneticButton 
                  className="bg-neutral-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)] transition-shadow duration-300 cursor-pointer"
                >
                  <div className="space-y-5">
                    <h3 className="text-gray-800 text-xl font-normal font-['Poppins'] leading-tight mb-30">
                      Symptom Understanding
                    </h3>

                    <div className="flex items-end justify-between">
                      <div className="flex-1"></div>
                      <button
                        onClick={onButtonClick}
                        className="inline-flex items-center text-gray-800 text-sm font-['Poppins']">
                        <span>Learn more</span>
                        <div className="ml-2 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-800">
                            <path d="M3 6L9 6M6 3L9 6L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </MagneticButton>
              </div>

              {/* Features Mode - Right Card */}
              <div className="w-full max-w-[360px] card-transition card-transition-delay-3">
                <MagneticButton 
                  className="bg-neutral-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)] transition-shadow duration-300 cursor-pointer"
                >
                <div className="space-y-5">
                  <h3 className="text-gray-800 text-xl font-normal font-['Poppins'] leading-tight mb-30">
                    Smart Health Guidance
                  </h3>

                  <div className="flex items-end justify-between">
                    <div className="flex-1"></div>
                    <button
                      onClick={onButtonClick}
                      className="inline-flex items-center text-gray-800 text-sm font-['Poppins']">
                      <span>Learn more</span>
                      <div className="ml-2 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-800">
                          <path d="M3 6L9 6M6 3L9 6L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
                </MagneticButton>
              </div>
            </>
          ) : (
            <>
              {/* Buddy Ai Mode - Different Content */}
              <div className="w-full max-w-[360px] card-transition card-transition-delay-1">
                <MagneticButton 
                  className="bg-neutral-100 border border-zinc-300/0 rounded-3xl space-y-5 p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)] transition-shadow duration-300 cursor-pointer"
                >
                  <h3 className="text-gray-800 text-xl font-normal font-['Poppins'] mb-30">
                    Listens Without Judgement
                  </h3>

                  <div className="flex items-end justify-between">
                    <div className="flex-1"></div>
                    <button
                      onClick={onButtonClick}
                      className="inline-flex items-center text-gray-800 text-sm font-['Poppins']">
                      <span>Learn more</span>
                      <div className="ml-2 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-800">
                          <path d="M3 6L9 6M6 3L9 6L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </MagneticButton>
              </div>

              {/* Buddy Ai Mode - Center */}
              <div className="w-full max-w-[360px] space-y-6 card-transition card-transition-delay-2">
                {/* Buddy Ai Center Card - Top (replacing image) */}
                <MagneticButton 
                  className="bg-neutral-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)] transition-shadow duration-300 cursor-pointer"
                >
                  <div className="space-y-5">
                    <h3 className="text-gray-800 text-xl font-normal font-['Poppins'] leading-tight mb-30">
                      Explaining issues Clearly
                    </h3>

                    <div className="flex items-end justify-between">
                      <div className="flex-1"></div>
                      <button
                        onClick={onButtonClick}
                        className="inline-flex items-center text-gray-800 text-sm font-['Poppins']">
                        <span>Learn more</span>
                        <div className="ml-2 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-800">
                            <path d="M3 6L9 6M6 3L9 6L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </MagneticButton>

                {/* Buddy Ai Center Card - Bottom */}
                <MagneticButton 
                  className="bg-neutral-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)] transition-shadow duration-300 cursor-pointer"
                >
                  <div className="space-y-5">
                    <h3 className="text-gray-800 text-xl font-normal font-['Poppins'] leading-tight mb-30">
                      Gentle, Thoughtful Guidance
                    </h3>

                    <div className="flex items-end justify-between">
                      <div className="flex-1"></div>
                      <button
                        onClick={onButtonClick}
                        className="inline-flex items-center text-gray-800 text-sm font-['Poppins']">
                        <span>Learn more</span>
                        <div className="ml-2 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)]">
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-800">
                            <path d="M3 6L9 6M6 3L9 6L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </MagneticButton>
              </div>

              {/* Buddy Ai Mode - Right Card */}
              <div className="w-full max-w-[360px] card-transition card-transition-delay-3">
                <MagneticButton 
                  className="bg-neutral-100 rounded-3xl p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)] transition-shadow duration-300 cursor-pointer"
                >
                <div className="space-y-5">
                  <h3 className="text-gray-800 text-xl font-normal font-['Poppins'] leading-tight mb-30">
                    Care, You Can Trust
                  </h3>

                  <div className="flex items-end justify-between">
                    <div className="flex-1"></div>
                    <button
                      onClick={onButtonClick}
                      className="inline-flex items-center text-gray-800 text-sm font-['Poppins']">
                      <span>Learn more</span>
                      <div className="ml-2 w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center shadow-[3px_3px_6px_rgba(163,177,198,0.4),-3px_-3px_6px_rgba(255,255,255,0.8)]">
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-gray-800">
                          <path d="M3 6L9 6M6 3L9 6L6 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>
                </MagneticButton>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default memo(FeaturesSection);

