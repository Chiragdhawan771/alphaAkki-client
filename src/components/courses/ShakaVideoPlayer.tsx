import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  SkipBack, 
  SkipForward, 
  AlertCircle, 
  Settings, 
  Download, 
  Share2,
  Minimize,
  RotateCcw,
  Wifi,
  WifiOff
} from 'lucide-react';

// Shaka Player types
declare global {
  interface Window {
    shaka: any;
  }
}

interface ShakaVideoPlayerProps {
  lectureId: string;
  videoUrl: string;
  title?: string;
  autoPlay?: boolean;
  drmConfig?: {
    servers?: Record<string, string>;
    advanced?: Record<string, any>;
  };
}

const ShakaVideoPlayer: React.FC<ShakaVideoPlayerProps> = ({ 
  lectureId,
  videoUrl,
  title,
  autoPlay = false,
  drmConfig
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [networkState, setNetworkState] = useState<'online' | 'offline'>('online');
  
  // Quality and streaming state
  const [availableQualities, setAvailableQualities] = useState<any[]>([]);
  const [currentQuality, setCurrentQuality] = useState<string>('auto');
  const [adaptiveStreaming, setAdaptiveStreaming] = useState(true);
  const [bandwidth, setBandwidth] = useState<number>(0);
  
  const { toast } = useToast();

  // Initialize Shaka Player
  const initializePlayer = useCallback(async () => {
    if (!videoRef.current) return;

    try {
      setLoadingVideo(true);
      setVideoError(null);

      // Load Shaka Player dynamically
      if (!window.shaka) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.7.7/shaka-player.compiled.js';
        script.async = true;
        document.head.appendChild(script);
        
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }

      // Install polyfills
      window.shaka.polyfill.installAll();

      // Check browser support
      if (!window.shaka.Player.isBrowserSupported()) {
        throw new Error('Browser not supported for advanced video streaming');
      }

      // Create player instance
      const player = new window.shaka.Player(videoRef.current);
      playerRef.current = player;

      // Configure DRM if provided
      if (drmConfig?.servers) {
        player.configure({
          drm: {
            servers: drmConfig.servers,
            advanced: drmConfig.advanced || {}
          }
        });
      }

      // Configure adaptive streaming
      player.configure({
        streaming: {
          rebufferingGoal: 2,
          bufferingGoal: 10,
          bufferBehind: 30,
          retryParameters: {
            timeout: 30000,
            maxAttempts: 4,
            baseDelay: 1000,
            backoffFactor: 2,
            fuzzFactor: 0.5
          }
        },
        abr: {
          enabled: adaptiveStreaming,
          useNetworkInformation: true,
          defaultBandwidthEstimate: 1000000
        }
      });

      // Set up event listeners
      player.addEventListener('error', handleShakaError);
      player.addEventListener('adaptation', handleAdaptation);
      player.addEventListener('buffering', handleBuffering);
      player.addEventListener('loading', () => setLoadingVideo(true));
      player.addEventListener('loaded', () => setLoadingVideo(false));

      // Load the video
      await player.load(videoUrl);
      
      // Get available qualities
      const tracks = player.getVariantTracks();
      setAvailableQualities(tracks);
      
      setLoadingVideo(false);
      
    } catch (error: any) {
      console.error('Shaka Player initialization error:', error);
      setVideoError(error.message || 'Failed to initialize video player');
      setLoadingVideo(false);
    }
  }, [videoUrl, drmConfig, adaptiveStreaming]);

  // Shaka Player event handlers
  const handleShakaError = (event: any) => {
    const error = event.detail;
    console.error('Shaka Player error:', error);
    
    let errorMessage = 'Video playback error';
    
    if (error.category === window.shaka.util.Error.Category.DRM) {
      errorMessage = 'DRM license error - content protection failed';
    } else if (error.category === window.shaka.util.Error.Category.NETWORK) {
      errorMessage = 'Network error - check your connection';
    } else if (error.category === window.shaka.util.Error.Category.MANIFEST) {
      errorMessage = 'Video format not supported';
    }
    
    setVideoError(errorMessage);
    toast({
      title: "Playback Error",
      description: errorMessage,
      variant: "destructive"
    });
  };

  const handleAdaptation = () => {
    if (playerRef.current) {
      const stats = playerRef.current.getStats();
      setBandwidth(stats.estimatedBandwidth);
      
      const activeTrack = playerRef.current.getVariantTracks()
        .find((track: any) => track.active);
      
      if (activeTrack) {
        setCurrentQuality(`${activeTrack.height}p`);
      }
    }
  };

  const handleBuffering = (event: any) => {
    setIsBuffering(event.buffering);
  };

  // Video control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const seekTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const skipTime = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
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
    const container = containerRef.current;
    if (!container) return;

    if (!isFullscreen) {
      if (container.requestFullscreen) {
        container.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
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

  const changeQuality = (qualityHeight: number) => {
    if (!playerRef.current) return;

    if (qualityHeight === 0) {
      // Auto quality
      playerRef.current.configure({ abr: { enabled: true } });
      setCurrentQuality('auto');
      setAdaptiveStreaming(true);
    } else {
      // Manual quality
      const tracks = playerRef.current.getVariantTracks();
      const targetTrack = tracks.find((track: any) => track.height === qualityHeight);
      
      if (targetTrack) {
        playerRef.current.configure({ abr: { enabled: false } });
        playerRef.current.selectVariantTrack(targetTrack, true);
        setCurrentQuality(`${qualityHeight}p`);
        setAdaptiveStreaming(false);
      }
    }
    
    setShowSettings(false);
  };

  const retryPlayback = () => {
    setVideoError(null);
    initializePlayer();
  };

  // Anti-piracy measures
  const preventRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toast({
      title: "Action Blocked",
      description: "Right-click is disabled for content protection",
      variant: "destructive"
    });
  };

  const preventDownload = () => {
    toast({
      title: "Download Blocked",
      description: "Video download is not allowed",
      variant: "destructive"
    });
  };

  const preventShare = () => {
    toast({
      title: "Sharing Blocked", 
      description: "Video sharing is not permitted",
      variant: "destructive"
    });
  };

  // Utility functions
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatBandwidth = (bandwidth: number) => {
    if (bandwidth > 1000000) {
      return `${(bandwidth / 1000000).toFixed(1)} Mbps`;
    }
    return `${(bandwidth / 1000).toFixed(0)} Kbps`;
  };

  // Effects
  useEffect(() => {
    initializePlayer();

    // Network status monitoring
    const handleOnline = () => setNetworkState('online');
    const handleOffline = () => setNetworkState('offline');
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [initializePlayer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Auto-hide controls
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const showControls = () => {
      setControlsVisible(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) setControlsVisible(false);
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', showControls);
      container.addEventListener('touchstart', showControls);
    }

    return () => {
      clearTimeout(timeout);
      if (container) {
        container.removeEventListener('mousemove', showControls);
        container.removeEventListener('touchstart', showControls);
      }
    };
  }, [isPlaying]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full max-w-full">
      <div 
        ref={containerRef}
        className="relative bg-black rounded-lg overflow-hidden shadow-2xl"
        onContextMenu={preventRightClick}
      >
        {/* Network Status Indicator */}
        {networkState === 'offline' && (
          <div className="absolute top-4 left-4 z-30 bg-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-2">
            <WifiOff className="h-3 w-3" />
            Offline
          </div>
        )}

        {/* Loading State */}
        {loadingVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mx-auto mb-4"></div>
              <p className="text-sm sm:text-base">Loading video...</p>
              {/* <p className="text-xs text-gray-400 mt-2">Initializing Shaka Player...</p> */}
            </div>
          </div>
        )}
        
        {/* Error State */}
        {videoError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
            <div className="text-white text-center max-w-md px-4">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-lg font-semibold mb-2">Playback Error</h3>
              <p className="text-sm text-gray-300 mb-4">{videoError}</p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retryPlayback}
                  className="text-white border-white hover:bg-white hover:text-black"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full aspect-video"
          autoPlay={autoPlay}
          crossOrigin="anonymous"
          preload="metadata"
          controlsList="nodownload nofullscreen noremoteplaybook"
          disablePictureInPicture
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none'
          }}
        />
        
        {/* Anti-piracy Watermarks */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="absolute top-4 right-4 text-white/20 text-xs font-mono">
            {new Date().toISOString()}
          </div>
          <div className="absolute bottom-4 left-4 text-white/15 text-xs">
            Protected • {lectureId?.slice(-8)} • Shaka DRM
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45 text-white/8 text-2xl font-bold">
            {title || 'PROTECTED CONTENT'}
          </div>
        </div>
        
        {/* Buffering Indicator */}
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p className="text-sm">Buffering...</p>
            </div>
          </div>
        )}
        
        {/* Video Controls Overlay */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent transition-opacity duration-300 z-20 ${
            controlsVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ 
            paddingBottom: 'env(safe-area-inset-bottom)',
            paddingLeft: 'env(safe-area-inset-left)',
            paddingRight: 'env(safe-area-inset-right)'
          }}
        >
          {/* Progress Bar */}
          <div className="px-3 sm:px-4 py-2 sm:py-3">
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleSeek}
                className="w-full h-2 sm:h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer touch-manipulation
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:bg-orange-500 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-track]:bg-gray-600 [&::-webkit-slider-track]:rounded-lg
                  [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:bg-orange-500 
                  [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:cursor-pointer"
              />
              <div 
                className="absolute top-0 left-0 h-2 sm:h-1 bg-orange-500 rounded-lg pointer-events-none"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          
          {/* Control Buttons */}
          <div className="flex items-center justify-between px-3 sm:px-4 pb-3 sm:pb-4 flex-wrap gap-2">
            <div className="flex items-center space-x-1 sm:space-x-2">
              {/* Skip Back */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => skipTime(-10)}
                className="text-white hover:bg-white/20 p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                title="Rewind 10s"
              >
                <SkipBack className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              {/* Play/Pause */}
              <Button
                size="sm"
                variant="ghost"
                onClick={togglePlay}
                disabled={loadingVideo || !!videoError}
                className="text-white hover:bg-white/20 disabled:opacity-50 p-1 sm:p-2 min-w-[40px] h-9 sm:h-10"
              >
                {isPlaying ? <Pause className="h-4 w-4 sm:h-5 sm:w-5" /> : <Play className="h-4 w-4 sm:h-5 sm:w-5" />}
              </Button>
              
              {/* Skip Forward */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => skipTime(10)}
                className="text-white hover:bg-white/20 p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                title="Forward 10s"
              >
                <SkipForward className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              {/* Volume Controls - Desktop */}
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
              {/* Time Display */}
              <span className="text-white text-xs sm:text-sm whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              {/* Quality/Bandwidth Info */}
              <div className="hidden sm:flex items-center space-x-2 text-xs text-white/70">
                {networkState === 'online' ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{currentQuality}</span>
                {bandwidth > 0 && <span>{formatBandwidth(bandwidth)}</span>}
              </div>
              
              {/* Settings Menu */}
              <div className="relative hidden sm:block">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowSettings(!showSettings)}
                  className="text-white hover:bg-white/20 p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                  title="Settings"
                >
                  <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
                
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg p-3 min-w-[200px] shadow-xl border border-white/10">
                    {/* Playback Speed */}
                    <div className="mb-4">
                      <div className="text-white text-xs mb-2 font-medium">Playback Speed</div>
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
                    
                    {/* Quality Selection */}
                    <div>
                      <div className="text-white text-xs mb-2 font-medium">Video Quality</div>
                      <div className="space-y-1">
                        <button
                          onClick={() => changeQuality(0)}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/20 transition-colors ${
                            currentQuality === 'auto' ? 'bg-orange-500/80 text-white font-medium' : 'text-white/90'
                          }`}
                        >
                          Auto (Adaptive)
                        </button>
                        {availableQualities
                          .filter((track, index, self) => 
                            index === self.findIndex(t => t.height === track.height)
                          )
                          .sort((a, b) => b.height - a.height)
                          .map((track) => (
                            <button
                              key={track.height}
                              onClick={() => changeQuality(track.height)}
                              className={`block w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/20 transition-colors ${
                                currentQuality === `${track.height}p` ? 'bg-orange-500/80 text-white font-medium' : 'text-white/90'
                              }`}
                            >
                              {track.height}p {track.bandwidth ? `(${formatBandwidth(track.bandwidth)})` : ''}
                            </button>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Blocked Actions */}
              <Button
                size="sm"
                variant="ghost"
                onClick={preventDownload}
                className="hidden sm:flex text-white/50 cursor-not-allowed p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                title="Download Disabled"
              >
                <Download className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={preventShare}
                className="hidden sm:flex text-white/50 cursor-not-allowed p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                title="Sharing Disabled"
              >
                <Share2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              
              {/* Fullscreen */}
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20 p-1 sm:p-2 min-w-[36px] h-8 sm:h-9"
                title="Fullscreen"
              >
                {isFullscreen ? <Minimize className="h-3 w-3 sm:h-4 sm:w-4" /> : <Maximize className="h-3 w-3 sm:h-4 sm:w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShakaVideoPlayer;
