import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '../components/landing-page';
import { API_URL } from '../config/api.js';

export default function VerifyOTP() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    // Get email from URL params or localStorage
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('signupEmail');
    const emailToUse = emailParam || storedEmail;
    
    if (!emailToUse) {
      // No email found, redirect to signup
      navigate('/signup');
      return;
    }
    
    setEmail(emailToUse);
    localStorage.setItem('signupEmail', emailToUse);
  }, [searchParams, navigate]);

  // Countdown timer for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }

    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: '' }));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      // Focus last input
      const lastInput = document.getElementById('otp-5');
      if (lastInput) {
        lastInput.focus();
      }
    }
  };

  const validateOTP = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit OTP' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateOTP()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const otpString = otp.join('');

      const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          otp: otpString,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed');
      }

      // Success - store user data and token
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || ''); // Store token for API clients if needed
      }
      
      // Clear stored email and redirect
      setSuccessMessage(data.message || 'Email verified successfully!');
      localStorage.removeItem('signupEmail');
      
      // Redirect to doctors page after 2 seconds
      setTimeout(() => {
        navigate('/doctors');
      }, 2000);
    } catch (error) {
      console.error('OTP verification error:', error);
      setErrors({ submit: error.message || 'Invalid OTP. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) {
      return;
    }

    setIsResending(true);
    setErrors({});

    try {
      const response = await fetch(`${API_URL}/api/auth/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP');
      }

      setSuccessMessage(data.message || 'OTP resent to your email.');
      setCountdown(60); // 60 second countdown
      setOtp(['', '', '', '', '', '']); // Clear OTP inputs
      
      // Focus first input
      const firstInput = document.getElementById('otp-0');
      if (firstInput) {
        firstInput.focus();
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setErrors({ submit: error.message || 'Failed to resend OTP. Please try again.' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 relative overflow-hidden"
    >
      {/* Navigation */}
      <div className="max-w-[1340px] mx-auto">
        <Navigation />
      </div>

      {/* OTP Form Container */}
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
            <h1 className="text-4xl font-medium text-gray-900 tracking-[-1.2px] leading-none mb-0">
              Verify Your Email
            </h1>
            <p className="text-sm text-gray-600 mt-2 mb-0">
              We've sent a 6-digit OTP to <strong>{email}</strong>
            </p>

            {/* Success Message */}
            {successMessage && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-xs text-green-800">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-xs text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* OTP Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-6">
              {/* OTP Input Fields */}
              <div className="flex flex-col gap-2.5">
                <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                  Enter OTP*
                </label>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={index === 0 ? handlePaste : undefined}
                      className="w-12 h-14 text-center text-xl font-bold border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              {errors.otp && (
                <p className="text-xs text-red-500">{errors.otp}</p>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-gray-900 flex items-center justify-center gap-2 p-4 rounded-[4px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
              >
                <span className="text-base font-medium text-white whitespace-pre tracking-[-0.16px]">
                  {isSubmitting ? 'Verifying...' : 'Verify OTP'}
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

              {/* Resend OTP */}
              <div className="flex items-center justify-center gap-2 py-0 px-2.5 pb-[10px] mt-2">
                <p className="text-sm font-medium text-gray-400 whitespace-pre tracking-[-0.14px]">
                  Didn't receive the OTP?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResending || countdown > 0}
                  className="text-sm font-medium text-gray-900 underline tracking-[-0.14px] disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
                >
                  {countdown > 0 
                    ? `Resend in ${countdown}s` 
                    : isResending 
                    ? 'Sending...' 
                    : 'Resend OTP'}
                </button>
              </div>

              {/* Back to Signup */}
              <div className="flex items-center justify-center gap-2 py-0 px-2.5 pb-[10px] mt-2">
                <p className="text-sm font-medium text-gray-400 whitespace-pre tracking-[-0.14px]">
                  Want to change email?
                </p>
                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem('signupEmail');
                    navigate('/signup');
                  }}
                  className="text-sm font-medium text-gray-900 underline tracking-[-0.14px]"
                >
                  Back to Signup
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

