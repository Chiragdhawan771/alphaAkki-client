'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, User, SignupData, LoginData, UpdateProfileData, ChangePasswordData } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (loginData: LoginData) => Promise<void>;
  signup: (signupData: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (updateData: UpdateProfileData) => Promise<void>;
  changePassword: (passwordData: ChangePasswordData) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = authService.getStoredUser();
        const token = authService.getStoredToken();

        if (storedUser && token) {
          setUser(storedUser);
          setIsAuthenticated(true);
          
          // Optionally refresh user data from server
          try {
            const { user: freshUser } = await authService.getCurrentUser();
            setUser(freshUser);
          } catch (error) {
            // If refresh fails, keep stored user data
            console.warn('Failed to refresh user data:', error);
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        // Clear invalid auth data
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (loginData: LoginData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.login(loginData);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (signupData: SignupData): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authService.signup(signupData);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    authService.logout();
  };

  const updateProfile = async (updateData: UpdateProfileData): Promise<void> => {
    try {
      const response = await authService.updateProfile(updateData);
      setUser(response.user);
    } catch (error) {
      throw error;
    }
  };

  const changePassword = async (passwordData: ChangePasswordData): Promise<void> => {
    try {
      await authService.changePassword(passwordData);
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      if (isAuthenticated) {
        const { user: freshUser } = await authService.getCurrentUser();
        setUser(freshUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
