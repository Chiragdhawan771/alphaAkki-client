"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { reviewService, Review } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';

export default function UserReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserReviews();
  }, []);

  const fetchUserReviews = async () => {
    try {
      setLoading(true);
      const userReviews = await reviewService.getUserReviews();
      setReviews(userReviews);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load your reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      setDeletingReview(reviewId);
      await reviewService.deleteReview(reviewId);
      
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted successfully.",
      });
      
      // Remove the deleted review from the list
      setReviews(prev => prev.filter(review => review._id !== reviewId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete review.",
        variant: "destructive",
      });
    } finally {
      setDeletingReview(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>My Reviews</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageSquare className="h-5 w-5" />
          <span>My Reviews</span>
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Manage your course reviews and see their approval status
        </p>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
            <p className="text-gray-600">
              You haven't written any course reviews yet. Complete a course and share your experience!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {review.course.title}
                      </h4>
                      <Badge className={getStatusColor(review.status)}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-gray-600">
                        {review.rating}/5 stars
                      </span>
                    </div>
                  </div>
                  
                  {review.status === 'pending' && (
                    <Button
                      onClick={() => handleDeleteReview(review._id)}
                      disabled={deletingReview === review._id}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingReview === review._id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                <p className="text-gray-700 mb-3 leading-relaxed">
                  {review.comment}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    Submitted: {formatDate(review.createdAt)}
                  </span>
                  
                  {review.status === 'approved' && review.approvedAt && (
                    <span>
                      Approved: {formatDate(review.approvedAt)}
                    </span>
                  )}
                </div>

                {/* Status-specific messages */}
                {review.status === 'pending' && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          <strong>Pending Review:</strong> Your review is waiting for admin approval.
                        </p>
                        <p className="text-xs text-yellow-700 mt-1">
                          You can delete this review while it's pending if you want to make changes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {review.status === 'approved' && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      <strong>Approved:</strong> Your review is now visible to other students.
                    </p>
                  </div>
                )}

                {review.status === 'rejected' && review.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-800">
                          <strong>Review Rejected:</strong> {review.rejectionReason}
                        </p>
                        <p className="text-xs text-red-700 mt-1">
                          You can write a new review for this course if you'd like.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
