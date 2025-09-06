"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Star, Clock, Users, Globe, Award, Play, Share2, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { CourseCurriculum } from "@/components/courses/course-curriculum"
import { EnrollmentCard } from "@/components/courses/enrollment-card"
import { courseService, enrollmentService } from "@/services"
import { Course, CourseStructure } from "@/services/types"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const [course, setCourse] = useState<Course | null>(null)
  const [courseStructure, setCourseStructure] = useState<CourseStructure | null>(null)
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enrollmentLoading, setEnrollmentLoading] = useState(true)
  const { toast } = useToast()

  const fetchCourse = async () => {
    try {
      const [courseResponse, structureResponse] = await Promise.all([
        courseService.getCourse(courseId),
        courseService.getCourseStructure(courseId)
      ])
      
      setCourse(courseResponse.data)
      setCourseStructure(structureResponse.data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course details. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const checkEnrollment = async () => {
    try {
      const response = await enrollmentService.checkEnrollmentStatus(courseId)
      setIsEnrolled(response.data.isEnrolled)
    } catch (error) {
      // User might not be logged in, that's okay
      setIsEnrolled(false)
    } finally {
      setEnrollmentLoading(false)
    }
  }

  const handleEnrollmentChange = () => {
    setIsEnrolled(true)
    // Refresh course data to get updated enrollment count
    fetchCourse()
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  useEffect(() => {
    if (courseId) {
      fetchCourse()
      checkEnrollment()
    }
  }, [courseId])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="aspect-video w-full rounded-lg" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
          <div>
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!course || !courseStructure) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Course Not Found</h1>
          <p className="text-muted-foreground">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Hero Section */}
          <div className="space-y-6">
            {/* Video/Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
              {course.previewVideo ? (
                <div className="relative w-full h-full">
                  <Image
                    src={course.thumbnail || "/placeholder-course.jpg"}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <Button size="lg" className="rounded-full">
                      <Play className="h-6 w-6 mr-2" />
                      Preview Course
                    </Button>
                  </div>
                </div>
              ) : (
                <Image
                  src={course.thumbnail || "/placeholder-course.jpg"}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              )}
            </div>

            {/* Course Info */}
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {course.categories.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
                <Badge variant="outline" className="capitalize">
                  {course.level}
                </Badge>
                {course.isFeatured && (
                  <Badge variant="destructive">Featured</Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight">{course.title}</h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {course.description}
              </p>

              <div className="flex items-center gap-6 text-sm">
                {course.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{course.rating.toFixed(1)}</span>
                    <span className="text-muted-foreground">rating</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{course.enrollmentCount} students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDuration(course.duration)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{course.language || 'English'}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Heart className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* What You'll Learn */}
          {course.whatYouWillLearn.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {course.whatYouWillLearn.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Course Content */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Course content</h2>
            <CourseCurriculum 
              sections={courseStructure.sections}
              courseId={courseId}
              isEnrolled={isEnrolled}
            />
          </div>

          <Separator />

          {/* Requirements */}
          {course.requirements.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Requirements</h2>
              <ul className="space-y-2">
                {course.requirements.map((requirement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <span className="text-sm">{requirement}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1">
          {!enrollmentLoading && (
            <EnrollmentCard
              course={course}
              isEnrolled={isEnrolled}
              onEnrollmentChange={handleEnrollmentChange}
            />
          )}
        </div>
      </div>
    </div>
  )
}
