"use client"

import { CourseCard } from "./course-card"
import { Course } from "@/services/types"
import { Skeleton } from "../ui/skeleton"

interface CourseGridProps {
  courses: Course[]
  loading?: boolean
  variant?: "default" | "enrolled" | "instructor"
  enrollmentProgress?: Record<string, number>
}

export function CourseGrid({ 
  courses, 
  loading = false, 
  variant = "default",
  enrollmentProgress = {}
}: CourseGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground text-lg mb-2">No courses found</div>
        <p className="text-sm text-muted-foreground">
          Try adjusting your search or filter criteria
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          variant={variant}
          showProgress={variant === "enrolled"}
          progress={enrollmentProgress[course.id] || 0}
        />
      ))}
    </div>
  )
}
