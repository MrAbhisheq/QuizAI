import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Brain, LayoutDashboard, Settings, LogOut, LogIn, User, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentUser, signOut } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const NavLinks = () => (
    <>
      <Link
        to="/generate"
        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
          isActive('/generate') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Brain className="w-5 h-5" />
        <span>Generate</span>
      </Link>
      <Link
        to="/dashboard"
        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
          isActive('/dashboard') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>My Quizzes</span>
      </Link>
      <Link
        to="/settings"
        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
          isActive('/settings') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </Link>
      <Link
        to="/profile"
        className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
          isActive('/profile') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        <User className="w-5 h-5" />
        <span>Profile</span>
      </Link>
      <button
        onClick={() => {
          signOut();
          setIsMobileMenuOpen(false);
        }}
        className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors w-full text-left"
      >
        <LogOut className="w-5 h-5" />
        <span>Sign Out</span>
      </button>
    </>
  );

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600">
              <Brain className="w-7 h-7" />
              <span className="hidden sm:inline">QuizAI</span>
            </Link>

            {/* Desktop Navigation */}
            {currentUser ? (
              <>
                {/* Desktop Menu - Hidden on mobile */}
                <div className="hidden lg:flex items-center gap-2">
                  <Link
                    to="/generate"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/generate') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Brain className="w-5 h-5" />
                    <span>Generate</span>
                  </Link>
                  <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/dashboard') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>My Quizzes</span>
                  </Link>
                  <Link
                    to="/settings"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/settings') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span>Settings</span>
                  </Link>
                  <Link
                    to="/profile"
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive('/profile') ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>

                {/* Mobile Hamburger Menu */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="w-6 h-6" />
                  ) : (
                    <Menu className="w-6 h-6" />
                  )}
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Side Drawer */}
      {currentUser && (
        <>
          {/* Overlay */}
          {isMobileMenuOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Drawer */}
          <div
            className={`fixed top-0 right-0 h-full w-64 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2 text-lg font-bold text-blue-600">
                <Brain className="w-6 h-6" />
                <span>QuizAI</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex flex-col gap-1 p-4">
              <NavLinks />
            </div>

            {/* Drawer Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <p className="font-medium truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};
