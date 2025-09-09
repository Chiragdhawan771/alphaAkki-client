"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { streamingService, progressService } from "@/services"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
interface VideoPlayerProps {
  lectureId: string
  courseId: string
  videoUrl?: string
  onProgress?: (progress: number, timeSpent: number, position: number) => void
  onComplete?: () => void
  autoPlay?: boolean
}

export function VideoPlayer({ 
  lectureId, 
  courseId, 
  videoUrl: propVideoUrl,
  onProgress, 
  onComplete,
  autoPlay = false 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const { toast } = useToast()

  const progressUpdateInterval = useRef<NodeJS.Timeout | undefined>(undefined)
  const hideControlsTimeout = useRef<NodeJS.Timeout | undefined>(undefined)

  // Set video URL from props or fetch from streaming service
  useEffect(() => {
    const initializeVideo = async () => {
      try {
        setLoading(true)
        
        if (propVideoUrl && propVideoUrl.trim() !== '') {
          // Use direct video URL from props
          setVideoUrl(propVideoUrl)
        } else {
          // Fallback to streaming service
          try {
            const response = await streamingService.getVideoStreamUrl(lectureId)
            setVideoUrl(response.data.url)
          } catch (streamingError) {
            console.error('Streaming service failed:', streamingError)
            setVideoUrl(null)
          }
        }
      } catch (error) {
        console.error('Video initialization failed:', error)
        setVideoUrl(null)
        toast({
          title: "Error",
          description: "Failed to load video. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    initializeVideo()
  }, [lectureId, propVideoUrl])

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => {
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current)
      }
    }
  }, [showControls, isPlaying])

  // Progress tracking
  useEffect(() => {
    if (isPlaying && duration > 0) {
      progressUpdateInterval.current = setInterval(() => {
        if (videoRef.current) {
          const progress = (currentTime / duration) * 100
          const timeSpent = currentTime
          onProgress?.(progress, timeSpent, currentTime)
          
          // Update progress on server every 10 seconds
          if (Math.floor(currentTime) % 10 === 0) {
            progressService.updateLectureProgress(courseId, lectureId, {
              progressPercentage: progress,
              timeSpent: timeSpent,
              lastPosition: currentTime
            }).catch(console.error)
          }
        }
      }, 1000)
    }

    return () => {
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current)
      }
    }
  }, [isPlaying, duration, currentTime, courseId, lectureId, onProgress])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (videoRef.current) {
        videoRef.current.pause()
        videoRef.current.src = ''
        videoRef.current.load()
      }
      if (progressUpdateInterval.current) {
        clearInterval(progressUpdateInterval.current)
      }
      if (hideControlsTimeout.current) {
        clearTimeout(hideControlsTimeout.current)
      }
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      if (autoPlay) {
        videoRef.current.play()
      }
    }
  }

  const handlePlay = () => {
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleEnded = async () => {
    setIsPlaying(false)
    try {
      await progressService.markLectureComplete(courseId, lectureId)
      onComplete?.()
      toast({
        title: "Lecture Complete!",
        description: "Great job! You've completed this lecture."
      })
    } catch (error) {
      console.error("Failed to mark lecture as complete:", error)
    }
  }

  const handleSeek = (value: number[]) => {
    if (videoRef.current && duration > 0) {
      const newTime = (value[0] / 100) * duration
      videoRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!isFullscreen) {
        if (videoRef.current.requestFullscreen) {
          videoRef.current.requestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen()
        }
      }
    }
  }

  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, currentTime + seconds))
    }
  }

  const changePlaybackRate = (rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-black rounded-xl flex items-center justify-center shadow-2xl">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <div className="space-y-2">
            <p className="text-white font-medium">Loading secure video stream...</p>
            <p className="text-gray-400 text-sm">Please wait while we prepare your content</p>
          </div>
        </div>
      </div>
    )
  }

  if (!videoUrl) {
    return (
      <div className="aspect-video bg-gradient-to-br from-red-900 to-black rounded-xl flex items-center justify-center shadow-2xl">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <ExternalLink className="h-8 w-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <p className="text-white font-medium">Video Unavailable</p>
            <p className="text-gray-400 text-sm">Unable to load the video stream. Please try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="relative aspect-video bg-black rounded-xl overflow-hidden group shadow-2xl"
      onMouseMove={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={videoUrl || undefined}
        className="w-full h-full object-cover"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleEnded}
        onClick={togglePlay}
        onError={(e) => {
          console.error('Video error:', e)
          setVideoUrl(null)
        }}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        crossOrigin="anonymous"
      />

      {/* Enhanced Controls Overlay */}
      <div 
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 transition-all duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Loading Indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto"></div>
              <p className="text-white text-sm font-medium">Loading secure video...</p>
            </div>
          </div>
        )}
        {/* Enhanced Play/Pause Button (Center) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            variant="ghost"
            size="lg"
            className="text-white hover:bg-white/30 rounded-full w-20 h-20 backdrop-blur-sm bg-black/20 border border-white/20 transition-all duration-200 hover:scale-105"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <Pause className="h-10 w-10" />
            ) : (
              <Play className="h-10 w-10 ml-1" />
            )}
          </Button>
        </div>

        {/* Enhanced Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
          {/* Enhanced Progress Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Slider
                value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full [&_[role=slider]]:bg-orange-500 [&_[role=slider]]:border-orange-400 [&_.bg-primary]:bg-orange-500"
              />
              {/* Progress percentage indicator */}
              <div className="absolute -top-8 left-0 right-0 flex justify-center">
                <div className="bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                  {Math.round(duration > 0 ? (currentTime / duration) * 100 : 0)}% completed
                </div>
              </div>
            </div>
            <div className="flex justify-between text-sm text-white font-medium">
              <span className="bg-black/50 px-2 py-1 rounded">{formatTime(currentTime)}</span>
              <span className="bg-black/50 px-2 py-1 rounded">{formatTime(duration)}</span>
            </div>
          </div>

          {/* Enhanced Control Buttons */}
          <div className="flex items-center justify-between backdrop-blur-sm bg-black/30 rounded-xl p-3">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-lg transition-colors"
                onClick={togglePlay}
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-lg transition-colors"
                onClick={() => skipTime(-10)}
                title="Rewind 10 seconds"
              >
                <SkipBack className="h-4 w-4" />
                <span className="text-xs ml-1">10s</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-lg transition-colors"
                onClick={() => skipTime(10)}
                title="Forward 10 seconds"
              >
                <SkipForward className="h-4 w-4" />
                <span className="text-xs ml-1">10s</span>
              </Button>

              <div className="flex items-center gap-2 bg-black/30 rounded-lg px-3 py-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-1"
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <Slider
                  value={[isMuted ? 0 : volume * 100]}
                  onValueChange={handleVolumeChange}
                  max={100}
                  className="w-24 [&_[role=slider]]:bg-white [&_.bg-primary]:bg-white/80"
                />
                <span className="text-xs text-white/80 min-w-[2rem]">{Math.round(isMuted ? 0 : volume * 100)}%</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={playbackRate}
                onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                className="bg-black/50 text-white text-sm rounded-lg px-3 py-1.5 border border-white/20 hover:border-white/40 transition-colors focus:outline-none focus:border-orange-400"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>Normal</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>

              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 rounded-lg transition-colors"
                onClick={toggleFullscreen}
                title="Fullscreen"
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
