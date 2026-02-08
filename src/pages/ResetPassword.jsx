import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '../components/landing-page';
import ComingSoonPopup from '../components/ComingSoonPopup';
import { API_URL } from '../config/api.js';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [step, setStep] = useState('otp'); // 'otp' or 'password'
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    const storedEmail = localStorage.getItem('resetPasswordEmail');
    const emailToUse = emailParam || storedEmail;

    if (!emailToUse) {
      navigate('/forgot-password');
      return;
    }

    setEmail(emailToUse);
    localStorage.setItem('resetPasswordEmail', emailToUse);
  }, [searchParams, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) {
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < otp.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
    setErrors((prev) => ({ ...prev, otp: '' }));
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = pasteData.split('').slice(0, 6).concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);
    const lastFilledIndex = newOtp.findIndex((digit) => !digit) - 1;
    if (lastFilledIndex >= 0) {
      inputRefs.current[lastFilledIndex]?.focus();
    } else {
      inputRefs.current[5]?.focus();
    }
    setErrors((prev) => ({ ...prev, otp: '' }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateOtp = () => {
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6 || !/^\d{6}$/.test(fullOtp)) {
      setErrors({ otp: 'Please enter a valid 6-digit OTP.' });
      return false;
    }
    return true;
  };

  const validatePassword = () => {
    const newErrors = {};

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!validateOtp()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-reset-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, otp: otp.join('') }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'OTP verification failed.');
      }

      setSuccessMessage('OTP verified successfully! Please set your new password.');
      setStep('password');
      setOtp(['', '', '', '', '', '']); // Clear OTP
    } catch (error) {
      console.error('Verify OTP error:', error);
      setErrors({ submit: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Password reset failed.');
      }

      setSuccessMessage('Password reset successfully! Redirecting to login...');
      localStorage.removeItem('resetPasswordEmail');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ submit: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setErrors({});
    setSuccessMessage('');
    setOtp(['', '', '', '', '', '']);

    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend OTP.');
      }

      setSuccessMessage(data.message || 'New OTP sent to your email.');
      setCountdown(60);
      inputRefs.current[0]?.focus();
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
        <Navigation onButtonClick={handleButtonClick} />
      </div>

      {/* Reset Password Form Container */}
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
              {step === 'otp' ? 'Verify OTP' : 'Reset Password'}
            </h1>
            <p className="text-sm text-gray-600 mt-2 mb-6">
              {step === 'otp'
                ? `We've sent a 6-digit OTP to ${email}`
                : 'Please enter your new password'}
            </p>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{errors.submit}</p>
              </div>
            )}

            {/* OTP Step */}
            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="flex flex-col gap-2.5 mt-6">
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
                        ref={(el) => (inputRefs.current[index] = el)}
                      />
                    ))}
                  </div>
                  {errors.otp && (
                    <p className="text-xs text-red-500 text-center mt-2">{errors.otp}</p>
                  )}
                </div>

                {/* Verify Button */}
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
              </form>
            )}

            {/* Password Reset Step */}
            {step === 'password' && (
              <form onSubmit={handleResetPassword} className="flex flex-col gap-2.5 mt-6">
                {/* New Password Field */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                    New Password
                  </label>
                  <div className="border-l border-gray-300 flex items-center gap-2.5 p-[15px]">
                    <img
                      src="/fee53d72d545adeed2055a609c3d6984f2eaa035.svg"
                      alt="Lock icon"
                      className="w-4 h-4 flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      placeholder="Enter your new password"
                      className="flex-1 text-xs font-medium text-gray-400 placeholder-gray-400 outline-none bg-transparent tracking-[-0.12px]"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                    Confirm New Password
                  </label>
                  <div className="border-l border-gray-300 flex items-center gap-2.5 p-[15px]">
                    <img
                      src="/fee53d72d545adeed2055a609c3d6984f2eaa035.svg"
                      alt="Lock icon"
                      className="w-4 h-4 flex-shrink-0"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="Confirm your new password"
                      className="flex-1 text-xs font-medium text-gray-400 placeholder-gray-400 outline-none bg-transparent tracking-[-0.12px]"
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500">{errors.confirmPassword}</p>
                  )}
                </div>

                {/* Reset Password Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gray-900 flex items-center justify-center gap-2 p-4 rounded-[4px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <span className="text-base font-medium text-white whitespace-pre tracking-[-0.16px]">
                    {isSubmitting ? 'Resetting...' : 'Reset Password'}
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
            )}

            {/* Back to Login Link */}
            <div className="flex items-center justify-center gap-2 py-0 px-2.5 pb-[10px] mt-4">
              <p className="text-sm font-medium text-gray-400 whitespace-pre tracking-[-0.14px]">
                Remember your password?
              </p>
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem('resetPasswordEmail');
                  navigate('/login');
                }}
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

