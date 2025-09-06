import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';
import {
  VideoMetadata,
  StreamingUrl,
  ApiResponse
} from './types';

class StreamingService {
  // Get video stream URL for a lecture
  async getVideoStreamUrl(lectureId: string): Promise<ApiResponse<StreamingUrl>> {
    try {
      const response = await axiosInstance.get(`/streaming/video/${lectureId}/url`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to get video stream URL');
      }
      throw new Error('Failed to get video stream URL');
    }
  }

  // Get video metadata for a lecture
  async getVideoMetadata(lectureId: string): Promise<ApiResponse<VideoMetadata>> {
    try {
      const response = await axiosInstance.get(`/streaming/lecture/${lectureId}/metadata`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to get video metadata');
      }
      throw new Error('Failed to get video metadata');
    }
  }

  // Generate course playlist
  async getCoursePlaylist(courseId: string): Promise<ApiResponse<{
    courseId: string;
    playlist: Array<{
      lectureId: string;
      title: string;
      duration: number;
      order: number;
      sectionTitle: string;
      streamUrl?: string;
    }>;
  }>> {
    try {
      const response = await axiosInstance.get(`/streaming/course/${courseId}/playlist`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to generate course playlist');
      }
      throw new Error('Failed to generate course playlist');
    }
  }

  // Get download URL for lecture resources
  async getResourceDownloadUrl(lectureId: string, resourceId: string): Promise<ApiResponse<StreamingUrl>> {
    try {
      const response = await axiosInstance.get(`/streaming/lecture/${lectureId}/resource/${resourceId}/download`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to get resource download URL');
      }
      throw new Error('Failed to get resource download URL');
    }
  }

  // Get subtitle/caption URL for a lecture
  async getSubtitleUrl(lectureId: string, language: string = 'en'): Promise<ApiResponse<StreamingUrl>> {
    try {
      const response = await axiosInstance.get(`/streaming/lecture/${lectureId}/subtitles/${language}`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to get subtitle URL');
      }
      throw new Error('Failed to get subtitle URL');
    }
  }
}

// Export singleton instance
export const streamingService = new StreamingService();
export default streamingService;
