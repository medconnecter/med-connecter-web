
import { createContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

// Define types for User and AuthContext
export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'patient' | 'doctor' | 'admin';
  isEmailVerified: boolean;
  isMobileVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, role: 'patient' | 'doctor') => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

// Create the AuthContext
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create mock user data (to be replaced by actual auth service)
const mockUsers = [
  {
    id: '1',
    email: 'patient@example.com',
    password: 'password123',
    displayName: 'John Doe',
    role: 'patient' as const,
    isEmailVerified: true,
    isMobileVerified: true,
  },
  {
    id: '2',
    email: 'doctor@example.com',
    password: 'password123',
    displayName: 'Dr. Jane Smith',
    role: 'doctor' as const,
    isEmailVerified: true,
    isMobileVerified: true,
  },
];

// AuthProvider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check for stored user in local storage on initial load
    const storedUser = localStorage.getItem('healthconnect_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Auth functions
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      // Mock authentication - in real app, this would be an API call
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }

      // Extract password before storing user data
      const { password: _, ...userData } = foundUser;
      
      // Set user in state and local storage
      setUser(userData);
      localStorage.setItem('healthconnect_user', JSON.stringify(userData));
      
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      // Clear user from state and storage
      setUser(null);
      localStorage.removeItem('healthconnect_user');
      toast.success('Successfully logged out');
    } catch (error) {
      toast.error('Failed to logout');
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, role: 'patient' | 'doctor') => {
    try {
      setLoading(true);
      // Check if user already exists
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }

      // In a real app, this would create a user in the backend
      const newUser = {
        id: `${mockUsers.length + 1}`,
        email,
        displayName: '',
        role,
        isEmailVerified: false,
        isMobileVerified: false,
      };

      // Add to mock users (in real app this would be stored in the database)
      mockUsers.push({ ...newUser, password });

      // Set the new user as current
      setUser(newUser);
      localStorage.setItem('healthconnect_user', JSON.stringify(newUser));
      
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registration failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      // Check if email exists
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('No account found with this email');
      }

      // In a real app, this would send a password reset email
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Password reset failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: Partial<User>) => {
    try {
      setLoading(true);
      
      if (!user) {
        throw new Error('No user is logged in');
      }

      // Update the user data
      const updatedUser = { ...user, ...data };
      
      // Update in local storage and state
      setUser(updatedUser);
      localStorage.setItem('healthconnect_user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    resetPassword,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
