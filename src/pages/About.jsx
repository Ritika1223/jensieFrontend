export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-5xl font-bold mb-6">About Jensei</h1>
          <p className="text-xl text-blue-100 max-w-3xl">
            Revolutionizing healthcare through AI-powered solutions that make quality medical care accessible to everyone.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Mission Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Mission</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-blue-600 text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered</h3>
              <p className="text-gray-600">
                Leveraging artificial intelligence to provide accurate diagnoses and personalized treatment recommendations.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-green-600 text-2xl">💚</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Accessible Care</h3>
              <p className="text-gray-600">
                Making quality healthcare accessible to everyone, regardless of location or economic status.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-purple-600 text-2xl">🔬</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Innovation</h3>
              <p className="text-gray-600">
                Continuously advancing medical technology to improve patient outcomes and healthcare efficiency.
              </p>
            </div>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
          <div className="prose max-w-none text-gray-600">
            <p className="mb-4">
              Founded in 2023, Jensei emerged from a simple yet powerful vision: to bridge the gap between cutting-edge
              artificial intelligence and compassionate healthcare. Our founders, a team of medical professionals and
              AI researchers, recognized the immense potential of technology to transform how we approach health and wellness.
            </p>
            <p className="mb-4">
              The name "Jensei" reflects our commitment to holistic health - combining the precision of artificial
              intelligence with the wisdom of traditional medicine. We believe that the future of healthcare lies not
              in replacing human touch, but in augmenting it with intelligent systems that can process vast amounts
              of medical data to provide better insights and outcomes.
            </p>
            <p>
              Today, Jensei serves thousands of patients worldwide, providing AI-powered diagnostics, personalized
              treatment plans, and connecting patients with the right healthcare professionals at the right time.
            </p>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Chen",
                role: "Chief Medical Officer",
                background: "Former Johns Hopkins researcher with 15 years in AI healthcare"
              },
              {
                name: "Alex Rodriguez",
                role: "Chief Technology Officer",
                background: "Ex-Google AI engineer, specializing in medical machine learning"
              },
              {
                name: "Dr. Michael Patel",
                role: "Chief Executive Officer",
                background: "Healthcare entrepreneur with multiple successful exits"
              }
            ].map((member, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md p-6 text-center">
                <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-600 text-2xl font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{member.name}</h3>
                <p className="text-blue-600 font-medium mb-3">{member.role}</p>
                <p className="text-gray-600 text-sm">{member.background}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-gray-100 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Patient-Centric",
                description: "Every decision we make is guided by what's best for patient outcomes and experience."
              },
              {
                title: "Scientific Rigor",
                description: "Our AI models are built on evidence-based medicine and continuously validated by medical experts."
              },
              {
                title: "Privacy & Security",
                description: "We maintain the highest standards of data protection and patient privacy."
              },
              {
                title: "Continuous Learning",
                description: "We constantly improve our algorithms and services based on new medical research and feedback."
              }
            ].map((value, index) => (
              <div key={index} className="bg-white rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
