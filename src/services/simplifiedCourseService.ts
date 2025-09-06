import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';

export interface SimplifiedCourse {
  _id: string;
  title: string;
  description: string;
  instructor: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  price: number;
  type: 'free' | 'paid';
  status: 'draft' | 'published' | 'archived';
  enrollmentCount: number;
  thumbnail?: string;
  videos: {
    title: string;
    videoUrl: string;
    videoKey: string;
    duration: number;
    order: number;
    uploadedAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface Enrollment {
  _id: string;
  student: string;
  course: SimplifiedCourse;
  enrolledAt: string;
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  watchedVideos: string[];
  lastAccessedAt?: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  price: number;
  type?: 'free' | 'paid';
  thumbnail?: string;
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  price?: number;
  type?: 'free' | 'paid';
  thumbnail?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface AddVideoData {
  title: string;
  duration?: number;
}

class SimplifiedCourseService {
  // Admin: Create course
  async createCourse(courseData: CreateCourseData) {
    try {
      const response = await axiosInstance.post('/simplified-courses', courseData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create course');
      }
      throw new Error('Failed to create course');
    }
  }

  // Admin: Get instructor's courses
  async getInstructorCourses() {
    try {
      const response = await axiosInstance.get('/simplified-courses/my-courses');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch courses');
      }
      throw new Error('Failed to fetch courses');
    }
  }

  // Admin: Get single course
  async getCourse(courseId: string) {
    try {
      const response = await axiosInstance.get(`/simplified-courses/${courseId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch course');
      }
      throw new Error('Failed to fetch course');
    }
  }

  // Admin: Update course
  async updateCourse(courseId: string, courseData: UpdateCourseData) {
    try {
      const response = await axiosInstance.patch(`/simplified-courses/${courseId}`, courseData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update course');
      }
      throw new Error('Failed to update course');
    }
  }

  // Admin: Delete course
  async deleteCourse(courseId: string) {
    try {
      const response = await axiosInstance.delete(`/simplified-courses/${courseId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete course');
      }
      throw new Error('Failed to delete course');
    }
  }

  // Admin: Add video to course
  async addVideo(courseId: string, videoData: AddVideoData, videoFile: File) {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', videoData.title);
      if (videoData.duration) {
        formData.append('duration', videoData.duration.toString());
      }

      const response = await axiosInstance.post(`/simplified-courses/${courseId}/videos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to upload video');
      }
      throw new Error('Failed to upload video');
    }
  }

  // Admin: Remove video from course
  async removeVideo(courseId: string, videoIndex: number) {
    try {
      const response = await axiosInstance.delete(`/simplified-courses/${courseId}/videos/${videoIndex}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to remove video');
      }
      throw new Error('Failed to remove video');
    }
  }

  // Public: Get all published courses
  async getPublishedCourses(page = 1, limit = 10, search?: string) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) {
        params.append('search', search);
      }

      const response = await axiosInstance.get(`/simplified-courses/published?${params}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch courses');
      }
      throw new Error('Failed to fetch courses');
    }
  }

  // User: Enroll in course
  async enrollInCourse(courseId: string, paymentData?: { paymentId?: string; amountPaid?: number }) {
    try {
      const response = await axiosInstance.post(`/simplified-courses/${courseId}/enroll`, paymentData || {});
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to enroll in course');
      }
      throw new Error('Failed to enroll in course');
    }
  }

  // User: Get enrolled courses
  async getEnrolledCourses() {
    try {
      const response = await axiosInstance.get('/simplified-courses/enrolled');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch enrolled courses');
      }
      throw new Error('Failed to fetch enrolled courses');
    }
  }

  // User: Get course content (only if enrolled)
  async getCourseContent(courseId: string) {
    try {
      const response = await axiosInstance.get(`/simplified-courses/${courseId}/content`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch course content');
      }
      throw new Error('Failed to fetch course content');
    }
  }

  // User: Mark video as watched
  async markVideoAsWatched(courseId: string, videoIndex: number) {
    try {
      const response = await axiosInstance.post(`/simplified-courses/${courseId}/videos/${videoIndex}/watch`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to mark video as watched');
      }
      throw new Error('Failed to mark video as watched');
    }
  }
}

export default new SimplifiedCourseService();
