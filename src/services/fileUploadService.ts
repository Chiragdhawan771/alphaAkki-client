import axiosInstance from './axiosInterceptor';
import { AxiosError } from 'axios';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

class FileUploadService {
  /**
   * Upload course thumbnail image to S3
   */
  async uploadCourseImage(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/files/upload/course-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to upload image');
      }
      throw new Error('Failed to upload image');
    }
  }

  /**
   * Upload course preview video to S3
   */
  async uploadCourseVideo(file: File): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axiosInstance.post('/files/upload/course-video', formData, {
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

  /**
   * Upload generic file to S3
   */
  async uploadFile(file: File, folder?: string): Promise<UploadResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const url = folder ? `/files/upload?folder=${folder}` : '/files/upload';
      const response = await axiosInstance.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to upload file');
      }
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<void> {
    try {
      await axiosInstance.delete(`/files/${key}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to delete file');
      }
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Get signed URL for private file access
   */
  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    try {
      const url = expiresIn 
        ? `/files/signed-url/${key}?expiresIn=${expiresIn}`
        : `/files/signed-url/${key}`;
      
      const response = await axiosInstance.get(url);
      return response.data.signedUrl;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to get signed URL');
      }
      throw new Error('Failed to get signed URL');
    }
  }
}

export default new FileUploadService();
