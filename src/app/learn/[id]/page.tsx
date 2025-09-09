"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Menu, X, BookOpen, Clock, CheckCircle2, Play } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
      
      // Check enrollment from structure response
      if (structureResponse.data.enrollment) {
        setIsEnrolled(true)
      }
      
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
      const progressResponse = await progressService.getCourseProgress(courseId)
      
      if (progressResponse.data.lectureProgress) {
        const progressMap: Record<string, number> = {}
        progressResponse.data.lectureProgress.forEach(progress => {
          progressMap[progress.lecture] = progress.progressPercentage
        })
        setUserProgress(progressMap)
      }
    } catch (error) {
      // Progress might not be available
      console.log('Progress not available:', error)
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

  const getTotalProgress = () => {
    const allLectures = courseStructure?.sections.flatMap(s => s.lectures || []) || []
    if (allLectures.length === 0) return 0
    
    const completedLectures = allLectures.filter(
      lecture => userProgress[lecture.id] === 100
    ).length
    
    return (completedLectures / allLectures.length) * 100
  }

  const getCurrentLectureInfo = () => {
    if (!currentLecture || !courseStructure) return null
    
    const allLectures = courseStructure.sections.flatMap(s => s.lectures || [])
    const currentIndex = allLectures.findIndex(l => l.id === currentLecture.id)
    const currentSection = courseStructure.sections.find(s => 
      s.lectures?.some(l => l.id === currentLecture.id)
    )
    
    return {
      currentIndex: currentIndex + 1,
      totalLectures: allLectures.length,
      sectionTitle: currentSection?.title || 'Unknown Section'
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-50 to-white">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={goBackToCourse}
            className="hover:bg-orange-50 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Course
          </Button>
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-orange-500" />
              <h1 className="font-semibold text-gray-900 truncate max-w-md">{course.title}</h1>
            </div>
            {getCurrentLectureInfo() && (
              <Badge variant="outline" className="text-xs">
                {getCurrentLectureInfo()?.currentIndex} of {getCurrentLectureInfo()?.totalLectures}
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Progress indicator */}
          {isEnrolled && (
            <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>{Math.round(getTotalProgress())}% Complete</span>
              </div>
              <Progress value={getTotalProgress()} className="w-20 h-2" />
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden hover:bg-orange-50"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className={cn(
          "transition-all duration-300 ease-in-out border-r border-gray-200",
          sidebarOpen ? "w-80" : "w-0",
          "md:relative absolute inset-y-0 left-0 z-10 bg-white shadow-lg md:shadow-none"
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

        {/* Enhanced Content Area */}
        <div className="flex-1 overflow-auto bg-gradient-to-br from-gray-50 to-white">
          <div className="p-6 max-w-5xl mx-auto">
            {currentLecture ? (
              <div className="space-y-6">
                {/* Lecture Header */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize bg-orange-50 text-orange-700 border-orange-200">
                          {currentLecture.type}
                        </Badge>
                        {getCurrentLectureInfo() && (
                          <Badge variant="secondary" className="text-xs">
                            {getCurrentLectureInfo()?.sectionTitle}
                          </Badge>
                        )}
                      </div>
                      <h1 className="text-2xl font-bold text-gray-900">{currentLecture.title}</h1>
                      {currentLecture.description && (
                        <p className="text-gray-600 leading-relaxed">{currentLecture.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{currentLecture.duration} min</span>
                    </div>
                  </div>
                  
                  {/* Progress for current lecture */}
                  {isEnrolled && userProgress[currentLecture.id] && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Lecture Progress</span>
                        <span className="font-medium text-gray-900">
                          {Math.round(userProgress[currentLecture.id])}%
                        </span>
                      </div>
                      <Progress value={userProgress[currentLecture.id]} className="h-2" />
                    </div>
                  )}
                </div>

                {/* Lecture Content */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <LectureContent
                    lecture={currentLecture}
                    courseId={courseId}
                    onProgress={handleProgress}
                    onComplete={handleLectureComplete}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="h-8 w-8 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold mb-2 text-gray-900">Ready to Learn?</h2>
                  <p className="text-gray-600 mb-4">
                    Choose a lecture from the sidebar to start your learning journey.
                  </p>
                  <Button 
                    onClick={() => setSidebarOpen(true)}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Browse Lectures
                  </Button>
                </div>
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
