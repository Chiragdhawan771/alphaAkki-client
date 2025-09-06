
"use client"
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Clock, Users, BookOpen, Play } from 'lucide-react';
import { SimplifiedCourse } from '@/services/simplifiedCourseService';

interface CourseCardProps {
  course: SimplifiedCourse;
  onViewDetails?: (course: SimplifiedCourse) => void;
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
  compact = false
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300 h-full flex flex-col">
      {/* Course Image */}
      <div className="relative">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className={`w-full object-cover rounded-t-lg ${compact ? 'h-32' : 'h-48'}`}
          />
        ) : (
          <div className={`w-full bg-gradient-to-br from-orange-400 to-red-500 rounded-t-lg flex items-center justify-center ${compact ? 'h-32' : 'h-48'}`}>
            <BookOpen className="h-12 w-12 text-white" />
          </div>
        )}
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3">
          <Badge variant={course.type === 'free' ? 'secondary' : 'default'} className="shadow-md">
            {course.type === 'free' ? 'Free' : `$${course.price}`}
          </Badge>
        </div>

        {/* Category Badge */}
        {course.category && (
          <div className="absolute top-3 left-3">
            <Badge variant="outline" className="bg-white/90 shadow-md">
              {course.category}
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <CardTitle className={`line-clamp-2 ${compact ? 'text-base' : 'text-lg'}`}>
          {course.title}
        </CardTitle>
        
        {/* Rating and Reviews */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {renderStars(course.averageRating)}
            <span className="font-medium text-sm ml-1">
              {course.averageRating > 0 ? course.averageRating.toFixed(1) : 'New'}
            </span>
            {course.totalReviews > 0 && (
              <span className="text-xs text-gray-500">({course.totalReviews})</span>
            )}
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="h-3 w-3 mr-1" />
            {course.enrollmentCount}
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
          {/* Duration and Instructor */}
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center space-x-1">
              <Clock className="h-3 w-3 text-gray-400" />
              <span>{course.estimatedDuration ? `${course.estimatedDuration}h` : 'Self-paced'}</span>
            </div>
            <span className="text-gray-500 truncate max-w-[120px]">
              {course.instructor.firstName} {course.instructor.lastName}
            </span>
          </div>

          {/* Tags */}
          {course.tags && course.tags.length > 0 && !compact && (
            <div className="flex flex-wrap gap-1">
              {course.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {course.tags.length > 2 && (
                <span className="text-xs text-gray-500">+{course.tags.length - 2}</span>
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
                onClick={() => onViewDetails(course)}
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
              onEnroll && (
                <Button 
                  className="flex-1" 
                  size={compact ? "sm" : "default"}
                  onClick={() => onEnroll(course._id)}
                >
                  Enroll Now
                </Button>
              )
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseCard;
