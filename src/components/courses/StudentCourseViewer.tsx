import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Play, 
  Lock, 
  CheckCircle, 
  Clock, 
  Users, 
  Star,
  BookOpen,
  Award,
  Target
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import VideoPlayer from './VideoPlayer';
import simplifiedCourseService, { SimplifiedCourse, Enrollment } from '@/services/simplifiedCourseService';

interface StudentCourseViewerProps {
  courseId?: string;
  onBack?: () => void;
}

const StudentCourseViewer: React.FC<StudentCourseViewerProps> = ({ courseId, onBack }) => {
  const [course, setCourse] = useState<SimplifiedCourse | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState<number | null>(null);
  const [watchedVideos, setWatchedVideos] = useState<number[]>([]);
  const [showEnrollDialog, setShowEnrollDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (courseId) {
      loadCourse();
      checkEnrollment();
    }
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    
    try {
      const courseData = await simplifiedCourseService.getCourse(courseId);
      setCourse(courseData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load course details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkEnrollment = async () => {
    if (!courseId) return;
    
    try {
      const enrolledCourses = await simplifiedCourseService.getEnrolledCourses();
      const userEnrollment = enrolledCourses.find((e: Enrollment) => e.course._id === courseId);
      
      if (userEnrollment) {
        setEnrollment(userEnrollment);
        setWatchedVideos(userEnrollment.watchedVideos.map((_: any, index: number) => index));
        
        // Load course content if enrolled
        const courseContent = await simplifiedCourseService.getCourseContent(courseId);
        setCourse(courseContent);
      }
    } catch (error) {
      // User not enrolled or error - this is fine for public course view
    }
  };

  const handleEnroll = async () => {
    if (!course) return;
    
    setEnrolling(true);
    try {
      // Dummy enrollment (no payment for now)
      const enrollmentData = course.type === 'paid' 
        ? { paymentId: 'dummy_payment_' + Date.now(), amountPaid: course.price }
        : {};
      
      const newEnrollment = await simplifiedCourseService.enrollInCourse(course._id, enrollmentData);
      setEnrollment(newEnrollment);
      setShowEnrollDialog(false);
      
      toast({
        title: "Enrollment Successful!",
        description: `You have successfully enrolled in ${course.title}`,
      });
      
      // Reload course content
      await checkEnrollment();
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description: "Failed to enroll in course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleVideoProgress = async (videoIndex: number, progress: number) => {
    if (!course || !enrollment) return;
    
    // Mark video as watched when 90% completed
    if (progress >= 90 && !watchedVideos.includes(videoIndex)) {
      try {
        await simplifiedCourseService.markVideoAsWatched(course._id, videoIndex);
        setWatchedVideos([...watchedVideos, videoIndex]);
        
        toast({
          title: "Progress Saved",
          description: "Video marked as completed!",
        });
      } catch (error) {
        console.error('Failed to mark video as watched:', error);
      }
    }
  };

  const calculateProgress = () => {
    if (!course?.videos || course.videos.length === 0) return 0;
    return (watchedVideos.length / course.videos.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Course not found</p>
        {onBack && (
          <Button onClick={onBack} className="mt-4">
            Go Back
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{course.title}</h1>
          <p className="text-gray-600 mt-1">by {course.instructor.firstName} {course.instructor.lastName}</p>
        </div>
        {onBack && (
          <Button variant="outline" onClick={onBack}>
            Back to Courses
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Video for Non-Enrolled Users */}
          {!enrollment && (
            <Card>
              <CardHeader>
                <CardTitle>Course Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative bg-black rounded-lg overflow-hidden">
                  {course.previewVideo ? (
                    <video
                      src={course.previewVideo}
                      className="w-full aspect-video"
                      controls
                      preload="metadata"
                      poster={course.thumbnail}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : course.videos && course.videos.length > 0 ? (
                    <video
                      src={course.videos[0].videoUrl}
                      className="w-full aspect-video"
                      controls
                      preload="metadata"
                      poster={course.thumbnail}
                    >
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <div className="w-full aspect-video bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Play className="h-16 w-16 mx-auto mb-4" />
                        <p className="text-lg font-semibold">Preview Coming Soon</p>
                        <p className="text-sm opacity-90">Video preview will be available shortly</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {course.previewVideo || (course.videos && course.videos.length > 0) 
                    ? "Get a preview of what you'll learn in this course. Enroll to access all course content."
                    : "Enroll to access all course content and start learning."
                  }
                </p>
              </CardContent>
            </Card>
          )}

          {/* Video Player for Enrolled Users */}
          {enrollment && selectedVideoIndex !== null && course.videos?.[selectedVideoIndex] && (
            <VideoPlayer
              video={course.videos[selectedVideoIndex]}
              courseId={course._id}
              videoIndex={selectedVideoIndex}
              onProgress={(progress) => handleVideoProgress(selectedVideoIndex, progress)}
              autoPlay={true}
            />
          )}

          {/* Course Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">{course.description}</p>
              
              {course.shortDescription && (
                <div>
                  <h4 className="font-semibold mb-2">Overview</h4>
                  <p className="text-gray-600">{course.shortDescription}</p>
                </div>
              )}

              {course.learningOutcomes && course.learningOutcomes.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <Target className="h-4 w-4 mr-2" />
                    What You'll Learn
                  </h4>
                  <ul className="space-y-1">
                    {course.learningOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Prerequisites
                  </h4>
                  <ul className="space-y-1">
                    {course.prerequisites.map((prereq, index) => (
                      <li key={index} className="flex items-start">
                        <div className="h-1.5 w-1.5 bg-gray-400 rounded-full mr-2 mt-2 flex-shrink-0" />
                        <span className="text-gray-700">{prereq}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Course Info</span>
                <Badge variant={course.type === 'free' ? 'secondary' : 'default'}>
                  {course.type === 'free' ? 'Free' : `$${course.price}`}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{course.enrollmentCount} students</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{course.estimatedDuration || 0}h duration</span>
                </div>
                <div className="flex items-center">
                  <Play className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{course.videos?.length || 0} videos</span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{course.averageRating.toFixed(1)} rating</span>
                </div>
              </div>

              {course.tags && course.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {course.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {!enrollment ? (
                <Button 
                  onClick={() => setShowEnrollDialog(true)} 
                  className="w-full"
                  size="lg"
                >
                  Enroll Now
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{Math.round(calculateProgress())}%</span>
                  </div>
                  <Progress value={calculateProgress()} className="h-2" />
                  <Badge variant="secondary" className="w-full justify-center">
                    <Award className="h-3 w-3 mr-1" />
                    Enrolled
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video List */}
          {enrollment && course.videos && course.videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.videos.map((video, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedVideoIndex === index 
                          ? 'bg-orange-50 border-orange-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedVideoIndex(index)}
                    >
                      <div className="flex items-center space-x-3">
                        {watchedVideos.includes(index) ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Play className="h-4 w-4 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium text-sm">{video.title}</p>
                          <p className="text-xs text-gray-500">{video.duration} min</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Preview for non-enrolled users */}
          {!enrollment && course.videos && course.videos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Course Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {course.videos.map((video, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        <Lock className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-sm text-gray-600">{video.title}</p>
                          <p className="text-xs text-gray-500">{video.duration} min</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">
                  Enroll to access all course content
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Enrollment Dialog */}
      <Dialog open={showEnrollDialog} onOpenChange={setShowEnrollDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll in {course.title}</DialogTitle>
            <DialogDescription>
              {course.type === 'free' 
                ? 'This course is free! Click below to enroll and start learning.'
                : `This course costs $${course.price}. For now, we'll enroll you with a dummy payment.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Course Details:</h4>
              <ul className="text-sm space-y-1">
                <li>• {course.videos?.length || 0} video lectures</li>
                <li>• {course.estimatedDuration || 0} hours of content</li>
                <li>• Lifetime access</li>
                <li>• Certificate of completion</li>
              </ul>
            </div>
            
            {course.type === 'paid' && (
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> This is a dummy enrollment for development. 
                  Payment integration will be implemented later.
                </p>
              </div>
            )}
            
            <div className="flex space-x-3">
              <Button 
                variant="outline" 
                onClick={() => setShowEnrollDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleEnroll} 
                disabled={enrolling}
                className="flex-1"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentCourseViewer;
