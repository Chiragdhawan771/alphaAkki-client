"use client";

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User } from 'lucide-react';
import { Review } from '@/services/reviewService';

interface ReviewListProps {
  reviews: Review[];
  loading?: boolean;
  showStatus?: boolean; // For admin view
}

export default function ReviewList({ reviews, loading = false, showStatus = false }: ReviewListProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reviews Yet</h3>
          <p className="text-gray-600">
            {showStatus 
              ? "No reviews found matching your criteria."
              : "Be the first to share your experience with this course!"
            }
          </p>
        </CardContent>
      </Card>
    );
  }

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

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review._id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {/* Avatar */}
              <div className="w-10 h-10 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 text-white" />
              </div>

              {/* Review Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <h4 className="font-semibold text-gray-900">
                      {review.student.firstName} {review.student.lastName}
                    </h4>
                    {showStatus && (
                      <Badge className={getStatusColor(review.status)}>
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
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
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                {/* Review Comment */}
                <p className="text-gray-700 mb-3 leading-relaxed">
                  {review.comment}
                </p>

                {/* Review Meta */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {formatDate(review.createdAt)}
                  </span>
                  
                  {showStatus && review.status === 'approved' && review.approvedBy && (
                    <span>
                      Approved by {review.approvedBy.firstName} {review.approvedBy.lastName}
                    </span>
                  )}
                </div>

                {/* Rejection Reason */}
                {showStatus && review.status === 'rejected' && review.rejectionReason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">
                      <strong>Rejection Reason:</strong> {review.rejectionReason}
                    </p>
                  </div>
                )}

                {/* Course Info (for user's own reviews) */}
                {showStatus && review.course && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Course:</strong> {review.course.title}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
