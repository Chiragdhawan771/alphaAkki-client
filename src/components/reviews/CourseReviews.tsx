"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare, Plus, Loader2 } from 'lucide-react';
import { reviewService, Review } from '@/services/reviewService';
import { enrollmentService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';

interface CourseReviewsProps {
  courseId: string;
  courseTitle: string;
}

export default function CourseReviews({ courseId, courseTitle }: CourseReviewsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: [0, 0, 0, 0, 0] // 1-star to 5-star counts
  });

  // Fetch course reviews and user enrollment status
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch approved reviews for the course
        const reviewsResponse = await reviewService.getCourseReviews(courseId, 1, 50);
        setReviews(reviewsResponse.reviews);
        
        // Calculate review statistics
        const totalReviews = reviewsResponse.reviews.length;
        const averageRating = totalReviews > 0 
          ? reviewsResponse.reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          : 0;
        
        // Calculate rating distribution
        const distribution = [0, 0, 0, 0, 0];
        reviewsResponse.reviews.forEach(review => {
          distribution[review.rating - 1]++;
        });
        
        setReviewStats({
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews,
          ratingDistribution: distribution
        });

        // Check if user is enrolled and has reviewed (if logged in)
        if (user) {
          try {
            // Check enrollment status
            const dashboardResponse = await enrollmentService.getUserDashboard();
            const enrolledCourses = dashboardResponse.data?.recentCourses || [];
            const enrolled = enrolledCourses.some((enrollment: any) => 
              enrollment.course._id === courseId
            );
            setIsEnrolled(enrolled);

            // Check if user has already reviewed this course
            const userReviewsResponse = await reviewService.getUserReviews();
            const courseReview = userReviewsResponse.find(review => 
              review.course._id === courseId
            );
            setHasReviewed(!!courseReview);
            setUserReviews(userReviewsResponse);
          } catch (error) {
            // User might not be enrolled or have reviews, which is fine
            setIsEnrolled(false);
            setHasReviewed(false);
          }
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load reviews. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, user, toast]);

  const handleReviewSubmitted = () => {
    setShowReviewForm(false);
    setHasReviewed(true);
    toast({
      title: "Review Submitted",
      description: "Your review has been submitted and is pending approval.",
    });
  };

  const renderRatingDistribution = () => {
    const maxCount = Math.max(...reviewStats.ratingDistribution);
    
    return (
      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = reviewStats.ratingDistribution[rating - 1];
          const percentage = reviewStats.totalReviews > 0 
            ? (count / reviewStats.totalReviews) * 100 
            : 0;
          
          return (
            <div key={rating} className="flex items-center space-x-2 text-sm">
              <span className="w-8 text-right">{rating}</span>
              <Star className="h-3 w-3 text-yellow-400 fill-current" />
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-gray-600">{count}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Course Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {reviewStats.averageRating.toFixed(1)}
              </div>
              <div className="flex items-center justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(reviewStats.averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">
                Based on {reviewStats.totalReviews} review{reviewStats.totalReviews !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Rating Distribution</h4>
              {renderRatingDistribution()}
            </div>
          </div>

          {/* Write Review Button */}
          {user && isEnrolled && !hasReviewed && (
            <div className="mt-6 pt-6 border-t">
              <Button
                onClick={() => setShowReviewForm(true)}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            </div>
          )}

          {/* Review Status Messages */}
          {user && !isEnrolled && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
                You need to be enrolled in this course to write a review.
              </p>
            </div>
          )}

          {user && hasReviewed && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-green-800 bg-green-50 p-3 rounded-lg border border-green-200">
                Thank you for your review! It will be visible once approved by our admin team.
              </p>
            </div>
          )}

          {!user && (
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-200">
                Please log in to write a review for this course.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form */}
      {showReviewForm && (
        <ReviewForm
          courseId={courseId}
          courseTitle={courseTitle}
          onReviewSubmitted={handleReviewSubmitted}
          onCancel={() => setShowReviewForm(false)}
        />
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Student Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {reviews.length > 0 ? (
            <ReviewList reviews={reviews} />
          ) : (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
              <p className="text-gray-600">
                Be the first to share your experience with this course!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
