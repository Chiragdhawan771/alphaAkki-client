"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Upload, X, ImageIcon, Video, FileText, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import fileUploadService from "@/services/fileUploadService"

interface FileUploadDialogProps {
  type: "image" | "video"
  currentUrl?: string
  onFileSelect: (file: File | null, url: string, s3Key?: string) => void
  trigger: React.ReactNode
}

export function FileUploadDialog({ type, currentUrl, onFileSelect, trigger }: FileUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl || "")
  const [urlInput, setUrlInput] = useState<string>(currentUrl || "")
  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("file")
  const [isUploading, setIsUploading] = useState(false)
  const [s3Key, setS3Key] = useState<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const acceptedTypes =
    type === "image" ? "image/jpeg,image/png,image/gif,image/webp" : "video/mp4,video/webm,video/ogg"

  const maxSize = type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024 // 5MB for images, 50MB for videos

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = acceptedTypes.split(",")
    if (!validTypes.some((validType) => file.type === validType.trim())) {
      toast({
        title: "Invalid file type",
        description: `Please select a valid ${type} file`,
        variant: "destructive",
      })
      return
    }

    // Validate file size
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: `File size must be less than ${type === "image" ? "5MB" : "50MB"}`,
        variant: "destructive",
      })
      return
    }

    setSelectedFile(file)

    // Create preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  const handleUrlChange = (url: string) => {
    setUrlInput(url)
    setPreviewUrl(url)
    setSelectedFile(null)
  }

  const handleSave = async () => {
    if (uploadMethod === "file" && selectedFile) {
      try {
        setIsUploading(true)
        
        // Upload to S3
        let uploadResult
        if (type === "image") {
          uploadResult = await fileUploadService.uploadCourseImage(selectedFile)
        } else {
          uploadResult = await fileUploadService.uploadCourseVideo(selectedFile)
        }
        
        // Pass the S3 URL and key to parent
        onFileSelect(selectedFile, uploadResult.url, uploadResult.key)
        setS3Key(uploadResult.key)
        
        setIsOpen(false)
        toast({
          title: "Success",
          description: `${type === "image" ? "Thumbnail" : "Preview video"} uploaded to S3 successfully`,
        })
      } catch (error: any) {
        toast({
          title: "Upload Failed",
          description: error.message || "Failed to upload file to S3",
          variant: "destructive",
        })
      } finally {
        setIsUploading(false)
      }
    } else if (uploadMethod === "url" && urlInput.trim()) {
      onFileSelect(null, urlInput.trim())
      setIsOpen(false)
      toast({
        title: "Success",
        description: `${type === "image" ? "Thumbnail" : "Preview video"} URL updated successfully`,
      })
    } else {
      toast({
        title: "No file selected",
        description: `Please select a ${type} file or enter a URL`,
        variant: "destructive",
      })
      return
    }
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setUrlInput("")
    setS3Key(undefined)
    onFileSelect(null, "")
    setIsOpen(false)
  }

  const resetDialog = () => {
    setSelectedFile(null)
    setPreviewUrl(currentUrl || "")
    setUrlInput(currentUrl || "")
    setUploadMethod("file")
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open)
        if (!open) resetDialog()
      }}
    >
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {type === "image" ? <ImageIcon className="h-5 w-5" /> : <Video className="h-5 w-5" />}
            Upload {type === "image" ? "Thumbnail" : "Preview Video"}
          </DialogTitle>
          <DialogDescription>Choose a {type} file from your device or enter a URL</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Method Toggle */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant={uploadMethod === "file" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadMethod("file")}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button
              type="button"
              variant={uploadMethod === "url" ? "default" : "outline"}
              size="sm"
              onClick={() => setUploadMethod("url")}
            >
              <FileText className="h-4 w-4 mr-2" />
              Enter URL
            </Button>
          </div>

          {uploadMethod === "file" ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="file-upload">Select {type} file</Label>
                <div className="mt-2">
                  <Input
                    ref={fileInputRef}
                    id="file-upload"
                    type="file"
                    accept={acceptedTypes}
                    onChange={handleFileSelect}
                    className="cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Max size: {type === "image" ? "5MB" : "50MB"}. Supported formats:{" "}
                  {type === "image" ? "JPEG, PNG, GIF, WebP" : "MP4, WebM, OGG"}
                </p>
              </div>

              {/* Drag and Drop Area */}
              <div
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.add("border-primary")
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("border-primary")
                }}
                onDrop={(e) => {
                  e.preventDefault()
                  e.currentTarget.classList.remove("border-primary")
                  const files = e.dataTransfer.files
                  if (files.length > 0) {
                    const file = files[0]
                    const event = { target: { files: [file] } } as React.ChangeEvent<HTMLInputElement>
                    handleFileSelect(event)
                  }
                }}
              >
                {type === "image" ? (
                  <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                ) : (
                  <Video className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                )}
                <p className="text-sm font-medium">Drop your {type} here, or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {type === "image" ? "PNG, JPG, GIF up to 5MB" : "MP4, WebM, OGG up to 50MB"}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="url-input">{type === "image" ? "Thumbnail" : "Video"} URL</Label>
                <Input
                  id="url-input"
                  type="url"
                  placeholder={`https://example.com/${type === "image" ? "thumbnail.jpg" : "video.mp4"}`}
                  value={urlInput}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative border rounded-lg overflow-hidden">
                {type === "image" ? (
                  <img
                    src={previewUrl || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                    onError={() => {
                      setPreviewUrl("")
                      toast({
                        title: "Invalid image",
                        description: "The image URL is not valid or accessible",
                        variant: "destructive",
                      })
                    }}
                  />
                ) : (
                  <video
                    src={previewUrl}
                    className="w-full h-48 object-cover"
                    controls
                    onError={() => {
                      setPreviewUrl("")
                      toast({
                        title: "Invalid video",
                        description: "The video URL is not valid or accessible",
                        variant: "destructive",
                      })
                    }}
                  />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreviewUrl("")
                    setSelectedFile(null)
                    setUrlInput("")
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleRemove} disabled={!currentUrl && !previewUrl}>
              Remove {type === "image" ? "Thumbnail" : "Video"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={!previewUrl || isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Save ${type === "image" ? "Thumbnail" : "Video"}`
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
