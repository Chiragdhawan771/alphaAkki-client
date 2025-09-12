"use client"

import { Play, Clock, CheckCircle, BookOpen } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Course, Enrollment } from "@/services/types"
import Image from "next/image"
import Link from "next/link"

interface EnrolledCourseCardProps {
  course: Course
  enrollment: Enrollment
  progress?: number
  lastAccessedLecture?: string
}

export function EnrolledCourseCard({ 
  course, 
  enrollment, 
  progress = 0,
  lastAccessedLecture 
}: EnrolledCourseCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatTimeSpent = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours === 0) return `${mins}m`
    return `${hours}h ${mins}m`
  }

  const getStatusBadge = () => {
    if (enrollment.status === 'completed') {
      return <Badge className="bg-green-500">Completed</Badge>
    }
    if (progress === 0) {
      return <Badge variant="secondary">Not Started</Badge>
    }
    return <Badge variant="default">In Progress</Badge>
  }

  const getProgressText = () => {
    if (enrollment.status === 'completed') {
      return "Course completed!"
    }
    if (progress === 0) {
      return "Ready to start"
    }
    return `${Math.round(progress)}% complete`
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.thumbnail || "/placeholder-course.jpg"}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <Button size="lg" className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30">
              <Play className="h-6 w-6 ml-1" />
            </Button>
          </div>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            {getStatusBadge()}
          </div>

          {/* Progress Badge */}
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-sm font-medium">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-4">
        {/* Course Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{getProgressText()}</span>
            {enrollment.status === 'completed' && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Course Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatDuration(course.duration)}</span>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>Time spent: {formatTimeSpent(enrollment.totalTimeSpent)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <Button asChild className="w-full">
            <Link href={`/courses/${course.id}/learn${lastAccessedLecture ? `?lecture=${lastAccessedLecture}` : ''}`}>
              {enrollment.status === 'completed' ? 'Review Course' : 
               progress === 0 ? 'Start Learning' : 'Continue Learning'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
