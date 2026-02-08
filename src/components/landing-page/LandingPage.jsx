import { useState } from 'react';
import HeroBanner from './HeroBanner';
import Navigation from './Navigation';
import ComingSoonPopup from '../ComingSoonPopup';
import PrecisionSection from './PrecisionSection';
import AboutSection from './AboutSection';
import ServiceSection from './ServiceSection';
import FeaturesSection from './FeaturesSection';
import AdvancedSection from './AdvancedSection';
import SmartSection from './SmartSection';
import Footer from './Footer';

export default function LandingPage() {
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="relative w-full min-h-screen bg-neutral-100 overflow-x-hidden" data-name="Landing Page" data-node-id="5148:1003">
      <div className="max-w-[1340px] m-auto px-2 sm:px-4">
        <Navigation onButtonClick={handleButtonClick} />
        <HeroBanner onButtonClick={handleButtonClick} />
      </div>

      <PrecisionSection onButtonClick={handleButtonClick} />
      <AboutSection onButtonClick={handleButtonClick} />
      <ServiceSection onButtonClick={handleButtonClick} />
      <FeaturesSection onButtonClick={handleButtonClick} />
      <AdvancedSection onButtonClick={handleButtonClick} />
      <SmartSection onButtonClick={handleButtonClick} />
      <Footer onButtonClick={handleButtonClick} />

      <ComingSoonPopup isOpen={showPopup} onClose={closePopup} />
    </div>
  );
}
