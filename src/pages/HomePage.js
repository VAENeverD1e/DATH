import Navbar from "../components/NavBar";
import React from "react";
import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen relative">
      {/* Background image (full screen) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/assets/Homepage_background.png')" }}
        aria-hidden="true"
      />
      {/* Gradient overlay so text stays readable */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 opacity-80" aria-hidden="true" />

      {/* Main content placed above background */}
      <div className="relative z-10">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex items-center">
                <img 
                  src="/assets/logo.png" 
                  alt="MediSafe Logo" 
                  className="h-12 w-auto"
                />
                <span className="ml-3 text-3xl font-bold text-gray-800">MediSafe</span>
              </div>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Home
                </Link>
                <Link to="/services" className="text-gray-700 hover:text-blue-600 font-medium">
                  Services
                </Link>
                <Link to="/about" className="text-gray-700 hover:text-blue-600 font-medium">
                  About Us
                </Link>
                <Link to="/contact" className="text-gray-700 hover:text-blue-600 font-medium">
                  Contact
                </Link>
              </div>

              {/* Right Side Actions */}
              <div className="flex items-center space-x-4">
                <button className="px-6 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors">
                  Log in
                </button>
                <div className="flex items-center space-x-2 border border-gray-300 rounded-lg px-3 py-2">
                  <img 
                    src="https://cdn.jsdelivr.net/npm/flag-icons@6.6.6/flags/4x3/gb.svg" 
                    alt="EN" 
                    className="h-4 w-6"
                  />
                  <span className="font-medium">EN</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Search - Book - Feel Better
              </h1>
              
              <p className="text-xl text-gray-700 leading-relaxed">
                Delivering care<br />
                with expertise,<br />
                guided by<br />
                medical ethics<br />
                and deep<br />
                compassion
              </p>

              <div className="inline-flex items-center bg-red-50 rounded-full px-8 py-4 shadow-lg">
                <svg className="w-8 h-8 text-blue-400 mr-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-red-700 text-2xl font-bold">Meet the</p>
                  <p className="text-red-700 text-2xl font-bold">Best Doctor</p>
                </div>
              </div>
            </div>

            {/* Right Content - (image removed; background shows the art) */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
