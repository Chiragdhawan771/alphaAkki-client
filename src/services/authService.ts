import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';

// Types based on the backend DTOs
export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string;
  profilePicture?: string;
  bio?: string;
  dateOfBirth?: Date;
  address?: string;
  isVerified: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: User;
  access_token: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  bio?: string;
  dateOfBirth?: Date;
  address?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  // Sign up a new user
  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/signup', signupData);
      const { user, access_token } = response.data;
      
      // Store token and user data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Signup failed');
      }
      throw new Error('Signup failed');
    }
  }

  // Login user
  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const response = await axiosInstance.post('/auth/login', loginData);
      const { user, access_token } = response.data;
      
      // Store token and user data in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Login failed');
      }
      throw new Error('Login failed');
    }
  }

  // Logout user
  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
  }

  // Get current user profile
  async getProfile(): Promise<{ user: User }> {
    try {
      const response = await axiosInstance.get('/auth/profile');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to get profile');
      }
      throw new Error('Failed to get profile');
    }
  }

  // Get current user info (me endpoint)
  async getCurrentUser(): Promise<{ user: User }> {
    try {
      const response = await axiosInstance.get('/auth/me');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to get current user');
      }
      throw new Error('Failed to get current user');
    }
  }

  // Update user profile
  async updateProfile(updateData: UpdateProfileData): Promise<{ user: User }> {
    try {
      const response = await axiosInstance.put('/auth/profile', updateData);
      
      // Update stored user data
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update profile');
      }
      throw new Error('Failed to update profile');
    }
  }

  // Change password
  async changePassword(passwordData: ChangePasswordData): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to change password');
      }
      throw new Error('Failed to change password');
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      return !!token;
    }
    return false;
  }

  // Get stored user data
  getStoredUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  // Get stored token
  getStoredToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;
