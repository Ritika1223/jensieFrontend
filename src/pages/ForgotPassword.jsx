import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/landing-page';
import ComingSoonPopup from '../components/ComingSoonPopup';
import { API_URL } from '../config/api.js';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPopup, setShowPopup] = useState(false);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors((prev) => ({ ...prev, email: '' }));
    }
  };

  const validateEmail = () => {
    if (!email.trim()) {
      setErrors({ email: 'Email is required' });
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateEmail()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error) {
          throw new Error(data.error);
        }
        throw new Error('Failed to send OTP. Please try again.');
      }

      // Success - store email and redirect to reset password page
      if (data.success && data.email) {
        localStorage.setItem('resetPasswordEmail', data.email);
        setSuccessMessage(data.message || 'OTP sent to your email!');
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(data.email)}`);
        }, 1500);
      } else {
        setSuccessMessage(data.message || 'If an account with that email exists, an OTP has been sent.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setErrors({ submit: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 relative overflow-hidden"
    >
      {/* Navigation */}
      <div className="max-w-[1340px] mx-auto">
        <Navigation onButtonClick={handleButtonClick} />
      </div>

      {/* Forgot Password Form Container */}
      <div
        className="flex items-center justify-center px-4 py-8 min-h-[calc(100vh-120px)]"
        style={{
            backgroundImage: 'url("/signup/world-map-min.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'top',
            backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="w-full max-w-[496px] bg-white rounded-lg shadow-[8px_4px_44px_0px_rgba(17,24,39,0.03)] p-8 relative z-10">
          {/* Form Container */}
          <div className="flex flex-col gap-2.5">
            {/* Heading */}
            <h1 className="text-[40px] font-medium text-gray-900 tracking-[-1.2px] leading-none mb-0">
              Forgot Password
            </h1>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {/* Form Fields */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-6">
              {/* Email Field */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                  Email Address
                </label>
                <div className="border-l border-gray-900 flex items-center p-[15px]">
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="flex-1 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent tracking-[-0.12px]"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <p className="text-xs text-red-500 mt-2">{errors.submit}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-900 flex items-center justify-center gap-2 p-4 rounded-[4px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <span className="text-base font-medium text-white whitespace-pre tracking-[-0.16px]">
                  {isSubmitting ? 'Sending...' : 'Send OTP'}
                </span>
                {!isSubmitting && (
                  <img
                    src="/66ef5b2bd24bd0c05c63341136f6c3aba39c1318.svg"
                    alt="Arrow icon"
                    className="w-4 h-4 flex-shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </button>
            </form>

            {/* Back to Login Link */}
            <div className="flex items-center justify-center gap-2 py-0 px-2.5 pb-[10px] mt-4">
              <p className="text-sm font-medium text-gray-400 whitespace-pre tracking-[-0.14px]">
                Remember your password?
              </p>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-sm font-medium text-gray-900 underline tracking-[-0.14px]"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Popup */}
      <ComingSoonPopup isOpen={showPopup} onClose={closePopup} />
    </div>
  );
}

