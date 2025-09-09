"use client"

import { useState, useEffect } from "react"
import { Download, FileText, ExternalLink, Play } from "lucide-react"
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
          <div className="bg-black rounded-xl overflow-hidden shadow-lg">
            <VideoPlayer
              lectureId={lecture.id}
              courseId={courseId}
              videoUrl={lecture.videoUrl}
              onProgress={onProgress}
              onComplete={onComplete}
              autoPlay={true}
            />
          </div>
        )
      
      case 'text':
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                Reading Material
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-p:leading-relaxed prose-strong:text-gray-900 prose-a:text-orange-600 hover:prose-a:text-orange-700"
                dangerouslySetInnerHTML={{ __html: lecture.content || '' }}
              />
            </CardContent>
          </Card>
        )
      
      case 'pdf':
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 text-white" />
                </div>
                PDF Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="h-10 w-10 text-red-600" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">PDF Learning Material</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
                  This lecture contains a comprehensive PDF document with detailed information and exercises.
                </p>
                {lecture.videoUrl && (
                  <Button 
                    asChild
                    className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3"
                  >
                    <a href={lecture.videoUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open PDF Document
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )
      
      case 'audio':
        return (
          <Card className="border-0 shadow-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-t-lg">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                  <Play className="h-4 w-4 text-white" />
                </div>
                Audio Lecture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-6">
                {lecture.videoUrl ? (
                  <audio controls className="w-full h-12 bg-white rounded-lg shadow-sm">
                    <source src={lecture.videoUrl} type="audio/mpeg" />
                    <source src={lecture.videoUrl} type="audio/wav" />
                    <source src={lecture.videoUrl} type="audio/ogg" />
                    Your browser does not support the audio element.
                  </audio>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-gray-600">Audio content is being prepared...</p>
                  </div>
                )}
              </div>
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
    <div className="p-6">
      {/* Main Content */}
      <div className="space-y-6">

        {renderLectureContent()}

        {/* Resources Section */}
        {lecture.resources && lecture.resources.length > 0 && (
          <div className="mt-6">
            <Card className="border-0 shadow-sm">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                    <Download className="h-4 w-4 text-white" />
                  </div>
                  Lecture Resources
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-3">
                  {lecture.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{resource.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="capitalize">{resource.type}</span>
                            <span>•</span>
                            <span>{formatFileSize(resource.size)}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResourceDownload(resource)}
                        disabled={downloadingResource === resource.name}
                        className="hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                      >
                        {downloadingResource === resource.name ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"></div>
                            <span>Downloading...</span>
                          </div>
                        ) : (
                          <>
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </>
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
