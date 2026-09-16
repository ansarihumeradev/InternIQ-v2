import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, MapPin, Eye, EyeOff, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [emailExists, setEmailExists] = useState<boolean | null>(null);
  const [selectedRole, setSelectedRole] = useState<'student' | 'recruiter'>('student');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    skills: '',
    phone: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState('');

  const { login, register, resetPassword, loading, error, clearError, checkEmailExists } = useAuth();

  // Clear errors when modal opens/closes or switches modes
  useEffect(() => {
    if (isOpen) {
      clearError();
      setFormErrors({});
      setSuccessMessage('');
      setEmailExists(null);
      setIsCheckingEmail(false);
      // Reset form data when modal opens
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        location: '',
        skills: '',
        phone: ''
      });
    }
  }, [isOpen, clearError]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!isLogin) {
      if (!formData.name.trim()) {
        errors.name = 'Name is required';
      }

      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }

      if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
        errors.phone = 'Please enter a valid phone number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailCheck = async () => {
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setFormErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setIsCheckingEmail(true);
    setFormErrors({});
    clearError();

    try {
      const exists = await checkEmailExists(formData.email.trim());
      setEmailExists(exists);
      
      if (exists) {
        // Email exists, show login form
        setIsLogin(true);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        // Email doesn't exist, show sign-up form
        setIsLogin(false);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      console.error('Error checking email:', err);
      setFormErrors({ email: 'Error checking email. Please try again.' });
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', { isLogin, formData: { ...formData, password: '***' } });
    
    if (!validateForm()) {
      console.log('Form validation failed:', formErrors);
      return;
    }

    try {
      if (isLogin) {
        console.log('Attempting login...');
        await login(formData.email.trim(), formData.password);
        console.log('Login successful');
        setSuccessMessage('Successfully logged in!');
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
          resetForm();
        }, 1500);
      } else {
        console.log('Attempting registration...');
        await register({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          role: selectedRole,
          location: formData.location.trim(),
          skills: formData.skills.split(',').map(s => s.trim()).filter(s => s),
          phone: formData.phone.trim()
        });
        console.log('Registration successful');
        setSuccessMessage(`Account created successfully as ${selectedRole.toUpperCase()}!`);
        setTimeout(() => {
          onClose();
          setSuccessMessage('');
          resetForm();
        }, 1500);
      }
    } catch (error) {
      console.error('Auth error:', error);
      // Error is handled by the context
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      location: '',
      skills: '',
      phone: ''
    });
    setFormErrors({});
    setEmailExists(null);
    setIsCheckingEmail(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBackToEmailCheck = () => {
    setEmailExists(null);
    setIsCheckingEmail(false);
    setFormData(prev => ({ ...prev, password: '', confirmPassword: '', name: '' }));
    setFormErrors({});
    clearError();
  };

  const handleClose = () => {
    console.log('Closing auth modal');
    onClose();
    resetForm();
  };

  // Don't render if not open
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            {emailExists !== null && (
              <button
                onClick={handleBackToEmailCheck}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {emailExists === null ? 'Welcome' : 
                 emailExists ? 'Sign In' : 'Create Account'}
              </h2>
              <p className="text-sm text-gray-600">
                {emailExists === null ? 'Enter your email to continue' :
                 emailExists ? 'Welcome back! Please sign in to your account' :
                 'Create your account to get started'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Check Step */}
            {emailExists === null && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={isCheckingEmail}
                    />
                  </div>
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleEmailCheck}
                  disabled={isCheckingEmail || !formData.email.trim()}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isCheckingEmail ? 'Checking...' : 'Continue'}
                </button>
              </div>
            )}

            {/* Login Form */}
            {emailExists === true && (
              <div className="space-y-4">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </div>
            )}

            {/* Sign Up Form */}
            {emailExists === false && (
              <div className="space-y-4">
                {/* Role Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am joining as:
                  </label>
                  <div className="grid grid-cols-2 gap-3 mb-2">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center ${
                        selectedRole === 'student'
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🎓 Student</span>
                      <span className="text-[10px] font-normal text-slate-500">Apply & Build Skills</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('recruiter')}
                      className={`p-3 rounded-xl border text-sm font-semibold transition-all flex flex-col items-center justify-center ${
                        selectedRole === 'recruiter'
                          ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm ring-2 ring-indigo-500/20'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>🏢 Recruiter</span>
                      <span className="text-[10px] font-normal text-slate-500">Post & Hire Interns</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="Create a password"
                      className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            )}
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {error}
              </p>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                {successMessage}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default AuthModal;