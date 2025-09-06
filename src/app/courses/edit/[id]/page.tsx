"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { CourseForm } from "@/components/courses/course-form"
import { UpdateCourseDto } from "@/types/course"
import { courseService } from "@/services"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function EditCoursePage() {
  const params = useParams()
  const router = useRouter()
  const courseId = params.id as string
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState(false)
  const { toast } = useToast()

  const fetchCourse = async () => {
    try {
      setLoading(true)
      const response = await courseService.getCourse(courseId)
      setCourse(response.data)
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

  const handleSubmit = async (data: UpdateCourseDto) => {
    try {
      setUpdateLoading(true)
      await courseService.updateCourse(courseId, data)
      toast({
        title: "Success",
        description: "Course updated successfully!",
      })
      router.push(`/courses/manage/${courseId}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update course",
        variant: "destructive"
      })
    } finally {
      setUpdateLoading(false)
    }
  }

  useEffect(() => {
    if (courseId) {
      fetchCourse()
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
            The course you're looking for doesn't exist or you don't have permission to edit it.
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.push(`/courses/manage/${courseId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Course</h1>
            <p className="text-muted-foreground mt-2">
              Update your course details and settings.
            </p>
          </div>
        </div>
        
        <CourseForm 
          initialData={course}
          onSubmit={handleSubmit}
          loading={updateLoading}
          submitLabel="Update Course"
        />
      </div>
    </div>
  )
}
