"use client"

import { useState } from "react"
import { Plus, Edit, Trash2, GripVertical, ChevronDown, ChevronRight } from "lucide-react"
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
} from "../ui/alert-dialog"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import { SectionForm } from "./section-form"
import { CreateSectionDto, UpdateSectionDto } from "@/types/course"
import { LectureManager } from "./lecture-manager"

interface Section {
  id: string
  title: string
  description?: string
  order: number
  isActive: boolean
  lectures: Lecture[]
  createdAt: string
  updatedAt: string
}

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

interface SectionManagerProps {
  courseId: string
  sections: Section[]
  onSectionCreate: (data: CreateSectionDto) => Promise<void>
  onSectionUpdate: (id: string, data: UpdateSectionDto) => Promise<void>
  onSectionDelete: (id: string) => Promise<void>
  onSectionReorder: (sections: Section[]) => Promise<void>
  loading?: boolean
}

export function SectionManager({
  courseId,
  sections,
  onSectionCreate,
  onSectionUpdate,
  onSectionDelete,
  onSectionReorder,
  loading = false
}: SectionManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleSectionCreate = async (data: CreateSectionDto) => {
    try {
      setActionLoading("create")
      await onSectionCreate(data)
      setShowAddForm(false)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSectionUpdate = async (data: UpdateSectionDto) => {
    if (!editingSection) return
    
    try {
      setActionLoading(`update-${editingSection.id}`)
      await onSectionUpdate(editingSection.id, data)
      setEditingSection(null)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSectionDelete = async (id: string) => {
    try {
      setActionLoading(`delete-${id}`)
      await onSectionDelete(id)
    } finally {
      setActionLoading(null)
    }
  }

  const toggleSectionExpansion = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Course Sections</h2>
          <p className="text-muted-foreground">
            Organize your course content into sections and lectures
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} disabled={loading}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
      </div>

      {/* Add Section Form */}
      {showAddForm && (
        <SectionForm
          onSubmit={handleSectionCreate}
          onCancel={() => setShowAddForm(false)}
          loading={actionLoading === "create"}
          submitLabel="Add Section"
        />
      )}

      {/* Edit Section Form */}
      {editingSection && (
        <SectionForm
          initialData={editingSection}
          onSubmit={handleSectionUpdate}
          onCancel={() => setEditingSection(null)}
          loading={actionLoading === `update-${editingSection.id}`}
          submitLabel="Update Section"
        />
      )}

      {/* Sections List */}
      <div className="space-y-4">
        {sortedSections.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">
                No sections yet. Add your first section to get started.
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedSections.map((section) => (
            <Card key={section.id} className="overflow-hidden">
              <Collapsible
                open={expandedSections.has(section.id)}
                onOpenChange={() => toggleSectionExpansion(section.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                        <CollapsibleTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-0 h-auto">
                            {expandedSections.has(section.id) ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      <div>
                        <CardTitle className="text-lg">{section.title}</CardTitle>
                        {section.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {section.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={section.isActive ? "default" : "secondary"}>
                        {section.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Badge variant="outline">
                        {section.lectures.length} lectures
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingSection(section)}
                        disabled={actionLoading === `update-${section.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={actionLoading === `delete-${section.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Section</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{section.title}"? 
                              This will also delete all lectures in this section. 
                              This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleSectionDelete(section.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>

                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <LectureManager
                      sectionId={section.id}
                      lectures={section.lectures}
                      onLectureCreate={async (data) => {
                        // Handle lecture creation
                        console.log("Create lecture:", data)
                      }}
                      onLectureUpdate={async (id, data) => {
                        // Handle lecture update
                        console.log("Update lecture:", id, data)
                      }}
                      onLectureDelete={async (id) => {
                        // Handle lecture deletion
                        console.log("Delete lecture:", id)
                      }}
                      onLectureReorder={async (lectures) => {
                        // Handle lecture reordering
                        console.log("Reorder lectures:", lectures)
                      }}
                    />
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
