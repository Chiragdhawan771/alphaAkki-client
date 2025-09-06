"use client"

import { useState, useEffect } from "react"
import { CourseFilters } from "@/components/courses/course-filters"
import { CourseGrid } from "@/components/courses/course-grid"
import { Pagination } from "@/components/courses/pagination"
import { courseService } from "@/services"
import { Course, CourseFilters as CourseFiltersType, PaginatedResponse } from "@/services/types"
import { useToast } from "@/hooks/use-toast"

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<string[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 12
  })
  const [filters, setFilters] = useState<CourseFiltersType>({
    page: 1,
    limit: 12
  })
  const { toast } = useToast()

  // Fetch courses
  const fetchCourses = async (currentFilters: CourseFiltersType) => {
    try {
      setLoading(true)
      const response: PaginatedResponse<Course> = await courseService.getCourses(currentFilters)
      setCourses(response.data)
      setPagination({
        page: response.page,
        totalPages: response.totalPages,
        total: response.total,
        limit: response.limit
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch courses. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await courseService.getCategories()
      setCategories(response.data)
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  // Handle filter changes
  const handleFiltersChange = (newFilters: CourseFiltersType) => {
    const updatedFilters = { ...newFilters, page: 1 } // Reset to first page on filter change
    setFilters(updatedFilters)
    fetchCourses(updatedFilters)
  }

  // Handle page changes
  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page }
    setFilters(updatedFilters)
    fetchCourses(updatedFilters)
  }

  // Initial load
  useEffect(() => {
    fetchCourses(filters)
    fetchCategories()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Explore Courses</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover thousands of courses taught by expert instructors. 
            Learn new skills and advance your career.
          </p>
        </div>

        {/* Filters */}
        <CourseFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          categories={categories}
        />

        {/* Results Summary */}
        {!loading && (
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Showing {courses.length} of {pagination.total} courses
            </p>
            {filters.search && (
              <p className="text-sm text-muted-foreground">
                Search results for "{filters.search}"
              </p>
            )}
          </div>
        )}

        {/* Course Grid */}
        <CourseGrid courses={courses} loading={loading} />

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
            className="mt-8"
          />
        )}
      </div>
    </div>
  )
}
