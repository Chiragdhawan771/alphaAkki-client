"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseSidebar } from "@/components/player/course-sidebar"
import { LectureContent } from "@/components/player/lecture-content"
import { courseService, enrollmentService, progressService, lectureService } from "@/services"
import { Course, CourseStructure, Lecture } from "@/services/types"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export default function LearnPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [courseStructure, setCourseStructure] = useState<CourseStructure | null>(null)
  const [currentLecture, setCurrentLecture] = useState<Lecture | null>(null)
  const [userProgress, setUserProgress] = useState<Record<string, number>>({})
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { toast } = useToast()

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      const [courseResponse, structureResponse] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getCourseStructure(courseId)
      ])
      
      setCourse(courseResponse.data)
      setCourseStructure(structureResponse.data)
      
      // Set first lecture as current if no lecture is selected
      const firstLecture = structureResponse.data.sections[0]?.lectures?.[0]
      if (firstLecture && !currentLecture) {
        setCurrentLecture(firstLecture)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course data. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollmentAndProgress = async () => {
    try {
      const [enrollmentResponse, progressResponse] = await Promise.all([
        enrollmentService.checkEnrollmentStatus(courseId),
        progressService.getCourseProgress(courseId)
      ])
      
      setIsEnrolled(enrollmentResponse.data.isEnrolled)
      
      if (enrollmentResponse.data.isEnrolled && progressResponse.data.lectureProgress) {
        const progressMap: Record<string, number> = {}
        progressResponse.data.lectureProgress.forEach(progress => {
          progressMap[progress.lecture] = progress.progressPercentage
        })
        setUserProgress(progressMap)
      }
    } catch (error) {
      // User might not be enrolled or logged in
      setIsEnrolled(false)
    }
  }

  const handleLectureSelect = async (lectureId: string) => {
    try {
      const lectureResponse = await lectureService.getLecture(lectureId)
      setCurrentLecture(lectureResponse.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load lecture. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleProgress = (progress: number, timeSpent: number, position: number) => {
    if (currentLecture) {
      setUserProgress(prev => ({
        ...prev,
        [currentLecture.id]: progress
      }))
    }
  }

  const handleLectureComplete = () => {
    if (currentLecture) {
      setUserProgress(prev => ({
        ...prev,
        [currentLecture.id]: 100
      }))
      
      // Auto-advance to next lecture
      const allLectures = courseStructure?.sections.flatMap(s => s.lectures || []) || []
      const currentIndex = allLectures.findIndex(l => l.id === currentLecture.id)
      const nextLecture = allLectures[currentIndex + 1]
      
      if (nextLecture) {
        setTimeout(() => {
          handleLectureSelect(nextLecture.id)
        }, 2000) // Wait 2 seconds before auto-advancing
      }
    }
  }

  const goBackToCourse = () => {
    router.push(`/courses/${courseId}`)
  }

  useEffect(() => {
    if (courseId) {
      fetchCourseData()
      checkEnrollmentAndProgress()
    }
  }, [courseId])

  // Check if user can access the current lecture
  const canAccessLecture = (lecture: Lecture | null) => {
    if (!lecture) return false
    return isEnrolled || lecture.isFree
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-sm text-muted-foreground">Loading course...</p>
        </div>
      </div>
    )
  }

  if (!course || !courseStructure) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/courses')}>
            Browse Courses
          </Button>
        </div>
      </div>
    )
  }

  if (!canAccessLecture(currentLecture)) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Access Restricted</h1>
          <p className="text-muted-foreground mb-4">
            You need to enroll in this course to access this content.
          </p>
          <Button onClick={goBackToCourse}>
            Go to Course Page
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={goBackToCourse}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Course
          </Button>
          <div className="hidden md:block">
            <h1 className="font-semibold truncate max-w-md">{course.title}</h1>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          sidebarOpen ? "w-80" : "w-0",
          "md:relative absolute inset-y-0 left-0 z-10 bg-background"
        )}>
          {sidebarOpen && (
            <CourseSidebar
              sections={courseStructure.sections}
              currentLectureId={currentLecture?.id}
              userProgress={userProgress}
              onLectureSelect={handleLectureSelect}
              isEnrolled={isEnrolled}
            />
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 max-w-4xl mx-auto">
            {currentLecture ? (
              <LectureContent
                lecture={currentLecture}
                courseId={courseId}
                onProgress={handleProgress}
                onComplete={handleLectureComplete}
              />
            ) : (
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold mb-2">Select a Lecture</h2>
                <p className="text-muted-foreground">
                  Choose a lecture from the sidebar to start learning.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-5"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}
