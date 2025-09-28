"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Edit, Eye, Plus, Play, Trash2, Upload, Users, Video, ImageIcon } from "lucide-react"
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

const SimplifiedCourseManager: React.FC = () => {
  const [courses, setCourses] = useState<SimplifiedCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateCourse, setShowCreateCourse] = useState(false)
  const [showAddVideo, setShowAddVideo] = useState<string | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<SimplifiedCourse | null>(null)
  const [isEditingCourse, setIsEditingCourse] = useState(false)
  const [editCourseData, setEditCourseData] = useState<Partial<SimplifiedCourse>>({})
  const [watchingVideoIndex, setWatchingVideoIndex] = useState<number | null>(null)
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
    duration: 0,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleThumbnailUpload = (file: File | null, url: string) => {
    if (isEditingCourse) {
      setEditCourseData({ ...editCourseData, thumbnail: url })
    } else {
      setNewCourse({ ...newCourse, thumbnail: url })
    }
  }

  const handlePreviewVideoUpload = (file: File | null, url: string) => {
    if (isEditingCourse) {
      setEditCourseData({ ...editCourseData, previewVideo: url })
    } else {
      setNewCourse({ ...newCourse, previewVideo: url })
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

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
    if (!newVideo.title.trim() || !videoFile) {
      toast({
        title: "Validation Error",
        description: "Please provide video title and select a video file",
        variant: "destructive",
      })
      return
    }

    if (!showAddVideo) return

    try {
      setUploadProgress(0)
      const updatedCourse = await simplifiedCourseService.addVideo(showAddVideo, newVideo, videoFile)

      // Update courses list
      setCourses(courses.map((course) => (course._id === showAddVideo ? updatedCourse : course)))

      setNewVideo({ title: "", duration: 0 })
      setVideoFile(null)
      setShowAddVideo(null)
      setUploadProgress(0)

      toast({
        title: "Success!",
        description: "Video uploaded successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to upload video",
        variant: "destructive",
      })
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
                          src={newCourse.thumbnail || "/placeholder.svg"}
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
                          src={newCourse.previewVideo}
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
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Video to {course.title}</DialogTitle>
                        <DialogDescription>Upload a new video to this course</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Video Title</label>
                          <Input
                            value={newVideo.title}
                            onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                            placeholder="Enter video title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Duration (seconds)</label>
                          <Input
                            type="number"
                            value={newVideo.duration}
                            onChange={(e) => setNewVideo({ ...newVideo, duration: Number(e.target.value) })}
                            placeholder="0"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Video File</label>
                          <Input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                          />
                        </div>
                        {uploadProgress > 0 && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                        )}
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => setShowAddVideo(null)}>
                            Cancel
                          </Button>
                          <Button onClick={handleAddVideo}>Upload Video</Button>
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
              <VideoPlayer
                lectureId={`${selectedCourse._id}_${watchingVideoIndex}`}
                videoUrl={selectedCourse.videos[watchingVideoIndex].videoUrl}
                title={selectedCourse.videos[watchingVideoIndex].title}
                autoPlay={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

export default SimplifiedCourseManager
