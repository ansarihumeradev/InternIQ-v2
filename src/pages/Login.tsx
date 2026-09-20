import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  User,
  Building2,
  GraduationCap,
  Briefcase,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Official Google Multi-color Icon
const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.94 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

// GitHub Clean Icon
const GitHubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

interface LoginProps {
  initialMode?: 'login' | 'signup';
}

const Login: React.FC<LoginProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [selectedRole, setSelectedRole] = useState<'student' | 'recruiter'>('student');

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotError, setForgotError] = useState('');

  // OAuth loading state
  const [oauthLoading, setOauthLoading] = useState<'google' | 'github' | null>(null);
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local UI status
  const [uiError, setUiError] = useState<string | null>(null);
  const [uiSuccess, setUiSuccess] = useState<string | null>(null);

  const { login, register, resetPassword, signInWithOAuth, loading, error, clearError, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check URL hash & search parameters for OAuth callbacks or errors
  useEffect(() => {
    const hash = window.location.hash;
    const search = window.location.search;

    if (hash.includes('access_token=') || search.includes('code=')) {
      setIsProcessingCallback(true);
    }

    // Capture OAuth error if any was returned from provider
    const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
    const searchParams = new URLSearchParams(search);
    const oauthErrorDesc =
      hashParams.get('error_description') ||
      searchParams.get('error_description') ||
      hashParams.get('error') ||
      searchParams.get('error');

    if (oauthErrorDesc) {
      setUiError(decodeURIComponent(oauthErrorDesc.replace(/\+/g, ' ')));
      setIsProcessingCallback(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  // Handle role-based redirect once user is authenticated
  useEffect(() => {
    if (user) {
      setIsProcessingCallback(false);
      // Determine destination: intended protected page, or role-specific workspace
      const fromPath = (location.state as any)?.from?.pathname;
      if (fromPath && fromPath !== '/login' && fromPath !== '/signup') {
        navigate(fromPath, { replace: true });
      } else if (user.role === 'recruiter') {
        // Direct recruiters to their recruiter dashboard/workspace
        navigate('/dashboard', { replace: true });
      } else {
        // Direct students to their student dashboard
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, navigate, location.state]);

  // Sync mode with prop change if navigation changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Clear errors when switching modes
  const switchMode = (newMode: 'login' | 'signup') => {
    clearError();
    setUiError(null);
    setUiSuccess(null);
    setMode(newMode);
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setOauthLoading(provider);
    setUiError(null);
    clearError();
    try {
      await signInWithOAuth(provider, {
        redirectTo: `${window.location.origin}/login`,
        role: mode === 'signup' ? selectedRole : undefined,
      });
    } catch (err: any) {
      setUiError(err?.message || `Failed to sign in with ${provider}`);
      setOauthLoading(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUiError(null);
    setUiSuccess(null);
    clearError();

    if (!email.trim()) {
      setUiError('Please enter your email address');
      return;
    }
    if (!email.includes('@')) {
      setUiError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setUiError('Please enter your password');
      return;
    }

    if (mode === 'signup') {
      if (!name.trim()) {
        setUiError('Please enter your full name');
        return;
      }
      if (password.length < 6) {
        setUiError('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setUiError('Passwords do not match');
        return;
      }

      try {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role: selectedRole,
          skills: [],
          experience: selectedRole === 'student' ? 'Fresher' : 'Recruiter',
        });
        setUiSuccess('Account created successfully! Redirecting...');
      } catch (err: any) {
        setUiError(err?.message || 'Registration failed. Please try again.');
      }
    } else {
      // Login flow
      try {
        await login(email.trim(), password);
        setUiSuccess('Successfully logged in! Redirecting...');
      } catch (err: any) {
        setUiError(err?.message || 'Invalid email or password. Please try again.');
      }
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail.trim() || !forgotEmail.includes('@')) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotLoading(true);
    try {
      await resetPassword(forgotEmail.trim());
      setForgotSuccess(true);
    } catch (err: any) {
      setForgotError(err?.message || 'Failed to send password reset email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const activeError = uiError || error;

  // Render callback state while authenticating via OAuth
  if (isProcessingCallback) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-secondary-50/60 via-white to-sky-50/40 flex flex-col items-center justify-center p-4">
        <div className="p-8 bg-white border border-slate-200/80 rounded-2xl shadow-xl flex flex-col items-center max-w-sm text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#0f172a] flex items-center justify-center shadow-md mb-4 animate-pulse">
            <Briefcase className="w-6 h-6 text-secondary-500" />
          </div>
          <Loader2 className="w-7 h-7 animate-spin text-secondary-600 mb-3" />
          <h3 className="text-base font-bold text-slate-900">Completing sign in...</h3>
          <p className="text-xs text-slate-500 mt-1">
            Setting up your secure InternIQ session and loading your workspace.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#ecfdf5]/60 via-[#f8fafc] to-[#e0f2fe]/40 text-slate-900 flex flex-col justify-center font-sans antialiased selection:bg-secondary-100 selection:text-secondary-700 relative overflow-hidden">
      
      {/* Soft Ambient Background Glows matching the InternIQ Homepage Reference */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#d1fae5]/70 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-[#e0f2fe]/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-[#ecfdf5] rounded-full blur-3xl pointer-events-none" />

      <div className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-12 relative z-10">
        
        {/* Left Form Panel */}
        <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-12 xl:px-20 py-10">
          <div className="w-full max-w-[420px] mx-auto">
            
            {/* InternIQ Branding matching the Homepage Reference */}
            <div className="mb-8">
              <Link to="/" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-[#0f172a] flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all">
                  <Briefcase className="w-5 h-5 text-secondary-500" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black text-slate-900 tracking-tight leading-none">
                    InternIQ
                  </span>
                  <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-1">
                    Advanced Hiring Platform
                  </span>
                </div>
              </Link>
            </div>

            {/* Header / Subtitle with Freshers-styled emerald accent */}
            <div className="mb-7">
              <h1 className="text-3xl sm:text-[34px] font-extrabold text-slate-900 tracking-tight leading-tight">
                {mode === 'login' ? (
                  <>
                    Welcome <span className="text-secondary-600 font-serif italic font-normal">back</span>
                  </>
                ) : (
                  <>
                    Create your <span className="text-secondary-600 font-serif italic font-normal">account</span>
                  </>
                )}
              </h1>
              <p className="text-sm text-slate-500 mt-1.5 font-normal">
                {mode === 'login'
                  ? 'Sign in to access your verified internships & talent workspace.'
                  : 'Join 50K+ freshers and top companies discovering opportunities daily.'}
              </p>
            </div>

            {/* Active Error Alert */}
            {activeError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 text-xs sm:text-sm shadow-sm"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">{activeError}</div>
              </motion.div>
            )}

            {/* Active Success Alert */}
            {uiSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-3.5 bg-secondary-50 border border-secondary-100 rounded-xl flex items-start gap-3 text-secondary-700 text-xs sm:text-sm shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4 text-secondary-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{uiSuccess}</div>
              </motion.div>
            )}

            {/* Social Auth Buttons */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                id="google-login-btn"
                onClick={() => handleOAuth('google')}
                disabled={loading || !!oauthLoading}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <GoogleIcon className="w-4 h-4 shrink-0" />
                )}
                <span>Google</span>
              </button>

              <button
                type="button"
                id="github-login-btn"
                onClick={() => handleOAuth('github')}
                disabled={loading || !!oauthLoading}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-sm font-semibold text-slate-700 transition-all shadow-sm hover:shadow disabled:opacity-50 cursor-pointer"
              >
                {oauthLoading === 'github' ? (
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                ) : (
                  <GitHubIcon className="w-4 h-4 shrink-0 text-slate-900" />
                )}
                <span>GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative px-3.5 bg-[#f8fafc] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                or continue with email
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Role selector for signup */}
              {mode === 'signup' && (
                <div className="space-y-1.5 mb-2">
                  <label className="block text-xs font-semibold text-slate-700">
                    I am joining as
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRole('student')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedRole === 'student'
                          ? 'border-secondary-600 bg-secondary-50 text-secondary-700 shadow-sm ring-1 ring-secondary-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4 text-secondary-600" />
                      <span>Student / Candidate</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedRole('recruiter')}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        selectedRole === 'recruiter'
                          ? 'border-secondary-600 bg-secondary-50 text-secondary-700 shadow-sm ring-1 ring-secondary-500/20'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-secondary-600" />
                      <span>Recruiter / Employer</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Full Name (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="name"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Full Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Taylor"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 shadow-sm transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Email Address */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Email address
                </label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 shadow-sm transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="text-xs font-semibold text-slate-700"
                  >
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      id="forgot-password-link"
                      onClick={() => {
                        setForgotEmail(email);
                        setShowForgotPassword(true);
                        setForgotSuccess(false);
                        setForgotError('');
                      }}
                      className="text-xs font-semibold text-secondary-600 hover:text-secondary-700 transition-colors cursor-pointer hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative flex items-center">
                  <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    required
                    className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 shadow-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Confirm Password (Sign Up only) */}
              {mode === 'signup' && (
                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Confirm Password
                  </label>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      id="confirm-password"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 shadow-sm transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Keep me signed in Checkbox (Login only) */}
              {mode === 'login' && (
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    id="keep-signed-in"
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-secondary-600 focus:ring-secondary-500 accent-secondary-600 cursor-pointer"
                  />
                  <label
                    htmlFor="keep-signed-in"
                    className="text-xs text-slate-600 select-none cursor-pointer hover:text-slate-800 transition-colors"
                  >
                    Keep me signed in
                  </label>
                </div>
              )}

              {/* Submit Button (Matching the Explore Internships emerald button) */}
              <button
                type="submit"
                id="submit-auth-btn"
                disabled={loading || !!oauthLoading}
                className="w-full mt-6 bg-secondary-600 hover:bg-secondary-700 active:bg-secondary-800 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-secondary-600/25 hover:shadow-secondary-600/35 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Toggle Link */}
            <div className="mt-8 text-center">
              {mode === 'login' ? (
                <p className="text-xs sm:text-sm text-slate-600">
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    id="switch-to-signup"
                    onClick={() => switchMode('signup')}
                    className="text-secondary-600 hover:text-secondary-700 font-semibold transition-colors hover:underline cursor-pointer"
                  >
                    Create one for free
                  </button>
                </p>
              ) : (
                <p className="text-xs sm:text-sm text-slate-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    id="switch-to-login"
                    onClick={() => switchMode('login')}
                    className="text-secondary-600 hover:text-secondary-700 font-semibold transition-colors hover:underline cursor-pointer"
                  >
                    Sign in to your account
                  </button>
                </p>
              )}
            </div>

          </div>
        </div>

        {/* Right Workspace Image Panel (Desktop only - Hidden on Mobile) */}
        <div className="hidden lg:block lg:col-span-6 xl:col-span-7 p-6 lg:p-8 xl:p-10">
          <div className="relative w-full h-full min-h-[640px] max-h-[820px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-slate-900 group">
            {/* Developer Workspace Image */}
            <img
              src="/auth-workspace.jpg"
              alt="Developer Workspace Setup"
              className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700 ease-out"
              loading="eager"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=1200&q=80&auto=format&fit=crop';
              }}
            />
            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent pointer-events-none" />

            {/* Top Pill Highlight */}
            <div className="absolute top-6 left-6 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-white/50 text-xs font-semibold text-slate-800 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-secondary-500 animate-ping" />
              <span>Verified Freshers &amp; Hiring Network</span>
            </div>

          </div>
        </div>

      </div>

      {/* Forgot Password Modal (Clean SaaS Design) */}
      <AnimatePresence>
        {showForgotPassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xl relative text-slate-900"
            >
              <div className="mb-5">
                <div className="w-11 h-11 rounded-xl bg-secondary-50 border border-secondary-100 flex items-center justify-center text-secondary-600 mb-3.5">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold tracking-tight text-slate-900">
                  Reset your password
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Enter your registered email address and we&apos;ll send you a password reset link.
                </p>
              </div>

              {forgotError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-secondary-50 text-secondary-600 flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-semibold text-slate-900 mb-1">
                    Check your email
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mb-6">
                    We&apos;ve sent a password reset link to{' '}
                    <span className="text-slate-800 font-semibold">{forgotEmail}</span>.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="w-full bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition-all shadow-md shadow-secondary-600/20 cursor-pointer"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                  <div>
                    <label
                      htmlFor="forgot-email"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Email address
                    </label>
                    <div className="relative flex items-center">
                      <Mail className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        id="forgot-email"
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="you@company.com"
                        required
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-secondary-500 focus:ring-2 focus:ring-secondary-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-1/2 bg-secondary-600 hover:bg-secondary-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-secondary-600/20 disabled:opacity-50 cursor-pointer"
                    >
                      {forgotLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <span>Send Link</span>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Login;
