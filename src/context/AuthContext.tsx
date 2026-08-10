import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  skills: string[];
  experience: string;
  location: string;
  phone?: string;
  linkedin?: string;
  portfolio?: string;
  education?: string;
  createdAt: string;
  lastLogin: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => void;
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

// Simulated database for users
const getUsersFromStorage = (): User[] => {
  try {
    const users = localStorage.getItem('fresherJobs_users');
    return users ? JSON.parse(users) : [];
  } catch (err) {
    console.error('Error loading users from localStorage:', err);
    return [];
  }
};

const saveUsersToStorage = (users: User[]) => {
  try {
    localStorage.setItem('fresherJobs_users', JSON.stringify(users));
  } catch (err) {
    console.error('Error saving users to localStorage:', err);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = () => {
      try {
        const savedUser = localStorage.getItem('fresherJobs_currentUser');
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log('User loaded from localStorage:', parsedUser);
        }
      } catch (err) {
        console.error('Error loading user from localStorage:', err);
        localStorage.removeItem('fresherJobs_currentUser');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const clearError = () => setError(null);

  const checkEmailExists = async (email: string): Promise<boolean> => {
    const users = getUsersFromStorage();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
  };

  const login = async (email: string, password: string) => {
    console.log('Login attempt:', { email, password: '***' });
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Basic validation
      if (!email || !email.trim()) {
        throw new Error('Email is required');
      }
      
      if (!password || !password.trim()) {
        throw new Error('Password is required');
      }
      
      if (!email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if user exists in database
      const users = getUsersFromStorage();
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error('Email not found. Please sign up first.');
      }

      // Check password
      if (user.password !== password) {
        throw new Error('Invalid password. Please try again.');
      }

      // Update last login
      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      saveUsersToStorage(updatedUsers);

      setUser(updatedUser);
      localStorage.setItem('fresherJobs_currentUser', JSON.stringify(updatedUser));
      console.log('Login successful:', updatedUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      console.error('Login error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    console.log('Register attempt:', userData);
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validation
      if (!userData.name || !userData.name.trim()) {
        throw new Error('Name is required');
      }
      
      if (!userData.email || !userData.email.trim()) {
        throw new Error('Email is required');
      }
      
      if (!userData.email.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      if (!userData.password || userData.password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }

      // Check if email already exists
      const users = getUsersFromStorage();
      const emailExists = users.some(u => u.email.toLowerCase() === userData.email!.toLowerCase());
      
      if (emailExists) {
        throw new Error('Email already exists. Please sign in instead.');
      }

      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name.trim(),
        email: userData.email.trim(),
        password: userData.password!,
        skills: userData.skills || [],
        experience: userData.experience || 'Fresher',
        location: userData.location || '',
        phone: userData.phone || '',
        linkedin: userData.linkedin || '',
        portfolio: userData.portfolio || '',
        education: userData.education || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      // Save to database
      const updatedUsers = [...users, newUser];
      saveUsersToStorage(updatedUsers);

      setUser(newUser);
      localStorage.setItem('fresherJobs_currentUser', JSON.stringify(newUser));
      console.log('Registration successful:', newUser);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      console.error('Registration error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('Logout called');
    setUser(null);
    localStorage.removeItem('fresherJobs_currentUser');
    console.log('User logged out');
  };

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('fresherJobs_currentUser', JSON.stringify(updatedUser));
      
      // Update in database
      const users = getUsersFromStorage();
      const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
      saveUsersToStorage(updatedUsers);
      
      console.log('Profile updated:', updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      error, 
      login, 
      register, 
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