// Course Management System Types
export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  duration: number; // minutes
  price: number;
  type: 'free' | 'paid';
  thumbnail: string;
  previewVideo: string;
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  enrollmentCount: number;
  rating: number;
  requirements: string[];
  whatYouWillLearn: string[];
  createdAt: Date;
  updatedAt: Date;
  isFeatured?: boolean;
}

export interface Section {
  id: string;
  title: string;
  description: string;
  course: string;
  order: number;
  duration: number;
  lectureCount: number;
  lectures?: Lecture[];
}

export interface Lecture {
  id: string;
  title: string;
  description: string;
  course: string;
  section: string;
  type: 'video' | 'text' | 'pdf' | 'audio' | 'quiz';
  order: number;
  duration: number;
  videoUrl?: string;
  videoKey?: string;
  content?: string; // HTML for text lectures
  resources: Resource[];
  isFree: boolean;
  allowDownload: boolean;
}

export interface Resource {
  name: string;
  url: string;
  key: string;
  size: number;
  type: string;
}

export interface Enrollment {
  id: string;
  user: string;
  course: string;
  status: 'active' | 'completed' | 'suspended' | 'cancelled';
  enrolledAt: Date;
  completedAt?: Date;
  amountPaid: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  progressPercentage: number;
  completedLectures: string[];
  totalTimeSpent: number;
  paymentId?: string;
  paymentMethod?: string;
}

export interface Progress {
  id: string;
  user: string;
  course: string;
  lecture: string;
  progressPercentage: number;
  timeSpent: number;
  lastPosition: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface CourseStructure {
  course: Course;
  sections: Section[];
  enrollment?: Enrollment;
}

export interface Dashboard {
  totalCourses: number;
  totalStudents: number;
  totalRevenue: number;
  recentEnrollments: Enrollment[];
  popularCourses: Course[];
  revenueData: Array<{ month: string; revenue: number }>;
}

export interface CreateCourseData {
  title: string;
  description: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  price?: number;
  type?: 'free' | 'paid';
  categories?: string[];
  requirements?: string[];
  whatYouWillLearn?: string[];
  language?: string;
}

export interface CreateSectionData {
  title: string;
  description: string;
  order: number;
}

export interface CreateLectureData {
  title: string;
  description: string;
  section: string;
  type: 'video' | 'text' | 'pdf' | 'audio' | 'quiz';
  order: number;
  duration: number;
  isFree: boolean;
  content?: string;
}

export interface EnrollmentData {
  course: string;
  amountPaid?: number;
  paymentStatus?: 'completed' | 'pending';
  paymentId?: string;
  paymentMethod?: string;
}

export interface ProgressUpdateData {
  progressPercentage: number;
  timeSpent: number;
  lastPosition: number;
}

export interface VideoMetadata {
  duration: number;
  quality: string[];
  thumbnails: string[];
  subtitles?: string[];
}

export interface StreamingUrl {
  url: string;
  expiresAt: Date;
}

export interface CourseFilters {
  level?: 'beginner' | 'intermediate' | 'advanced';
  type?: 'free' | 'paid';
  categories?: string[];
  priceRange?: { min: number; max: number };
  rating?: number;
  search?: string;
  sortBy?: 'newest' | 'popular' | 'rating' | 'price_low' | 'price_high';
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FileUploadResponse {
  url: string;
  key: string;
  size: number;
  type: string;
}
