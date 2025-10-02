"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Play,
  Menu,
  X,
  Star,
  MessageSquare
} from "lucide-react"
import AntiPiracyWrapper from '@/components/courses/AntiPiracyWrapper';
import { CourseReviews } from '@/components/reviews';
import { courseService, simplifiedCourseService } from '@/services'
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import VideoPlayer from "@/components/courses/VideoPlayer"
import { useAuth } from "@/contexts/AuthContext"

interface Video {
  title: string
  videoUrl: string
  videoKey: string
  duration: number
  order: number
  uploadedAt: Date
}

interface SimplifiedCourse {
  _id: string
  title: string
  description: string
  instructor: any
  thumbnail?: string
  videos: Video[]
  totalDuration: number
}

export default function CourseLearningPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = params.id as string
  const { toast } = useToast()
  const { user } = useAuth()

  const [course, setCourse] = useState<SimplifiedCourse | null>(null)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrollAttempted, setEnrollAttempted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState("")
  const [showReviews, setShowReviews] = useState(false)

  useEffect(() => {
    loadCourseData()
  }, [courseId])

  useEffect(() => {
    // Set initial video from URL or first video
    if (course?.videos && course.videos.length > 0) {
      const videoParam = searchParams.get('video')
      const targetVideo = videoParam 
        ? course.videos.find((v: Video) => v.order === parseInt(videoParam))
        : course.videos[0]
      
      if (targetVideo) {
        setCurrentVideo(targetVideo)
      } else {
        setCurrentVideo(course.videos[0])
      }
    }
  }, [course, searchParams])

  // Keyboard navigation: Left/Right arrows
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        goToPreviousVideo()
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        goToNextVideo()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [currentVideo, course])

  const loadCourseData = async () => {
    try {
      setLoading(true)
      console.log('Loading course with ID:', courseId)
      const courseData = await courseService.getCourse(courseId)
      console.log('Course data received:', courseData)
      
      // Response shape from API: { course, enrollment, watchedVideos }
      const payload = (courseData as any) || {}
      const apiCourse = payload.course || {}

      const videosArr: Video[] = (apiCourse.videos || []).map((video: any, index: number) => ({
        title: video.title,
        videoUrl: video.videoUrl,
        videoKey: video.videoKey,
        duration: video.duration || 0,
        order: video.order || index + 1,
        uploadedAt: video.uploadedAt ? new Date(video.uploadedAt) : new Date(),
      }))

      const courseWithProgress: SimplifiedCourse = {
        _id: apiCourse._id || apiCourse.id || courseId,
        title: apiCourse.title || 'Untitled Course',
        description: apiCourse.description || '',
        instructor: apiCourse.instructor ? 
          `${apiCourse.instructor.firstName || ''} ${apiCourse.instructor.lastName || ''}`.trim() || 'Unknown Instructor'
          : 'Unknown Instructor',
        thumbnail: apiCourse.thumbnail,
        totalDuration: videosArr.reduce((sum, v) => sum + (v.duration || 0), 0),
        videos: videosArr,
      }
      
      console.log('Processed course data:', courseWithProgress)
      setCourse(courseWithProgress)
    } catch (error) {
      console.error('Error loading course:', error)
      const message = (error as any)?.message || 'Failed to load course data'
      // Auto-enroll fallback for free courses if not enrolled
      if (!enrollAttempted && /enrolled/i.test(message)) {
        try {
          setEnrollAttempted(true)
          console.log('Attempting to enroll user in course:', courseId)
          await simplifiedCourseService.enrollInCourse(courseId)
          console.log('Enrollment successful, refetching content...')
          // Re-fetch content after successful enrollment
          const courseData = await courseService.getCourse(courseId)
          const payload = (courseData as any) || {}
          const apiCourse = payload.course || {}

          const videosArr: Video[] = (apiCourse.videos || []).map((video: any, index: number) => ({
            title: video.title,
            videoUrl: video.videoUrl,
            videoKey: video.videoKey,
            duration: video.duration || 0,
            order: video.order || index + 1,
            uploadedAt: video.uploadedAt ? new Date(video.uploadedAt) : new Date(),
          }))

          const courseWithProgress: SimplifiedCourse = {
            _id: apiCourse._id || apiCourse.id || courseId,
            title: apiCourse.title || 'Untitled Course',
            description: apiCourse.description || '',
            instructor: apiCourse.instructor ? 
              `${apiCourse.instructor.firstName || ''} ${apiCourse.instructor.lastName || ''}`.trim() || 'Unknown Instructor'
              : 'Unknown Instructor',
            thumbnail: apiCourse.thumbnail,
            totalDuration: videosArr.reduce((sum, v) => sum + (v.duration || 0), 0),
            videos: videosArr,
          }

          setCourse(courseWithProgress)
          return
        } catch (enrollErr: any) {
          console.error('Enrollment failed:', enrollErr)
          const enrollMsg = enrollErr?.message || ''
          if (/payment/i.test(enrollMsg)) {
            toast({
              title: "Payment required",
              description: "This is a paid course. Please purchase/enroll from the course page first.",
              variant: "destructive"
            })
          } else {
            toast({
              title: "Unable to load course",
              description: enrollMsg || 'Please try again later.',
              variant: "destructive"
            })
          }
        }
      } else {
        toast({
          title: "Error",
          description: message,
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const navigateToVideo = (video: Video, index: number) => {
    setCurrentVideo(video)
    router.push(`/courses/${courseId}/learn?video=${video.order}`, { scroll: false })
  }

  // Progress tracking removed

  const getCurrentVideoIndex = () => {
    if (!course?.videos || !currentVideo) return 0
    return course.videos.findIndex((v: Video) => v.order === currentVideo.order) + 1
  }

  const goToPreviousVideo = () => {
    if (!course?.videos || !currentVideo) return
    
    const currentIndex = course.videos.findIndex((v: Video) => v.order === currentVideo.order)
    if (currentIndex > 0) {
      const prevVideo = course.videos[currentIndex - 1]
      setCurrentVideo(prevVideo)
      router.push(`/courses/${courseId}/learn?video=${prevVideo.order}`, { scroll: false })
    }
  }

  const goToNextVideo = () => {
    if (!course?.videos || !currentVideo) return
    
    const currentIndex = course.videos.findIndex((v: Video) => v.order === currentVideo.order)
    if (currentIndex < course.videos.length - 1) {
      const nextVideo = course.videos[currentIndex + 1]
      setCurrentVideo(nextVideo)
      router.push(`/courses/${courseId}/learn?video=${nextVideo.order}`, { scroll: false })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-200 border-t-orange-500 mx-auto mb-6"></div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">Loading Course</h2>
          <p className="text-gray-600 text-sm sm:text-base">Please wait while we prepare your learning experience...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="bg-white rounded-2xl p-8 shadow-xl">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="h-10 w-10 text-red-500" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">Course Not Found</h1>
            <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
              The course you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button 
              onClick={() => router.push('/dashboard')}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AntiPiracyWrapper
      // userId={courseId}
      // courseId={course?._id}
      userName={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || user?.name}
      userEmail={user?.email}
    >
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white/95 backdrop-blur-md border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 h-8 sm:h-9"
                >
                  <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline text-sm">Back to Dashboard</span>
                  <span className="sm:hidden text-xs">Back</span>
                </Button>
                <Separator orientation="vertical" className="h-4 sm:h-6" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">{course?.title}</h1>
                  <p className="text-xs sm:text-sm text-gray-600 truncate hidden sm:block">{course?.instructor}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviews(!showReviews)}
                  className="flex items-center space-x-1 px-2 sm:px-3 h-8 sm:h-9"
                >
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline text-xs sm:text-sm">Reviews</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 h-8 w-8 sm:h-9 sm:w-9"
                  aria-label="Toggle course content"
                >
                  {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            
            {/* Sidebar - Video List */}
            <div className={cn(
              "lg:col-span-1 space-y-4",
              "lg:block lg:relative lg:z-auto",
              sidebarOpen 
                ? "fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white z-50 p-4 overflow-y-auto shadow-2xl lg:shadow-none lg:static lg:w-auto lg:max-w-none lg:h-auto lg:p-0" 
                : "hidden"
            )}>
              {/* Mobile Close Button */}
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h2 className="text-lg font-semibold text-gray-900">Course Content</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <Card className="shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="pb-3 sm:pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Course Content</CardTitle>
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">{course.videos.length} videos</span>
                  </div>
                  <div className="relative">
                    <input
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      placeholder="Search videos..."
                      className="w-full rounded-xl border-2 border-gray-200 px-3 sm:px-4 py-2 sm:py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-gray-50 focus:bg-white touch-manipulation"
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3 max-h-[60vh] lg:max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  {course.videos
                    .filter((v) => v.title.toLowerCase().includes(filter.toLowerCase()))
                    .map((video: Video, index: number) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 group touch-manipulation",
                        currentVideo?.order === video.order
                          ? "bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 shadow-md"
                          : "hover:bg-gray-50 hover:shadow-md border border-gray-200 active:bg-gray-100"
                      )}
                      onClick={() => {
                        navigateToVideo(video, index);
                        setSidebarOpen(false); // Close sidebar on mobile after selection
                      }}
                    >
                      <div className="flex-shrink-0">
                        <div className={cn(
                          "w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200",
                          currentVideo?.order === video.order
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                            : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600"
                        )}>
                          <Play className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className={cn(
                          "font-semibold text-xs sm:text-sm leading-tight transition-colors duration-200",
                          currentVideo?.order === video.order
                            ? "text-orange-800"
                            : "text-gray-900 group-hover:text-orange-700"
                        )}>
                          <span className="line-clamp-2">{index + 1}. {video.title}</span>
                        </div>
                        {/* <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Clock className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{video.duration ? `${Math.ceil(video.duration / 60)} min` : 'Duration N/A'}</span>
                        </div> */}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-4 sm:space-y-6 lg:space-y-8 order-first lg:order-last">
              {currentVideo ? (
                <>
                  {/* Video Content */}
                  <div className="space-y-4 sm:space-y-6">
                    <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex-1 min-w-0">
                          <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 leading-tight">{currentVideo.title}</h2>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-gray-600">
                            {/* <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">Video Lecture</Badge>
                            {currentVideo.duration && (
                              <div className="flex items-center space-x-2 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">
                                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                                <span className="font-medium text-xs sm:text-sm">{Math.ceil(currentVideo.duration / 60)} minutes</span>
                              </div>
                            )} */}
                          </div>
                        </div>
                      </div>

                      {/* Video Player */}
                      <div className="rounded-lg sm:rounded-xl overflow-hidden shadow-xl sm:shadow-2xl">
                        {currentVideo ? (
                          <VideoPlayer
                            lectureId={currentVideo.videoKey}
                            videoUrl={currentVideo.videoUrl}
                            title={currentVideo.title}
                            autoPlay={true}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                            <p className="text-gray-500">No videos available</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Up Next */}
                    {course.videos.length > 1 && getCurrentVideoIndex() < course.videos.length && (
                      <div className="mt-4 sm:mt-6 rounded-xl border border-gray-200 p-4 sm:p-6 bg-gradient-to-r from-orange-50 to-red-50">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs uppercase tracking-wider text-orange-600 font-semibold mb-2">Up next</div>
                            <div className="font-semibold text-gray-900 text-base sm:text-lg mb-1 line-clamp-2">
                              {course.videos[getCurrentVideoIndex()].title}
                            </div>
                            <div className="text-sm text-gray-600 flex items-center gap-2">
                              <Clock className="h-4 w-4 flex-shrink-0" />
                              <span>
                                {course.videos[getCurrentVideoIndex()].duration
                                  ? `${Math.ceil(course.videos[getCurrentVideoIndex()].duration / 60)} minutes`
                                  : 'Duration not available'}
                              </span>
                            </div>
                          </div>
                          <Button
                            onClick={goToNextVideo}
                            size="lg"
                            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 w-full sm:w-auto justify-center"
                          >
                            Play Next
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-gray-100">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <Button
                        variant="outline"
                        onClick={goToPreviousVideo}
                        disabled={getCurrentVideoIndex() === 1}
                        size="lg"
                        className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        <span className="font-medium">Previous</span>
                      </Button>

                      <div className="text-center bg-gray-50 px-4 sm:px-6 py-2 sm:py-3 rounded-xl order-first sm:order-none">
                        <p className="text-xs sm:text-sm font-semibold text-gray-700">
                          Video {getCurrentVideoIndex()} of {course.videos.length}
                        </p>
                      </div>

                      <Button
                        onClick={goToNextVideo}
                        disabled={getCurrentVideoIndex() === course.videos.length}
                        size="lg"
                        className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                      >
                        <span>Next</span>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <div className="bg-gray-50 rounded-2xl p-8 sm:p-12">
                    <Play className="h-16 w-16 sm:h-20 sm:w-20 text-gray-400 mx-auto mb-6" />
                    <h3 className="text-xl sm:text-2xl font-semibold mb-3 text-gray-800">No videos available</h3>
                    <p className="text-gray-600 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                      This course doesn't have any videos yet. Check back later or contact the instructor.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {showReviews && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">Course Reviews</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviews(false)}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
                <CourseReviews courseId={courseId} courseTitle={course?.title || ''} />
              </div>
            </div>
          </div>
        )}
      </div>
    </AntiPiracyWrapper>
  )
}
