"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Settings, Users, BarChart3, BookOpen } from "lucide-react"
import { CourseForm } from "@/components/courses/course-form"
import { CourseStatusManager } from "@/components/courses/course-status-manager"
import { EnrollmentManager } from "@/components/courses/enrollment-manager"
import { courseService, enrollmentService } from "@/services"
import { useToast } from "@/hooks/use-toast"
import { CreateCourseDto, UpdateCourseDto } from "@/types/course"

interface Course {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'archived'
  enrollmentCount: number
  completionRate?: number
  lastUpdated: string
  // Add other course properties as needed
}

export default function CourseManagePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollments, setEnrollments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await courseService.getCourse(courseId)
      setCourse({
        ...response.data,
        lastUpdated: response.data.updatedAt || new Date().toISOString()
      } as unknown as Course)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchEnrollments = async () => {
    try {
      const response = await enrollmentService.getCourseEnrollments(courseId)
      setEnrollments(response.data)
    } catch (error) {
      console.error("Failed to fetch enrollments:", error)
    }
  }

  const handleCourseUpdate = async (data: UpdateCourseDto) => {
    try {
      await courseService.updateCourse(courseId, data)
      toast({
        title: "Success",
        description: "Course updated successfully"
      })
      fetchCourse()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update course",
        variant: "destructive"
      })
    }
  }


  const handleStatusChange = async (data: { status: 'draft' | 'published' | 'archived' }) => {
    try {
      await courseService.updateCourseStatus(courseId, data.status)
      toast({
        title: "Success",
        description: `Course status changed to ${data.status}`
      })
      fetchCourse()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update course status",
        variant: "destructive"
      })
    }
  }

  useEffect(() => {
    if (courseId) {
      fetchCourse()
      fetchEnrollments()
    }
  }, [courseId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The course you're looking for doesn't exist or you don't have permission to manage it.
          </p>
          <Button onClick={() => router.push("/courses")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push("/courses")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={
                course.status === "published" ? "default" : 
                course.status === "draft" ? "secondary" : "destructive"
              }>
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {course.enrollmentCount} students enrolled
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/courses/${courseId}`)}>
            View Course
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Management Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Content
          </TabsTrigger>
          <TabsTrigger value="students" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Students
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <CourseForm
                initialData={course}
                onSubmit={handleCourseUpdate}
                submitLabel="Update Course"
              />
            </div>
            <div>
              <CourseStatusManager
                course={course}
                onStatusChange={handleStatusChange}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Content Management</h3>
            <p className="text-muted-foreground">
              Course content management features are being updated. Please use the simplified course interface for now.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <EnrollmentManager
            courseId={courseId}
            enrollments={enrollments}
            onEnrollmentCreate={async (data) => {
              // Handle manual enrollment creation
              console.log("Create enrollment:", data)
            }}
            onEnrollmentUpdate={async (id, data) => {
              // Handle enrollment updates
              console.log("Update enrollment:", id, data)
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
            <p className="text-muted-foreground">
              Detailed analytics and insights for your course will be available here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
