import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import DoctorCard from './DoctorCard';

const DoctorCarousel = ({ doctors, carouselId = 'default' }) => {
  const nextButtonRef = useRef(null);
  const prevButtonRef = useRef(null);
  const swiperRef = useRef(null);
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Track navigation state for visual feedback
  useEffect(() => {
    if (!swiperInstance) return;
    
    const handleSlideChange = () => {
      setIsNavigating(true);
      setTimeout(() => {
        setIsNavigating(false);
      }, prefersReducedMotion ? 100 : 400);
    };
    
    swiperInstance.on('slideChange', handleSlideChange);
    
    return () => {
      swiperInstance.off('slideChange', handleSlideChange);
    };
  }, [swiperInstance, prefersReducedMotion]);

  if (!doctors || doctors.length === 0) {
    return null;
  }

  // Initialize navigation after both Swiper and buttons are ready
  useEffect(() => {
    if (swiperInstance && nextButtonRef.current && prevButtonRef.current && swiperInstance.navigation) {
      // Use setTimeout to ensure buttons are fully rendered in DOM
      const timer = setTimeout(() => {
        if (swiperInstance && nextButtonRef.current && prevButtonRef.current && swiperInstance.navigation) {
          swiperInstance.params.navigation.nextEl = nextButtonRef.current;
          swiperInstance.params.navigation.prevEl = prevButtonRef.current;
          swiperInstance.navigation.init();
          swiperInstance.navigation.update();
        }
      }, 10);
      
      return () => clearTimeout(timer);
    }
  }, [swiperInstance]);

  return (
    <div className="relative group">
      <style>{`
        @media (max-width: 639px) {
          .doctor-carousel .swiper-slide {
            width: 100% !important;
            flex-shrink: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .doctor-carousel .swiper-wrapper {
            transition-duration: 0ms !important;
          }
        }
        /* Premium pill arrows - white with black icon */
        .premium-pill-arrow {
          background: white;
          border: 1px solid rgba(0, 0, 0, 0.1);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .premium-pill-arrow.swiper-button-lock {
          display: flex !important;
          opacity: 0.35;
          pointer-events: none;
        }
        .premium-pill-arrow:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
      `}</style>
      <Swiper
        ref={swiperRef}
        modules={[Navigation]}
        navigation={{
          nextEl: nextButtonRef.current,
          prevEl: prevButtonRef.current,
        }}
        onSwiper={(swiper) => {
          setSwiperInstance(swiper);
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 0,
            allowTouchMove: true,
            centeredSlides: false,
            watchSlidesProgress: true,
            resistance: true,
            resistanceRatio: 0,
          },
          640: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
          1024: {
            slidesPerView: 3,
            spaceBetween: 24,
          },
          1280: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
          1536: {
            slidesPerView: 4,
            spaceBetween: 24,
          },
        }}
        speed={prefersReducedMotion ? 0 : 400}
        lazy={true}
        className="doctor-carousel pb-12"
      >
        {doctors.map((doctor) => (
          <SwiperSlide key={doctor.id} className="!w-full sm:!w-auto">
            <div className="w-full flex justify-center items-start sm:block px-2 sm:px-0">
              <div className="w-full max-w-[260px] sm:max-w-none">
                <DoctorCard doctor={doctor} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Premium Pill Navigation Buttons */}
      <button
        ref={prevButtonRef}
        className={`premium-pill-arrow absolute left-2 md:left-0 top-1/2 -translate-y-1/2 h-24 w-10 z-30 rounded-full flex items-center justify-center ${isNavigating ? 'cursor-wait' : 'cursor-pointer'}`}
        aria-label="Previous"
      >
        <svg
          width="12"
          height="48"
          viewBox="0 0 12 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-800"
        >
          <path
            d="M9 40L3 24L9 8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <button
        ref={nextButtonRef}
        className={`premium-pill-arrow absolute right-2 md:right-0 top-1/2 -translate-y-1/2 h-24 w-10 z-30 rounded-full flex items-center justify-center ${isNavigating ? 'cursor-wait' : 'cursor-pointer'}`}
        aria-label="Next"
      >
        <svg
          width="12"
          height="48"
          viewBox="0 0 12 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-gray-800"
        >
          <path
            d="M3 8L9 24L3 40"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
};

export default DoctorCarousel;

