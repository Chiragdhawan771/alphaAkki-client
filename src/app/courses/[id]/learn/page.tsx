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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Video List */}
          <div className={cn(
            "lg:col-span-1 space-y-4",
            sidebarOpen ? "block" : "hidden",
            "lg:block"
          )}>
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Course Content</CardTitle>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{course.videos.length} videos</span>
                </div>
                <div className="relative">
                  <input
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    placeholder="Search videos..."
                    className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-200 bg-gray-50 focus:bg-white"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-3 max-h-[32rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                {course.videos
                  .filter((v) => v.title.toLowerCase().includes(filter.toLowerCase()))
                  .map((video: Video, index: number) => (
                  <div
                    key={index}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 group",
                      currentVideo?.order === video.order
                        ? "bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 shadow-md"
                        : "hover:bg-gray-50 hover:shadow-md border border-gray-200"
                    )}
                    onClick={() => navigateToVideo(video, index)}
                  >
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200",
                        currentVideo?.order === video.order
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                          : "bg-gray-100 text-gray-600 group-hover:bg-orange-100 group-hover:text-orange-600"
                      )}>
                        <Play className="h-4 w-4" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className={cn(
                        "font-semibold text-sm truncate transition-colors duration-200",
                        currentVideo?.order === video.order
                          ? "text-orange-800"
                          : "text-gray-900 group-hover:text-orange-700"
                      )}>
                        {index + 1}. {video.title}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{video.duration ? `${Math.ceil(video.duration / 60)} minutes` : 'Duration not available'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {currentVideo ? (
              <>
                {/* Video Content */}
                <div className="space-y-6">
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentVideo.title}</h2>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full">Video Lecture</Badge>
                          {currentVideo.duration && (
                            <div className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
                              <Clock className="h-4 w-4" />
                              <span className="font-medium">{Math.ceil(currentVideo.duration / 60)} minutes</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Video Player */}
                    <div className="rounded-xl overflow-hidden shadow-2xl">
                      <VideoPlayer
                        lectureId={currentVideo.videoKey}
                        videoUrl={currentVideo.videoUrl}
                        title={currentVideo.title}
                      />
                    </div>
                  </div>

                  {/* Up Next */}
                  {course.videos.length > 1 && getCurrentVideoIndex() < course.videos.length && (
                    <div className="mt-6 rounded-xl border border-gray-200 p-6 bg-gradient-to-r from-orange-50 to-red-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="text-xs uppercase tracking-wider text-orange-600 font-semibold mb-2">Up next</div>
                          <div className="font-semibold text-gray-900 text-lg mb-1">
                            {course.videos[getCurrentVideoIndex()].title}
                          </div>
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>
                              {course.videos[getCurrentVideoIndex()].duration
                                ? `${Math.ceil(course.videos[getCurrentVideoIndex()].duration / 60)} minutes`
                                : 'Duration not available'}
                            </span>
                          </div>
                        </div>
                        <Button
                          onClick={goToNextVideo}
                          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                        >
                          Play Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                  <div className="flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={goToPreviousVideo}
                      disabled={getCurrentVideoIndex() === 1}
                      className="flex items-center space-x-2 px-6 py-3 rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      <span className="font-medium">Previous</span>
                    </Button>

                    <div className="text-center bg-gray-50 px-6 py-3 rounded-xl">
                      <p className="text-sm font-semibold text-gray-700">
                        Video {getCurrentVideoIndex()} of {course.videos.length}
                      </p>
                    </div>

                    <Button
                      onClick={goToNextVideo}
                      disabled={getCurrentVideoIndex() === course.videos.length}
                      className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span>Next</span>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
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
