"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Play, FileText, Download, Lock, CheckCircle, Clock, BookOpen } from "lucide-react"
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
    <div className="w-80 bg-white flex flex-col h-full">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
            <BookOpen className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-bold text-lg text-gray-900">Course Content</h3>
        </div>
        {isEnrolled && (
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">Overall Progress</span>
              <span className="font-bold text-gray-900">{Math.round(getTotalProgress())}%</span>
            </div>
            <div className="space-y-1">
              <Progress value={getTotalProgress()} className="h-3 bg-gray-200" />
              <div className="flex justify-between text-xs text-gray-500">
                <span>{sections.flatMap(s => s.lectures || []).filter(l => userProgress[l.id] === 100).length} completed</span>
                <span>{sections.flatMap(s => s.lectures || []).length} total</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Sections */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {sections.map((section, sectionIndex) => (
            <div key={section.id} className="space-y-2">
              {/* Enhanced Section Header */}
              <Button
                variant="ghost"
                className="w-full justify-between p-4 h-auto text-left hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 rounded-xl border border-transparent hover:border-orange-100 transition-all duration-200"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0">
                    {expandedSections.has(section.id) ? (
                      <ChevronDown className="h-4 w-4 text-orange-500" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-sm text-gray-900 truncate">
                      {sectionIndex + 1}. {section.title}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{section.lectureCount} lectures</span>
                      <span>•</span>
                      <span>{formatDuration(section.duration)}</span>
                    </div>
                  </div>
                </div>
                {isEnrolled && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="text-xs text-gray-500">
                      {Math.round(getSectionProgress(section))}%
                    </div>
                    <Progress value={getSectionProgress(section)} className="w-16 h-2" />
                  </div>
                )}
              </Button>

              {/* Enhanced Section Lectures */}
              {expandedSections.has(section.id) && section.lectures && (
                <div className="ml-6 space-y-1 border-l-2 border-gray-100 pl-4">
                  {section.lectures.map((lecture, lectureIndex) => {
                    const canAccess = isEnrolled || lecture.isFree
                    const isCompleted = userProgress[lecture.id] === 100
                    const isCurrent = currentLectureId === lecture.id
                    const hasProgress = userProgress[lecture.id] && userProgress[lecture.id] > 0

                    return (
                      <Button
                        key={lecture.id}
                        variant="ghost"
                        className={cn(
                          "w-full justify-start p-3 h-auto text-left transition-all duration-200 rounded-lg",
                          isCurrent && "bg-gradient-to-r from-orange-100 to-red-100 border border-orange-200 shadow-sm",
                          !isCurrent && canAccess && "hover:bg-gray-50 hover:border-gray-200 border border-transparent",
                          !canAccess && "opacity-60 cursor-not-allowed bg-gray-50",
                          isCompleted && !isCurrent && "bg-green-50 border-green-200"
                        )}
                        onClick={() => canAccess && onLectureSelect(lecture.id)}
                        disabled={!canAccess}
                      >
                        <div className="flex items-start gap-3 min-w-0 w-full">
                          <div className="flex items-center gap-1 flex-shrink-0 mt-1">
                            <div className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
                              isCurrent && "bg-orange-500 text-white",
                              isCompleted && !isCurrent && "bg-green-500 text-white",
                              hasProgress && !isCompleted && !isCurrent && "bg-blue-500 text-white",
                              !hasProgress && !isCurrent && "bg-gray-200 text-gray-600"
                            )}>
                              {isCompleted ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : isCurrent ? (
                                <Play className="h-3 w-3" />
                              ) : (
                                lectureIndex + 1
                              )}
                            </div>
                            {!canAccess && <Lock className="h-3 w-3 text-gray-400" />}
                          </div>
                          
                          <div className="min-w-0 flex-1">
                            <div className={cn(
                              "font-medium text-sm truncate",
                              isCurrent && "text-orange-700",
                              isCompleted && !isCurrent && "text-green-700",
                              !canAccess && "text-gray-500"
                            )}>
                              {lecture.title}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{formatDuration(lecture.duration)}</span>
                              </div>
                              {lecture.isFree && (
                                <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-green-50 text-green-700 border-green-200">
                                  Free
                                </Badge>
                              )}
                              {getLectureIcon(lecture)}
                            </div>
                            
                            {isEnrolled && hasProgress && userProgress[lecture.id] < 100 && (
                              <div className="mt-2 space-y-1">
                                <Progress 
                                  value={userProgress[lecture.id]} 
                                  className="h-1.5" 
                                />
                                <div className="text-xs text-gray-500">
                                  {Math.round(userProgress[lecture.id])}% complete
                                </div>
                              </div>
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
