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

export interface MultipartUploadSession {
  sessionId: string;
  uploadId: string;
  key: string;
  bucket: string;
}

export interface PresignedPartUrl {
  partNumber: number;
  presignedUrl: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
  chunkIndex?: number;
  totalChunks?: number;
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

  // Admin: Add video to course using multipart upload
  async addVideo(
    courseId: string, 
    videoData: AddVideoData, 
    videoFile: File,
    onUploadProgress?: (progress: UploadProgress) => void
  ) {
    try {
      // File size validation
      const MAX_FILE_SIZE = 5 * 1024 * 1024 * 1024; // 5GB limit
      const MIN_FILE_SIZE = 1024; // 1KB minimum
      
      if (videoFile.size > MAX_FILE_SIZE) {
        throw new Error(`File size (${this.formatFileSize(videoFile.size)}) exceeds maximum allowed size of ${this.formatFileSize(MAX_FILE_SIZE)}`);
      }
      
      if (videoFile.size < MIN_FILE_SIZE) {
        throw new Error(`File size (${this.formatFileSize(videoFile.size)}) is too small. Minimum size is ${this.formatFileSize(MIN_FILE_SIZE)}`);
      }
      
      // Validate file type
      const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/mkv'];
      if (!allowedTypes.includes(videoFile.type)) {
        throw new Error(`Unsupported file type: ${videoFile.type}. Supported types: ${allowedTypes.join(', ')}`);
      }
      
      // Use multipart upload for large files (>50MB) or all files
      const shouldUseMultipart = videoFile.size > 50 * 1024 * 1024 || true;
      
      if (shouldUseMultipart) {
        return await this.multipartVideoUpload(courseId, videoData, videoFile, onUploadProgress);
      } else {
        // Fallback to legacy upload for small files (if needed)
        return await this.legacyVideoUpload(courseId, videoData, videoFile, onUploadProgress);
      }
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to upload video');
      }
      throw new Error('Failed to upload video');
    }
  }
  
  // Helper method to format file sizes
  private formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  // Multipart upload implementation
  private async multipartVideoUpload(
    courseId: string,
    videoData: AddVideoData,
    videoFile: File,
    onUploadProgress?: (progress: UploadProgress) => void
  ) {
    // Optimize chunk size based on file size
    const CHUNK_SIZE = this.getOptimalChunkSize(videoFile.size);
    const totalChunks = Math.ceil(videoFile.size / CHUNK_SIZE);
    const chunkProgress = new Array(totalChunks).fill(0); // Track progress per chunk
    let session: MultipartUploadSession | null = null;

    try {
      // Step 1: Initialize multipart upload
      onUploadProgress?.({
        loaded: 0,
        total: videoFile.size,
        percentage: 0,
        chunkIndex: 0,
        totalChunks
      });
      
      session = await this.initiateMultipartUpload(courseId, videoData, videoFile, CHUNK_SIZE, totalChunks);
      
      // Step 2: Upload chunks in parallel (with concurrency limit)
      const uploadedParts = await this.uploadChunksInParallel(
        courseId,
        session,
        videoFile,
        CHUNK_SIZE,
        totalChunks,
        (chunkUpdate) => {
          // Update progress for specific chunk
          chunkProgress[chunkUpdate.chunkIndex] = chunkUpdate.loaded;
          
          // Calculate total uploaded bytes
          const totalUploaded = chunkProgress.reduce((sum, bytes) => sum + bytes, 0);
          
          const overallProgress: UploadProgress = {
            loaded: totalUploaded,
            total: videoFile.size,
            percentage: Math.round((totalUploaded / videoFile.size) * 100),
            chunkIndex: chunkUpdate.chunkIndex,
            totalChunks
          };
          onUploadProgress?.(overallProgress);
        }
      );

      // Step 3: Complete multipart upload - show completion progress
      onUploadProgress?.({
        loaded: videoFile.size,
        total: videoFile.size,
        percentage: 100,
        chunkIndex: totalChunks - 1,
        totalChunks
      });
      
      const result = await this.completeMultipartUpload(courseId, session.sessionId, uploadedParts);
      
      return result;
    } catch (error) {
      console.error('Multipart upload failed:', error);
      
      // Cleanup: Abort multipart upload on failure
      if (session) {
        try {
          await this.abortMultipartUpload(courseId, session.sessionId);
          console.log('Multipart upload aborted due to failure');
        } catch (abortError) {
          console.error('Failed to abort multipart upload:', abortError);
        }
      }
      
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Multipart upload failed: ${error.message}`);
      }
      throw error;
    }
  }

  // Initialize multipart upload session
  private async initiateMultipartUpload(
    courseId: string,
    videoData: AddVideoData,
    videoFile: File,
    chunkSize: number,
    totalChunks: number
  ): Promise<MultipartUploadSession> {
    try {
      const response = await axiosInstance.post(`/simplified-courses/${courseId}/videos/uploads/initiate`, {
        title: videoData.title,
        fileName: videoFile.name,
        mimeType: videoFile.type,
        fileSize: videoFile.size,
        partSize: chunkSize,
        totalParts: totalChunks,
        duration: videoData.duration,
        autoDetectDuration: videoData.autoDetectDuration
      });
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to initialize upload');
      }
      throw new Error('Failed to initialize upload');
    }
  }

  // Upload chunks in parallel with concurrency control and retry logic
  private async uploadChunksInParallel(
    courseId: string,
    session: MultipartUploadSession,
    file: File,
    chunkSize: number,
    totalChunks: number,
    onChunkProgress: (progress: { loaded: number; chunkIndex: number }) => void
  ) {
    const MAX_CONCURRENT_UPLOADS = 3;
    const MAX_RETRIES = 3;
    const uploadedParts: { partNumber: number; eTag: string }[] = [];
    
    // Create chunks
    const chunks: { partNumber: number; chunk: Blob; start: number; end: number }[] = [];
    for (let i = 0; i < totalChunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);
      chunks.push({ partNumber: i + 1, chunk, start, end });
    }

    // Upload chunk with retry logic
    const uploadChunkWithRetry = async (chunkData: typeof chunks[0], retryCount = 0): Promise<{ partNumber: number; eTag: string }> => {
      try {
        // Get presigned URL for this part
        const presignedResponse = await axiosInstance.post(
          `/simplified-courses/${courseId}/videos/uploads/${session.sessionId}/parts/presign`,
          { partNumbers: [chunkData.partNumber] }
        );

        console.log(`Presigned response for chunk ${chunkData.partNumber}:`, presignedResponse.data);
        
        // Backend returns parts array with url property, not presignedUrls
        const presignedUrl = presignedResponse.data.parts[0]?.url;
        if (!presignedUrl) {
          console.error('No presigned URL in response:', presignedResponse.data);
          throw new Error(`Failed to get presigned URL for part ${chunkData.partNumber}`);
        }

        // Upload chunk directly to S3
        console.log(`Uploading chunk ${chunkData.partNumber} (${chunkData.chunk.size} bytes) to S3...`);
        
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          body: chunkData.chunk,
          // Don't set Content-Type for S3 multipart uploads - let S3 handle it
        });

        if (!uploadResponse.ok) {
          const errorText = await uploadResponse.text().catch(() => 'Unknown error');
          console.error(`S3 upload failed for chunk ${chunkData.partNumber}:`, {
            status: uploadResponse.status,
            statusText: uploadResponse.statusText,
            error: errorText
          });
          throw new Error(`Failed to upload chunk ${chunkData.partNumber}: ${uploadResponse.status} ${uploadResponse.statusText}`);
        }

        const etag = uploadResponse.headers.get('ETag');
        if (!etag) {
          throw new Error(`No ETag received for part ${chunkData.partNumber}`);
        }

        // Report progress for this chunk
        onChunkProgress({
          loaded: chunkData.chunk.size,
          chunkIndex: chunkData.partNumber - 1
        });

        return {
          partNumber: chunkData.partNumber,
          eTag: etag.replace(/"/g, '') // Remove quotes from ETag (note: eTag not etag)
        };
      } catch (error) {
        console.error(`Failed to upload chunk ${chunkData.partNumber} (attempt ${retryCount + 1}):`, error);
        
        // Retry logic
        if (retryCount < MAX_RETRIES) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Retrying chunk ${chunkData.partNumber} in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return uploadChunkWithRetry(chunkData, retryCount + 1);
        }
        
        throw new Error(`Failed to upload chunk ${chunkData.partNumber} after ${MAX_RETRIES + 1} attempts: ${error instanceof Error ? error.message : String(error)}`);
      }
    };

    // Process chunks in batches with concurrency control
    for (let i = 0; i < chunks.length; i += MAX_CONCURRENT_UPLOADS) {
      const batch = chunks.slice(i, i + MAX_CONCURRENT_UPLOADS);
      const batchResults = await Promise.all(batch.map(chunk => uploadChunkWithRetry(chunk)));
      uploadedParts.push(...batchResults);
    }

    // Sort parts by part number
    return uploadedParts.sort((a, b) => a.partNumber - b.partNumber);
  }

  // Complete multipart upload
  private async completeMultipartUpload(
    courseId: string,
    sessionId: string,
    parts: { partNumber: number; eTag: string }[]
  ) {
    try {
      const response = await axiosInstance.post(
        `/simplified-courses/${courseId}/videos/uploads/${sessionId}/complete`,
        { parts }
      );
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to complete upload');
      }
      throw new Error('Failed to complete upload');
    }
  }

  // Abort multipart upload
  private async abortMultipartUpload(courseId: string, sessionId: string) {
    try {
      await axiosInstance.delete(`/simplified-courses/${courseId}/videos/uploads/${sessionId}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError) {
        throw new Error(error.response?.data?.message || 'Failed to abort upload');
      }
      throw new Error('Failed to abort upload');
    }
  }

  // Get optimal chunk size based on file size
  private getOptimalChunkSize(fileSize: number): number {
    const MB = 1024 * 1024;
    const GB = 1024 * MB;
    
    // Optimize chunk size based on file size for better performance
    if (fileSize < 100 * MB) {
      return 5 * MB;   // 5MB chunks for small files
    } else if (fileSize < 500 * MB) {
      return 10 * MB;  // 10MB chunks for medium files
    } else if (fileSize < 2 * GB) {
      return 25 * MB;  // 25MB chunks for large files
    } else {
      return 50 * MB;  // 50MB chunks for very large files
    }
  }

  // Legacy upload method (fallback)
  private async legacyVideoUpload(
    courseId: string,
    videoData: AddVideoData,
    videoFile: File,
    onUploadProgress?: (progress: UploadProgress) => void
  ) {
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
          const progress: UploadProgress = {
            loaded: progressEvent.loaded,
            total: progressEvent.total,
            percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
          };
          onUploadProgress?.(progress);
        }
      },
    });
    return response.data;
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
