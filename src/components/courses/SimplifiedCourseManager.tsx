"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  Edit,
  Eye,
  Plus,
  Play,
  Trash2,
  Upload,
  Users,
  Video,
  ImageIcon,
  Clock,
  Loader2,
  CheckCircle2,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import simplifiedCourseService, {
  type SimplifiedCourse,
  type CreateCourseData,
  type AddVideoData,
} from "@/services/simplifiedCourseService"
import VideoPlayer from "./VideoPlayer"
import { FileUploadDialog } from "./file-upload-dialog"
import secureVideoService from "@/services/secureVideoService"

const SimplifiedCourseManager: React.FC = () => {
  const [courses, setCourses] = useState<SimplifiedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [showAddVideo, setShowAddVideo] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<SimplifiedCourse | null>(null)
  const [isEditingCourse, setIsEditingCourse] = useState(false)
  const [editCourseData, setEditCourseData] = useState<Partial<SimplifiedCourse>>({})
  const [watchingVideoIndex, setWatchingVideoIndex] = useState<number | null>(null)
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)
  const { toast } = useToast()

  // Course creation form
  const [newCourse, setNewCourse] = useState<CreateCourseData>({
    title: "",
    description: "",
    price: 0,
    type: "paid",
    thumbnail: "",
    previewVideo: "",
    shortDescription: "",
    learningOutcomes: [],
    prerequisites: [],
    estimatedDuration: 0,
    category: "",
    tags: [],
  })

  // Video upload form
  const [newVideo, setNewVideo] = useState<AddVideoData>({
    title: "",
    duration: undefined,
    autoDetectDuration: true,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null)
  const [videoSize, setVideoSize] = useState<string | null>(null)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isDurationDetecting, setIsDurationDetecting] = useState(false)
  const [safeDuration, setSafeDuration] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (!videoFile) {
      setVideoPreviewUrl(null)
      setVideoSize(null)
      setVideoError(null)
      setSafeDuration(undefined)
      if (newVideo.autoDetectDuration) {
        setNewVideo((prev) => ({ ...prev, duration: undefined }))
      }
      return
    }

    setVideoError(null)
    setVideoPreviewUrl(URL.createObjectURL(videoFile))
    const sizeInMb = videoFile.size / (1024 * 1024)
    setVideoSize(`${sizeInMb.toFixed(sizeInMb > 10 ? 1 : 2)} MB`)

    if (!newVideo.autoDetectDuration) {
      return
    }

    let isCancelled = false
    setIsDurationDetecting(true)

    const tempVideo = document.createElement("video")
    tempVideo.preload = "metadata"
    tempVideo.src = URL.createObjectURL(videoFile)

    const cleanup = () => {
      tempVideo.removeAttribute("src")
      tempVideo.load()
      URL.revokeObjectURL(tempVideo.src)
      setIsDurationDetecting(false)
    }

    tempVideo.onloadedmetadata = () => {
      if (isCancelled) {
        cleanup()
        return
      }

      const detectedDuration = Math.round(tempVideo.duration || 0)
      if (Number.isFinite(detectedDuration) && detectedDuration > 0) {
        setSafeDuration(detectedDuration)
        setNewVideo((prev) => ({
          ...prev,
          duration: detectedDuration,
        }))
      } else {
        setVideoError("Unable to detect duration automatically. Please enter it manually.")
        setSafeDuration(undefined)
        setNewVideo((prev) => ({ ...prev, duration: undefined }))
      }
      cleanup()
    }

    tempVideo.onerror = () => {
      if (!isCancelled) {
        setVideoError("We couldn't read this file. Please try a different video.")
        setSafeDuration(undefined)
        setNewVideo((prev) => ({ ...prev, duration: undefined, autoDetectDuration: false }))
      }
      cleanup()
    }

    return () => {
      isCancelled = true
      cleanup()
    }
  }, [videoFile, newVideo.autoDetectDuration])

  const handleThumbnailUpload = (file: File | null, url: string) => {
    if (isEditingCourse) {
      setEditCourseData({ ...editCourseData, thumbnail: file })
    } else {
      setNewCourse({ ...newCourse, thumbnail: file })
    }
  }

  const handlePreviewVideoUpload = (file: File | null, url: string) => {
    if (isEditingCourse) {
      setEditCourseData({ ...editCourseData, previewVideo: file })
    } else {
      setNewCourse({ ...newCourse, previewVideo: file })
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (!selectedCourse || watchingVideoIndex === null || watchingVideoIndex < 0) {
      setPreviewVideoUrl(null)
      setPreviewError(null)
      setPreviewLoading(false)
      return
    }

    let isMounted = true

    const fetchSignedUrl = async () => {
      try {
        setPreviewLoading(true)
        setPreviewError(null)
        const secureUrl = await secureVideoService.getSecureVideoUrl(selectedCourse._id, watchingVideoIndex)
        if (isMounted) {
          setPreviewVideoUrl(secureUrl)
        }
      } catch (error: any) {
        console.error("Failed to fetch secure video URL:", error)
        if (isMounted) {
          setPreviewError(error?.message || "Failed to load secure video URL")
          const fallbackUrl = selectedCourse.videos?.[watchingVideoIndex]?.videoUrl || null
          setPreviewVideoUrl(fallbackUrl)
        }
      } finally {
        if (isMounted) {
          setPreviewLoading(false)
        }
      }
    }

    fetchSignedUrl()

    return () => {
      isMounted = false
    }
  }, [selectedCourse, watchingVideoIndex])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const coursesData = await simplifiedCourseService.getInstructorCourses()
      setCourses(coursesData)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCourse = async () => {
    if (!newCourse.title.trim() || !newCourse.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const course = await simplifiedCourseService.createCourse(newCourse)
      setCourses([course, ...courses])
      setNewCourse({
        title: "",
        description: "",
        price: 0,
        type: "paid",
        thumbnail: "",
        previewVideo: "",
        shortDescription: "",
        learningOutcomes: [],
        prerequisites: [],
        estimatedDuration: 0,
        category: "",
        tags: [],
      })
      setShowCreateCourse(false)

      toast({
        title: "Success!",
        description: "Course created successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      })
    }
  }

  const handleAddVideo = async () => {
    if (!newVideo.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for this lecture before uploading.",
        variant: "destructive",
      })
      return
    }

    if (!videoFile) {
      toast({
        title: "Video Required",
        description: "Select a video file to upload before continuing.",
        variant: "destructive",
      })
      return
    }

    const durationValid = newVideo.duration !== undefined && !Number.isNaN(newVideo.duration) && newVideo.duration > 0

    if (!durationValid) {
      toast({
        title: "Duration Needed",
        description: newVideo.autoDetectDuration
          ? "Please wait while we detect the duration or switch off auto-detect to enter it manually."
          : "Enter the video duration in seconds before uploading.",
        variant: "destructive",
      })
      return
    }

    if (!showAddVideo) return

    try {
      setIsUploading(true)
      setUploadProgress(0)
      const uploadResult = await simplifiedCourseService.addVideo(showAddVideo, newVideo, videoFile)
      const uploadedVideo = uploadResult?.video

      if (!uploadedVideo) {
        throw new Error("Video upload succeeded but no video details were returned")
      }

      const mergedVideo = {
        ...uploadedVideo,
        duration: newVideo.duration ?? uploadedVideo.duration,
        title: newVideo.title || uploadedVideo.title,
      }

      setCourses((prev) =>
        prev.map((course) => {
          if (course._id !== showAddVideo) return course
          const videos = course.videos ? [...course.videos, mergedVideo] : [mergedVideo]
          return {
            ...course,
            videos,
          }
        })
      )

      setSelectedCourse((prev) =>
        prev && prev._id === showAddVideo
          ? {
              ...prev,
              videos: prev.videos ? [...prev.videos, mergedVideo] : [mergedVideo],
            }
          : prev
      )

      setNewVideo({ title: "", duration: undefined, autoDetectDuration: true })
      setVideoFile(null)
      setVideoPreviewUrl(null)
      setVideoSize(null)
      setVideoError(null)
      setSafeDuration(undefined)
      setShowAddVideo(null)
      setUploadProgress(0)

      toast({
        title: "Lecture Added",
        description: "The video lecture has been uploaded successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Something went wrong while uploading the video.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveVideo = async (courseId: string, videoIndex: number) => {
    try {
      const updatedCourse = await simplifiedCourseService.removeVideo(courseId, videoIndex)
      setCourses(courses.map((course) => (course._id === courseId ? updatedCourse : course)))

      toast({
        title: "Success!",
        description: "Video removed successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to remove video",
        variant: "destructive",
      })
    }
  }

  const handleUpdateCourseStatus = async (courseId: string, status: "draft" | "published" | "archived") => {
    try {
      const updatedCourse = await simplifiedCourseService.updateCourse(courseId, { status })
      setCourses(courses.map((course) => (course._id === courseId ? { ...course, status } : course)))

      toast({
        title: "Success!",
        description: `Course ${status} successfully`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      })
    }
  }

  const handleEditCourse = async () => {
    if (!selectedCourse || !editCourseData.title || !editCourseData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const updatedCourse = await simplifiedCourseService.updateCourse(selectedCourse._id, editCourseData)
      setCourses(courses.map((c) => (c._id === selectedCourse._id ? updatedCourse : c)))
      setSelectedCourse(updatedCourse)
      setIsEditingCourse(false)

      toast({
        title: "Success!",
        description: "Course updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive",
      })
    }
  }

  const startEditingCourse = (course: SimplifiedCourse) => {
    setEditCourseData({
      title: course.title,
      description: course.description,
      price: course.price,
      type: course.type,
      thumbnail: course.thumbnail || "",
      previewVideo: course.previewVideo || "",
      shortDescription: course.shortDescription || "",
      learningOutcomes: course.learningOutcomes || [],
      prerequisites: course.prerequisites || [],
      estimatedDuration: course.estimatedDuration || 0,
      category: course.category || "",
      tags: course.tags || [],
    })
    setIsEditingCourse(true)
  }

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      return
    }

    try {
      await simplifiedCourseService.deleteCourse(courseId)
      setCourses(courses.filter((course) => course._id !== courseId))

      toast({
        title: "Success!",
        description: "Course deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800"
      case "draft":
        return "bg-yellow-100 text-yellow-800"
      case "archived":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  const renderDurationDisplay = () => {
    if (!newVideo.autoDetectDuration) {
      return newVideo.duration ? formatSeconds(newVideo.duration) : "Manual entry"
    }
    if (isDurationDetecting) {
      return "Detecting..."
    }
    if (safeDuration) {
      return formatSeconds(safeDuration)
    }
    return "Not detected"
  }

  const formatSeconds = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`
    }
    if (mins > 0) {
      return `${mins}m ${secs}s`
    }
    return `${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">Create and manage your courses with video content</p>
        </div>
        <Dialog open={showCreateCourse} onOpenChange={setShowCreateCourse}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="h-4 w-4 mr-2" />
              Create Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>Fill in the details to create a new course</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course Title *</label>
                  <Input
                    value={newCourse.title}
                    onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                    placeholder="Enter course title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <Input
                    value={newCourse.category || ""}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    placeholder="e.g., Web Development, Design"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Short Description</label>
                <Input
                  value={newCourse.shortDescription || ""}
                  onChange={(e) => setNewCourse({ ...newCourse, shortDescription: e.target.value })}
                  placeholder="Brief course summary (max 200 characters)"
                  maxLength={200}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Full Description *</label>
                <Textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  placeholder="Enter detailed course description"
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <Select
                    value={newCourse.type}
                    onValueChange={(value: "free" | "paid") => setNewCourse({ ...newCourse, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {newCourse.type === "paid" && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Price (₹)</label>
                    <Input
                      type="number"
                      value={newCourse.price || ''}
                      onChange={(e) => setNewCourse({ ...newCourse, price: Number(e.target.value) || 0 })}
                      placeholder="Enter price"
                      min="0"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                  <Input
                    type="number"
                    value={newCourse.estimatedDuration || ''}
                    onChange={(e) => setNewCourse({ ...newCourse, estimatedDuration: Number(e.target.value) || 0 })}
                    placeholder="Est. hours"
                    min="0"
                    step="0.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course Thumbnail</label>
                  <div className="space-y-2">
                    <FileUploadDialog
                      type="image"
                      currentUrl={newCourse.thumbnail}
                      onFileSelect={handleThumbnailUpload}
                      trigger={
                        <Button type="button" variant="outline" className="w-full bg-transparent">
                          <ImageIcon className="h-4 w-4 mr-2" />
                          {newCourse.thumbnail ? "Change Thumbnail" : "Upload Thumbnail"}
                        </Button>
                      }
                    />
                    {newCourse.thumbnail && (
                      <div className="relative">
                        <img
                          src={URL.createObjectURL(newCourse.thumbnail) || "/placeholder.svg"}
                          alt="Thumbnail preview"
                          className="w-full h-24 object-cover rounded border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Preview Video</label>
                  <div className="space-y-2">
                    <FileUploadDialog
                      type="video"
                      currentUrl={newCourse.previewVideo}
                      onFileSelect={handlePreviewVideoUpload}
                      trigger={
                        <Button type="button" variant="outline" className="w-full bg-transparent">
                          <Video className="h-4 w-4 mr-2" />
                          {newCourse.previewVideo ? "Change Preview Video" : "Upload Preview Video"}
                        </Button>
                      }
                    />
                    {newCourse.previewVideo && (
                      <div className="relative">
                        <video
                          src={URL.createObjectURL(newCourse.previewVideo)}
                          className="w-full h-24 object-cover rounded border"
                          controls
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Learning Outcomes</label>
                <Textarea
                  value={newCourse.learningOutcomes?.join("\n") || ""}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      learningOutcomes: e.target.value.split("\n").filter((item) => item.trim()),
                    })
                  }
                  placeholder="What will students learn? (one per line)\ne.g., Build responsive websites\nMaster React fundamentals"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Prerequisites</label>
                <Textarea
                  value={newCourse.prerequisites?.join("\n") || ""}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      prerequisites: e.target.value.split("\n").filter((item) => item.trim()),
                    })
                  }
                  placeholder="What should students know beforehand? (one per line)\ne.g., Basic HTML/CSS knowledge\nFamiliarity with JavaScript"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags</label>
                <Input
                  value={newCourse.tags?.join(", ") || ""}
                  onChange={(e) =>
                    setNewCourse({
                      ...newCourse,
                      tags: e.target.value
                        .split(",")
                        .map((tag) => tag.trim())
                        .filter((tag) => tag),
                    })
                  }
                  placeholder="Enter tags separated by commas (e.g., react, javascript, frontend)"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateCourse(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateCourse}>Create Course</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-4">Create your first course to get started with teaching</p>
            <Button onClick={() => setShowCreateCourse(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{course.title}</CardTitle>
                    <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                  </div>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => setSelectedCourse(course)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedCourse(course)
                        startEditingCourse(course)
                      }}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteCourse(course._id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Videos:</span>
                    <span className="font-medium">{course?.videos?.length || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Enrollments:</span>
                    <span className="font-medium flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {course.enrollmentCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price:</span>
                    <span className="font-medium">{course.type === "free" ? "Free" : `Rs.${course.price}`}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Dialog
                    open={showAddVideo === course._id}
                    onOpenChange={(open) => setShowAddVideo(open ? course._id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button size="sm" className="w-full bg-transparent" variant="outline">
                        <Upload className="h-3 w-3 mr-2" />
                        Add Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl p-0 overflow-hidden">
                      <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-1 px-6 py-6">
                        <DialogHeader className="space-y-2">
                          <DialogTitle className="text-lg">Add Lecture Video</DialogTitle>
                          <DialogDescription>
                            Provide the lecture details and upload the lesson video for <span className="font-medium text-foreground">{course.title}</span>.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
                          <div className="space-y-5">
                            <div className="space-y-2">
                              <label className="block text-sm font-medium">Video Title</label>
                              <Input
                                value={newVideo.title}
                                onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                                placeholder="Intro to React Hooks"
                              />
                              <p className="text-xs text-muted-foreground">Students will see this title in the course outline.</p>
                            </div>

                            <div className="grid gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="block text-sm font-medium">Duration</label>
                                  {safeDuration && (
                                    <Badge variant="secondary" className="text-xs">
                                      Detected {formatSeconds(safeDuration)}
                                    </Badge>
                                  )}
                                </div>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    value={newVideo.duration ?? ""}
                                    onChange={(e) => {
                                      const value = e.target.value
                                      setNewVideo((prev) => ({
                                        ...prev,
                                        duration: value === "" ? undefined : Number(value),
                                      }))
                                    }}
                                    placeholder={newVideo.autoDetectDuration ? "Detecting..." : "Enter seconds"}
                                    min="0"
                                    className="pr-24"
                                    disabled={newVideo.autoDetectDuration}
                                  />
                                  <span className="absolute inset-y-0 right-2 flex items-center text-xs text-muted-foreground">
                                    {formatSeconds(newVideo.duration || 0)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <label className="inline-flex items-center space-x-2">
                                    <input
                                      id="auto-detect-duration"
                                      type="checkbox"
                                      checked={newVideo.autoDetectDuration ?? false}
                                      onChange={(e) =>
                                        setNewVideo((prev) => ({
                                          ...prev,
                                          autoDetectDuration: e.target.checked,
                                          duration: e.target.checked ? safeDuration : prev.duration,
                                        }))
                                      }
                                      className="h-4 w-4"
                                    />
                                    <span>Auto-detect duration</span>
                                  </label>
                                  <span>{newVideo.autoDetectDuration ? (isDurationDetecting ? "Reading video…" : "We will use the detected length") : "Enter the duration manually"}</span>
                                </div>
                                {videoError && <p className="text-xs text-red-500">{videoError}</p>}
                              </div>

                              {uploadProgress > 0 && (
                                <div className="space-y-2">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>Uploading</span>
                                    <span>{uploadProgress}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                                      style={{ width: `${uploadProgress}%` }}
                                    ></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="border-2 border-dashed rounded-xl bg-muted/20 p-4">
                              <Input
                                id="video-upload"
                                type="file"
                                accept="video/*"
                                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                className="hidden"
                              />
                              <label
                                htmlFor="video-upload"
                                className="flex flex-col items-center justify-center text-center gap-2 py-6 cursor-pointer rounded-lg border border-dashed hover:border-orange-500 hover:text-orange-500 transition-colors"
                              >
                                <Upload className="h-5 w-5" />
                                <div className="space-y-1">
                                  <p className="text-sm font-medium">
                                    {videoFile ? "Replace selected video" : "Drag & drop or click to upload"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    MP4 / MOV / WEBM • up to 2GB
                                  </p>
                                </div>
                              </label>

                              {videoFile && (
                                <div className="mt-4 space-y-3 rounded-lg border bg-background p-3">
                                  <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium truncate" title={videoFile.name}>
                                      {videoFile.name}
                                    </span>
                                    <Badge variant="outline">{videoSize}</Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Clock className="h-3 w-3" />
                                    <span>{renderDurationDisplay()}</span>
                                  </div>
                                  {videoPreviewUrl && (
                                    <video
                                      className="w-full rounded-lg border aspect-video max-h-48 object-cover"
                                      src={videoPreviewUrl}
                                      controls
                                      preload="metadata"
                                    />
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4 text-orange-500" />
                                High-quality uploads help students stay engaged. Aim for 1080p MP4 when possible.
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-orange-500" />
                                Duration is required for accurate progress tracking and learner expectations.
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddVideo(null)
                              setVideoFile(null)
                              setVideoPreviewUrl(null)
                              setVideoSize(null)
                              setVideoError(null)
                              setNewVideo({ title: "", duration: undefined, autoDetectDuration: true })
                            }}
                            disabled={isUploading}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleAddVideo} disabled={isUploading}>
                            {isUploading ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Video
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <div className="flex space-x-2">
                    <Select
                      value={course.status}
                      onValueChange={(value: "draft" | "published" | "archived") =>
                        handleUpdateCourseStatus(course._id, value)
                      }
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Course Details Modal */}
      {selectedCourse && (
        <Dialog
          open={!!selectedCourse}
          onOpenChange={() => {
            setSelectedCourse(null)
            setIsEditingCourse(false)
          }}
        >
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>{selectedCourse.title}</span>
                {!isEditingCourse && (
                  <Button size="sm" variant="outline" onClick={() => startEditingCourse(selectedCourse)}>
                    <Edit className="h-3 w-3 mr-1" />
                    Edit Course
                  </Button>
                )}
              </DialogTitle>
              <DialogDescription>
                {isEditingCourse ? "Edit course details" : "Course details and video management"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 max-h-[70vh] overflow-y-auto">
              {isEditingCourse ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Course Title *</label>
                      <Input
                        value={editCourseData.title || ""}
                        onChange={(e) => setEditCourseData({ ...editCourseData, title: e.target.value })}
                        placeholder="Enter course title"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Category</label>
                      <Input
                        value={editCourseData.category || ""}
                        onChange={(e) => setEditCourseData({ ...editCourseData, category: e.target.value })}
                        placeholder="e.g., Web Development, Design"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Short Description</label>
                    <Input
                      value={editCourseData.shortDescription || ""}
                      onChange={(e) => setEditCourseData({ ...editCourseData, shortDescription: e.target.value })}
                      placeholder="Brief course summary (max 200 characters)"
                      maxLength={200}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Full Description *</label>
                    <Textarea
                      value={editCourseData.description || ""}
                      onChange={(e) => setEditCourseData({ ...editCourseData, description: e.target.value })}
                      placeholder="Enter detailed course description"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Type</label>
                      <Select
                        value={editCourseData.type}
                        onValueChange={(value: "free" | "paid") =>
                          setEditCourseData({ ...editCourseData, type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editCourseData.type === "paid" && (
                      <div>
                        <label className="block text-sm font-medium mb-2">Price (₹)</label>
                        <Input
                          type="number"
                          value={editCourseData.price || ""}
                          onChange={(e) => setEditCourseData({ ...editCourseData, price: Number(e.target.value) || 0 })}
                          placeholder="Enter price"
                          min="0"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium mb-2">Duration (hours)</label>
                      <Input
                        type="number"
                        value={editCourseData.estimatedDuration || ""}
                        onChange={(e) =>
                          setEditCourseData({ ...editCourseData, estimatedDuration: Number(e.target.value) || 0 })
                        }
                        placeholder="Est. hours"
                        min="0"
                        step="0.5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Course Thumbnail</label>
                      <div className="space-y-2">
                        <FileUploadDialog
                          type="image"
                          currentUrl={editCourseData.thumbnail}
                          onFileSelect={handleThumbnailUpload}
                          trigger={
                            <Button type="button" variant="outline" className="w-full bg-transparent">
                              <ImageIcon className="h-4 w-4 mr-2" />
                              {editCourseData.thumbnail ? "Change Thumbnail" : "Upload Thumbnail"}
                            </Button>
                          }
                        />
                        {editCourseData.thumbnail && (
                          <div className="relative">
                            <img
                              src={editCourseData.thumbnail || "/placeholder.svg"}
                              alt="Thumbnail preview"
                              className="w-full h-24 object-cover rounded border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Preview Video</label>
                      <div className="space-y-2">
                        <FileUploadDialog
                          type="video"
                          currentUrl={editCourseData.previewVideo}
                          onFileSelect={handlePreviewVideoUpload}
                          trigger={
                            <Button type="button" variant="outline" className="w-full bg-transparent">
                              <Video className="h-4 w-4 mr-2" />
                              {editCourseData.previewVideo ? "Change Preview Video" : "Upload Preview Video"}
                            </Button>
                          }
                        />
                        {editCourseData.previewVideo && (
                          <div className="relative">
                            <video
                              src={editCourseData.previewVideo}
                              className="w-full h-24 object-cover rounded border"
                              controls
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Learning Outcomes</label>
                    <Textarea
                      value={editCourseData.learningOutcomes?.join("\n") || ""}
                      onChange={(e) =>
                        setEditCourseData({
                          ...editCourseData,
                          learningOutcomes: e.target.value.split("\n").filter((item) => item.trim()),
                        })
                      }
                      placeholder="What will students learn? (one per line)\ne.g., Build responsive websites\nMaster React fundamentals"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Prerequisites</label>
                    <Textarea
                      value={editCourseData.prerequisites?.join("\n") || ""}
                      onChange={(e) =>
                        setEditCourseData({
                          ...editCourseData,
                          prerequisites: e.target.value.split("\n").filter((item) => item.trim()),
                        })
                      }
                      placeholder="What should students know beforehand? (one per line)\ne.g., Basic HTML/CSS knowledge\nFamiliarity with JavaScript"
                      rows={2}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <Input
                      value={editCourseData.tags?.join(", ") || ""}
                      onChange={(e) =>
                        setEditCourseData({
                          ...editCourseData,
                          tags: e.target.value
                            .split(",")
                            .map((tag) => tag.trim())
                            .filter((tag) => tag),
                        })
                      }
                      placeholder="Enter tags separated by commas (e.g., react, javascript, frontend)"
                    />
                  </div>

                  <div className="flex justify-end space-x-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => setIsEditingCourse(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleEditCourse}>Save Changes</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold mb-2">Course Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Category:</span> {selectedCourse.category || "Not specified"}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {selectedCourse.estimatedDuration || 0} hours
                        </div>
                        <div>
                          <span className="font-medium">Price:</span> Rs.{selectedCourse.price}
                        </div>
                        <div>
                          <span className="font-medium">Type:</span> {selectedCourse.type}
                        </div>
                        {selectedCourse.tags && selectedCourse.tags.length > 0 && (
                          <div>
                            <span className="font-medium">Tags:</span> {selectedCourse.tags.join(", ")}
                          </div>
                        )}
                      </div>
                    </div>

                    {selectedCourse.thumbnail && (
                      <div>
                        <h3 className="font-semibold mb-2">Thumbnail</h3>
                        <img
                          src={selectedCourse.thumbnail || "/placeholder.svg"}
                          alt="Course thumbnail"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{selectedCourse.description}</p>
                  </div>

                  {selectedCourse.shortDescription && (
                    <div>
                      <h3 className="font-semibold mb-2">Short Description</h3>
                      <p className="text-gray-600">{selectedCourse.shortDescription}</p>
                    </div>
                  )}

                  {selectedCourse.learningOutcomes && selectedCourse.learningOutcomes.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Learning Outcomes</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {selectedCourse.learningOutcomes.map((outcome, index) => (
                          <li key={index}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedCourse.prerequisites && selectedCourse.prerequisites.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Prerequisites</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {selectedCourse.prerequisites.map((prereq, index) => (
                          <li key={index}>{prereq}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              )}

              <div>
                <h3 className="font-semibold mb-4">Videos ({selectedCourse.videos?.length || 0})</h3>
                {!selectedCourse.videos || selectedCourse.videos.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No videos uploaded yet. Add your first video to get started.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedCourse.videos.map((video, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Play className="h-4 w-4 text-orange-500" />
                          <div>
                            <p className="font-medium">{video.title}</p>
                            <p className="text-sm text-gray-500">
                              Duration: {Math.floor(video.duration / 60)}:
                              {(video.duration % 60).toString().padStart(2, "0")}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setWatchingVideoIndex(index)}
                            title="Watch Video"
                          >
                            <Video className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveVideo(selectedCourse._id, index)}
                            title="Remove Video"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Video Watching Dialog */}
      {selectedCourse && watchingVideoIndex !== null && selectedCourse.videos?.[watchingVideoIndex] && (
        <Dialog open={watchingVideoIndex !== null} onOpenChange={() => setWatchingVideoIndex(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Watch Video: {selectedCourse.videos[watchingVideoIndex].title}</DialogTitle>
              <DialogDescription>Admin preview of course video</DialogDescription>
            </DialogHeader>
            <div className="mt-4">
      {previewLoading ? (
        <div className="w-full aspect-video bg-black flex flex-col items-center justify-center text-white space-y-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          <p>Loading secure video...</p>
        </div>
      ) : (
        <VideoPlayer
          lectureId={`${selectedCourse._id}_${watchingVideoIndex}`}
          videoUrl={previewVideoUrl || selectedCourse.videos[watchingVideoIndex].videoUrl}
          title={selectedCourse.videos[watchingVideoIndex].title}
          autoPlay={true}
        />
      )}
      {previewError && (
        <p className="text-xs text-red-500 mt-2">{previewError}</p>
      )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default SimplifiedCourseManager
