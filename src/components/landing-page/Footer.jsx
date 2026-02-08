export default function Footer({ onButtonClick }) {
  const footerSections = [
    {
      title: "NAVIGATION",
      links: [
        { name: "About", href: "#" },
        { name: "Features", href: "#" },
        { name: "Teams", href: "#" },
        { name: "Service", href: "#" }
      ]
    },
    {
      title: "SUPPORT",
      links: [
        { name: "Doctors", href: "#" },
        { name: "Lab Test", href: "#" }
      ]
    },
    {
      title: "LEGAL",
      links: [
        { name: "Privacy", href: "#" },
        { name: "Term", href: "#" },
        { name: "Partner", href: "#" }
      ]
    },
    {
      title: "INFO",
      links: [
        { name: "About us", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Contacts", href: "#" }
      ]
    }
  ];

  return (
    <footer className="bg-black text-white py-16 px-4" data-name="Footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Logo Section - Optimized */}
          <div className="lg:col-span-1">
            <div className="w-48 h-24 flex items-center">
              <img
                src="jensei-footer-logo.png"
                alt="Jensei Logo"
                className="h-20 w-auto object-contain"
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {footerSections.map((section, index) => (
                <div key={index} className="space-y-4">
                  <h3 className="font-['Poppins'] font-medium text-white text-lg uppercase tracking-wider">
                    {section.title}
                  </h3>

                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <a
                          href={link.href}
                          className="font-['Poppins'] text-white text-sm leading-relaxed block cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            onButtonClick();
                          }}
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <p className="font-['Poppins'] text-gray-400 text-sm">
              © 2024 Jensei. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
