import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '../services/supabase'; // adjust path if your client lives elsewhere

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'recruiter' | 'admin';
  avatar?: string;
  skills: string[];
  experience: string;
  location: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  education?: string;
  resumeUrl?: string;
  githubUsername?: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User> & { password: string }) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  isAuthenticated: boolean;
  checkEmailExists: (email: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Maps a row from the `profiles` table (+ auth email) into our User shape
const mapProfileToUser = (profile: any, email: string): User => ({
  id: profile.id,
  name: profile.name || email.split('@')[0],
  email,
  role: (profile.role as 'student' | 'recruiter' | 'admin') || 'student',
  avatar: profile.avatar_url,
  skills: profile.skills || [],
  experience: profile.experience || 'Fresher',
  location: profile.location || '',
  phone: profile.phone || '',
  linkedin: profile.linkedin || '',
  portfolio: profile.portfolio || '',
  education: profile.education || '',
  resumeUrl: profile.resume_url || '',
  githubUsername: profile.github_username || '',
  createdAt: profile.created_at || new Date().toISOString(),
  lastLogin: profile.last_login || new Date().toISOString(),
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async (userId: string, email: string) => {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Error loading profile:', profileError);
      return null;
    }
    if (!profile) {
      // If profile does not exist yet (e.g. before trigger execution or fallback), construct default
      return {
        id: userId,
        name: email.split('@')[0],
        email,
        role: 'student',
        skills: [],
        experience: 'Fresher',
        location: '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      } as User;
    }
    return mapProfileToUser(profile, email);
  };

  // On mount: check if there's already a live Supabase session
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const mapped = await loadProfile(session.user.id, session.user.email!);
        if (mapped) setUser(mapped);
      }
      setLoading(false);
    };
    init();

    // Keep user state in sync with auth changes (e.g. token refresh, logout in another tab)
    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const mapped = await loadProfile(session.user.id, session.user.email!);
        if (mapped) setUser(mapped);
      } else {
        setUser(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const clearError = () => setError(null);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    const { data, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    if (checkError) {
      console.error('Error checking email:', checkError);
      return false;
    }
    return !!data;
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      if (!email || !email.trim()) throw new Error('Email is required');
      if (!password || !password.trim()) throw new Error('Password is required');
      if (!email.includes('@')) throw new Error('Please enter a valid email address');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw new Error(signInError.message);
      if (!data.user) throw new Error('Login failed. Please try again.');

      // Update last_login timestamp on the profile
      const nowIso = new Date().toISOString();
      await supabase
        .from('profiles')
        .update({ last_login: nowIso })
        .eq('id', data.user.id);

      const mapped = await loadProfile(data.user.id, data.user.email!);
      if (mapped) setUser(mapped);

      console.log('Login successful:', mapped);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User> & { password: string }) => {
    setLoading(true);
    setError(null);

    try {
      if (!userData.name || !userData.name.trim()) throw new Error('Name is required');
      if (!userData.email || !userData.email.trim()) throw new Error('Email is required');
      if (!userData.email.includes('@')) throw new Error('Please enter a valid email address');
      if (!userData.password || userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      const selectedRole = userData.role || 'student';

      // Pass user metadata (name & role) to signUp so the DB trigger auto-populates profiles!
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: userData.email.trim(),
        password: userData.password,
        options: {
          data: {
            name: userData.name.trim(),
            role: selectedRole
          }
        }
      });

      if (signUpError) throw new Error(signUpError.message);
      if (!data.user) throw new Error('Registration failed. Please try again.');

      const nowIso = new Date().toISOString();

      // Upsert profile for extra fields (trigger automatically handles basic creation on auth.users insert)
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name: userData.name.trim(),
          email: userData.email.trim().toLowerCase(),
          role: selectedRole,
          skills: userData.skills || [],
          experience: userData.experience || 'Fresher',
          location: userData.location || '',
          phone: userData.phone || '',
          linkedin: userData.linkedin || '',
          portfolio: userData.portfolio || '',
          education: userData.education || '',
          last_login: nowIso,
        });
      } catch (upsertErr) {
        console.warn('Profile upsert note (trigger handles profile creation):', upsertErr);
      }

      const mapped = await loadProfile(data.user.id, data.user.email!);
      if (mapped) setUser(mapped);

      // Check if email confirmation is required by Supabase Auth settings
      if (!data.session) {
        console.log('User created, confirmation email sent');
      } else {
        console.log('Registration successful:', mapped);
      }
    } catch (err) {
      let errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      if (errorMessage.toLowerCase().includes('email rate limit exceeded') || errorMessage.includes('429')) {
        errorMessage = 'Supabase Email Rate Limit Exceeded. Please try using a fresh email address (e.g. testuser2@gmail.com) or turn off "Confirm Email" in your Supabase Dashboard -> Auth -> Providers -> Email settings.';
      } else if (errorMessage.includes('Failed to fetch') || errorMessage.includes('FETCH_ERROR')) {
        errorMessage = 'Network Connection Error to Supabase. Please restart your Vite dev server (stop "npm run dev" and re-run it) or check your internet connection.';
      }
      console.error('Registration error:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    try {
      if (!email || !email.includes('@')) throw new Error('Please enter a valid email address');
      const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (resetErr) throw new Error(resetErr.message);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email.';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    console.log('User logged out');
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: userData.name,
        avatar_url: userData.avatar,
        skills: userData.skills,
        experience: userData.experience,
        location: userData.location,
        phone: userData.phone,
        linkedin: userData.linkedin,
        portfolio: userData.portfolio,
        education: userData.education,
        resume_url: userData.resumeUrl,
        github_username: userData.githubUsername,
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating profile:', updateError);
      setError(updateError.message);
      return;
    }

    const updatedUser = { ...user, ...userData };
    setUser(updatedUser);
    console.log('Profile updated:', updatedUser);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      login,
      register,
      resetPassword,
      logout,
      updateProfile,
      clearError,
      isAuthenticated: !!user,
      checkEmailExists
    }}>
      {children}
    </AuthContext.Provider>
  );
};