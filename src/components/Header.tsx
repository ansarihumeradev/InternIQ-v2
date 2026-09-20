import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, User, Bell, Menu, X, Briefcase, ChevronDown, Bookmark } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  const studentNavigation = [
    { name: 'Home', href: '/' },
    { name: 'Internships', href: '/internships' },
    { name: 'Companies', href: '/companies' },
  ];

  const recruiterNavigation = [
    { name: 'Home', href: '/' },
    { name: 'My Listings', href: '/dashboard' },
    { name: 'Post Internship/Job', href: '/dashboard?action=post' },
    { name: 'Applicants', href: '/dashboard' },
    { name: 'Companies', href: '/companies' },
  ];

  const navigation = user?.role === 'recruiter' ? recruiterNavigation : studentNavigation;

  const services = [
    { name: 'Career Guidance', href: '/career-guidance', description: 'Get personalized mentorship' },
    { name: 'Resume Builder', href: '/resume-builder', description: 'Create ATS-friendly resumes' },
    { name: 'Interview Prep', href: '/interview-prep', description: 'Practice with mock interviews' },
    { name: 'Skill Development', href: '/skill-development', description: 'Enhance your skills' },
    { name: 'Online Branding', href: '/online-branding', description: 'Build your digital presence' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleSignInClick = () => {
    console.log('Sign In button clicked');
    setIsAuthModalOpen(true);
  };

  const handleAuthModalClose = () => {
    console.log('Auth modal close requested');
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    logout();
  };

  if (location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-xl shadow-sm">
                <Briefcase className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent tracking-tight">
                  InternIQ
                </span>
                <span className="text-[9px] font-semibold tracking-wider text-slate-400 uppercase -mt-1">
                  Advanced Hiring Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-tag text-sm font-medium transition-all duration-200 ${isActive(item.href)
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                    }`}
                >
                  {item.name}
                </Link>
              ))}

              {/* Services Dropdown (Student Only) */}
              {user?.role !== 'recruiter' && (
                <div className="relative">
                  <button
                    onMouseEnter={() => setIsServicesOpen(true)}
                    onMouseLeave={() => setIsServicesOpen(false)}
                    className="flex items-center px-3 py-2 rounded-tag text-sm font-medium text-slate-600 hover:text-teal-600 hover:bg-slate-50 transition-all duration-200"
                  >
                    Services
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>

                  {isServicesOpen && (
                    <div
                      onMouseEnter={() => setIsServicesOpen(true)}
                      onMouseLeave={() => setIsServicesOpen(false)}
                      className="absolute top-full left-0 mt-1 w-80 bg-white rounded-card shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 py-2 z-50"
                    >
                      {services.map((service) => (
                        <Link
                          key={service.name}
                          to={service.href}
                          className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                        >
                          <div className="font-medium text-slate-800">{service.name}</div>
                          <div className="text-sm text-slate-500">{service.description}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="p-2 text-slate-500 hover:text-teal-600 transition-colors"
                  >
                    <Bell className="h-5 w-5" />
                  </Link>
                  <div className="relative group">
                    <button className="flex items-center space-x-2 p-1.5 rounded-tag hover:bg-slate-50 transition-all border border-slate-100">
                      <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-400 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="hidden md:flex flex-col items-start text-left">
                        <span className="text-xs font-bold text-slate-700 leading-tight">
                          {user.name}
                        </span>
                        <span className={`text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md mt-0.5 ${user.role === 'recruiter'
                            ? 'bg-purple-50 text-purple-600'
                            : user.role === 'admin'
                              ? 'bg-rose-50 text-rose-600'
                              : 'bg-teal-50 text-teal-600'
                          }`}>
                          {user.role || 'student'}
                        </span>
                      </div>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-card shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-slate-600 hover:text-teal-600 hover:bg-slate-50 rounded-t-xl transition-colors"
                      >
                        Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-slate-600 hover:text-teal-600 hover:bg-slate-50 transition-colors"
                      >
                        Dashboard
                      </Link>
                      {user.role !== 'recruiter' && (
                        <Link
                          to="/dashboard?tab=saved"
                          className="block px-4 py-2 text-sm text-slate-600 hover:text-teal-600 hover:bg-slate-50 flex items-center justify-between transition-colors"
                        >
                          <span>Saved Items</span>
                          <Bookmark className="h-4 w-4 text-teal-500" />
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-b-xl transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <button
                  onClick={handleSignInClick}
                  className="bg-gradient-to-r from-primary-600 to-accent-600 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200"
                >
                  Sign In
                </button>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-500 hover:text-teal-600 transition-colors"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-white border-t border-slate-100"
          >
            <div className="px-4 py-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`block px-3 py-2 rounded-tag text-sm font-medium transition-colors ${isActive(item.href)
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-slate-600 hover:text-teal-600 hover:bg-slate-50'
                    }`}
                >
                  {item.name}
                </Link>
              ))}

              {user?.role !== 'recruiter' && (
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-xs font-medium text-slate-400 px-3 py-2">Services</div>
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      to={service.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block px-3 py-2 rounded-tag text-sm text-slate-600 hover:text-teal-600 hover:bg-slate-50 transition-colors"
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </header>

      <AuthModal isOpen={isAuthModalOpen} onClose={handleAuthModalClose} />
    </>
  );
};

export default Header;