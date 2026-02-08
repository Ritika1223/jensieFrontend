// Navigation assets
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { checkAuth, clearAuth, getStoredUser } from '../../utils/auth.js';
import { API_URL } from '../../config/api.js';
import MagneticButton from '../MagneticButton';

export default function Navigation({ onButtonClick }) {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // First check if we have a stored user (quick check)
        const storedUser = getStoredUser();
        if (storedUser) {
          setUser(storedUser);
          setIsAuthenticated(true);
        }

        // Then verify with backend
        const authResult = await checkAuth();
        setIsAuthenticated(authResult.authenticated);
        if (authResult.authenticated && authResult.user) {
          setUser(authResult.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    verifyAuth();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call logout API to clear HTTP-only cookie
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      // Clear local storage
      clearAuth();
      
      // Update state
      setIsAuthenticated(false);
      setUser(null);
      
      // Redirect to landing page
      navigate('/');
      
      // Reload page to ensure clean state
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, clear local storage
      clearAuth();
      setIsAuthenticated(false);
      setUser(null);
      navigate('/');
      window.location.reload();
    }
  };

  return (
    <div className="w-full flex justify-between bg-none mt-4 sm:mt-10 px-4" data-name="Nav bar">
      {/* Logo */}
      <Link to="/" className="cursor-pointer z-50" data-name="Jensei Logo">
        <div className="relative w-full h-full">
          <img
            alt="Jensei Logo"
            className="w-20 sm:w-22 max-w-[120px] sm:max-w-[150px]"
            src="jensei-logo.png"
            loading="eager"
            decoding="async"
          />
        </div>
      </Link>

      {/* Desktop Navigation */}
      <div className="hidden md:flex relative justify-end w-full h-full gap-4">
        {/* Menu Item */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onButtonClick}>
          <p className="left-[1.31rem] top-[0.59rem] font-['Poppins'] text-[0.875rem] leading-[1.31rem] text-[#222222]">
            Menu
          </p>
          <img className="mr-3" src="landing-page/menu-hamburger.svg" alt="Menu" loading="lazy" decoding="async" />
        </div>

        {/* Doctors */}
        <MagneticButton 
          className="flex items-center bg-[rgba(0,0,0,0.04)] rounded-3xl px-4 py-1 transition-colors cursor-pointer" 
          onClick={() => {
            if (isAuthenticated) {
              navigate('/doctors');
            } else {
              navigate('/login');
            }
          }}
        >
          <p className="font-['Poppins'] text-[0.875rem] leading-[1.31rem] text-[#878787]">
            Doctors
          </p>
        </MagneticButton>

        {/* Buddy Ai */}
        <MagneticButton 
          className="flex items-center bg-[rgba(0,0,0,0.04)] rounded-3xl px-4 py-1 transition-colors cursor-pointer hover:bg-[rgba(0,0,0,0.08)] active:scale-95" 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Fast and smooth navigation - scroll to top instantly, then navigate
            window.scrollTo({ top: 0, behavior: 'auto' });
            navigate('/chat', { replace: false });
          }}
        >
          <p className="font-['Poppins'] text-[0.875rem] leading-[1.31rem] text-[#878787]">
            Buddy Ai
          </p>
        </MagneticButton>

        {/* Show Sign up / Log in buttons when NOT authenticated */}
        {!isCheckingAuth && !isAuthenticated && (
          <>
            {/* Sign up button - Optimized */}
            <Link to="/signup" className="bg-[rgba(0,0,0,0.04)] flex items-center justify-center h-[2.5rem] px-[0.625rem] rounded-[0.75rem] w-[6.25rem] cursor-pointer">
              <p className="justify-start text-black/60 text-lg font-medium font-['DM_Sans']">
                Sign up
              </p>
            </Link>

            {/* Log in button - Optimized */}
            <Link to="/login" className="bg-black flex items-center justify-center h-[2.5rem] px-[0.625rem] rounded-[0.75rem] w-[6.25rem] cursor-pointer" data-node-id="4998:509">
              <p className="font-['DM_Sans'] font-medium text-[1.125rem] text-white">
                Log in
              </p>
            </Link>
          </>
        )}

        {/* Show Logout button when authenticated - Optimized */}
        {!isCheckingAuth && isAuthenticated && (
          <button
            onClick={handleLogout}
            className="bg-black flex items-center justify-center h-[2.5rem] px-[0.625rem] rounded-[0.75rem] w-[6.25rem] cursor-pointer"
          >
            <p className="font-['DM_Sans'] font-medium text-[1.125rem] text-white">
              Logout
            </p>
          </button>
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-3 z-50">
        {/* Auth Buttons - Always visible on mobile - Optimized */}
        {!isCheckingAuth && !isAuthenticated && (
          <>
            <Link to="/signup" className="bg-[rgba(0,0,0,0.04)] flex items-center justify-center h-9 px-3 rounded-lg text-sm font-medium font-['DM_Sans'] text-black/60">
              Sign up
            </Link>
            <Link to="/login" className="bg-black flex items-center justify-center h-9 px-3 rounded-lg text-sm font-medium font-['DM_Sans'] text-white">
              Log in
            </Link>
          </>
        )}

        {!isCheckingAuth && isAuthenticated && (
          <button
            onClick={handleLogout}
            className="bg-black flex items-center justify-center h-9 px-3 rounded-lg text-sm font-medium font-['DM_Sans'] text-white"
          >
            Logout
          </button>
        )}

        {/* Hamburger Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center justify-center w-10 h-10 cursor-pointer"
          aria-label="Toggle menu"
        >
          <img 
            className="w-6 h-6" 
            src="landing-page/menu-hamburger.svg" 
            alt="Menu"
            loading="lazy"
            decoding="async"
          />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu - Optimized */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 md:hidden">
            <div className="flex flex-col h-full p-6">
              {/* Close Button */}
              <div className="flex justify-end mb-6">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 flex items-center justify-center"
                  aria-label="Close menu"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 6L6 18M6 6L18 18" stroke="#222222" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Menu Items */}
              <div className="flex flex-col gap-4">
                <button
                  onClick={() => {
                    onButtonClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-left font-['Poppins'] text-base text-[#222222]"
                >
                  <span>Menu</span>
                </button>

                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      navigate('/doctors');
                    } else {
                      navigate('/login');
                    }
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-left font-['Poppins'] text-base text-[#878787]"
                >
                  <span>Doctors</span>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMobileMenuOpen(false);
                    // Fast and smooth navigation - scroll to top instantly, then navigate
                    window.scrollTo({ top: 0, behavior: 'auto' });
                    navigate('/chat', { replace: false });
                  }}
                  className="flex items-center gap-2 text-left font-['Poppins'] text-base text-[#878787] hover:text-[#222222] transition-colors duration-150 active:scale-95"
                >
                  <span>Buddy Ai</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
