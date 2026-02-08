export default function SmartSection({ onButtonClick }) {
  const tags = [
    { name: "Smarter Health", bgColor: "bg-gray-100" },
    { name: "AI-Powered", bgColor: "bg-blue-50" },
    { name: "Intelligent Care", bgColor: "bg-purple-50" }
  ];

  return (
    <section className="relative w-full py-12 sm:py-24 px-4" data-name="Smart Section">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Main Title */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-['Poppins'] font-light leading-tight text-zinc-800">
              Health Just Got Smarter
            </h2>

            {/* Description */}
            <p className="font-['Poppins'] text-xl leading-relaxed text-zinc-600 max-w-md">
              Our AI healthcare solutions bring intelligence and precision to each step of your medical journey, making wellness management simpler.
            </p>

            {/* Tag Container */}
            <div className="flex flex-col md:flex-row">
              {tags.map((tag, index) => (
                <div
                  key={index}
                  className="py-4 px-4 lg:px-6"
                >
                  <span className="font-['Poppins'] text-zinc-600 text-lg sm:text-sm xl:text-lg font-normal">
                    {tag.name}
                  </span>
                </div>
              ))}

              {/* Decorative Arrows - Optimized */}
              <div className="flex items-center space-x-2 ml-4">
                <img className="w-full max-w-[30px]" src="landing-page/smart-v-icon-min.png" loading="lazy" decoding="async" alt="" />
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Header with Learn More Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Left Image - Couple - Optimized */}
              <div className="flex flex-col items-end gap-6 w-full">
                <button className="w-fit h-12 inline-flex items-center bg-indigo-500 text-white px-6 py-3 rounded-full text-lg font-['Poppins'] font-medium" onClick={onButtonClick}>
                  <span>Learn More</span>
                  <div className="w-3 h-3 border-t border-r border-white ml-3"></div>
                </button>
                <img
                  src="landing-page/learn-more.png"
                  alt="Happy couple embracing outdoors"
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>

              {/* Right Image - Family - Optimized */}
              <div className="flex flex-col items-end gap-6 w-full">
                <div className="flex items-center h-12 max-w-[150px] mb-2 font-['Poppins'] text-sm text-zinc-800 text-right sm:text-left">
                  Better Health, One Insight at a Time
                </div>

                <img
                  src="landing-page/one-insight.png"
                  alt="Family walking together in nature"
                  className="w-full h-full"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
