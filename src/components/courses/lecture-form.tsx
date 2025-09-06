"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, X, Upload, FileText, Video, Headphones, FileImage } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "../ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Badge } from "../ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form"
import { CreateLectureDto } from "../../../dto/create-lecture.dto"

interface LectureResourceDto {
  name: string;
  url: string;
  key: string;
  size: number;
  type: string;
}

const lectureSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  section: z.string().min(1, "Section is required"),
  type: z.enum(["video", "audio", "text", "pdf", "quiz"]),
  order: z.number().min(0, "Order must be positive"),
  duration: z.number().min(0, "Duration must be positive").optional(),
  videoUrl: z.string().optional(),
  videoKey: z.string().optional(),
  audioUrl: z.string().optional(),
  audioKey: z.string().optional(),
  content: z.string().optional(),
  pdfUrl: z.string().optional(),
  pdfKey: z.string().optional(),
  thumbnail: z.string().optional(),
  resources: z.array(z.object({
    name: z.string(),
    url: z.string(),
    key: z.string(),
    size: z.number(),
    type: z.string(),
  })).default([]),
  status: z.enum(["draft", "published", "archived"]).optional(),
  isFree: z.boolean().optional(),
  isActive: z.boolean().optional(),
  allowDownload: z.boolean().optional(),
  playbackSpeed: z.number().optional(),
  transcript: z.string().optional(),
  keywords: z.array(z.string()).default([]),
})

interface LectureFormProps {
  sectionId: string
  initialData?: Partial<CreateLectureDto>
  onSubmit: (data: CreateLectureDto) => void
  onCancel?: () => void
  loading?: boolean
  submitLabel?: string
}

export function LectureForm({ 
  sectionId,
  initialData, 
  onSubmit, 
  onCancel,
  loading = false, 
  submitLabel = "Save Lecture" 
}: LectureFormProps) {
  const [newResource, setNewResource] = useState<Partial<LectureResourceDto>>({})
  const [newKeyword, setNewKeyword] = useState("")

  type FormData = z.infer<typeof lectureSchema>;
  
  const form = useForm<FormData>({
    resolver: zodResolver(lectureSchema),
    defaultValues: {
      title: "",
      description: "",
      section: sectionId,
      type: "video" as const,
      order: 0,
      duration: 0,
      status: "draft" as const,
      isFree: false,
      isActive: true,
      allowDownload: false,
      playbackSpeed: 1.0,
      resources: [],
      keywords: [],
      ...initialData,
    },
  })

  const watchedType = form.watch("type")

  const addResource = () => {
    if (!newResource.name || !newResource.url) return
    
    const currentResources = form.getValues("resources") as LectureResourceDto[]
    const resource: LectureResourceDto = {
      name: newResource.name,
      url: newResource.url,
      key: newResource.key || "",
      size: newResource.size || 0,
      type: newResource.type || "application/octet-stream",
    }
    
    form.setValue("resources", [...currentResources, resource])
    setNewResource({})
  }

  const removeResource = (index: number) => {
    const currentResources = form.getValues("resources") as LectureResourceDto[]
    form.setValue("resources", currentResources.filter((_: LectureResourceDto, i: number) => i !== index))
  }

  const addKeyword = () => {
    if (!newKeyword.trim()) return
    
    const currentKeywords = form.getValues("keywords") as string[]
    if (!currentKeywords.includes(newKeyword.trim())) {
      form.setValue("keywords", [...currentKeywords, newKeyword.trim()])
    }
    setNewKeyword("")
  }

  const removeKeyword = (index: number) => {
    const currentKeywords = form.getValues("keywords") as string[]
    form.setValue("keywords", currentKeywords.filter((_: string, i: number) => i !== index))
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />
      case "audio": return <Headphones className="h-4 w-4" />
      case "text": return <FileText className="h-4 w-4" />
      case "pdf": return <FileImage className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getTypeIcon(watchedType)}
          {initialData ? "Edit Lecture" : "Add New Lecture"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lecture Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter lecture title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Lecture description (optional)"
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lecture Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="video">Video</SelectItem>
                          <SelectItem value="audio">Audio</SelectItem>
                          <SelectItem value="text">Text</SelectItem>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="quiz">Quiz</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Content Based on Type */}
            <Tabs value={watchedType} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="video">Video</TabsTrigger>
                <TabsTrigger value="audio">Audio</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
                <TabsTrigger value="pdf">PDF</TabsTrigger>
                <TabsTrigger value="quiz">Quiz</TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-4">
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/video.mp4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="videoKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Video S3 Key</FormLabel>
                      <FormControl>
                        <Input placeholder="videos/course-id/lecture.mp4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="thumbnail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thumbnail URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/thumbnail.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="audio" className="space-y-4">
                <FormField
                  control={form.control}
                  name="audioUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audio URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/audio.mp3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="audioKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audio S3 Key</FormLabel>
                      <FormControl>
                        <Input placeholder="audio/course-id/lecture.mp3" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="text" className="space-y-4">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Text Content (HTML)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter your text content here..."
                          className="min-h-[200px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        You can use HTML tags for formatting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="pdf" className="space-y-4">
                <FormField
                  control={form.control}
                  name="pdfUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PDF URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/document.pdf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pdfKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PDF S3 Key</FormLabel>
                      <FormControl>
                        <Input placeholder="pdfs/course-id/document.pdf" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="quiz" className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <p>Quiz content will be managed through a separate quiz builder.</p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Resources */}
            <div className="space-y-4">
              <Label>Lecture Resources</Label>
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <Input
                    placeholder="Resource name"
                    value={newResource.name || ""}
                    onChange={(e) => setNewResource(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Resource URL"
                    value={newResource.url || ""}
                    onChange={(e) => setNewResource(prev => ({ ...prev, url: e.target.value }))}
                  />
                  <Input
                    placeholder="File type"
                    value={newResource.type || ""}
                    onChange={(e) => setNewResource(prev => ({ ...prev, type: e.target.value }))}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addResource}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                
                {(form.watch("resources") as LectureResourceDto[])?.map((resource: LectureResourceDto, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <span className="flex-1">{resource.name}</span>
                    <Badge variant="outline">{resource.type}</Badge>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeResource(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <Label>Settings</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="playbackSpeed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Playback Speed</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="1.0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 1.0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <FormField
                  control={form.control}
                  name="isFree"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4"
                        />
                      </FormControl>
                      <FormLabel>Free Preview</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4"
                        />
                      </FormControl>
                      <FormLabel>Active</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="allowDownload"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="w-4 h-4"
                        />
                      </FormControl>
                      <FormLabel>Allow Download</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Transcript */}
            <FormField
              control={form.control}
              name="transcript"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transcript</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Video/audio transcript for accessibility"
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Helps with accessibility and SEO
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Keywords */}
            <div className="space-y-2">
              <Label>SEO Keywords</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addKeyword()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addKeyword}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {((form.watch("keywords") as string[])?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                  {(form.watch("keywords") as string[])?.map((keyword: string, index: number) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeKeyword(index)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? "Saving..." : submitLabel}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
