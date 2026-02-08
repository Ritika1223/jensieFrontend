export default function AboutSection({ onButtonClick }) {
  return (
    <section className="relative w-full py-12 sm:py-24 px-4" data-name="About Section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Column */}
          <div className="flex flex-col justify-between h-full space-y-8">
            {/* About Label */}
            <div className="space-y-8">
              <div className="w-fit rounded-full px-6 py-3 border border-zinc-700 shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.8)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1),inset_-2px_-2px_4px_rgba(255,255,255,0.8)] cursor-pointer">
                <span className="text-zinc-700 text-xl font-normal font-['Poppins'] leading-8">About</span>
              </div>

              {/* Main Title */}
              <h2 className="max-w-96 text-3xl md:text-4xl font-['Poppins'] font-normal leading-10 lg:leading-[60px] text-zinc-800">
                Better Health, One Insight at a Time
              </h2>
            </div>

              {/* Description Card - Optimized for Performance */}
            <div className="flex items-center justify-between gap-2 sm:gap-0 max-h-[180px] bg-neutral-100 rounded-2xl p-3 sm:p-8 relative shadow-[6px_6px_12px_rgba(0,0,0,0.1),-6px_-6px_12px_rgba(255,255,255,0.9)]">
              {/* Explore Button */}
              <div className="flex flex-col justify-end h-[-webkit-fill-available]">
                <button className="inline-flex items-center space-x-3 bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-['Poppins'] font-medium shadow-[4px_4px_8px_rgba(79,70,229,0.25),-2px_-2px_6px_rgba(139,132,255,0.4)] active:shadow-[inset_3px_3px_6px_rgba(79,70,229,0.4),inset_-2px_-2px_4px_rgba(139,132,255,0.2)]" onClick={onButtonClick}>
                  <span>Explore</span>
                  <img className="w-5" src="landing-page/button-arrow.svg" loading="lazy" decoding="async" alt=""></img>
                </button>
              </div>

              <p className="font-['Poppins'] text-base leading-relaxed text-[#454545] max-w-[340px]">
                When data goes unheard, understanding is lost. Jensei transforms patient data into preventive care.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="relative">
            {/* Background Container - Optimized for Performance */}
            <div className="relative flex flex-col sm:flex-row items-center sm:justify-between bg-neutral-100 rounded-3xl p-8 overflow-hidden shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)]">

              <div>
                {/* Doctor's Consultation Title */}
                <h3 className="w-40 justify-start text-zinc-800 text-xl md:text-2xl font-normal font-['Poppins'] leading-9 mb-6">Doctor's Consultation</h3>

                {/* Feature List */}
                <div className="space-y-4 mb-8">
                  <div className="w-fit rounded-full px-4 py-2 flex items-center justify-between border border-zinc-100 shadow-[3px_3px_6px_rgba(0,0,0,0.08),-3px_-3px_6px_rgba(255,255,255,0.8)] cursor-pointer">
                    <span className="font-['Poppins'] text-neutral-800 text-xs font-normal mr-3">AI-Powered Precision Care</span>
                    <img className="w-3.5 h-3.5" src="landing-page/features-circle-icon.png" loading="lazy" decoding="async" alt=""></img>
                  </div>

                  <div className="w-fit rounded-full px-4 py-2 flex items-center justify-between border border-zinc-100 shadow-[3px_3px_6px_rgba(0,0,0,0.08),-3px_-3px_6px_rgba(255,255,255,0.8)] cursor-pointer">
                    <span className="font-['Poppins'] text-neutral-800 text-xs font-normal mr-3">Health Just Got Smarter</span>
                    <img className="w-3.5 h-3.5" src="landing-page/features-circle-icon.png" loading="lazy" decoding="async" alt=""></img>
                  </div>

                  <div className="w-fit rounded-full px-4 py-2 flex items-center justify-between border border-zinc-100 shadow-[3px_3px_6px_rgba(0,0,0,0.08),-3px_-3px_6px_rgba(255,255,255,0.8)] cursor-pointer">
                    <span className="font-['Poppins'] text-neutral-800 text-xs font-normal mr-3">AI-Powered Health Partner</span>
                    <img className="w-3.5 h-3.5" src="landing-page/features-circle-icon.png" loading="lazy" decoding="async" alt=""></img>
                  </div>
                </div>
                {/* Doctor Profile Images - Optimized */}
                <div className="flex space-x-2 mb-6 relative z-10">
                  <div className="w-14 h-14 rounded-full doctor-juggle doctor-juggle-1">
                    <img src="landing-page/doctors/doctor-1.png" alt="Dr. Sarah Johnson" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="w-14 h-14 rounded-full doctor-juggle doctor-juggle-2">
                    <img src="landing-page/doctors/doctor-3.png" alt="Dr. Michael Chen" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="w-14 h-14 rounded-full doctor-juggle doctor-juggle-3">
                    <img src="landing-page/doctors/doctor-2.png" alt="Dr. Emily Rodriguez" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                  <div className="w-14 h-14 rounded-full doctor-juggle doctor-juggle-4">
                    <img src="landing-page/doctors/doctor-4.png" alt="Dr. David Kim" className="w-full h-full object-cover" loading="lazy" decoding="async" />
                  </div>
                </div>
              </div>

              {/* Main Doctor Image - Desktop only */}
              <div className="w-64 z-20">
                <img
                  src="landing-page/virtual-consultation.png"
                  alt="Virtual Doctor Consultation"
                  className="w-full h-full"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* 24/7 Available Badge */}
              {/* <div className="absolute bottom-6 left-6 bg-white rounded-xl px-4 py-3 shadow-lg z-30">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-['Poppins'] text-sm text-[#454545] font-medium">24/7 Available</span>
                </div>
              </div> */}

              {/* Consultation Stats Badge - Desktop only */}
              {/* <div className="absolute bottom-6 right-6 bg-white rounded-xl px-4 py-3 shadow-lg hidden lg:block z-30">
                <div className="text-center">
                  <div className="text-lg font-['Poppins'] font-bold text-blue-600">500+</div>
                  <div className="text-xs font-['Poppins'] text-[#454545]">Consultations</div>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
