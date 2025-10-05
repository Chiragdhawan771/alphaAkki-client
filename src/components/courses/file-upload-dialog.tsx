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
import { Upload, X, ImageIcon, Video } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FileUploadDialogProps {
  type: "image" | "video"
  currentUrl?: string
  onFileSelect: (file: File | null, url: string) => void
  trigger: React.ReactNode
}

export function FileUploadDialog({ type, currentUrl, onFileSelect, trigger }: FileUploadDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(currentUrl || "")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const acceptedTypes =
    type === "image" ? "image/jpeg,image/png,image/gif,image/webp" : "video/mp4,video/webm,video/ogg"

  const maxSize = type === "image" ? 50 * 1024 * 1024 : 500 * 1024 * 1024 // 5MB for images, 50MB for videos

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
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSave = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: `Please select a ${type} file`,
        variant: "destructive",
      })
      return
    }

    onFileSelect(selectedFile, previewUrl)
    setIsOpen(false)
    toast({
      title: "Success",
      description: `${type === "image" ? "Thumbnail" : "Preview video"} updated successfully`,
    })
  }

  const handleRemove = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    onFileSelect(null, "")
    setIsOpen(false)
  }

  const resetDialog = () => {
    setSelectedFile(null)
    setPreviewUrl(currentUrl || "")
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
          <DialogDescription>Choose a {type} file from your device</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Input */}
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
                Max size: {type === "image" ? "50MB" : "500MB"}. Supported formats:{" "}
                {type === "image" ? "JPEG, PNG, GIF, WebP" : "MP4, WebM, OGG"}
              </p>
            </div>

            {/* Drag and Drop */}
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
                {type === "image" ? "PNG, JPG, GIF up to 50MB" : "MP4, WebM, OGG up to 500MB"}
              </p>
            </div>
          </div>

          {/* Preview */}
          {previewUrl && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative border rounded-lg overflow-hidden">
                {type === "image" ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <video src={previewUrl} className="w-full h-48 object-cover" controls />
                )}
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    setPreviewUrl("")
                    setSelectedFile(null)
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleRemove} disabled={!previewUrl}>
              Remove {type === "image" ? "Thumbnail" : "Video"}
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSave} disabled={!selectedFile}>
                Save {type === "image" ? "Thumbnail" : "Video"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
