import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';
import {
  Progress,
  ProgressUpdateData,
  ApiResponse
} from './types';

class ProgressService {
  // Update lecture progress
  async updateLectureProgress(
    courseId: string,
    lectureId: string,
    progressData: ProgressUpdateData
  ): Promise<ApiResponse<Progress>> {
    try {
      const response = await axiosInstance.patch(
        `/progress/course/${courseId}/lecture/${lectureId}`,
        progressData
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update lecture progress');
      }
      throw new Error('Failed to update lecture progress');
    }
  }

  // Mark lecture as complete
  async markLectureComplete(courseId: string, lectureId: string): Promise<ApiResponse<Progress>> {
    try {
      const response = await axiosInstance.post(`/progress/course/${courseId}/lecture/${lectureId}/complete`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to mark lecture as complete');
      }
      throw new Error('Failed to mark lecture as complete');
    }
  }

  // Get course progress summary
  async getCourseProgress(courseId: string): Promise<ApiResponse<{
    courseId: string;
    progressPercentage: number;
    completedLectures: number;
    totalLectures: number;
    totalTimeSpent: number;
    lastAccessedLecture?: string;
    lectureProgress: Progress[];
  }>> {
    try {
      const response = await axiosInstance.get(`/progress/course/${courseId}/summary`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch course progress');
      }
      throw new Error('Failed to fetch course progress');
    }
  }

  // Get lecture progress
  async getLectureProgress(courseId: string, lectureId: string): Promise<ApiResponse<Progress>> {
    try {
      const response = await axiosInstance.get(`/progress/course/${courseId}/lecture/${lectureId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch lecture progress');
      }
      throw new Error('Failed to fetch lecture progress');
    }
  }

  // Get user's overall progress across all courses
  async getUserProgress(): Promise<ApiResponse<{
    totalCoursesEnrolled: number;
    completedCourses: number;
    inProgressCourses: number;
    totalTimeSpent: number;
    courseProgress: Array<{
      courseId: string;
      courseTitle: string;
      progressPercentage: number;
      lastAccessed: Date;
    }>;
  }>> {
    try {
      const response = await axiosInstance.get('/progress/user/summary');
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch user progress');
      }
      throw new Error('Failed to fetch user progress');
    }
  }

  // Reset lecture progress
  async resetLectureProgress(courseId: string, lectureId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/progress/course/${courseId}/lecture/${lectureId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to reset lecture progress');
      }
      throw new Error('Failed to reset lecture progress');
    }
  }
}

// Export singleton instance
export const progressService = new ProgressService();
export default progressService;
