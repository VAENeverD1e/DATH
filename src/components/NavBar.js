import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const userMenuRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const toggleUserMenu = () => {
    setIsUserOpen(!isUserOpen);
  };

  useEffect(() => {
    // Read user from sessionStorage first (remember-me = false), then fall back to localStorage
    try {
      const rawSession = sessionStorage.getItem('user');
      const rawLocal = localStorage.getItem('user');
      const raw = rawSession || rawLocal;
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  useEffect(() => {
    // Close user menu on outside click
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    setUser(null);
    setIsUserOpen(false);
    navigate('/admin-login');
  };

  const goToDashboard = () => {
    setIsUserOpen(false);
    if (!user || !user.role) return navigate('/');
    // Basic role-based dashboard routing
    if (user.role === 'admin') return navigate('/admin-dashboard');
    if (user.role === 'doctor') return navigate('/doctor');
    return navigate('/home');
  };

  return (
    <nav className="bg-white shadow-sm fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo Section */}
          <div className="flex items-center">
            <img 
              src="/assets/logo.png" 
              alt="MediSafe Logo" 
              className="h-12 w-auto"
            />
            <span className="ml-3 text-3xl font-bold text-gray-800">MediSafe</span>
          </div>
          
          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/home" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Home
            </Link>
            <Link 
              to="/services" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Services
            </Link>
            <Link 
              to="/about" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200"
            >
              Contact
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Log in Button */}
            {!user ? (
              <Link to="/admin-login" className="px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors duration-200 font-medium">
                Log in
              </Link>
            ) : (
              <div className="relative" ref={userMenuRef}>
                <button onClick={toggleUserMenu} className="flex items-center space-x-3 border border-gray-200 rounded-full px-3 py-1 hover:shadow-sm transition-shadow duration-150">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="avatar" className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="h-9 w-9 rounded-full bg-blue-400 text-white flex items-center justify-center font-semibold">
                      {user.name ? user.name.split(' ').map(s => s[0]).slice(0,2).join('') : 'U'}
                    </div>
                  )}
                  <span className="hidden sm:inline font-medium">Hello ~</span>
                </button>

                {isUserOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                    <button onClick={goToDashboard} className="w-full text-left px-4 py-2 hover:bg-gray-50">Dashboard</button>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-50">Logout</button>
                  </div>
                )}
              </div>
            )}
            
            {/* Language Selector */}
            <div className="relative">
              <button 
                onClick={toggleLanguage}
                className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2 hover:bg-gray-50 transition-colors duration-200"
              >
                <img 
                  src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gb.svg" 
                  alt="EN" 
                  className="h-4 w-6"
                />
                <span className="font-medium">EN</span>
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isLanguageOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Language Dropdown */}
              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
                  <button className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors">
                    <img 
                      src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gb.svg" 
                      alt="EN" 
                      className="h-4 w-6"
                    />
                    <span>English</span>
                  </button>
                  <button className="w-full flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors">
                    <img 
                      src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/vn.svg" 
                      alt="VI" 
                      className="h-4 w-6"
                    />
                    <span>Tiếng Việt</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Home
              </Link>
              <Link to="/services" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Services
              </Link>
              <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                About Us
              </Link>
              <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium transition-colors duration-200">
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;