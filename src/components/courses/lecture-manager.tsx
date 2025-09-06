"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, GripVertical, Play, Eye, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { LectureForm } from "./lecture-form"
import { CreateLectureDto, UpdateLectureDto } from "@/types/course"

interface Lecture {
  id: string
  title: string
  description?: string
  type: 'video' | 'audio' | 'text' | 'pdf' | 'quiz'
  order: number
  duration?: number
  status: 'draft' | 'published' | 'archived'
  isActive: boolean
  isFree?: boolean
  allowDownload?: boolean
  videoUrl?: string
  audioUrl?: string
  pdfUrl?: string
  thumbnail?: string
  resources?: any[]
  createdAt: string
  updatedAt: string
}

interface LectureManagerProps {
  sectionId: string
  lectures: Lecture[]
  onLectureCreate: (data: CreateLectureDto) => Promise<void>
  onLectureUpdate: (id: string, data: UpdateLectureDto) => Promise<void>
  onLectureDelete: (id: string) => Promise<void>
  onLectureReorder: (lectures: Lecture[]) => Promise<void>
  loading?: boolean
}

export function LectureManager({
  sectionId,
  lectures,
  onLectureCreate,
  onLectureUpdate,
  onLectureDelete,
  onLectureReorder,
  loading = false
}: LectureManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLecture, setEditingLecture] = useState<Lecture | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleLectureCreate = async (data: CreateLectureDto) => {
    try {
      setActionLoading("create")
      await onLectureCreate(data)
      setShowAddForm(false)
    } finally {
      setActionLoading(null)
    }
  }

  const handleLectureUpdate = async (data: UpdateLectureDto) => {
    if (!editingLecture) return
    
    try {
      setActionLoading(`update-${editingLecture.id}`)
      await onLectureUpdate(editingLecture.id, data)
      setEditingLecture(null)
    } finally {
      setActionLoading(null)
    }
  }

  const handleLectureDelete = async (id: string) => {
    try {
      setActionLoading(`delete-${id}`)
      await onLectureDelete(id)
    } finally {
      setActionLoading(null)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return "🎥"
      case "audio": return "🎵"
      case "text": return "📝"
      case "pdf": return "📄"
      case "quiz": return "❓"
      default: return "📄"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video": return "bg-blue-100 text-blue-800"
      case "audio": return "bg-purple-100 text-purple-800"
      case "text": return "bg-green-100 text-green-800"
      case "pdf": return "bg-red-100 text-red-800"
      case "quiz": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return "N/A"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const sortedLectures = [...lectures].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Lectures</h3>
          <p className="text-sm text-muted-foreground">
            Manage lectures in this section
          </p>
        </div>
        <Button 
          size="sm" 
          onClick={() => setShowAddForm(true)} 
          disabled={loading}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Lecture
        </Button>
      </div>

      {/* Add Lecture Form */}
      {showAddForm && (
        <LectureForm
          sectionId={sectionId}
          onSubmit={handleLectureCreate}
          onCancel={() => setShowAddForm(false)}
          loading={actionLoading === "create"}
          submitLabel="Add Lecture"
        />
      )}

      {/* Edit Lecture Form */}
      {editingLecture && (
        <LectureForm
          sectionId={sectionId}
          initialData={editingLecture}
          onSubmit={handleLectureUpdate}
          onCancel={() => setEditingLecture(null)}
          loading={actionLoading === `update-${editingLecture.id}`}
          submitLabel="Update Lecture"
        />
      )}

      {/* Lectures List */}
      <div className="space-y-2">
        {sortedLectures.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
            <p>No lectures yet. Add your first lecture to get started.</p>
          </div>
        ) : (
          sortedLectures.map((lecture, index) => (
            <Card key={lecture.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTypeIcon(lecture.type)}</span>
                    <Badge className={getTypeColor(lecture.type)}>
                      {lecture.type}
                    </Badge>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium truncate">{lecture.title}</h4>
                      <span className="text-sm text-muted-foreground">
                        #{lecture.order + 1}
                      </span>
                    </div>
                    {lecture.description && (
                      <p className="text-sm text-muted-foreground truncate">
                        {lecture.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{formatDuration(lecture.duration)}</span>
                    {lecture.isFree && (
                      <Badge variant="outline" className="text-xs">
                        Free
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge 
                    variant={
                      lecture.status === "published" ? "default" : 
                      lecture.status === "draft" ? "secondary" : "destructive"
                    }
                  >
                    {lecture.status}
                  </Badge>
                  
                  <Badge variant={lecture.isActive ? "default" : "secondary"}>
                    {lecture.isActive ? "Active" : "Inactive"}
                  </Badge>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1">
                    {lecture.type === "video" && lecture.videoUrl && (
                      <Button variant="ghost" size="sm" title="Preview">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                    
                    {lecture.allowDownload && (
                      <Button variant="ghost" size="sm" title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                    )}

                    <Button variant="ghost" size="sm" title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingLecture(lecture)}
                      disabled={actionLoading === `update-${lecture.id}`}
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={actionLoading === `delete-${lecture.id}`}
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Lecture</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete "{lecture.title}"? 
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleLectureDelete(lecture.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>

              {/* Lecture Resources */}
              {lecture.resources && lecture.resources.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Resources:</span>
                    <div className="flex flex-wrap gap-1">
                      {lecture.resources.map((resource, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {resource.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {sortedLectures.length > 0 && (
        <div className="text-sm text-muted-foreground text-center pt-2">
          Total: {sortedLectures.length} lectures • 
          Duration: {formatDuration(sortedLectures.reduce((acc, lecture) => acc + (lecture.duration || 0), 0))}
        </div>
      )}
    </div>
  )
}
