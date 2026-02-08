export default function ServiceSection({ onButtonClick }) {
  return (
    <section className="relative w-full py-12 sm:py-24 px-4" data-name="Service Section">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Left Column - Title */}
          <div className="space-y-6">
            {/* Services Label */}
            <div className="w-fit rounded-full px-4 py-1 border border-zinc-700">
              <span className="text-zinc-700 text-xl font-normal font-['Poppins'] leading-8">Services</span>
            </div>

            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl lg:text-6xl font-['Poppins'] font-normal leading-tight text-zinc-800 max-w-xl">
              Caring Innovation, Powered by AI
            </h2>
          </div>

          {/* Right Column - Description */}
          <div className="flex flex-col items-center lg:pt-16">
            <div className="space-y-4 mt-8">
              <h3 className="text-blue-600 text-xl font-medium font-['Poppins']">
                Smart Health
              </h3>
              <p className="font-['Poppins'] text-base leading-relaxed text-zinc-600 max-w-sm">
                Combining human care warmth with AI innovation to meet your health needs.
              </p>
            </div>
          </div>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Health and Lifestyle Coaching Card - Neomorphism */}
          <div>
            <div className="bg-neutral-100 rounded-3xl p-8 space-y-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)]">
              <h3 className="w-64 text-zinc-800 text-xl lg:text-2xl font-normal font-['Poppins'] leading-9">
                Health and Lifestyle Coaching
              </h3>

              <div className="w-full h-48 rounded-xl overflow-hidden">
                <img
                  src="landing-page/coaching-image.png"
                  alt="Health and Lifestyle Coaching"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              <div className="flex items-end justify-between">
                <p className="font-['Poppins'] text-sm leading-relaxed text-zinc-600 max-w-[200px]">
                  AI collaborates with health experts to help users reach their health goals.
                </p>

                <button className="inline-flex items-center space-x-3 bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-['Poppins'] font-medium shadow-[4px_4px_8px_rgba(79,70,229,0.4),-2px_-2px_6px_rgba(139,132,255,0.3)] active:shadow-[inset_3px_3px_6px_rgba(79,70,229,0.5),inset_-2px_-2px_4px_rgba(139,132,255,0.3)]" onClick={onButtonClick}>
                  <span>Explore</span>
                  <img className="w-5" src="landing-page/button-arrow.svg" loading="lazy" decoding="async" alt=""></img>
                </button>
              </div>
            </div>
          </div>

          {/* AI-Powered Symptom Checker Card */}
          <div className="space-y-8">
            {/* See Diagnosis Button */}
            {/* <div class="justify-start text-white text-2xl font-normal font-['Poppins'] leading-9">See Diagnosis</div> */}
            <button
              onClick={onButtonClick}
              className="w-full max-w-[380px] py-6 md:py-10 bg-indigo-500 rounded-[41px] font-['Poppins'] font-medium flex items-center justify-between px-6 text-white text-2xl font-normal shadow-[6px_6px_12px_rgba(79,70,229,0.4),-4px_-4px_10px_rgba(139,132,255,0.3)] active:shadow-[inset_4px_4px_8px_rgba(79,70,229,0.5),inset_-4px_-4px_8px_rgba(139,132,255,0.3)]">
              <span>See Diagnosis</span>
              <div className="w-5 h-5 border-t border-r border-white"></div>
            </button>

            <div className="flex flex-col justify-between bg-neutral-100 rounded-3xl p-8 space-y-6 gap-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)]">
              <h3 className="text-zinc-800 text-xl md:text-2xl max-w-[254px] font-normal font-['Poppins'] leading-9">
                AI-Powered Symptom Checker
              </h3>

              {/* Heart Anatomy with Metrics - Optimized */}
              <div className="relative overflow-hidden rounded-2xl">
                <img
                  src="landing-page/heart-anatomy.png"
                  alt="Heart Anatomy"
                  className="w-full h-auto lg:h-60 object-cover"
                  loading="lazy"
                  decoding="async"
                />
                <div className="scan-line" aria-hidden="true" />
              </div>
            </div>
          </div>

          {/* Personalized Health Insights Card - Neomorphism */}
          <div className="">
            <div className="bg-neutral-100 rounded-3xl p-8 space-y-6 shadow-[8px_8px_16px_rgba(163,177,198,0.5),-8px_-8px_16px_rgba(255,255,255,0.8)] hover:shadow-[12px_12px_20px_rgba(163,177,198,0.4),-12px_-12px_20px_rgba(255,255,255,0.9)]">
              <h3 className="text-zinc-800 text-xl md:text-2xl max-w-[185px] font-normal font-['Poppins'] leading-tight">
                Personalized Health Insights
              </h3>

              <p className="font-['Poppins'] text-sm max-w-[307px] leading-relaxed text-zinc-600">
                This service offers personalized health insights based on medical history.
              </p>

              {/* Health Metrics Graph - Optimized */}
              <div className="w-full relative overflow-hidden">
                <img
                  src="landing-page/insights-graph.png"
                  alt="Health Metrics Graph"
                  className="w-full h-full object-contain"
                  loading="lazy"
                  decoding="async"
                />
                <div className="graph-line-animated" aria-hidden="true" />
              </div>

              <div className="flex items-end justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src="landing-page/insights-options.png"
                    alt="Insights Options"
                    className="w-full max-w-[98px]"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                <button
                  onClick={onButtonClick}
                  className="inline-flex items-center space-x-3 bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-['Poppins'] font-medium">
                  <span>Explore</span>
                  <img className="w-5" src="landing-page/button-arrow.svg" loading="lazy" decoding="async" alt=""></img>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
