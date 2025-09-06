"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Play, FileText, Download, Lock, CheckCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Section, Lecture } from "@/services/types"
import { cn } from "@/lib/utils"

interface CourseSidebarProps {
  sections: Section[]
  currentLectureId?: string
  userProgress?: Record<string, number>
  onLectureSelect: (lectureId: string) => void
  isEnrolled?: boolean
}

export function CourseSidebar({ 
  sections, 
  currentLectureId, 
  userProgress = {},
  onLectureSelect,
  isEnrolled = false
}: CourseSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.map(s => s.id))
  )

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

  const getSectionProgress = (section: Section) => {
    if (!section.lectures || section.lectures.length === 0) return 0
    
    const completedLectures = section.lectures.filter(
      lecture => userProgress[lecture.id] === 100
    ).length
    
    return (completedLectures / section.lectures.length) * 100
  }

  const getTotalProgress = () => {
    const allLectures = sections.flatMap(s => s.lectures || [])
    if (allLectures.length === 0) return 0
    
    const completedLectures = allLectures.filter(
      lecture => userProgress[lecture.id] === 100
    ).length
    
    return (completedLectures / allLectures.length) * 100
  }

  return (
    <div className="w-80 bg-muted/30 border-r flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b">
        <h3 className="font-semibold text-lg mb-2">Course Content</h3>
        {isEnrolled && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{Math.round(getTotalProgress())}%</span>
            </div>
            <Progress value={getTotalProgress()} className="h-2" />
          </div>
        )}
      </div>

      {/* Sections */}
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="space-y-1">
              {/* Section Header */}
              <Button
                variant="ghost"
                className="w-full justify-between p-3 h-auto text-left"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="h-4 w-4 flex-shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="font-medium text-sm truncate">
                      Section {sectionIndex + 1}: {section.title}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {section.lectureCount} lectures • {formatDuration(section.duration)}
                    </div>
                  </div>
                </div>
                {isEnrolled && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Progress value={getSectionProgress(section)} className="w-12 h-1" />
                  </div>
                )}
              </Button>

              {/* Section Lectures */}
              {expandedSections.has(section.id) && section.lectures && (
                <div className="ml-4 space-y-1">
                  {section.lectures.map((lecture, lectureIndex) => {
                    const canAccess = isEnrolled || lecture.isFree
                    const isCompleted = userProgress[lecture.id] === 100
                    const isCurrent = currentLectureId === lecture.id

                    return (
                      <Button
                        key={lecture.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start p-3 h-auto text-left transition-colors",
                          isCurrent && "bg-primary/10 border border-primary/20",
                          !canAccess && "opacity-60 cursor-not-allowed"
                        )}
                        onClick={() => canAccess && onLectureSelect(lecture.id)}
                        disabled={!canAccess}
                      >
                        <div className="flex items-start gap-3 min-w-0 w-full">
                          <div className="flex items-center gap-1 flex-shrink-0 mt-0.5">
                            {getLectureIcon(lecture)}
                            {!canAccess && <Lock className="h-3 w-3 text-muted-foreground" />}
                            {isCompleted && <CheckCircle className="h-3 w-3 text-green-500" />}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-sm truncate">
                              {lectureIndex + 1}. {lecture.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(lecture.duration)}
                              </div>
                              {lecture.isFree && (
                                <Badge variant="secondary" className="text-xs px-1 py-0">
                                  Free
                                </Badge>
                              )}
                            </div>
                            
                            {isEnrolled && userProgress[lecture.id] && userProgress[lecture.id] < 100 && (
                              <Progress 
                                value={userProgress[lecture.id]} 
                                className="h-1 mt-2" 
                              />
                            )}
                          </div>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
