import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';

class SecureVideoService {
  // Get secure video URL with authentication
  async getSecureVideoUrl(courseId: string, videoIndex: number): Promise<string> {
    try {
      const response = await axiosInstance.get(`/simplified-courses/${courseId}/videos/${videoIndex}/stream`);
      return response.data.streamUrl;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to get secure video URL');
      }
      throw new Error('Failed to get secure video URL');
    }
  }

  // Get video stream with proper headers
  async getVideoStream(courseId: string, videoIndex: number): Promise<Blob> {
    try {
      const response = await axiosInstance.get(`/simplified-courses/${courseId}/videos/${videoIndex}/stream`, {
        responseType: 'blob',
        headers: {
          'Accept': 'video/*',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to stream video');
      }
      throw new Error('Failed to stream video');
    }
  }

  // Create a secure blob URL for video playback
  async createSecureVideoUrl(courseId: string, videoIndex: number): Promise<string> {
    try {
      // First try to get the signed URL directly
      const signedUrl = await this.getSecureVideoUrl(courseId, videoIndex);
      return signedUrl;
    } catch (error) {
      console.error('Failed to get secure video URL, trying blob approach:', error);
      try {
        const blob = await this.getVideoStream(courseId, videoIndex);
        return URL.createObjectURL(blob);
      } catch (blobError) {
        console.error('Failed to create secure video URL:', blobError);
        throw error;
      }
    }
  }

  // Cleanup blob URL to prevent memory leaks
  revokeVideoUrl(url: string): void {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  }

  // Get video metadata without streaming the full video
  async getVideoMetadata(courseId: string, videoIndex: number) {
    try {
      const response = await axiosInstance.get(`/simplified-courses/${courseId}/videos/${videoIndex}/metadata`);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to get video metadata');
      }
      throw new Error('Failed to get video metadata');
    }
  }
}

export default new SecureVideoService();
