import { useState } from 'react';

export default function ComingSoonPopup({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="text-blue-600">
              <path d="M16 2L20.09 10.26L29 12L20.09 13.74L16 22L11.91 13.74L3 12L11.91 10.26L16 2Z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="currentColor" opacity="0.2" />
              <path d="M16 2L20.09 10.26L29 12L20.09 13.74L16 22L11.91 13.74L3 12L11.91 10.26L16 2Z"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-['Poppins'] font-semibold text-zinc-800">
            More Features Coming Soon!
          </h2>

          {/* Message */}
          <p className="text-base font-['Poppins'] text-zinc-600 leading-relaxed">
            We're working hard to bring you amazing new features and pages. Stay tuned for updates as we continue to enhance your healthcare experience with AI-powered solutions.
          </p>

          {/* Features List */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-['Poppins'] text-zinc-700">Enhanced Dashboard</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-['Poppins'] text-zinc-700">Doctor Consultation Portal</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="text-sm font-['Poppins'] text-zinc-700">AI Health Insights</span>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-3 rounded-full font-['Poppins'] font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
}
