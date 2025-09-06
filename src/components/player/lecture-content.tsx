"use client"

import { useState, useEffect } from "react"
import { Download, FileText, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { VideoPlayer } from "./video-player"
import { Lecture, Resource } from "@/services/types"
import { streamingService } from "@/services"
import { useToast } from "@/hooks/use-toast"

interface LectureContentProps {
  lecture: Lecture
  courseId: string
  onProgress?: (progress: number, timeSpent: number, position: number) => void
  onComplete?: () => void
}

export function LectureContent({ 
  lecture, 
  courseId, 
  onProgress, 
  onComplete 
}: LectureContentProps) {
  const [downloadingResource, setDownloadingResource] = useState<string | null>(null)
  const { toast } = useToast()

  const handleResourceDownload = async (resource: Resource) => {
    try {
      setDownloadingResource(resource.name)
      const response = await streamingService.getResourceDownloadUrl(lecture.id, resource.name)
      
      // Create a temporary link to download the file
      const link = document.createElement('a')
      link.href = response.data.url
      link.download = resource.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: "Download Started",
        description: `Downloading ${resource.name}...`
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Failed to download resource. Please try again.",
        variant: "destructive"
      })
    } finally {
      setDownloadingResource(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const renderLectureContent = () => {
    switch (lecture.type) {
      case 'video':
        return (
          <VideoPlayer
            lectureId={lecture.id}
            courseId={courseId}
            onProgress={onProgress}
            onComplete={onComplete}
            autoPlay={true}
          />
        )
      
      case 'text':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {lecture.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: lecture.content || '' }}
              />
            </CardContent>
          </Card>
        )
      
      case 'pdf':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {lecture.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">PDF Document</h3>
                <p className="text-muted-foreground mb-4">
                  This lecture contains a PDF document for you to read.
                </p>
                {lecture.videoUrl && (
                  <Button asChild>
                    <a href={lecture.videoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open PDF
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      
      case 'audio':
        return (
          <Card>
            <CardHeader>
              <CardTitle>{lecture.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {lecture.videoUrl && (
                <audio controls className="w-full">
                  <source src={lecture.videoUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </CardContent>
          </Card>
        )
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>{lecture.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This lecture type is not yet supported in the player.
              </p>
            </CardContent>
          </Card>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Lecture Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="capitalize">
            {lecture.type}
          </Badge>
          {lecture.isFree && (
            <Badge variant="secondary">Free</Badge>
          )}
        </div>
        <h1 className="text-2xl font-bold">{lecture.title}</h1>
        {lecture.description && (
          <p className="text-muted-foreground">{lecture.description}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {renderLectureContent()}

        {/* Resources Section */}
        {lecture.resources && lecture.resources.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lecture.resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {resource.type} • {formatFileSize(resource.size)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResourceDownload(resource)}
                      disabled={downloadingResource === resource.name}
                    >
                      {downloadingResource === resource.name ? (
                        "Downloading..."
                      ) : (
                        <>
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </>
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
