import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';
import {
  Course,
  Dashboard,
  ApiResponse,
  PaginatedResponse
} from './types';

// User interface for student management
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  enrolledCourses: number;
  completedCourses: number;
  totalProgress: number;
  joinedAt: Date;
  lastActive: Date;
}

class AdminService {
  // Get admin dashboard data
  async getAdminDashboard(): Promise<ApiResponse<Dashboard>> {
    try {
      const response = await axiosInstance.get('/admin/dashboard');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch admin dashboard');
      }
      throw new Error('Failed to fetch admin dashboard');
    }
  }

  // Approve a course
  async approveCourse(courseId: string): Promise<ApiResponse<Course>> {
    try {
      const response = await axiosInstance.post(`/admin/courses/${courseId}/approve`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to approve course');
      }
      throw new Error('Failed to approve course');
    }
  }

  // Reject a course
  async rejectCourse(courseId: string, reason?: string): Promise<ApiResponse<Course>> {
    try {
      const response = await axiosInstance.post(`/admin/courses/${courseId}/reject`, { reason });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to reject course');
      }
      throw new Error('Failed to reject course');
    }
  }

  // Toggle featured status of a course
  async toggleFeaturedStatus(courseId: string, isFeatured: boolean): Promise<ApiResponse<Course>> {
    try {
      const response = await axiosInstance.patch(`/admin/courses/${courseId}/feature`, { isFeatured });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update featured status');
      }
      throw new Error('Failed to update featured status');
    }
  }

  // Get pending courses for approval
  async getPendingCourses(): Promise<PaginatedResponse<Course>> {
    try {
      const response = await axiosInstance.get('/admin/courses?status=pending');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch pending courses');
      }
      throw new Error('Failed to fetch pending courses');
    }
  }

  // Get all courses for admin management
  async getAllCoursesForAdmin(filters?: {
    status?: string;
    instructor?: string;
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Course>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axiosInstance.get(`/admin/courses?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch courses for admin');
      }
      throw new Error('Failed to fetch courses for admin');
    }
  }

  // Get platform analytics
  async getPlatformAnalytics(period: 'week' | 'month' | 'year' = 'month'): Promise<ApiResponse<{
    totalUsers: number;
    totalCourses: number;
    totalRevenue: number;
    newUsersThisPeriod: number;
    newCoursesThisPeriod: number;
    revenueThisPeriod: number;
    topCategories: Array<{ category: string; count: number }>;
    topInstructors: Array<{ instructor: string; revenue: number; courses: number }>;
    enrollmentTrends: Array<{ date: string; enrollments: number }>;
    revenueTrends: Array<{ date: string; revenue: number }>;
  }>> {
    try {
      const response = await axiosInstance.get(`/admin/analytics?period=${period}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch platform analytics');
      }
      throw new Error('Failed to fetch platform analytics');
    }
  }

  // Suspend/unsuspend a course
  async toggleCourseSuspension(courseId: string, suspended: boolean): Promise<ApiResponse<Course>> {
    try {
      const response = await axiosInstance.patch(`/admin/courses/${courseId}/suspend`, { suspended });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to toggle course suspension');
      }
      throw new Error('Failed to toggle course suspension');
    }
  }

  // Get all students for admin management
  async getAllStudents(filters?: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axiosInstance.get(`/admin/users?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch students');
      }
      throw new Error('Failed to fetch students');
    }
  }

  // Get user details by ID
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user details');
      }
      throw new Error('Failed to fetch user details');
    }
  }

  // Update user role
  async updateUserRole(userId: string, role: 'student' | 'instructor' | 'admin'): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.patch(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update user role');
      }
      throw new Error('Failed to update user role');
    }
  }

  // Suspend/unsuspend a user
  async toggleUserSuspension(userId: string, suspended: boolean): Promise<ApiResponse<User>> {
    try {
      const response = await axiosInstance.patch(`/admin/users/${userId}/suspend`, { suspended });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to toggle user suspension');
      }
      throw new Error('Failed to toggle user suspension');
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
export default adminService;
