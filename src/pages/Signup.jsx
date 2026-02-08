import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '../components/landing-page';
import ComingSoonPopup from '../components/ComingSoonPopup';
import { API_URL } from '../config/api.js';

export default function Signup() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Check for Google OAuth errors in URL
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      let errorMessage = 'Google authentication failed. Please try again.';
      if (error === 'no_code') {
        errorMessage = 'Google authentication was cancelled.';
      } else if (error === 'no_email') {
        errorMessage = 'Unable to retrieve email from Google account.';
      } else if (error === 'google_auth_failed') {
        errorMessage = 'Google authentication failed. Please try again.';
      }
      setErrors({ submit: errorMessage });
      // Clear the error from URL
      navigate('/signup', { replace: true });
    }

    // Check for Google OAuth success
    const googleAuth = searchParams.get('google_auth');
    if (googleAuth === 'success') {
      setSuccessMessage('Account created successfully with Google!');
      // Clear the parameter from URL and redirect
      setTimeout(() => {
        navigate('/doctors', { replace: true });
      }, 2000);
    }
  }, [searchParams, navigate]);

  const handleButtonClick = () => {
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.error) {
          throw new Error(data.error);
        }
        throw new Error('Signup failed. Please try again.');
      }

      // Success - store email and redirect to OTP verification
      if (data.success && data.email) {
        localStorage.setItem('signupEmail', data.email);
        // Redirect to OTP verification page
        navigate(`/verify-otp?email=${encodeURIComponent(data.email)}`);
      } else {
        // Fallback (shouldn't happen with new flow)
        setSuccessMessage(data.message || 'OTP sent to your email!');
        setTimeout(() => {
          navigate('/verify-otp');
        }, 2000);
      }
    } catch (error) {
      console.error('Signup error:', error);
      setErrors({ submit: error.message || 'An error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_URL}/api/auth/google`;
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 relative overflow-hidden"
    >
      {/* Navigation */}
      <div className="max-w-[1340px] mx-auto">
        <Navigation onButtonClick={handleButtonClick} />
      </div>

      {/* Signup Form Container */}
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
            Sign Up
          </h1>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-6">
            {/* Name Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                Name*
              </label>
              <div className="border-l border-gray-900 flex items-center p-[15px]">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="flex-1 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent tracking-[-0.12px]"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-red-500">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                Email address*
              </label>
              <div className="border-l border-gray-300 flex items-center gap-2.5 p-[15px]">
                <img
                  src="/bfbf02caf369c01fe1340c50219d2fd83637bc20.svg"
                  alt="Email icon"
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    // Fallback if icon doesn't exist
                    e.target.style.display = 'none';
                  }}
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="flex-1 text-xs font-medium text-gray-400 placeholder-gray-400 outline-none bg-transparent tracking-[-0.12px]"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                Phone number*
              </label>
              <div className="border-l border-gray-300 flex items-center gap-1.5 p-[15px]">
                <img
                  src="/0d2d1ad148c533103c2ae6058aa8f44a8a53f901.svg"
                  alt="Phone icon"
                  className="w-4 h-4 flex-shrink-0"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter your Phone no."
                  className="flex-1 text-xs font-medium text-gray-400 placeholder-gray-400 outline-none bg-transparent tracking-[-0.12px]"
                />
              </div>
              {errors.phone && (
                <p className="text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                Password*
              </label>
              <div className="border-l border-gray-300 flex items-center gap-1.5 p-[15px]">
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
                  onChange={handleChange}
                  placeholder="Create a password"
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
                Confirm Password*
              </label>
              <div className="border-l border-gray-300 flex items-center gap-1.5 p-[15px]">
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
                  onChange={handleChange}
                  placeholder="Confirm password"
                  className="flex-1 text-xs font-medium text-gray-400 placeholder-gray-400 outline-none bg-transparent tracking-[-0.12px]"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <p className="text-xs text-red-500 mt-2">{errors.submit}</p>
            )}

            {/* Success Message */}
            {successMessage && (
              <p className="text-xs text-green-600 mt-2">{successMessage}</p>
            )}

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-900 flex items-center justify-center gap-2 p-4 rounded-[4px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <span className="text-base font-medium text-white whitespace-pre tracking-[-0.16px]">
                Sign up
              </span>
              <img
                src="/66ef5b2bd24bd0c05c63341136f6c3aba39c1318.svg"
                alt="Arrow icon"
                className="w-4 h-4 flex-shrink-0"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </button>
          </form>

          {/* Social Login */}
          <div className="flex flex-col sm:flex-row items-center gap-2 p-4 mt-2">
            <p className="flex-1 text-base text-center text-[#667085] leading-[1.5]">
              Or login with
            </p>
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="flex-1 bg-white border border-[#d0d5dd] flex items-center justify-center gap-2 px-6 py-[13px] rounded-[4px] hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <img
                src="/94aab567d7f62fc603b87f71e26f5fb4dcbbe73f.png"
                alt="Google icon"
                className="w-12 h-auto"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <span className="text-lg text-[#0c141d] whitespace-pre leading-[1.5]">
                Google
              </span>
            </button>
          </div>

          {/* Login Link */}
          <div className="flex items-center justify-center gap-2 py-0 px-2.5 pb-[10px] mt-2">
            <p className="text-sm font-medium text-gray-400 whitespace-pre tracking-[-0.14px]">
              Already have an account?
            </p>
            <Link
              to="/login"
              className="text-sm font-medium text-gray-900 underline tracking-[-0.14px]"
            >
              Log in
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Coming Soon Popup */}
      <ComingSoonPopup isOpen={showPopup} onClose={closePopup} />
    </div>
  );
}

