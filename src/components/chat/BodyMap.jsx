import React, { useState, useRef, useEffect, useCallback } from 'react';

const BodyMap = ({ onSymptomSelect, onSendToChatbot, selectedSymptoms = [] }) => {
  const [rotation, setRotation] = useState(0); // 0 = front, 90 = right, 180 = back, 270 = left
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, rotation: 0 });
  const [hoveredRegion, setHoveredRegion] = useState(null);
  const containerRef = useRef(null);

  // Define body regions for each view
  const bodyRegions = {
    front: {
      head: { x: 240, y: 100, width: 80, height: 100, label: 'Head', anatomical: 'Cephalic region' },
      forehead: { x: 240, y: 60, width: 60, height: 30, label: 'Forehead', anatomical: 'Frontal region' },
      leftEye: { x: 220, y: 90, width: 20, height: 15, label: 'Left Eye', anatomical: 'Left orbital region' },
      rightEye: { x: 260, y: 90, width: 20, height: 15, label: 'Right Eye', anatomical: 'Right orbital region' },
      nose: { x: 240, y: 105, width: 20, height: 25, label: 'Nose', anatomical: 'Nasal region' },
      mouth: { x: 240, y: 130, width: 30, height: 15, label: 'Mouth', anatomical: 'Oral region' },
      neck: { x: 240, y: 150, width: 60, height: 40, label: 'Neck', anatomical: 'Cervical region' },
      leftShoulder: { x: 190, y: 190, width: 40, height: 30, label: 'Left Shoulder', anatomical: 'Left acromial region' },
      rightShoulder: { x: 290, y: 190, width: 40, height: 30, label: 'Right Shoulder', anatomical: 'Right acromial region' },
      chest: { x: 240, y: 270, width: 120, height: 100, label: 'Chest', anatomical: 'Thoracic region' },
      leftBreast: { x: 200, y: 240, width: 30, height: 40, label: 'Left Breast', anatomical: 'Left mammary region' },
      rightBreast: { x: 250, y: 240, width: 30, height: 40, label: 'Right Breast', anatomical: 'Right mammary region' },
      abdomen: { x: 240, y: 370, width: 100, height: 100, label: 'Abdomen', anatomical: 'Abdominal region' },
      leftArm: { x: 125, y: 265, width: 50, height: 150, label: 'Left Arm', anatomical: 'Left upper limb' },
      rightArm: { x: 355, y: 265, width: 50, height: 150, label: 'Right Arm', anatomical: 'Right upper limb' },
      leftHand: { x: 115, y: 415, width: 30, height: 40, label: 'Left Hand', anatomical: 'Left hand region' },
      rightHand: { x: 385, y: 415, width: 30, height: 40, label: 'Right Hand', anatomical: 'Right hand region' },
      leftLeg: { x: 220, y: 470, width: 40, height: 150, label: 'Left Leg', anatomical: 'Left lower limb' },
      rightLeg: { x: 260, y: 470, width: 40, height: 150, label: 'Right Leg', anatomical: 'Right lower limb' },
      leftFoot: { x: 215, y: 620, width: 30, height: 30, label: 'Left Foot', anatomical: 'Left foot region' },
      rightFoot: { x: 275, y: 620, width: 30, height: 30, label: 'Right Foot', anatomical: 'Right foot region' },
    },
    back: {
      head: { x: 240, y: 100, width: 80, height: 100, label: 'Head (Back)', anatomical: 'Occipital region' },
      neck: { x: 240, y: 150, width: 60, height: 40, label: 'Neck (Back)', anatomical: 'Posterior cervical region' },
      leftShoulder: { x: 190, y: 190, width: 40, height: 30, label: 'Left Shoulder (Back)', anatomical: 'Left posterior shoulder' },
      rightShoulder: { x: 290, y: 190, width: 40, height: 30, label: 'Right Shoulder (Back)', anatomical: 'Right posterior shoulder' },
      upperBack: { x: 240, y: 240, width: 120, height: 100, label: 'Upper Back', anatomical: 'Thoracic spine region' },
      lowerBack: { x: 240, y: 340, width: 100, height: 100, label: 'Lower Back', anatomical: 'Lumbar region' },
      leftArm: { x: 125, y: 265, width: 50, height: 150, label: 'Left Arm (Back)', anatomical: 'Left posterior upper limb' },
      rightArm: { x: 355, y: 265, width: 50, height: 150, label: 'Right Arm (Back)', anatomical: 'Right posterior upper limb' },
      leftHand: { x: 115, y: 415, width: 30, height: 40, label: 'Left Hand (Back)', anatomical: 'Left posterior hand' },
      rightHand: { x: 385, y: 415, width: 30, height: 40, label: 'Right Hand (Back)', anatomical: 'Right posterior hand' },
      leftLeg: { x: 220, y: 440, width: 40, height: 150, label: 'Left Leg (Back)', anatomical: 'Left posterior lower limb' },
      rightLeg: { x: 260, y: 440, width: 40, height: 150, label: 'Right Leg (Back)', anatomical: 'Right posterior lower limb' },
      leftFoot: { x: 215, y: 590, width: 30, height: 30, label: 'Left Foot (Back)', anatomical: 'Left posterior foot' },
      rightFoot: { x: 275, y: 590, width: 30, height: 30, label: 'Right Foot (Back)', anatomical: 'Right posterior foot' },
    },
    left: {
      head: { x: 240, y: 100, width: 80, height: 100, label: 'Head (Left Side)', anatomical: 'Left lateral head' },
      neck: { x: 240, y: 150, width: 60, height: 40, label: 'Neck (Left Side)', anatomical: 'Left lateral neck' },
      leftShoulder: { x: 190, y: 190, width: 40, height: 30, label: 'Left Shoulder (Side)', anatomical: 'Left lateral shoulder' },
      leftArm: { x: 125, y: 265, width: 50, height: 150, label: 'Left Arm (Side)', anatomical: 'Left lateral upper limb' },
      torso: { x: 240, y: 270, width: 120, height: 220, label: 'Torso (Left Side)', anatomical: 'Left lateral torso' },
      leftLeg: { x: 220, y: 490, width: 40, height: 150, label: 'Left Leg (Side)', anatomical: 'Left lateral lower limb' },
      leftFoot: { x: 215, y: 640, width: 30, height: 30, label: 'Left Foot (Side)', anatomical: 'Left lateral foot' },
    },
    right: {
      head: { x: 240, y: 100, width: 80, height: 100, label: 'Head (Right Side)', anatomical: 'Right lateral head' },
      neck: { x: 240, y: 150, width: 60, height: 40, label: 'Neck (Right Side)', anatomical: 'Right lateral neck' },
      rightShoulder: { x: 290, y: 190, width: 40, height: 30, label: 'Right Shoulder (Side)', anatomical: 'Right lateral shoulder' },
      rightArm: { x: 355, y: 265, width: 50, height: 150, label: 'Right Arm (Side)', anatomical: 'Right lateral upper limb' },
      torso: { x: 240, y: 270, width: 120, height: 220, label: 'Torso (Right Side)', anatomical: 'Right lateral torso' },
      rightLeg: { x: 260, y: 490, width: 40, height: 150, label: 'Right Leg (Side)', anatomical: 'Right lateral lower limb' },
      rightFoot: { x: 275, y: 640, width: 30, height: 30, label: 'Right Foot (Side)', anatomical: 'Right lateral foot' },
    }
  };

  // Get current view based on rotation
  const getCurrentView = () => {
    const normalizedRotation = ((rotation % 360) + 360) % 360;
    if (normalizedRotation >= 315 || normalizedRotation < 45) return 'front';
    if (normalizedRotation >= 45 && normalizedRotation < 135) return 'right';
    if (normalizedRotation >= 135 && normalizedRotation < 225) return 'back';
    return 'left';
  };

  const currentView = getCurrentView();
  const currentRegions = bodyRegions[currentView];

  // Handle mouse drag for rotation
  const handleMouseDown = useCallback((e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      rotation: rotation
    });
  }, [rotation]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragStart.x;
    const sensitivity = 0.5; // Adjust rotation sensitivity
    const newRotation = dragStart.rotation + (deltaX * sensitivity);
    setRotation(newRotation);
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle touch events for mobile
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX,
        rotation: rotation
      });
    }
  }, [rotation]);

  const handleTouchMove = useCallback((e) => {
    if (!isDragging || e.touches.length !== 1) return;
    
    const deltaX = e.touches[0].clientX - dragStart.x;
    const sensitivity = 0.5;
    const newRotation = dragStart.rotation + (deltaX * sensitivity);
    setRotation(newRotation);
  }, [isDragging, dragStart]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  // Handle region click
  const handleRegionClick = useCallback((regionKey, e) => {
    e.stopPropagation();
    const region = currentRegions[regionKey];
    if (!region) return;

    const symptom = {
      region: regionKey,
      label: region.label,
      anatomical: region.anatomical,
      view: currentView,
      rotation: rotation,
      id: `${currentView}-${regionKey}-${Date.now()}`,
      coordinates: { x: region.x, y: region.y }
    };

    // Add to selected symptoms
    if (onSymptomSelect) {
      onSymptomSelect(symptom);
    }

    // Automatically send to chatbot
    if (onSendToChatbot) {
      const message = `I'm experiencing symptoms in my ${region.label.toLowerCase()} (${region.anatomical}).`;
      onSendToChatbot(message, symptom);
    }
  }, [currentView, currentRegions, rotation, onSymptomSelect, onSendToChatbot]);

  const isSelected = (regionKey) => {
    return selectedSymptoms.some(s => s.region === regionKey && s.view === currentView);
  };

  // Quick rotation buttons
  const rotateToView = (targetRotation) => {
    setRotation(targetRotation);
  };

  // Render body parts for front view
  const renderFrontView = () => {
    const regions = bodyRegions.front;
    return (
      <>
        {/* Head */}
        <ellipse
          cx={regions.head.x}
          cy={regions.head.y}
          rx="40"
          ry="50"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
          className={`body-region ${
            hoveredRegion === 'head' ? 'fill-indigo-100 stroke-indigo-400' : ''
          } ${isSelected('head') ? 'fill-indigo-200 stroke-indigo-500' : ''}`}
          onClick={(e) => handleRegionClick('head', e)}
          onMouseEnter={() => setHoveredRegion('head')}
          onMouseLeave={() => setHoveredRegion(null)}
        />
        {/* Neck */}
        <rect
          x={regions.neck.x - 30}
          y={regions.neck.y}
          width="60"
          height="40"
          rx="5"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
          className={`body-region ${
            hoveredRegion === 'neck' ? 'fill-indigo-100 stroke-indigo-400' : ''
          } ${isSelected('neck') ? 'fill-indigo-200 stroke-indigo-500' : ''}`}
          onClick={(e) => handleRegionClick('neck', e)}
          onMouseEnter={() => setHoveredRegion('neck')}
          onMouseLeave={() => setHoveredRegion(null)}
        />
        {/* Chest */}
        <ellipse
          cx={regions.chest.x}
          cy={regions.chest.y}
          rx="60"
          ry="50"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
          className={`body-region ${
            hoveredRegion === 'chest' ? 'fill-indigo-100 stroke-indigo-400' : ''
          } ${isSelected('chest') ? 'fill-indigo-200 stroke-indigo-500' : ''}`}
          onClick={(e) => handleRegionClick('chest', e)}
          onMouseEnter={() => setHoveredRegion('chest')}
          onMouseLeave={() => setHoveredRegion(null)}
        />
        {/* Abdomen */}
        <ellipse
          cx={regions.abdomen.x}
          cy={regions.abdomen.y}
          rx="50"
          ry="50"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
          className={`body-region ${
            hoveredRegion === 'abdomen' ? 'fill-indigo-100 stroke-indigo-400' : ''
          } ${isSelected('abdomen') ? 'fill-indigo-200 stroke-indigo-500' : ''}`}
          onClick={(e) => handleRegionClick('abdomen', e)}
          onMouseEnter={() => setHoveredRegion('abdomen')}
          onMouseLeave={() => setHoveredRegion(null)}
        />
        {/* Left Arm */}
        <ellipse
          cx={regions.leftArm.x}
          cy={regions.leftArm.y}
          rx="25"
          ry="75"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
          className={`body-region ${
            hoveredRegion === 'leftArm' ? 'fill-indigo-100 stroke-indigo-400' : ''
          } ${isSelected('leftArm') ? 'fill-indigo-200 stroke-indigo-500' : ''}`}
          onClick={(e) => handleRegionClick('leftArm', e)}
          onMouseEnter={() => setHoveredRegion('leftArm')}
          onMouseLeave={() => setHoveredRegion(null)}
        />
        {/* Right Arm */}
        <ellipse
          cx={regions.rightArm.x}
          cy={regions.rightArm.y}
          rx="25"
          ry="75"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
          className={`body-region ${
            hoveredRegion === 'rightArm' ? 'fill-indigo-100 stroke-indigo-400' : ''
          } ${isSelected('rightArm') ? 'fill-indigo-200 stroke-indigo-500' : ''}`}
          onClick={(e) => handleRegionClick('rightArm', e)}
          onMouseEnter={() => setHoveredRegion('rightArm')}
          onMouseLeave={() => setHoveredRegion(null)}
        />
        {/* Left Leg */}
        <ellipse
          cx={regions.leftLeg.x}
          cy={regions.leftLeg.y}
          rx="20"
          ry="75"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
          className={`body-region ${
            hoveredRegion === 'leftLeg' ? 'fill-indigo-100 stroke-indigo-400' : ''
          } ${isSelected('leftLeg') ? 'fill-indigo-200 stroke-indigo-500' : ''}`}
          onClick={(e) => handleRegionClick('leftLeg', e)}
          onMouseEnter={() => setHoveredRegion('leftLeg')}
          onMouseLeave={() => setHoveredRegion(null)}
        />
        {/* Right Leg */}
        <ellipse
          cx={regions.rightLeg.x}
          cy={regions.rightLeg.y}
          rx="20"
          ry="75"
          fill="#f3f4f6"
          stroke="#d1d5db"
          strokeWidth="2"
          className={`body-region ${
            hoveredRegion === 'rightLeg' ? 'fill-indigo-100 stroke-indigo-400' : ''
          } ${isSelected('rightLeg') ? 'fill-indigo-200 stroke-indigo-500' : ''}`}
          onClick={(e) => handleRegionClick('rightLeg', e)}
          onMouseEnter={() => setHoveredRegion('rightLeg')}
          onMouseLeave={() => setHoveredRegion(null)}
        />
      </>
    );
  };

  // Render body parts for back view
  const renderBackView = () => {
    const regions = bodyRegions.back;
    return (
      <>
        <ellipse cx={regions.head.x} cy={regions.head.y} rx="40" ry="50" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <rect x={regions.neck.x - 30} y={regions.neck.y} width="60" height="40" rx="5" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <ellipse cx={regions.upperBack.x} cy={regions.upperBack.y} rx="60" ry="50" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <ellipse cx={regions.lowerBack.x} cy={regions.lowerBack.y} rx="50" ry="50" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <ellipse cx={regions.leftArm.x} cy={regions.leftArm.y} rx="25" ry="75" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <ellipse cx={regions.rightArm.x} cy={regions.rightArm.y} rx="25" ry="75" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <ellipse cx={regions.leftLeg.x} cy={regions.leftLeg.y} rx="20" ry="75" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <ellipse cx={regions.rightLeg.x} cy={regions.rightLeg.y} rx="20" ry="75" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
      </>
    );
  };

  // Render body parts for side views
  const renderSideView = () => {
    const regions = currentView === 'left' ? bodyRegions.left : bodyRegions.right;
    return (
      <>
        <ellipse cx={regions.head.x} cy={regions.head.y} rx="40" ry="50" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <rect x={regions.neck.x - 30} y={regions.neck.y} width="60" height="40" rx="5" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        <ellipse cx={regions.torso.x} cy={regions.torso.y} rx="60" ry="110" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        {currentView === 'left' ? (
          <ellipse cx={regions.leftArm.x} cy={regions.leftArm.y} rx="25" ry="75" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        ) : (
          <ellipse cx={regions.rightArm.x} cy={regions.rightArm.y} rx="25" ry="75" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        )}
        {currentView === 'left' ? (
          <ellipse cx={regions.leftLeg.x} cy={regions.leftLeg.y} rx="20" ry="75" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        ) : (
          <ellipse cx={regions.rightLeg.x} cy={regions.rightLeg.y} rx="20" ry="75" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="2" />
        )}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-2xl shadow-lg">
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }
        @keyframes ripple {
          0% { transform: scale(0); opacity: 1; }
          100% { transform: scale(4); opacity: 0; }
        }
        .body-region {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .body-region:hover {
          filter: brightness(1.1);
        }
        .body-container {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
        }
        .symptom-marker {
          animation: pulse 2s ease-in-out infinite;
        }
        .ripple-effect {
          animation: ripple 0.6s ease-out;
        }
      `}</style>

      {/* View Indicator and Quick Rotate Buttons */}
      <div className="flex items-center gap-4 w-full justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">View:</span>
          <span className="text-sm font-semibold text-indigo-600 capitalize">{currentView}</span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => rotateToView(0)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentView === 'front'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Front View"
          >
            Front
          </button>
          <button
            onClick={() => rotateToView(90)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentView === 'right'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Right Side"
          >
            Right
          </button>
          <button
            onClick={() => rotateToView(180)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentView === 'back'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Back View"
          >
            Back
          </button>
          <button
            onClick={() => rotateToView(270)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              currentView === 'left'
                ? 'bg-indigo-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title="Left Side"
          >
            Left
          </button>
        </div>
      </div>

      {/* Instructions */}
      <p className="text-xs text-gray-500 text-center">
        Drag horizontally to rotate • Click on body parts to mark symptoms
      </p>

      {/* Body Container with Rotation */}
      <div
        ref={containerRef}
        className="relative"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className="body-container"
          style={{
            transform: `perspective(1000px) rotateY(${rotation}deg)`,
            transformStyle: 'preserve-3d'
          }}
        >
          <svg
            width="480"
            height="650"
            viewBox="0 0 480 650"
            className="select-none"
          >
            {/* Body outline based on current view */}
            {currentView === 'front' && renderFrontView()}
            {currentView === 'back' && renderBackView()}
            {(currentView === 'left' || currentView === 'right') && renderSideView()}

            {/* Selected symptom markers with ripple effect */}
            {selectedSymptoms
              .filter(s => s.view === currentView)
              .map((symptom) => {
                const region = currentRegions[symptom.region];
                if (!region) return null;
                return (
                  <g key={symptom.id}>
                    {/* Ripple effect */}
                    <circle
                      cx={region.x}
                      cy={region.y}
                      r="15"
                      fill="#ef4444"
                      opacity="0.3"
                      className="ripple-effect"
                    />
                    {/* Main marker */}
                    <circle
                      cx={region.x}
                      cy={region.y}
                      r="8"
                      fill="#ef4444"
                      className="symptom-marker"
                    />
                    {/* Label */}
                    <text
                      x={region.x}
                      y={region.y - 15}
                      textAnchor="middle"
                      className="text-xs font-semibold fill-red-600"
                      fontSize="12"
                    >
                      {region.label}
                    </text>
                  </g>
                );
              })}
          </svg>
        </div>
      </div>

      {/* Selected Symptoms List */}
      {selectedSymptoms.length > 0 && (
        <div className="w-full">
          <p className="text-sm font-medium text-gray-700 mb-2">Selected Symptom Locations:</p>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {selectedSymptoms.map((symptom) => (
              <div
                key={symptom.id}
                className="flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm"
              >
                <span>{symptom.label}</span>
                <button
                  onClick={() => {
                    if (onSymptomSelect) {
                      onSymptomSelect(symptom, true);
                    }
                  }}
                  className="text-indigo-500 hover:text-indigo-700 font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BodyMap;










