"use client"

import { useState } from "react"
import { CheckCircle, Clock, Archive, AlertCircle, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PublishCourseDto } from "@/types/course"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
interface Course {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  enrollmentCount: number
  completionRate?: number
  lastUpdated: string
  sections: Section[]
}

interface Section {
  id: string
  title: string
  lectures: Lecture[]
  isActive: boolean
}

interface Lecture {
  id: string
  title: string
  status: 'draft' | 'published' | 'archived'
  isActive: boolean
}

interface CourseStatusManagerProps {
  course: Course
  onStatusChange: (data: PublishCourseDto) => Promise<void>
  loading?: boolean
}

export function CourseStatusManager({ 
  course, 
  onStatusChange, 
  loading = false 
}: CourseStatusManagerProps) {
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<'draft' | 'published' | 'archived'>(course.status)

  const handleStatusChange = async (newStatus: 'draft' | 'published' | 'archived') => {
    try {
      setActionLoading(true)
      await onStatusChange({ status: newStatus })
      setSelectedStatus(newStatus)
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'draft': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'archived': return <Archive className="h-4 w-4 text-gray-600" />
      default: return <AlertCircle className="h-4 w-4 text-red-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      case 'archived': return 'bg-gray-100 text-gray-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const getReadinessCheck = () => {
    const totalLectures = course.sections.reduce((acc, section) => acc + section.lectures.length, 0)
    const publishedLectures = course.sections.reduce((acc, section) => 
      acc + section.lectures.filter(lecture => lecture.status === 'published').length, 0)
    const activeSections = course.sections.filter(section => section.isActive).length
    
    const checks = [
      {
        label: "Course has sections",
        passed: course.sections.length > 0,
        required: true
      },
      {
        label: "At least one active section",
        passed: activeSections > 0,
        required: true
      },
      {
        label: "Course has lectures",
        passed: totalLectures > 0,
        required: true
      },
      {
        label: "At least one published lecture",
        passed: publishedLectures > 0,
        required: true
      },
      {
        label: "Course title is set",
        passed: course.title.length > 0,
        required: true
      }
    ]

    const passedRequired = checks.filter(check => check.required && check.passed).length
    const totalRequired = checks.filter(check => check.required).length
    const canPublish = passedRequired === totalRequired

    return { checks, canPublish, progress: (passedRequired / totalRequired) * 100 }
  }

  const readiness = getReadinessCheck()

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon(course.status)}
            Course Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge className={getStatusColor(course.status)}>
                {course.status.charAt(0).toUpperCase() + course.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Last updated: {new Date(course.lastUpdated).toLocaleDateString()}
              </span>
            </div>
            
            {course.status === 'published' && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{course.enrollmentCount} enrolled</span>
                </div>
                {course.completionRate && (
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    <span>{course.completionRate}% completion</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Description */}
          <div className="text-sm text-muted-foreground">
            {course.status === 'draft' && (
              <p>This course is in draft mode. Only you can see it. Complete the readiness checklist below to publish it.</p>
            )}
            {course.status === 'published' && (
              <p>This course is live and visible to students. Students can enroll and access the content.</p>
            )}
            {course.status === 'archived' && (
              <p>This course is archived. Existing students can still access it, but new enrollments are disabled.</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Readiness Checklist */}
      {course.status !== 'published' && (
        <Card>
          <CardHeader>
            <CardTitle>Publication Readiness</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm text-muted-foreground">
                  {readiness.checks.filter(c => c.passed).length} of {readiness.checks.length} completed
                </span>
              </div>
              <Progress value={readiness.progress} className="h-2" />
            </div>

            <div className="space-y-2">
              {readiness.checks.map((check, index) => (
                <div key={index} className="flex items-center gap-2">
                  {check.passed ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm ${check.passed ? 'text-green-700' : 'text-red-700'}`}>
                    {check.label}
                  </span>
                  {check.required && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>
              ))}
            </div>

            {!readiness.canPublish && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Complete all required items above before publishing your course.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Status Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Change Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Select
              value={selectedStatus}
              onValueChange={(value: 'draft' | 'published' | 'archived') => setSelectedStatus(value)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published" disabled={!readiness.canPublish}>
                  Published
                </SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            {selectedStatus !== course.status && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    disabled={actionLoading || loading || (selectedStatus === 'published' && !readiness.canPublish)}
                  >
                    {actionLoading ? "Updating..." : `Change to ${selectedStatus}`}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Change Course Status to {selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {selectedStatus === 'published' && (
                        <span>
                          This will make your course visible to all students. Students will be able to enroll and access the content.
                        </span>
                      )}
                      {selectedStatus === 'draft' && (
                        <span>
                          This will make your course private. Only you will be able to see it. Existing enrollments will remain active.
                        </span>
                      )}
                      {selectedStatus === 'archived' && (
                        <span>
                          This will archive your course. Existing students can still access it, but new enrollments will be disabled.
                        </span>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleStatusChange(selectedStatus)}
                    >
                      Confirm Change
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview Course
            </Button>
            {course.status === 'published' && (
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                View Analytics
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Course Statistics */}
      {course.status === 'published' && (
        <Card>
          <CardHeader>
            <CardTitle>Course Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{course.enrollmentCount}</div>
                <div className="text-sm text-muted-foreground">Total Enrollments</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {course.completionRate || 0}%
                </div>
                <div className="text-sm text-muted-foreground">Completion Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {course.sections.reduce((acc, section) => acc + section.lectures.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Lectures</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
