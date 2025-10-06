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
  level: 'beginner' | 'intermediate' | 'advanced';
  enrollmentCount: number;
  thumbnail?: string;
  previewVideo?: string;
  shortDescription?: string;
  learningOutcomes?: string[];
  prerequisites?: string[];
  estimatedDuration?: number;
  category?: string;
  tags?: string[];
  averageRating: number;
  totalReviews: number;
  videos?: {
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
  previewVideo?: string;
  shortDescription?: string;
  learningOutcomes?: string[];
  prerequisites?: string[];
  estimatedDuration?: number;
  category?: string;
  tags?: string[];
}

export interface UpdateCourseData {
  title?: string;
  description?: string;
  price?: number;
  type?: 'free' | 'paid';
  thumbnail?: string;
  previewVideo?: string;
  shortDescription?: string;
  learningOutcomes?: string[];
  prerequisites?: string[];
  estimatedDuration?: number;
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
}

export interface AddVideoData {
  title: string;
  duration?: number;
  autoDetectDuration?: boolean;
}

class SimplifiedCourseService {
  // Admin: Create course
  async createCourse(courseData: CreateCourseData): Promise<SimplifiedCourse> {
    try {
      const response = await axiosInstance.post('/simplified-courses', courseData);
      return response.data as SimplifiedCourse;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create course');
      }
      throw new Error('Failed to create course');
    }
  }

  // Admin: Get instructor's courses
  async getInstructorCourses(): Promise<SimplifiedCourse[]> {
    try {
      const response = await axiosInstance.get('/simplified-courses/my-courses');
      return response.data as SimplifiedCourse[];
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
  async addVideo(courseId: string, videoData: AddVideoData, videoFile: File,onUploadProgress?: (progress: number) => void) {
    try {
      const formData = new FormData();
      formData.append('video', videoFile);
      formData.append('title', videoData.title);
      if (videoData.autoDetectDuration) {
        formData.append('autoDetectDuration', 'true');
      }
      if (videoData.duration !== undefined) {
        formData.append('duration', videoData.duration.toString());
      }

      const response = await axiosInstance.post(`/simplified-courses/${courseId}/videos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
          timeout: 0,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            if (onUploadProgress) onUploadProgress(percent);
          }
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

  // User: Create review for course
  async createReview(courseId: string, reviewData: { rating: number; comment: string }) {
    try {
      const response = await axiosInstance.post(`/reviews/courses/${courseId}`, reviewData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create review');
      }
      throw new Error('Failed to create review');
    }
  }

  // Public: Get course reviews
  async getCourseReviews(courseId: string, page = 1, limit = 10) {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      const response = await axiosInstance.get(`/reviews/courses/${courseId}?${params}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
      }
      throw new Error('Failed to fetch reviews');
    }
  }

  // User: Get own reviews
  async getMyReviews() {
    try {
      const response = await axiosInstance.get('/reviews/my-reviews');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch reviews');
      }
      throw new Error('Failed to fetch reviews');
    }
  }
}

export default new SimplifiedCourseService();
