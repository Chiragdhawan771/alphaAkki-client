"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreateCourseDto } from "@/types/course"
import { courseService } from "@/services"
import { useToast } from "@/hooks/use-toast"
import { CourseForm } from "@/components/courses/course-form"
export default function CreateCoursePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (data: CreateCourseDto) => {
    try {
      setLoading(true)
      const response = await courseService.createCourse(data)
      toast({
        title: "Success",
        description: "Course created successfully!",
      })
      router.push(`/courses/manage/${response.data.id}`)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create course",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create New Course</h1>
          <p className="text-muted-foreground mt-2">
            Fill in the details below to create your new course. You can always edit these later.
          </p>
        </div>
        
        <CourseForm 
          onSubmit={handleSubmit}
          loading={loading}
          submitLabel="Create Course"
        />
      </div>
    </div>
  )
}
