import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, AlertCircle, Settings, Download, Share2 } from 'lucide-react';
import { Card, CardContent } from '../ui/card';

interface VideoPlayerProps {
  lectureId: string;
  videoUrl: string;
  title?: string;
  autoPlay?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ 
  lectureId,
  videoUrl,
  title,
  autoPlay = false 
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [secureVideoUrl, setSecureVideoUrl] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [quality, setQuality] = useState('auto');
  const [isBuffering, setIsBuffering] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => setCurrentTime(videoElement.currentTime);
    const updateDuration = () => setDuration(videoElement.duration);
    const handleEnded = () => {
      setIsPlaying(false);
    };
    const handleError = () => {
      setVideoError('Failed to load video. Please try again.');
      setLoadingVideo(false);
    };
    const handleLoadStart = () => {
      setLoadingVideo(true);
      setVideoError(null);
    };
    const handleCanPlay = () => {
      setLoadingVideo(false);
    };
    const handleWaiting = () => {
      setIsBuffering(true);
    };
    const handlePlaying = () => {
      setIsBuffering(false);
    };

    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);
    videoElement.addEventListener('loadstart', handleLoadStart);
    videoElement.addEventListener('canplay', handleCanPlay);
    videoElement.addEventListener('waiting', handleWaiting);
    videoElement.addEventListener('playing', handlePlaying);

    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
      videoElement.removeEventListener('loadstart', handleLoadStart);
      videoElement.removeEventListener('canplay', handleCanPlay);
      videoElement.removeEventListener('waiting', handleWaiting);
      videoElement.removeEventListener('playing', handlePlaying);
    };
  }, []);

  // Load secure video URL
  useEffect(() => {
    const loadSecureVideo = async () => {
      try {
        setLoadingVideo(true);
        setVideoError(null);
        
        // Use the secure video URL directly if it's already a signed URL
        if (videoUrl && videoUrl.includes('amazonaws.com') && videoUrl.includes('X-Amz-Signature')) {
          setSecureVideoUrl(videoUrl);
          return;
        }
        
        // For non-secure URLs, use the original URL as fallback
        setSecureVideoUrl(videoUrl);
      } catch (error) {
        console.error('Failed to load video:', error);
        setVideoError('Failed to load video. Please try again.');
        setSecureVideoUrl(videoUrl);
      }
    };

    loadSecureVideo();
  }, [lectureId, videoUrl]);

  // Anti-piracy measures
  useEffect(() => {
    const disableDevTools = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
      if (e.key === 'F12' || 
          (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
          (e.ctrlKey && e.key === 'u')) {
        e.preventDefault();
        toast({
          title: "Action Blocked",
          description: "Developer tools are disabled for content protection",
          variant: "destructive"
        });
      }
    };

    const disablePrintScreen = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        toast({
          title: "Screenshot Blocked",
          description: "Screenshots are not allowed",
          variant: "destructive"
        });
      }
    };

    document.addEventListener('keydown', disableDevTools);
    document.addEventListener('keydown', disablePrintScreen);
    
    return () => {
      document.removeEventListener('keydown', disableDevTools);
      document.removeEventListener('keydown', disablePrintScreen);
    };
  }, [toast]);


  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
  };

  const changePlaybackRate = (rate: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = rate;
    setPlaybackRate(rate);
    setShowSettings(false);
    toast({
      title: "Playback Speed",
      description: `Speed set to ${rate}x`
    });
  };

  const preventRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Action Blocked",
      description: "Right-click is disabled for content protection",
      variant: "destructive"
    });
  };

  const preventDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Download Blocked",
      description: "Video download is not allowed",
      variant: "destructive"
    });
  };

  const preventShare = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Sharing Blocked",
      description: "Video sharing is not permitted",
      variant: "destructive"
    });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-full">
        <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
          {loadingVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Loading video...</p>
              </div>
            </div>
          )}
          
          {videoError && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-white text-center">
                <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                <p>{videoError}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2 text-white border-white hover:bg-white hover:text-black"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}
          
          <video
            ref={videoRef}
            src={secureVideoUrl || undefined}
            className="w-full aspect-video"
            autoPlay={autoPlay}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onContextMenu={preventRightClick}
            crossOrigin="anonymous"
            preload="metadata"
            controlsList="nodownload nofullscreen noremoteplayback"
            disablePictureInPicture
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none'
            }}
          />
          
          {/* Anti-piracy overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-4 right-4 text-white/30 text-xs font-mono">
              {new Date().toISOString()}
            </div>
            <div className="absolute bottom-4 left-4 text-white/20 text-xs">
              Protected Content - {lectureId?.slice(-8)}
            </div>
          </div>
          
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p>Buffering...</p>
              </div>
            </div>
          )}
          
          {/* Video Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-2 sm:p-4">
            {/* Progress Bar */}
            <div className="mb-2 sm:mb-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-2 sm:h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider touch-manipulation"
              />
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => skipTime(-10)}
                  className="text-white hover:bg-white/20 p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                  title="Rewind 10s"
                >
                  <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={togglePlay}
                  disabled={loadingVideo || !!videoError}
                  className="text-white hover:bg-white/20 disabled:opacity-50 p-1 sm:p-2 min-w-[40px] h-9 sm:h-10"
                >
                  {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => skipTime(10)}
                  className="text-white hover:bg-white/20 p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                  title="Forward 10s"
                >
                  <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <div className="hidden sm:flex items-center space-x-2 ml-2 sm:ml-4">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20 p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                  >
                    {isMuted ? <VolumeX className="h-3 w-3 sm:h-4 sm:w-4" /> : <Volume2 className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </Button>
                  
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-12 sm:w-16 h-2 sm:h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer touch-manipulation"
                  />
                </div>
                
                {/* Mobile Volume Control */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleMute}
                  className="sm:hidden text-white hover:bg-white/20 p-1 min-w-[36px] h-8"
                >
                  {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                </Button>
              </div>
              
              <div className="flex items-center space-x-1 sm:space-x-4 flex-shrink-0">
                <span className="text-white text-xs sm:text-sm whitespace-nowrap">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                
                {/* Playback Speed */}
                <div className="relative hidden sm:block">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowSettings(!showSettings)}
                    className="text-white hover:bg-white/20 p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                    title="Playback Speed"
                  >
                    <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                  
                  {showSettings && (
                    <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-3 min-w-[140px] shadow-xl border border-white/10">
                      <div className="text-white text-xs mb-3 font-medium">Playback Speed</div>
                      <div className="space-y-1">
                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                          <button
                            key={rate}
                            onClick={() => changePlaybackRate(rate)}
                            className={`block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/20 transition-colors ${
                              playbackRate === rate ? 'bg-orange-500/80 text-white font-medium' : 'text-white/90'
                            }`}
                          >
                            {rate}x {rate === 1 ? '(Normal)' : ''}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Blocked Download Button - Hidden on mobile */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={preventDownload}
                  className="hidden sm:flex text-white/50 cursor-not-allowed p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                  title="Download Disabled"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                {/* Blocked Share Button - Hidden on mobile */}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={preventShare}
                  className="hidden sm:flex text-white/50 cursor-not-allowed p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                  title="Sharing Disabled"
                >
                  <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                  title="Fullscreen"
                >
                  <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default VideoPlayer;
