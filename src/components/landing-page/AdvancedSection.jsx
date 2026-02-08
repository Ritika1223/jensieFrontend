import { useState, useCallback, useMemo, memo } from 'react';

function AdvancedSection({ onButtonClick }) {
  const [activeButton, setActiveButton] = useState('previous'); // Default to 'previous' (sun/intelligent)
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(1); // Default to index 1 (Predictive Health Analysis)

  const features = useMemo(() => [
    { name: "Chronic Condition Monitoring" },
    { name: "Predictive Health Analysis" },
    { name: "AI Diagnostics and Screening" }
  ], []);

  const handleButtonClick = useCallback((buttonType) => {
    setActiveButton(buttonType);
  }, []);

  const handleFeatureClick = useCallback((index) => {
    setActiveFeatureIndex(index);
  }, []);

  const cardContent = useMemo(() => activeButton === 'next' ? 'Care' : 'Intelligent', [activeButton]);
  const currentSlide = useMemo(() => activeFeatureIndex + 1, [activeFeatureIndex]);

  return (
    <section className="relative w-full py-12 sm:py-24 px-4" data-name="Advanced Section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Column */}
          <div className="flex flex-col items-center lg:items-start space-y-8">
            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-['Poppins'] font-light leading-16 text-zinc-800">
              Advanced Healthcare, Simplified by AI
            </h2>

            {/* Description with Button */}
            <div className="space-y-6">
              <p className="font-['Poppins'] text-base leading-relaxed text-zinc-600">
                AI-Driven Insights, Personalized Care
              </p>

              {/* Our Experts Button - Optimized */}
              <button className="inline-flex items-center bg-indigo-500 text-white px-6 py-3 rounded-full text-sm font-['Poppins'] font-medium gap-4 cursor-pointer" onClick={onButtonClick}>
                <span>Our Experts</span>
                <div className="w-3 h-3 border-t border-r border-white pl-3"></div>
              </button>
            </div>

            {/* Feature List */}

            <div className="w-full max-w-[360px] space-y-4">
              {features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between space-x-4 w-full cursor-pointer transition-all duration-300 hover:opacity-80"
                  onClick={() => handleFeatureClick(index)}
                >
                  <span className={`font-['Poppins'] text-lg transition-colors duration-200 ${
                    activeFeatureIndex === index ? 'text-zinc-800 font-medium' : 'text-gray-500'
                  }`}>
                    {feature.name}
                  </span>
                  <img className="w-5" src="landing-page/arrow-icon-blue.png" loading="lazy" decoding="async" alt=""></img>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="relative">
            <div className="space-y-8">
              {/* Intelligence Card */}
              <div className="relative flex flex-col items-center lg:items-end">
                {/* Circular Profile Image */}
                <div className="flex justify-center lg:justify-end mb-8">
                  <div className="relative flex items-end gap-12">
                    <div className="flex flex-col gap-2">
                      <button 
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 border-2 ${
                          activeButton === 'previous' 
                            ? 'bg-indigo-500 border-indigo-600 text-white shadow-lg scale-110' 
                            : 'bg-transparent border-indigo-500 text-indigo-500 hover:border-indigo-600 hover:text-indigo-600 scale-95'
                        }`}
                        onClick={() => handleButtonClick('previous')}
                        aria-label="Previous"
                        style={{ transform: 'translateZ(0)', willChange: activeButton === 'previous' ? 'transform' : 'auto' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" fill="none"/>
                          <path d="M12 2V4M12 20V22M22 12H20M4 12H2M19.07 4.93L17.66 6.34M6.34 17.66L4.93 19.07M19.07 19.07L17.66 17.66M6.34 6.34L4.93 4.93" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                        </svg>
                      </button>
                      <button 
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-200 border-2 ${
                          activeButton === 'next' 
                            ? 'bg-indigo-500 border-indigo-600 text-white shadow-lg scale-110' 
                            : 'bg-transparent border-indigo-500 text-indigo-500 hover:border-indigo-600 hover:text-indigo-600 scale-95'
                        }`}
                        onClick={() => handleButtonClick('next')}
                        aria-label="Next"
                        style={{ transform: 'translateZ(0)', willChange: activeButton === 'next' ? 'transform' : 'auto' }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 15C18 19.4 14.4 23 10 23C5.6 23 2 19.4 2 15C2 10.6 5.6 7 10 7C11.4 7 12.7 7.3 13.8 7.9C14.9 8.5 15.8 9.3 16.5 10.2C17.2 11.1 17.6 12.1 17.8 13.1C18 14.1 18 14.6 18 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                          <circle cx="14" cy="11" r="1.5" fill="currentColor" opacity="0.8"/>
                        </svg>
                      </button>
                    </div>
                    <div className="flex flex-col w-full max-w-[182px] rounded-3xl p-4 shadow-xl bg-white">
                      <img
                        src="landing-page/advanced-intelligent.png"
                        alt="Healthcare Professional"
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        fetchpriority="low"
                      />
                      <p className="font-['Poppins'] text-zinc-800 text-lg text-center font-medium mt-3">{cardContent}</p>
                    </div>
                  </div>
                </div>

                {/* Technology Visualization - Optimized */}
                <div className="relative max-w-[420px]">
                  <div className="w-full mb-4">
                    <img
                      src="landing-page/advanced-carousel.png"
                      alt="AI Technology Visualization"
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                    />
                  </div>

                  {/* Progress Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="font-['Poppins'] text-zinc-800 text-base transition-opacity duration-200">
                      {String(currentSlide).padStart(2, '0')}<span className="text-blue-600">/03</span>
                    </span>

                    <div className="flex space-x-2">
                      {features.map((_, index) => (
                        <div 
                          key={index}
                          className={`w-8 h-1 rounded-full transition-colors duration-200 ${
                            activeFeatureIndex === index ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-100 rounded-full opacity-10"></div>
        <div className="absolute bottom-32 right-20 w-24 h-24 bg-purple-100 rounded-full opacity-10"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-green-100 rounded-full opacity-10"></div>
      </div>
    </section>
  );
}

export default memo(AdvancedSection);
