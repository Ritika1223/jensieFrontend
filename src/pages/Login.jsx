import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Navigation } from '../components/landing-page';
import ComingSoonPopup from '../components/ComingSoonPopup';
import { API_URL } from '../config/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
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
      navigate('/login', { replace: true });
    }

    // Check for Google OAuth success
    const googleAuth = searchParams.get('google_auth');
    if (googleAuth === 'success') {
      setSuccessMessage('Successfully logged in with Google!');
      // Clear the parameter from URL
      navigate('/doctors', { replace: true });
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

    if (!formData.username.trim()) {
      newErrors.username = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.username)) {
      newErrors.username = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
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
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Important for cookies
        body: JSON.stringify({
          email: formData.username.trim(), // Backend expects email
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle validation errors from backend
        if (data.error) {
          throw new Error(data.error);
        }
        throw new Error('Login failed. Please try again.');
      }

      // Success - store user data in localStorage
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token || ''); // Store token for API clients if needed
      }

      // Show success message
      setSuccessMessage(data.message || 'Login successful!');

      // Redirect to doctors page
        navigate('/doctors');
    } catch (error) {
      console.error('Login error:', error);
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

      {/* Login Form Container */}
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
            Log in
          </h1>

          {/* Form Fields */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 mt-6">
            {/* User Name Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                User Name
              </label>
              <div className="border-l border-gray-900 flex items-center p-[15px]">
                <input
                  type="email"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="flex-1 text-xs font-medium text-gray-900 placeholder-gray-400 outline-none bg-transparent tracking-[-0.12px]"
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500">{errors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2.5">
              <label className="text-sm font-medium text-gray-900 tracking-[-0.14px]">
                Password
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
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="flex-1 text-xs font-medium text-gray-400 placeholder-gray-400 outline-none bg-transparent tracking-[-0.12px]"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
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

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-gray-900 flex items-center justify-center gap-2 p-4 rounded-[4px] mt-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <span className="text-base font-medium text-white whitespace-pre tracking-[-0.16px]">
                Sign in
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

            {/* Forgot Password Link */}
            <div className="flex items-center justify-end mt-2">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-gray-900 underline tracking-[-0.14px] hover:text-gray-700"
              >
                Forgot password?
              </Link>
            </div>
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

          {/* Sign Up Link */}
          <div className="flex items-center justify-center gap-2 py-0 px-2.5 pb-[10px] mt-2">
            <p className="text-sm font-medium text-gray-400 whitespace-pre tracking-[-0.14px]">
              Don't have an account?
            </p>
            <Link
              to="/signup"
              className="text-sm font-medium text-gray-900 underline tracking-[-0.14px]"
            >
              Sign up
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

