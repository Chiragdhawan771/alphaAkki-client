// Course DTOs based on backend structure
export interface CreateCourseDto {
  title: string
  description: string
  shortDescription?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  language?: string
  duration?: number
  price?: number
  type?: 'free' | 'paid'
  thumbnail?: string
  previewVideo?: string
  categories?: string[]
  tags?: string[]
  isFeatured?: boolean
  requirements?: string[]
  whatYouWillLearn?: string[]
  targetAudience?: string[]
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
}

export interface CreateSectionDto {
  title: string
  description?: string
  order: number
  isActive?: boolean
}

export interface CreateLectureDto {
  title: string
  description?: string
  section: string
  type: 'video' | 'audio' | 'text' | 'pdf' | 'quiz'
  order: number
  duration?: number
  videoUrl?: string
  videoKey?: string
  audioUrl?: string
  audioKey?: string
  content?: string
  pdfUrl?: string
  pdfKey?: string
  thumbnail?: string
  resources?: LectureResourceDto[]
  status?: 'draft' | 'published' | 'archived'
  isFree?: boolean
  isActive?: boolean
  allowDownload?: boolean
  playbackSpeed?: number
  transcript?: string
  keywords?: string[]
}

export interface LectureResourceDto {
  name: string
  url: string
  key: string
  size: number
  type: string
}

export interface CreateEnrollmentDto {
  course: string
  amountPaid?: number
  paymentStatus?: 'pending' | 'completed' | 'failed' | 'refunded'
  paymentId?: string
  paymentMethod?: string
}

export interface PublishCourseDto {
  status: 'draft' | 'published' | 'archived'
}

export interface QueryCourseDto {
  search?: string
  level?: 'beginner' | 'intermediate' | 'advanced'
  type?: 'free' | 'paid'
  status?: 'draft' | 'published' | 'archived'
  category?: string
  instructor?: string
  isFeatured?: boolean
  minPrice?: number
  maxPrice?: number
  minRating?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface UpdateCourseDto extends Partial<CreateCourseDto> {}
export interface UpdateSectionDto extends Partial<CreateSectionDto> {}
export interface UpdateLectureDto extends Partial<CreateLectureDto> {}

export interface UpdateProgressDto {
  lecture: string
  progress: number
  completed?: boolean
  timeSpent?: number
}

export interface UploadFileDto {
  file: File
  type: 'video' | 'audio' | 'pdf' | 'image' | 'document'
  folder?: string
}
