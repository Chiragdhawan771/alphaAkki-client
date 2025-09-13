// Export all review components for easy importing
export { default as ReviewForm } from './ReviewForm';
export { default as ReviewList } from './ReviewList';
export { default as CourseReviews } from './CourseReviews';
export { default as AdminReviewManager } from './AdminReviewManager';
export { default as UserReviewSection } from './UserReviewSection';

// Re-export types from the service
export type { Review, CreateReviewDto, UpdateReviewStatusDto, ReviewsResponse } from '@/services/reviewService';
