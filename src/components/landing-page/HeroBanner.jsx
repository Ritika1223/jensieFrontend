export default function HeroBanner({ onButtonClick }) {
  return (
    <div className="w-full bg-neutral-100 flex flex-col lg:flex-row mt-8 sm:mt-12 lg:mt-20" data-name="Hero Banner" data-node-id="4965:1082">
      {/* Left section (60%) */}
      <div className="w-full lg:w-[55%] flex flex-col p-4 sm:p-6 lg:p-4">
        {/* Main Hero Title */}
        <div className="">
          <h1 className="font-['Poppins'] font-light text-2xl sm:text-3xl md:text-4xl lg:text-5xl leading-tight sm:leading-[2.5rem] md:leading-[3rem] lg:leading-[3.5rem] text-[#232629] max-w-full lg:max-w-[480px]" data-node-id="4965:1086">
            Bringing AI to the Heart of Healthcare
          </h1>
        </div>

        {/* Tagline */}
        <div className="mt-4 sm:mt-6 lg:mt-7 mb-6 sm:mb-8 lg:mb-10">
          <p className="font-['Poppins'] text-sm sm:text-base leading-6 text-[#454545] max-w-full lg:max-w-[140px]" data-node-id="4965:1154">
            Where AI Meets Holistic Health
          </p>
        </div>

        {/* Cards wrapper */}
        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 items-start">
          {/* Left column - Virtual Consultation and Medication Search */}
          <div className="flex flex-col gap-4 w-full lg:w-auto">
            {/* Virtual Consultation Card - Neomorphism */}
            <div className="w-full lg:w-72 h-auto lg:h-64 bg-neutral-100 rounded-2xl lg:rounded-3xl p-5 sm:p-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)]" data-name="Virtual Consultation Container">
              <div className="flex items-start justify-between">
                <p className="font-['Poppins'] text-zinc-800 text-base sm:text-lg font-normal leading-5 sm:leading-6 max-w-full lg:max-w-[130px]">
                  Virtual Consultation
                </p>
                <p className="font-['Poppins'] text-xs leading-4 text-[#6378f0]">
                  24/7
                </p>
              </div>

              {/* Consultation Button - Neomorphism */}
              <div className="w-24 sm:w-28 h-7 sm:h-8 flex items-center justify-center rounded-full border-[1px] border-indigo-500/30 my-3 sm:my-4 lg:my-5 cursor-pointer shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]" onClick={onButtonClick}>
                <div className="justify-start text-indigo-500/50 text-[11px] font-medium font-['Poppins'] leading-4">Consultation</div>
                <div className="w-2 h-2 border-[1px] border-b-0 border-l-0 border-indigo-500/50 ml-1.5" />
              </div>

              {/* Profile Images - Optimized */}
              <div className="flex justify-center space-x-0">
                <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
                  <img alt="Doctor 1" className="w-full h-full rounded-full" src="landing-page/doctors/doctor-1.png" loading="lazy" decoding="async" />
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
                  <img alt="Doctor 2" className="w-full h-full rounded-full" src="landing-page/doctors/doctor-2.png" loading="lazy" decoding="async" />
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
                  <img alt="Doctor 3" className="w-full h-full rounded-full" src="landing-page/doctors/doctor-3.png" loading="lazy" decoding="async" />
                </div>
                <div className="w-11 h-11 sm:w-12 sm:h-12 lg:w-14 lg:h-14">
                  <img alt="Doctor 4" className="w-full h-full rounded-full" src="landing-page/doctors/doctor-4.png" loading="lazy" decoding="async" />
                </div>
              </div>
            </div>

            {/* Medication Search Card */}
            <div className="w-full lg:w-72" data-name="Search Container">
              {/* Medication Section */}
              <div className="w-full lg:w-72 flex justify-between my-3">
                <p className="font-['Poppins'] text-base sm:text-lg leading-6 text-[#232629]">
                  Medication
                </p>
                <div className="flex gap-1">
                  <div className="w-5 h-5 sm:w-7 sm:h-7 premium-medication-icon group cursor-pointer">
                    <img alt="Medication 1" className="w-full h-full rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.6)]" src="landing-page/user-action-1.svg" loading="lazy" />
                  </div>
                  <div className="w-5 h-5 sm:w-7 sm:h-7 premium-medication-icon group cursor-pointer" style={{ animationDelay: '0.1s' }}>
                    <img alt="Medication 2" className="w-full h-full rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.6)]" src="landing-page/user-action-2.svg" loading="lazy" />
                  </div>
                  <div className="w-5 h-5 sm:w-7 sm:h-7 premium-medication-icon group cursor-pointer" style={{ animationDelay: '0.2s' }}>
                    <img alt="Medication 3" className="w-full h-full rounded-full transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.6)]" src="landing-page/user-action-3.svg" loading="lazy" />
                  </div>
                </div>
              </div>

              {/* Medication Section - Neomorphism Inset */}
              <div className="w-full lg:w-72 h-14 sm:h-16 bg-neutral-100 rounded-full flex items-center px-4 sm:px-5 shadow-[inset_4px_4px_8px_rgba(163,177,198,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
                {/* Search Icon */}
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="mr-3 flex-shrink-0">
                  <circle cx="11" cy="11" r="8" stroke="#6366f1" strokeWidth="2" />
                  <path d="m21 21-4.35-4.35" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" />
                </svg>

                <input
                  type="text"
                  placeholder="Search..."
                  className="flex-1 h-full bg-transparent font-['Poppins'] font-light italic text-[0.875rem] leading-[1.31rem] text-[#878787] placeholder:text-[#878787] border-none outline-none"
                />

                {/* Search Button - Neomorphism */}
                <button className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center ml-2 flex-shrink-0 cursor-pointer shadow-[5px_5px_10px_rgba(163,177,198,0.4),-5px_-5px_10px_rgba(255,255,255,0.8)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]" onClick={onButtonClick}>
                  <div className="w-2 h-2 border-[1px] border-b-0 border-l-0 border-[#454545]" />
                </button>
              </div>
            </div>
          </div>

          {/* Statistics Card - Neomorphism */}
          <div className="w-full lg:w-44 h-auto lg:h-48 bg-neutral-100 flex flex-col items-center rounded-2xl lg:rounded-3xl p-3 sm:p-4 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)]" data-name="Diagnosis Container">
            <div className="w-18 h-6 flex items-center justify-center rounded-full border border-zinc-700/20 shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.7)] cursor-pointer">
              <p className="text-center justify-start text-zinc-700 text-[11px] font-normal font-['Poppins'] leading-4">
                Statistics
              </p>
            </div>

            {/* Circular Progress - Optimized */}
            <div className="w-24 h-24 my-3">
              <img alt="" className="w-full h-full" src="landing-page/diagnosis-circle.png" loading="lazy" decoding="async" />
            </div>

            <div className="flex font-['Poppins'] text-[11px] leading-4 text-[#454545]">
              <p>Successful diagnosis </p>
              <div className="w-1.5 h-1.5 border-[1px] border-b-0 border-l-0 border-[#FF4DB8] ml-1" />
            </div>
          </div>

          {/* Caring Innovation Card - Neomorphism */}
          <div className="w-full lg:w-44 h-auto lg:h-80 bg-neutral-100 flex flex-col justify-between gap-4 lg:gap-0 p-3 sm:p-4 rounded-2xl lg:rounded-3xl shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)]" data-name="Caring Innovation Container" data-node-id="4965:1140">
            <div className="">
              <p className="font-['Poppins'] text-zinc-800 text-lg font-normal leading-6">
                Caring Innovation
              </p>

              {/* Explore Button - Neomorphism */}
              <div className="w-20 h-6 flex items-center justify-center cursor-pointer bg-indigo-500 rounded-full mt-2 shadow-[5px_5px_10px_rgba(79,70,229,0.4),-3px_-3px_8px_rgba(139,132,255,0.3)] active:shadow-[inset_4px_4px_8px_rgba(79,70,229,0.5),inset_-3px_-3px_6px_rgba(139,132,255,0.3)]" onClick={onButtonClick}>
                <p className="font-['Poppins'] font-light text-[11px] leading-4 text-white">
                  Explore
                </p>
              </div>
            </div>

            <div className="">
              {/* About Button - Neomorphism */}
              <div className="w-14 h-6 rounded-full border border-zinc-700/20 flex items-center justify-center cursor-pointer mb-2 shadow-[4px_4px_8px_rgba(163,177,198,0.4),-4px_-4px_8px_rgba(255,255,255,0.8)] active:shadow-[inset_3px_3px_6px_rgba(163,177,198,0.4),inset_-3px_-3px_6px_rgba(255,255,255,0.7)]" onClick={onButtonClick}>
                <p className="font-['Poppins'] text-[11px] leading-4 text-[#454545]">
                  About
                </p>
              </div>

              <p className="font-['Poppins'] text-[11px] leading-4 text-[#454545] w-full">
                In healthcare, the No. 1 problem isn't disease, it's cost.
              </p>

              <p className="font-['Poppins'] italic text-[10px] leading-4 text-[#878787] mt-1">
                Read More
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right section (40%) */}
      <div className="w-full lg:w-[45%] flex flex-col p-4 sm:p-6 lg:p-4 mt-8 lg:mt-0 overflow-hidden">
        {/* Top row - Health Stats and Consultation containers */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-5 mt-3 sm:mt-5 lg:mt-6 mb-4 sm:mb-6 relative z-10">
          {/* Health Stats Container - Inset Neomorphism */}
          <div className="bg-neutral-100 rounded-2xl p-3 flex-shrink-0">
            <img 
              alt="Health Metrics" 
              className="h-full max-h-[44px] sm:max-h-[56px] w-auto max-w-[168px] md:max-w-[180px] lg:max-w-none" 
              src="landing-page/health-metrics.png"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Consultation Container - Neomorphism */}
          <div className="flex items-center justify-center w-full sm:w-auto sm:min-w-[140px] sm:max-w-[180px] md:max-w-[200px] h-14 sm:h-16 bg-indigo-500 rounded-[41px] cursor-pointer shadow-[6px_6px_12px_rgba(79,70,229,0.4),-4px_-4px_10px_rgba(139,132,255,0.3)] active:shadow-[inset_4px_4px_8px_rgba(79,70,229,0.5),inset_-4px_-4px_8px_rgba(139,132,255,0.3)] flex-shrink-0" data-name="Consultation Container" data-node-id="4965:1088" onClick={onButtonClick}>
            <p className="font-['Poppins'] font-light text-base sm:text-lg leading-5 sm:leading-6 text-white whitespace-nowrap">
              Consultation
            </p>
            <div className="w-2 h-2 border border-b-0 border-l-0 border-white ml-2 flex-shrink-0">
            </div>
          </div>
        </div>

        {/* Brain image and separator */}
        <div className="relative flex-1 flex flex-col items-center brain-float">
          {/* Sidebar Brain Image - Optimized for Low Internet - CRITICAL above-fold image */}
          <div className="relative w-full max-w-[20rem] lg:w-[25rem] mt-6 sm:mt-8 lg:mt-12 z-0" data-name="Sidebar Image">
            <img
              alt="AI Brain Healthcare"
              className="w-full h-full object-cover"
              src="landing-page/sidebar-image.png"
              loading="eager"
              decoding="async"
              fetchpriority="high"
            />
          </div>

          {/* Sidebar Separator - Hidden on mobile */}
          <div className="hidden lg:block absolute right-0 top-[10rem] w-[1.625rem] h-[8.31rem] z-20" data-name="Sidebar Separator" data-node-id="4965:1180">
            <img alt="" className="w-full h-full sidebar-bar-animate" src="landing-page/sidebar-separator.png" loading="lazy" />
          </div>
        </div>
      </div>
    </div >
  );
}
