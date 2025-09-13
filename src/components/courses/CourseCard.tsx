"use client";
import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Star,
  Clock,
  Users,
  BookOpen,
  Play,
  CreditCard,
  Loader2,
} from "lucide-react";
import { SimplifiedCourse } from "@/services/simplifiedCourseService";
import { usePayment } from "@/hooks/usePayment";

interface CourseCardProps {
  course: SimplifiedCourse;
  onViewDetails?: (courseId: string) => void;
  onEnroll?: (courseId: string) => void;
  onContinue?: (courseId: string) => void;
  isEnrolled?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onViewDetails,
  onEnroll,
  onContinue,
  isEnrolled = false,
  showActions = true,
  compact = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { paymentState, initiatePayment, enrollInFreeCourse } = usePayment();
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.round(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (course.previewVideo) {
      hoverTimeoutRef.current = setTimeout(() => {
        setShowVideo(true);
        if (videoRef.current) {
          videoRef.current.play().catch(console.error);
        }
      }, 500); // Delay before showing video
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setShowVideo(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const handleEnrollClick = async () => {
    console.log(
      "CourseCard handleEnrollClick called for course:",
      course._id,
      "type:",
      course.type
    );
    console.log("onEnroll prop:", onEnroll);

    if (course.type === "free") {
      console.log("Enrolling in free course");
      await enrollInFreeCourse(course._id);
    } else {
      console.log("Initiating payment for paid course");
      await initiatePayment(course._id);
    }
  };

  return (
    <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 rounded-3xl bg-white">
      {/* Course Image/Video */}
      <div
        className="relative overflow-hidden "
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Thumbnail Image */}
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className={`w-full object-cover rounded-t-lg transition-opacity duration-300 ${
              compact ? "h-48" : "h-52"
            } ${showVideo ? "opacity-0" : "opacity-100"}`}
          />
        ) : (
          <div
            className={`w-full bg-gradient-to-br from-orange-400 to-red-500 rounded-t-lg flex items-center justify-center transition-opacity duration-300 ${
              compact ? "h-48" : "h-52"
            } ${showVideo ? "opacity-0" : "opacity-100"}`}
          >
            <BookOpen className="h-12 w-12 text-white" />
          </div>
        )}

        {/* Preview Video */}
        {course.previewVideo && (
          <video
            ref={videoRef}
            src={course.previewVideo}
            className={`absolute inset-0 w-full object-cover rounded-t-lg transition-opacity duration-300 ${
              compact ? "h-48" : "h-52"
            } ${showVideo ? "opacity-100" : "opacity-0"}`}
            // muted
            loop
            playsInline
            preload="metadata"
          />
        )}

        {/* Play Icon Overlay */}
        {course.previewVideo && !showVideo && isHovered && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-t-lg">
            <div className="bg-white/90 rounded-full p-3 shadow-lg">
              <Play className="h-6 w-6 text-gray-800 ml-1" />
            </div>
          </div>
        )}

        <div className="absolute bottom-3 right-3 z-10">
          <Badge
            variant={course.type === "free" ? "secondary" : "outline"}
            className="bg-white/90 shadow-md"
          >
            {[course?.instructor?.firstName, course?.instructor?.lastName].join(
              " "
            )}
          </Badge>
        </div>

        {/* Category Badge */}

        <div className="absolute top-3 left-3 z-10">
          <Badge variant="outline" className="bg-white/90 shadow-md">
            <Clock className="h-3 w-3 text-gray-400" />
            <span>
              {course.estimatedDuration
                ? `${course.estimatedDuration} Hours`
                : "Self-paced"}
            </span>
          </Badge>
        </div>

        {course.category && (
          <div className="absolute top-3 right-3 z-10">
            <Badge variant="outline" className="bg-white/90 shadow-md">
              {course.category}
            </Badge>
          </div>
        )}

        {/* Video Count Badge */}
        {course.videos && course.videos.length > 0 && (
          <div className="absolute bottom-3 left-3 z-10">
            <Badge
              variant="outline"
              className="bg-black/70 text-white border-white/20"
            >
              <Play className="h-3 w-3 mr-1" />
              {course.videos.length} videos
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <CardTitle
          className={`line-clamp-2 ${compact ? "text-base" : "text-lg"}`}
        >
          {course.title}
        </CardTitle>
        <CardDescription className={`line-clamp-2`}>
          {course.shortDescription}
        </CardDescription>

        {/* Rating and Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {course.level || "Beginner"}
            </Badge>
          {!isEnrolled &&  <Badge variant="outline" className="text-xs">
              {course.type}
            </Badge>}
            {!isEnrolled && course.type === "paid" && course.price && (
              <Badge variant="outline" className="text-xs">
                One-time payment
              </Badge>
            )}
          </div>
          
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col">
        {/* Short Description */}
        {course.shortDescription && !compact && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {course.shortDescription}
          </p>
        )}

        {/* Course Details */}
        <div className="space-y-2 mb-4 flex-1">
          {course.tags && course.tags.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 2).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-1 py-0"
                >
                  {tag}
                </Badge>
              ))}
              {course.tags.length > 2 && (
                <span className="text-xs text-gray-500">
                  +{course.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 mt-auto">
            {onViewDetails && (
              <Button
                className="flex-1"
                variant="outline"
                size={compact ? "sm" : "default"}
                onClick={() => onViewDetails(course._id)}
              >
                View Details
              </Button>
            )}
            {isEnrolled ? (
              onContinue && (
                <Button
                  className="flex-1"
                  size={compact ? "sm" : "default"}
                  onClick={() => onContinue(course._id)}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Continue
                </Button>
              )
            ) : (
              <Button
                className="flex-1"
                size={compact ? "sm" : "default"}
                onClick={
                  onEnroll ? () => onEnroll(course._id) : handleEnrollClick
                }
                disabled={paymentState.isProcessing}
              >
                {paymentState.isProcessing ? (
                  <>
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    {course.type === "free" ? "Enrolling..." : "Processing..."}
                  </>
                ) : (
                  <>
                    {course.type === "free" ? (
                      "Enroll Free"
                    ) : (
                      <>
                        <CreditCard className="h-3 w-3 mr-1" />
                        Buy ₹{course.price}
                      </>
                    )}
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
