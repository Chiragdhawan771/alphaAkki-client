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
  X
} from "lucide-react"
import VideoPlayer from "@/components/courses/VideoPlayer"
import { courseService } from "@/services"
import simplifiedCourseService from "@/services/simplifiedCourseService"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

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

  const [course, setCourse] = useState<SimplifiedCourse | null>(null)
  const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrollAttempted, setEnrollAttempted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filter, setFilter] = useState("")

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
    router.push(`/courses/${courseId}/learn?video=${index}`, { scroll: false })
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
      navigateToVideo(prevVideo, currentIndex - 1)
    }
  }

  const goToNextVideo = () => {
    if (!course?.videos || !currentVideo) return
    
    const currentIndex = course.videos.findIndex((v: Video) => v.order === currentVideo.order)
    if (currentIndex < course.videos.length - 1) {
      const nextVideo = course.videos[currentIndex + 1]
      navigateToVideo(nextVideo, currentIndex + 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-4">The course you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/dashboard')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="font-semibold text-lg truncate max-w-md">{course.title}</h1>
                <div className="text-sm text-muted-foreground">{course.videos.length} videos</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progress UI removed */}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden"
              >
                {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Video List */}
          <div className={cn(
            "lg:col-span-1 space-y-4",
            sidebarOpen ? "block" : "hidden",
            "lg:block"
          )}>
            <Card>
              <CardHeader className="pb-3 space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Course Content</CardTitle>
                  <span className="text-xs text-gray-500">{course.videos.length} videos</span>
                </div>
                <div className="relative">
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search videos..."
                    className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[28rem] overflow-y-auto">
                {course.videos
                  .filter((v) => v.title.toLowerCase().includes(filter.toLowerCase()))
                  .map((video: Video, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                      currentVideo?.order === video.order
                        ? "bg-primary/10 border border-primary/20"
                        : "hover:bg-muted/50"
                    )}
                    onClick={() => navigateToVideo(video, index)}
                  >
                    <div className="flex-shrink-0">
                      <Play className="h-5 w-5 text-muted-foreground" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {index + 1}. {video.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{video.duration ? `${Math.ceil(video.duration / 60)} min` : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {currentVideo ? (
              <>
                {/* Video Content */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{currentVideo.title}</h2>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                        <Badge variant="outline">Video</Badge>
                        {currentVideo.duration && (
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{Math.ceil(currentVideo.duration / 60)} minutes</span>
                          </div>
                        )}
                        {/* Completed badge removed */}
                      </div>
                    </div>
                  </div>

                  {/* Video Player */}
                  <VideoPlayer
                    lectureId={currentVideo.videoKey}
                    videoUrl={currentVideo.videoUrl}
                    title={currentVideo.title}
                  />

                  {/* Up Next */}
                  {course.videos.length > 1 && getCurrentVideoIndex() < course.videos.length && (
                    <div className="mt-4 rounded-lg border p-4 bg-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs uppercase tracking-wide text-gray-500">Up next</div>
                          <div className="font-medium">
                            {course.videos[getCurrentVideoIndex()].title}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {course.videos[getCurrentVideoIndex()].duration
                                ? `${Math.ceil(course.videos[getCurrentVideoIndex()].duration / 60)} min`
                                : 'N/A'}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          onClick={goToNextVideo}
                          className="flex items-center gap-2"
                        >
                          Play next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={goToPreviousVideo}
                    disabled={getCurrentVideoIndex() === 1}
                    className="flex items-center space-x-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </Button>

                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Video {getCurrentVideoIndex()} of {course.videos.length}
                    </p>
                  </div>

                  <Button
                    onClick={goToNextVideo}
                    disabled={getCurrentVideoIndex() === course.videos.length}
                    className="flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No videos available</h3>
                <p className="text-muted-foreground">This course doesn't have any videos yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
