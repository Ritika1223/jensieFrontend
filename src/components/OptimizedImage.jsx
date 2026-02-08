import { useState, useRef, useEffect, memo } from 'react';

/**
 * OptimizedImage - Simplified image component using native lazy loading
 * Features:
 * - Native browser lazy loading
 * - Progressive loading with blur-up effect
 * - Placeholder support
 */
const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  className = '',
  style = {},
  loading = 'lazy',
  priority = false,
  placeholder = 'blur', // 'blur' | 'empty' | 'skeleton'
  onLoad,
  onError,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const handleLoad = (e) => {
    setIsLoaded(true);
    onLoad?.(e);
  };

  const handleError = (e) => {
    setHasError(true);
    onError?.(e);
  };

  // Generate placeholder styles
  const getPlaceholderStyle = () => {
    if (isLoaded || placeholder === 'empty') return {};
    
    if (placeholder === 'blur') {
      return {
        filter: 'blur(10px)',
        transform: 'scale(1.05)',
      };
    }
    
    if (placeholder === 'skeleton') {
      return {
        backgroundColor: '#e5e7eb',
        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      };
    }
    
    return {};
  };

  return (
    <div 
      className={`relative overflow-hidden ${className}`}
      style={{ 
        ...style,
        minHeight: isLoaded ? 'auto' : '50px',
      }}
    >
      {/* Skeleton placeholder */}
      {!isLoaded && placeholder === 'skeleton' && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ borderRadius: 'inherit' }}
        />
      )}
      
      {/* Actual image - uses native lazy loading */}
      {!hasError && (
        <img
          src={src}
          alt={alt}
          className="w-full h-full"
          style={{
            ...getPlaceholderStyle(),
            transition: 'filter 0.3s ease-out, transform 0.3s ease-out, opacity 0.3s ease-out',
            opacity: isLoaded ? 1 : (placeholder === 'empty' ? 0 : 0.7),
          }}
          loading={priority ? 'eager' : loading}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          {...props}
        />
      )}
      
      {/* Error fallback */}
      {hasError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-sm"
          style={{ borderRadius: 'inherit' }}
        >
          <span>Failed to load</span>
        </div>
      )}
    </div>
  );
});

export default OptimizedImage;

/**
 * LazySection - Lazy loads entire sections when they come into view
 * Useful for heavy components below the fold
 */
export const LazySection = memo(function LazySection({ 
  children, 
  fallback = null,
  rootMargin = '100px',
  className = '',
  onVisible,
}) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.01 }
    );

    observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, [rootMargin, onVisible]);

  return (
    <div ref={sectionRef} className={className}>
      {isVisible ? children : fallback}
    </div>
  );
});

/**
 * SectionSkeleton - A simple skeleton placeholder for sections
 */
export const SectionSkeleton = memo(function SectionSkeleton({ 
  height = '400px',
  className = '',
}) {
  return (
    <div 
      className={`bg-neutral-100 rounded-lg flex items-center justify-center ${className}`}
      style={{ height, minHeight: height }}
    >
      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
});

