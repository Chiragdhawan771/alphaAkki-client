"use client"

import { Star, Clock, Users, Play } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Course } from "@/services/types"
import Image from "next/image"
import Link from "next/link"

interface CourseCardProps {
  course: Course
  showProgress?: boolean
  progress?: number
  variant?: "default" | "enrolled" | "instructor"
}

export function CourseCard({ 
  course, 
  showProgress = false, 
  progress = 0,
  variant = "default" 
}: CourseCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatPrice = (price: number) => {
    return course.type === 'free' ? 'Free' : `$${price.toFixed(2)}`
  }

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={course.thumbnail || "/placeholder-course.jpg"}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {course.previewVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <Button size="sm" variant="secondary" className="rounded-full">
                <Play className="h-4 w-4 mr-1" />
                Preview
              </Button>
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant={course.type === 'free' ? 'secondary' : 'default'}>
              {course.type === 'free' ? 'Free' : 'Paid'}
            </Badge>
            {course.isFeatured && (
              <Badge variant="destructive">Featured</Badge>
            )}
          </div>
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-white/90">
              {course.level}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {course.description}
            </p>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDuration(course.duration)}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.enrollmentCount}
            </div>
            {course.rating > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {course.rating.toFixed(1)}
              </div>
            )}
          </div>

          {course.categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {course.categories.slice(0, 3).map((category) => (
                <Badge key={category} variant="outline" className="text-xs">
                  {category}
                </Badge>
              ))}
              {course.categories.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{course.categories.length - 3}
                </Badge>
              )}
            </div>
          )}

          {showProgress && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <div className="text-lg font-bold text-primary">
          {formatPrice(course.price)}
        </div>
        
        <div className="flex gap-2">
          {variant === "enrolled" ? (
            <Button asChild size="sm">
              <Link href={`/learn/${course.id}`}>
                Continue Learning
              </Link>
            </Button>
          ) : variant === "instructor" ? (
            <Button asChild size="sm" variant="outline">
              <Link href={`/instructor/courses/${course.id}`}>
                Manage
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href={`/courses/${course.id}`}>
                View Course
              </Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
