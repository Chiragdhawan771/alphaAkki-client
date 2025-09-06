import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';
import {
  Enrollment,
  EnrollmentData,
  ApiResponse,
  PaginatedResponse
} from './types';

class EnrollmentService {
  // Enroll in a course
  async enrollInCourse(enrollmentData: EnrollmentData): Promise<ApiResponse<Enrollment>> {
    try {
      const response = await axiosInstance.post('/enrollments', enrollmentData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to enroll in course');
      }
      throw new Error('Failed to enroll in course');
    }
  }

  // Get user dashboard (enrolled courses)
  async getUserDashboard(): Promise<ApiResponse<{ enrollments: Enrollment[] }>> {
    try {
      const response = await axiosInstance.get('/enrollments/dashboard');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user dashboard');
      }
      throw new Error('Failed to fetch user dashboard');
    }
  }

  // Check enrollment status for a course
  async checkEnrollmentStatus(courseId: string): Promise<ApiResponse<{ isEnrolled: boolean; enrollment?: Enrollment }>> {
    try {
      const response = await axiosInstance.get(`/enrollments/course/${courseId}/check`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to check enrollment status');
      }
      throw new Error('Failed to check enrollment status');
    }
  }

  // Get enrollment by ID
  async getEnrollment(enrollmentId: string): Promise<ApiResponse<Enrollment>> {
    try {
      const response = await axiosInstance.get(`/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch enrollment');
      }
      throw new Error('Failed to fetch enrollment');
    }
  }

  // Update enrollment status
  async updateEnrollmentStatus(
    enrollmentId: string, 
    status: 'active' | 'completed' | 'suspended' | 'cancelled'
  ): Promise<ApiResponse<Enrollment>> {
    try {
      const response = await axiosInstance.patch(`/enrollments/${enrollmentId}`, { status });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update enrollment status');
      }
      throw new Error('Failed to update enrollment status');
    }
  }

  // Get all enrollments (admin/instructor)
  async getAllEnrollments(filters?: {
    courseId?: string;
    userId?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Enrollment>> {
    try {
      const params = new URLSearchParams();
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, value.toString());
          }
        });
      }

      const response = await axiosInstance.get(`/enrollments?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch enrollments');
      }
      throw new Error('Failed to fetch enrollments');
    }
  }

  // Get course enrollments (for instructors)
  async getCourseEnrollments(courseId: string): Promise<PaginatedResponse<Enrollment>> {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/enrollments`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch course enrollments');
      }
      throw new Error('Failed to fetch course enrollments');
    }
  }

  // Cancel enrollment
  async cancelEnrollment(enrollmentId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to cancel enrollment');
      }
      throw new Error('Failed to cancel enrollment');
    }
  }

  // Get user dashboard statistics
  async getUserDashboardStats(): Promise<ApiResponse<{
    totalCourses: number;
    completedCourses: number;
    certificates: number;
    totalHours: number;
    averageProgress: number;
  }>> {
    try {
      const response = await axiosInstance.get('/enrollments/dashboard');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch dashboard stats');
      }
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  // Get admin dashboard statistics
  async getAdminDashboardStats(): Promise<ApiResponse<{
    totalCourses: number;
    totalStudents: number;
    totalRevenue: number;
    averageProgress: number;
    recentEnrollments: Enrollment[];
  }>> {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch admin stats');
      }
      throw new Error('Failed to fetch admin stats');
    }
  }
}

// Export singleton instance
export const enrollmentService = new EnrollmentService();
export default enrollmentService;
