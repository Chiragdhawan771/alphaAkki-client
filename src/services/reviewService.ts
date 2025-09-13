import axiosInstance from './axiosInterceptor';

export interface Review {
  _id: string;
  student: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  course: {
    _id: string;
    title: string;
    thumbnail?: string;
  };
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewDto {
  rating: number;
  comment: string;
}

export interface UpdateReviewStatusDto {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}

class ReviewService {
  // User: Create a review for a course
  async createReview(courseId: string, reviewData: CreateReviewDto): Promise<Review> {
    const response = await axiosInstance.post(`/reviews/courses/${courseId}`, reviewData);
    return response.data;
  }

  // Public: Get approved reviews for a course
  async getCourseReviews(courseId: string, page = 1, limit = 10): Promise<ReviewsResponse> {
    const response = await axiosInstance.get(`/reviews/courses/${courseId}`, {
      params: { page, limit }
    });
    return response.data;
  }

  // Admin: Get all reviews with optional status filter
  async getAllReviews(status?: string, page = 1, limit = 10): Promise<ReviewsResponse> {
    const params: any = { page, limit };
    if (status) params.status = status;
    
    const response = await axiosInstance.get('/reviews/admin/all', { params });
    return response.data;
  }

  // Admin: Update review status (approve/reject)
  async updateReviewStatus(reviewId: string, statusData: UpdateReviewStatusDto): Promise<Review> {
    const response = await axiosInstance.patch(`/reviews/admin/${reviewId}/status`, statusData);
    return response.data;
  }

  // User: Get own reviews
  async getUserReviews(): Promise<Review[]> {
    const response = await axiosInstance.get('/reviews/my-reviews');
    return response.data;
  }

  // User: Delete own review (only if pending)
  async deleteReview(reviewId: string): Promise<{ message: string }> {
    const response = await axiosInstance.delete(`/reviews/${reviewId}`);
    return response.data;
  }
}

export const reviewService = new ReviewService();
