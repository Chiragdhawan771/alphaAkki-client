"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Star, DollarSign, Eye, TrendingUp, Clock } from "lucide-react"
import { Course } from "@/services/types"

interface CourseStatsCardProps {
  course: Course
  enrollmentCount?: number
  totalRevenue?: number
  averageProgress?: number
  totalWatchTime?: number
}

export function CourseStatsCard({ 
  course, 
  enrollmentCount = 0,
  totalRevenue = 0,
  averageProgress = 0,
  totalWatchTime = 0
}: CourseStatsCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={course.status === 'published' ? 'default' : 'secondary'}>
                {course.status}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {course.level}
              </Badge>
              {course.type === 'paid' && (
                <Badge variant="outline">
                  {formatRevenue(course.price)}
                </Badge>
              )}
            </div>
          </div>
          {course.rating > 0 && (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-medium">{course.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Students</span>
            </div>
            <div className="text-2xl font-bold">{enrollmentCount}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Revenue</span>
            </div>
            <div className="text-2xl font-bold">{formatRevenue(totalRevenue)}</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Avg Progress</span>
            </div>
            <div className="text-2xl font-bold">{Math.round(averageProgress)}%</div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Watch Time</span>
            </div>
            <div className="text-2xl font-bold">{formatDuration(totalWatchTime)}</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Average Student Progress</span>
            <span className="font-medium">{Math.round(averageProgress)}%</span>
          </div>
          <Progress value={averageProgress} className="h-2" />
        </div>

        {/* Course Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            <span>{course.duration} min duration</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Created {new Date(course.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
