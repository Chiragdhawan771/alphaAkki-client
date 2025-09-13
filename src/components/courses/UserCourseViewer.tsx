import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import simplifiedCourseService, {
  SimplifiedCourse,
  Enrollment,
} from "@/services/simplifiedCourseService";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  CheckCircle,
  Award,
  Tag,
} from "lucide-react";
import CourseDetailModal from "./CourseDetailModal";
import CourseCard from "./CourseCard";

const UserCourseViewer: React.FC = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<Enrollment[]>([]);
  const [availableCourses, setAvailableCourses] = useState<SimplifiedCourse[]>(
    []
  );
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [currentVideo, setCurrentVideo] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"enrolled" | "browse">("enrolled");
  const [detailModalCourse, setDetailModalCourse] =
    useState<SimplifiedCourse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [enrolled, available] = await Promise.all([
        simplifiedCourseService.getEnrolledCourses(),
        simplifiedCourseService.getPublishedCourses(1, 20),
      ]);
      setEnrolledCourses(enrolled);
      setAvailableCourses(available.courses || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch courses",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollInCourse = async (courseId: string) => {
    try {
      await simplifiedCourseService.enrollInCourse(courseId);
      toast({
        title: "Success!",
        description: "Successfully enrolled in course",
      });
      fetchData(); // Refresh data
      setIsDetailModalOpen(false); // Close modal after enrollment
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to enroll in course",
        variant: "destructive",
      });
    }
  };

  const handleViewCourseDetails = (course: SimplifiedCourse|any) => {
    const selectedCourse = availableCourses.find((c) => {
      console.log(c,course,"dadas")
      return c._id === course});
    if (selectedCourse) {
      setDetailModalCourse(selectedCourse);
      setIsDetailModalOpen(true);
    }
  };

  const handleOpenCourse = async (courseId: string) => {
    try {
      const courseContent = await simplifiedCourseService.getCourseContent(
        courseId
      );
      setSelectedCourse(courseContent);
      setCurrentVideo(0);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to load course content",
        variant: "destructive",
      });
    }
  };

  const handleMarkVideoAsWatched = async (videoIndex: number) => {
    if (!selectedCourse) return;

    try {
      const updatedEnrollment =
        await simplifiedCourseService.markVideoAsWatched(
          selectedCourse.course._id,
          videoIndex
        );

      // Update the selected course enrollment data
      setSelectedCourse({
        ...selectedCourse,
        enrollment: updatedEnrollment,
      });

      // Update the enrolled courses list
      setEnrolledCourses(
        enrolledCourses.map((enrollment) =>
          enrollment.course._id === selectedCourse.course._id
            ? { ...enrollment, ...updatedEnrollment }
            : enrollment
        )
      );

      toast({
        title: "Progress Updated",
        description: "Video marked as watched",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update progress",
        variant: "destructive",
      });
    }
  };

  const isVideoWatched = (videoIndex: number) => {
    if (!selectedCourse) return false;
    const videoId = `${selectedCourse.course._id}_${videoIndex}`;
    return selectedCourse.watchedVideos?.includes(videoId) || false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="border-b">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab("enrolled")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "enrolled"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            My Courses ({enrolledCourses.length})
          </button>
          <button
            onClick={() => setActiveTab("browse")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "browse"
                ? "border-orange-500 text-orange-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Browse Courses ({availableCourses.length})
          </button>
        </div>
      </div>

      {/* Enrolled Courses Tab */}
      {activeTab === "enrolled" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            My Enrolled Courses
          </h2>
          {enrolledCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-lg font-semibold mb-2">
                  No enrolled courses
                </h3>
                <p className="text-gray-600 mb-4">
                  Browse available courses and start learning today
                </p>
                <Button onClick={() => setActiveTab("browse")}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.map((enrollment) => (
                <CourseCard
                  key={enrollment.course._id}
                  course={enrollment.course}
                  onViewDetails={handleOpenCourse}
                  onEnroll={undefined}
                  compact={true}
                  isEnrolled={true}
                  onContinue={() =>
                    (window.location.href = `/courses/${enrollment.course._id}/learn`)
                  }
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Browse Courses Tab */}
      {activeTab === "browse" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Available Courses
          </h2>
          {availableCourses.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">
                  No courses available
                </h3>
                <p className="text-gray-600">
                  Check back later for new courses
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCourses.map((course) => {
                const isEnrolled = enrolledCourses.some(
                  (e) => e.course._id === course._id
                );

                return (
                  <CourseCard
                    key={course._id}
                    course={course}
                    onViewDetails={handleViewCourseDetails}
                    onEnroll={undefined}
                    compact={true}
                    isEnrolled={isEnrolled}
                    onContinue={() =>
                      (window.location.href = `/courses/${course._id}/learn`)
                    }
                  />
                  
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Course Content Modal */}
      {selectedCourse && (
        <Dialog
          open={!!selectedCourse}
          onOpenChange={() => setSelectedCourse(null)}
        >
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle>{selectedCourse.course.title}</DialogTitle>
              <DialogDescription>
                Course content and video player
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[70vh]">
              {/* Video Player */}
              <div className="lg:col-span-2">
                {selectedCourse.course.videos?.length > 0 ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-lg overflow-hidden">
                      <video
                        key={currentVideo}
                        controls
                        className="w-full h-full"
                        src={
                          selectedCourse.course.videos[currentVideo]?.videoUrl
                        }
                        onEnded={() => handleMarkVideoAsWatched(currentVideo)}
                      >
                        Your browser does not support the video tag.
                      </video>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">
                          {selectedCourse.course.videos[currentVideo]?.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Video {currentVideo + 1} of{" "}
                          {selectedCourse.course.videos?.length || 0}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleMarkVideoAsWatched(currentVideo)}
                        variant={
                          isVideoWatched(currentVideo) ? "default" : "outline"
                        }
                        size="sm"
                      >
                        {isVideoWatched(currentVideo) ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Watched
                          </>
                        ) : (
                          <>
                            <Clock className="h-4 w-4 mr-2" />
                            Mark as Watched
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-4xl mb-2">🎥</div>
                      <p className="text-gray-500">No videos available</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Video List */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Course Content</h3>
                  {selectedCourse.enrollment && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{selectedCourse.enrollment.progress}%</span>
                      </div>
                      <Progress
                        value={selectedCourse.enrollment.progress}
                        className="h-2"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedCourse.course.videos?.map(
                    (video: any, index: number) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          currentVideo === index
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setCurrentVideo(index)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            {isVideoWatched(index) ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Play className="h-4 w-4 text-gray-400" />
                            )}
                            <div>
                              <p className="font-medium text-sm">
                                {video.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {video.duration
                                  ? `${Math.floor(video.duration / 60)}:${(
                                      video.duration % 60
                                    )
                                      .toString()
                                      .padStart(2, "0")}`
                                  : "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  ) || []}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Course Detail Modal */}
      <CourseDetailModal
        course={detailModalCourse}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEnroll={undefined}
        isEnrolled={
          detailModalCourse
            ? enrolledCourses.some(
                (e) => e.course._id === detailModalCourse._id
              )
            : false
        }
      />
    </div>
  );
};

export default UserCourseViewer;
