"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronRight, Play, FileText, Download, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Section, Lecture } from "@/services/types"
import { progressService } from "@/services"
import { cn } from "@/lib/utils"

interface CourseCurriculumProps {
  sections: Section[]
  courseId: string
  isEnrolled?: boolean
  userProgress?: Record<string, number>
  onLectureClick?: (lectureId: string) => void
}

export function CourseCurriculum({ 
  sections, 
  courseId,
  isEnrolled = false, 
  userProgress = {},
  onLectureClick 
}: CourseCurriculumProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set([sections[0]?.id]))
  const [courseProgress, setCourseProgress] = useState<Record<string, number>>(userProgress)

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getLectureIcon = (lecture: Lecture) => {
    switch (lecture.type) {
      case 'video':
        return <Play className="h-4 w-4" />
      case 'text':
        return <FileText className="h-4 w-4" />
      case 'pdf':
        return <Download className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getTotalDuration = () => {
    return sections.reduce((total, section) => total + section.duration, 0)
  }

  const getTotalLectures = () => {
    return sections.reduce((total, section) => {
      const lectureCount = section.lectureCount || section.lectures?.length || 0
      return total + lectureCount
    }, 0)
  }

  return (
    <div className="space-y-4">
      {/* Course Stats */}
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Duration:</span>
            <div className="font-semibold">{formatDuration(getTotalDuration())}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Total Lectures:</span>
            <div className="font-semibold">{getTotalLectures()}</div>
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {sections.map((section, sectionIndex) => (
          <div key={section.id} className="border rounded-lg overflow-hidden">
            {/* Section Header */}
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto text-left"
              onClick={() => toggleSection(section.id)}
            >
              <div className="flex items-center gap-3">
                {expandedSections.has(section.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <div>
                  <div className="font-semibold">
                    Section {sectionIndex + 1}: {section.title}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {section.lectureCount} lectures • {formatDuration(section.duration)}
                  </div>
                </div>
              </div>
              {isEnrolled && userProgress && (
                <div className="flex items-center gap-2">
                  <Progress value={userProgress[section.id] || 0} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">
                    {Math.round(userProgress[section.id] || 0)}%
                  </span>
                </div>
              )}
            </Button>

            {/* Section Content */}
            {expandedSections.has(section.id) && section.lectures && (
              <div className="border-t bg-muted/20">
                {section.lectures.map((lecture, lectureIndex) => {
                  const canAccess = isEnrolled || lecture.isFree
                  const isCompleted = userProgress && userProgress[lecture.id] === 100

                  return (
                    <div
                      key={lecture.id}
                      className={cn(
                        "flex items-center justify-between p-4 border-b last:border-b-0 transition-colors",
                        canAccess ? "hover:bg-muted/50 cursor-pointer" : "opacity-60"
                      )}
                      onClick={() => canAccess && onLectureClick?.(lecture.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {getLectureIcon(lecture)}
                          {!canAccess && <Lock className="h-3 w-3 text-muted-foreground" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">
                            {lectureIndex + 1}. {lecture.title}
                          </div>
                          {lecture.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {lecture.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {lecture.isFree && (
                          <Badge variant="secondary" className="text-xs">
                            Free
                          </Badge>
                        )}
                        {isCompleted && (
                          <Badge variant="default" className="text-xs">
                            Completed
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(lecture.duration)}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
