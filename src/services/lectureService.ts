import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';
import {
  Lecture,
  CreateLectureData,
  ApiResponse,
  FileUploadResponse
} from './types';

interface CreateLectureDto {
  title: string;
  description?: string;
  section: string;
  type: 'video' | 'text' | 'pdf' | 'audio' | 'quiz';
  order: number;
  duration?: number;
  videoUrl?: string;
  videoKey?: string;
  audioUrl?: string;
  audioKey?: string;
  content?: string;
  pdfUrl?: string;
  pdfKey?: string;
  thumbnail?: string;
  resources?: Array<{
    name: string;
    url: string;
    key: string;
    size: number;
    type: string;
  }>;
  status?: 'draft' | 'published' | 'archived';
  isFree?: boolean;
  isActive?: boolean;
  allowDownload?: boolean;
  playbackSpeed?: number;
  transcript?: string;
  keywords?: string[];
}

class LectureService {
  // Create a new lecture
  async createLecture(lectureData: CreateLectureDto): Promise<ApiResponse<Lecture>> {
    try {
      const response = await axiosInstance.post('/lectures', lectureData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to create lecture');
      }
      throw new Error('Failed to create lecture');
    }
  }

  // Get lecture by ID
  async getLecture(lectureId: string): Promise<ApiResponse<Lecture>> {
    try {
      const response = await axiosInstance.get(`/lectures/${lectureId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch lecture');
      }
      throw new Error('Failed to fetch lecture');
    }
  }

  // Update lecture
  async updateLecture(lectureId: string, lectureData: Partial<CreateLectureDto>): Promise<ApiResponse<Lecture>> {
    try {
      const response = await axiosInstance.patch(`/lectures/${lectureId}`, lectureData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update lecture');
      }
      throw new Error('Failed to update lecture');
    }
  }

  // Delete lecture
  async deleteLecture(lectureId: string): Promise<ApiResponse<void>> {
    try {
      const response = await axiosInstance.delete(`/lectures/${lectureId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete lecture');
      }
      throw new Error('Failed to delete lecture');
    }
  }

  // Upload lecture content
  async uploadLectureContent(
    lectureId: string,
    file: File,
    contentType: 'video' | 'audio' | 'pdf' | 'thumbnail' | 'resources'
  ): Promise<ApiResponse<FileUploadResponse>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post(`/lectures/${lectureId}/upload/${contentType}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to upload lecture content');
      }
      throw new Error('Failed to upload lecture content');
    }
  }

  // Get lectures by section
  async getLecturesBySection(sectionId: string): Promise<ApiResponse<Lecture[]>> {
    try {
      const response = await axiosInstance.get(`/lectures/section/${sectionId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch section lectures');
      }
      throw new Error('Failed to fetch section lectures');
    }
  }

  // Get lectures by course
  async getLecturesByCourse(courseId: string): Promise<ApiResponse<Lecture[]>> {
    try {
      const response = await axiosInstance.get(`/lectures/course/${courseId}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch course lectures');
      }
      throw new Error('Failed to fetch course lectures');
    }
  }

  // Get free lectures for course preview
  async getFreeLectures(courseId: string): Promise<ApiResponse<Lecture[]>> {
    try {
      const response = await axiosInstance.get(`/lectures/course/${courseId}/free`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to fetch free lectures');
      }
      throw new Error('Failed to fetch free lectures');
    }
  }

  // Reorder lectures within a section
  async reorderLectures(sectionId: string, lectures: Array<{ id: string; order: number }>): Promise<ApiResponse<Lecture[]>> {
    try {
      const response = await axiosInstance.put(`/lectures/section/${sectionId}/reorder`, lectures);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to reorder lectures');
      }
      throw new Error('Failed to reorder lectures');
    }
  }

  // Update lecture content (for text content)
  async updateLectureContent(lectureId: string, content: string): Promise<ApiResponse<Lecture>> {
    try {
      const response = await axiosInstance.patch(`/lectures/${lectureId}`, { content });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to update lecture content');
      }
      throw new Error('Failed to update lecture content');
    }
  }
}

// Export singleton instance
export const lectureService = new LectureService();
export default lectureService;
