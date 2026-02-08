import React, { memo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhoneIcon } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';
import './DoctorCard.css';

const DoctorCard = memo(({ doctor }) => {
  const navigate = useNavigate();
  const {
    name,
    specialty,
    experience,
    patientStories,
    rating,
    location,
    image,
    badge,
    isRecommended
  } = doctor;

  // Format experience: 5 -> "5 years+"
  const formatExperience = (years) => {
    if (typeof years === 'number') {
      return `${years} years+`;
    }
    return years; // Fallback for string values
  };

  // Format patient stories: 230 -> "230+"
  const formatPatientStories = (stories) => {
    if (typeof stories === 'number') {
      return `${stories}+`;
    }
    return stories; // Fallback for string values
  };

  // Format rating: 4.5 -> "4.5" (keep as is, or format to one decimal)
  const formatRating = (ratingValue) => {
    if (typeof ratingValue === 'number') {
      return ratingValue.toFixed(1);
    }
    return ratingValue; // Fallback for string values
  };

  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef(null);

  // Check if image is already loaded (cached images) or start as visible for better UX
  useEffect(() => {
    if (image && imgRef.current) {
      if (imgRef.current.complete && imgRef.current.naturalHeight !== 0) {
        setImageLoaded(true);
      } else {
        // For better UX on slow connections, show image immediately
        // It will fade in when loaded
        setImageLoaded(true);
      }
    } else if (!image) {
      setImageError(true);
    }
  }, [image]);

  const handleCardClick = () => {
    navigate(`/doctor-profile/${doctor.id}`);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(true);
  };

  return (
    <div 
      className="relative w-64 max-w-[260px] h-auto bg-gradient-to-l from-neutral-100/90 to-stone-50 border border-[rgba(0,0,0,0.1)] rounded-2xl p-2 sm:p-2 flex flex-col w-full sm:max-w-[260px] min-h-[304px] hover:shadow-lg transition-shadow duration-200"
      style={{ 
        contain: 'layout style paint'
      }}
    >

      {/* Badge - Top Left */}
      {badge && (
        <div className="absolute top-2 left-2 bg-[rgba(76,158,255,0.11)] flex gap-1.5 items-center pl-1.5 pr-2.5 py-1 rounded-md z-10">
          <div className="w-2 h-2">
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 0L4.94427 2.76393L8 3.23607L5.88854 5.23607L6.47214 8L4 6.76393L1.52786 8L2.11146 5.23607L0 3.23607L3.05573 2.76393L4 0Z" fill="#22212c"/>
            </svg>
          </div>
          <p className="font-bold text-[10px] text-[#22212c] whitespace-nowrap">{badge}</p>
        </div>
      )}

      {/* Rating - Top Right */}
      <div className="absolute top-2 right-2 bg-[rgba(76,158,255,0.11)] border border-transparent flex gap-1 items-center justify-center px-3 py-1 rounded-2xl z-10">
        <div className="h-2 w-2.25 flex items-center justify-center">
          <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4.5 0L5.53125 3.1875L9 3.375L6.46875 5.4375L7.5 8.625L4.5 6.75L1.5 8.625L2.53125 5.4375L0 3.375L3.46875 3.1875L4.5 0Z" fill="#1e2022"/>
          </svg>
        </div>
        <p className="font-medium text-[10px] text-[#1e2022] tracking-wide whitespace-nowrap">{formatRating(rating)}</p>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Image and Stats Row */}
        <div className="flex items-start gap-2 mt-8 mb-2 justify-between">
          {/* Doctor Image - Left */}
          <div className="w-24 h-24 sm:w-28 sm:h-28 relative flex-shrink-0">
            <div className="absolute inset-[-22.62%_-20.68%_-18.74%_-20.68%]">
              {imageError || !image ? (
                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M6 21C6 17 9 14 12 14C15 14 18 17 18 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              ) : (
                <>
                  {!imageLoaded && (
                    <div className="absolute inset-0 w-full h-full bg-gray-200 rounded-full animate-pulse z-0"></div>
                  )}
                  <img 
                    ref={imgRef}
                    alt={name} 
                    className={`w-full h-full object-cover rounded-full relative z-10 ${imageLoaded ? 'opacity-100' : 'opacity-50'}`}
                    src={image}
                    loading="lazy"
                    decoding="async"
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                </>
              )}
            </div>
          </div>

          {/* Stats - Right of Image */}
          <div className="flex flex-col justify-between pt-5 h-24 sm:h-28">
            <div className="flex flex-col gap-0.5">
              <p className="font-normal text-xs text-[#22212c] whitespace-nowrap">{formatExperience(experience)}</p>
              <div className="bg-[rgba(240,238,255,0.6)] flex items-center justify-center px-2 py-0.5 rounded-md w-fit">
                <p className="font-normal text-[8px] text-[#616ed0] whitespace-nowrap">Experience</p>
              </div>
            </div>
            <div className="flex flex-col gap-0.5">
              <p className="font-normal text-xs text-[#22212c] whitespace-nowrap">{formatPatientStories(patientStories)}</p>
              <div className="bg-[rgba(240,238,255,0.6)] flex items-center justify-center px-2 py-0.5 rounded-md w-fit">
                <p className="font-normal text-[8px] text-[#616ed0] whitespace-nowrap">Patient Stories</p>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="flex flex-col gap-1.5 px-2">
          {/* Name */}
          <div className="flex items-center gap-1">
            <p className="font-bold text-sm text-[#22212c] whitespace-nowrap">{name}</p>
            <img
              src="/doctors-listing/verified-star.svg"
              alt="Verified doctor"
              className="w-3.5 h-3.5"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Specialty */}
          <div className="bg-[rgba(240,238,255,0.6)] flex items-center justify-center px-2 py-0.5 rounded-md w-fit">
            <p className="font-normal text-[10px] text-[#616ed0] whitespace-nowrap">{specialty}</p>
          </div>

          {/* Description */}
          <p className="font-normal text-[12px] text-[#22212c] leading-tight py-2">
            Helping people fall in love with their reflection again.
          </p>

          {/* Location */}
          <div className="flex items-center gap-1.5">
            <MapPinIcon className="w-4 h-4 text-red-500" />
            <p className="font-normal text-[11px] text-black tracking-wide">{location}</p>
          </div>
        </div>

        {/* Action Buttons - Bottom */}
        <div 
          className="flex gap-2 items-center justify-end mt-6 mb-2 px-1"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Call Button - Left */}
          <button 
            className="marcus-neon-btn flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 cursor-pointer"
            onClick={() => {/* Add call functionality */}}
            aria-label="Call doctor"
          >
            <PhoneIcon className="w-4 h-4 text-white" />
          </button>

          {/* Book Now Button - Right */}
          <button 
            className="marcus-neon-btn flex items-center justify-center px-4 py-2 rounded-full text-white font-medium text-xs transition-all duration-300 cursor-pointer"
            onClick={() => navigate(`/doctor-profile/${doctor.id}`)}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
});

DoctorCard.displayName = 'DoctorCard';

export default DoctorCard;

