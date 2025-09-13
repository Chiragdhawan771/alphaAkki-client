import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';
import { CreateCourseDto } from '@/types/course';
import {
  Course,
  CourseStructure,
  CourseFilters,
  PaginatedResponse,
  ApiResponse,
  FileUploadResponse
} from './types';

class CourseService {
  // Create a new course
  async createCourse(courseData: CreateCourseDto): Promise<ApiResponse<Course>> {
    try {
      const response = await axiosInstance.post('/courses', courseData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create course');
      }
      throw new Error('Failed to create course');
    }
  }

  // Get all courses with filters and pagination
  async getCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else if (typeof value === 'object' && key === 'priceRange') {
              params.append('minPrice', value.min.toString());
              params.append('maxPrice', value.max.toString());
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const response = await axiosInstance.get(`/courses?${params.toString()}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch courses');
      }
      throw new Error('Failed to fetch courses');
    }
  }

  // Get course by ID (for enrolled users - learning page)
  async getCourse(courseId: string): Promise<ApiResponse<Course>> {
    try {
      console.log('Fetching course content from API:', `/simplified-courses/${courseId}/content`);
      const response = await axiosInstance.get(`/simplified-courses/${courseId}/content`);
      console.log('API Response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('API Error:', error);
      if (error instanceof AxiosError) {
        console.error('Axios Error Details:', error.response?.data);
        throw new Error(error.response?.data?.message || 'Failed to fetch course');
      }
      throw new Error('Failed to fetch course');
    }
  }

  // Get course structure (sections and lectures)
  async getCourseStructure(courseId: string): Promise<ApiResponse<CourseStructure>> {
    try {
      const response = await axiosInstance.get(`/simplified-courses/${courseId}/content`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch course structure');
      }
      throw new Error('Failed to fetch course structure');
    }
  }

  // Update course
  async updateCourse(courseId: string, courseData: Partial<CreateCourseDto>): Promise<ApiResponse<Course>> {
    try {
      const response = await axiosInstance.patch(`/courses/${courseId}`, courseData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update course');
      }
      throw new Error('Failed to update course');
    }
  }

  // Delete course
  async deleteCourse(courseId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/courses/${courseId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete course');
      }
      throw new Error('Failed to delete course');
    }
  }

  // Upload course content (thumbnail, preview video, resources)
  async uploadCourseContent(
    courseId: string,
    file: File,
    fileType: 'thumbnail' | 'preview_video' | 'course_resource'
  ): Promise<ApiResponse<FileUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('fileType', fileType);

      const response = await axiosInstance.post(`/courses/${courseId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to upload course content');
      }
      throw new Error('Failed to upload course content');
    }
  }

  // Get featured courses
  async getFeaturedCourses(limit: number = 10): Promise<PaginatedResponse<Course>> {
    try {
      const response = await axiosInstance.get(`/courses/featured?limit=${limit}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch featured courses');
      }
      throw new Error('Failed to fetch featured courses');
    }
  }

  // Get popular courses
  async getPopularCourses(limit: number = 10): Promise<PaginatedResponse<Course>> {
    try {
      const response = await axiosInstance.get(`/courses/popular?limit=${limit}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch popular courses');
      }
      throw new Error('Failed to fetch popular courses');
    }
  }

  // Get courses by instructor
  async getCoursesByInstructor(instructorId: string, filters?: Omit<CourseFilters, 'instructor'>): Promise<PaginatedResponse<Course>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else if (typeof value === 'object' && key === 'priceRange') {
              params.append('minPrice', value.min.toString());
              params.append('maxPrice', value.max.toString());
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const queryString = params.toString();
      const url = `/courses/instructor/${instructorId}${queryString ? `?${queryString}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch instructor courses');
      }
      throw new Error('Failed to fetch instructor courses');
    }
  }

  // Search courses
  async searchCourses(query: string, filters?: Omit<CourseFilters, 'search'>): Promise<PaginatedResponse<Course>> {
    try {
      const searchFilters = { ...filters, search: query };
      return await this.getCourses(searchFilters);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to search courses');
      }
      throw new Error('Failed to search courses');
    }
  }

  // Get course categories
  async getCategories(): Promise<ApiResponse<string[]>> {
    try {
      const response = await axiosInstance.get('/courses/categories');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch categories');
      }
      throw new Error('Failed to fetch categories');
    }
  }

  // Get course tags
  async getTags(): Promise<ApiResponse<string[]>> {
    try {
      const response = await axiosInstance.get('/courses/tags');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch tags');
      }
      throw new Error('Failed to fetch tags');
    }
  }

  // Get user's courses
  async getMyCourses(filters?: CourseFilters): Promise<PaginatedResponse<Course>> {
    try {
      const params = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              value.forEach(v => params.append(key, v.toString()));
            } else if (typeof value === 'object' && key === 'priceRange') {
              params.append('minPrice', value.min.toString());
              params.append('maxPrice', value.max.toString());
            } else {
              params.append(key, value.toString());
            }
          }
        });
      }

      const queryString = params.toString();
      const url = `/courses/my-courses${queryString ? `?${queryString}` : ''}`;
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch my courses');
      }
      throw new Error('Failed to fetch my courses');
    }
  }

  // Get course by slug
  async getCourseBySlug(slug: string): Promise<ApiResponse<Course>> {
    try {
      const response = await axiosInstance.get(`/courses/slug/${slug}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch course');
      }
      throw new Error('Failed to fetch course');
    }
  }

  // Update course status
  async updateCourseStatus(courseId: string, status: 'draft' | 'published' | 'archived'): Promise<ApiResponse<Course>> {
    try {
      const response = await axiosInstance.patch(`/courses/${courseId}/status`, { status });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update course status');
      }
      throw new Error('Failed to update course status');
    }
  }

  // Get course enrollments
  async getCourseEnrollments(courseId: string): Promise<ApiResponse<any[]>> {
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

  // Get course analytics
  async getCourseAnalytics(courseId: string): Promise<ApiResponse<any>> {
    try {
      const response = await axiosInstance.get(`/courses/${courseId}/analytics`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch course analytics');
      }
      throw new Error('Failed to fetch course analytics');
    }
  }

  // Duplicate course
  async duplicateCourse(courseId: string): Promise<ApiResponse<Course>> {
    try {
      const response = await axiosInstance.post(`/courses/${courseId}/duplicate`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to duplicate course');
      }
      throw new Error('Failed to duplicate course');
    }
  }
}

// Export singleton instance
export const courseService = new CourseService();
export default courseService;
