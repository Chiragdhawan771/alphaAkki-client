"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Star, 
  User, 
  Check, 
  X, 
  Clock, 
  Filter,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { reviewService, Review } from '@/services/reviewService';
import { useToast } from '@/hooks/use-toast';

export default function AdminReviewManager() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [processingReviews, setProcessingReviews] = useState<Set<string>>(new Set());
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchReviews = async (status?: string, page = 1) => {
    try {
      setLoading(true);
      const response = await reviewService.getAllReviews(status, page, 10);
      setReviews(response.reviews);
      setCurrentPage(response.page);
      setTotalPages(response.totalPages);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to fetch reviews. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const status = activeTab === 'all' ? undefined : activeTab;
    fetchReviews(status, 1);
    setCurrentPage(1);
  }, [activeTab]);

  const handleApprove = async (reviewId: string) => {
    try {
      setProcessingReviews(prev => new Set(prev).add(reviewId));
      await reviewService.updateReviewStatus(reviewId, { status: 'approved' });
      
      toast({
        title: "Review Approved",
        description: "The review has been approved and is now visible to users.",
      });
      
      // Refresh the current view
      const status = activeTab === 'all' ? undefined : activeTab;
      fetchReviews(status, currentPage);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to approve review.",
        variant: "destructive",
      });
    } finally {
      setProcessingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
    }
  };

  const handleReject = async (reviewId: string) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Rejection Reason Required",
        description: "Please provide a reason for rejecting this review.",
        variant: "destructive",
      });
      return;
    }

    try {
      setProcessingReviews(prev => new Set(prev).add(reviewId));
      await reviewService.updateReviewStatus(reviewId, { 
        status: 'rejected',
        rejectionReason: rejectionReason.trim()
      });
      
      toast({
        title: "Review Rejected",
        description: "The review has been rejected with the provided reason.",
      });
      
      // Reset rejection form
      setShowRejectionForm(null);
      setRejectionReason('');
      
      // Refresh the current view
      const status = activeTab === 'all' ? undefined : activeTab;
      fetchReviews(status, currentPage);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to reject review.",
        variant: "destructive",
      });
    } finally {
      setProcessingReviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(reviewId);
        return newSet;
      });
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage: number) => {
    const status = activeTab === 'all' ? undefined : activeTab;
    fetchReviews(status, newPage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Review Management</h2>
          <p className="text-gray-600">Manage and moderate course reviews</p>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-500">Filter by status</span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <Check className="h-4 w-4" />
            <span>Approved</span>
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center space-x-2">
            <X className="h-4 w-4" />
            <span>Rejected</span>
          </TabsTrigger>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {loading ? (
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
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No {activeTab === 'all' ? '' : activeTab} Reviews
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'pending' 
                    ? "No reviews are currently pending approval."
                    : `No ${activeTab} reviews found.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
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
                            <Badge className={getStatusColor(review.status)}>
                              {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                            </Badge>
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

                        {/* Course Info */}
                        <div className="mb-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                          <p className="text-sm text-gray-700">
                            <strong>Course:</strong> {review.course.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Student: {review.student.email}
                          </p>
                        </div>

                        {/* Review Comment */}
                        <p className="text-gray-700 mb-3 leading-relaxed">
                          {review.comment}
                        </p>

                        {/* Review Meta */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>
                            Submitted: {formatDate(review.createdAt)}
                          </span>
                          
                          {review.status === 'approved' && review.approvedBy && (
                            <span>
                              Approved by {review.approvedBy.firstName} {review.approvedBy.lastName}
                            </span>
                          )}
                        </div>

                        {/* Rejection Reason */}
                        {review.status === 'rejected' && review.rejectionReason && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-800">
                              <strong>Rejection Reason:</strong> {review.rejectionReason}
                            </p>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {review.status === 'pending' && (
                          <div className="flex items-center space-x-3">
                            <Button
                              onClick={() => handleApprove(review._id)}
                              disabled={processingReviews.has(review._id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                              size="sm"
                            >
                              {processingReviews.has(review._id) ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              <span className="ml-1">Approve</span>
                            </Button>
                            
                            <Button
                              onClick={() => setShowRejectionForm(review._id)}
                              disabled={processingReviews.has(review._id)}
                              variant="destructive"
                              size="sm"
                            >
                              <X className="h-4 w-4" />
                              <span className="ml-1">Reject</span>
                            </Button>
                          </div>
                        )}

                        {/* Rejection Form */}
                        {showRejectionForm === review._id && (
                          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <label className="block text-sm font-medium text-red-800 mb-2">
                              Rejection Reason *
                            </label>
                            <Textarea
                              value={rejectionReason}
                              onChange={(e) => setRejectionReason(e.target.value)}
                              placeholder="Please provide a clear reason for rejecting this review..."
                              className="mb-3"
                              maxLength={500}
                            />
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => handleReject(review._id)}
                                disabled={processingReviews.has(review._id) || !rejectionReason.trim()}
                                variant="destructive"
                                size="sm"
                              >
                                {processingReviews.has(review._id) ? (
                                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                                ) : null}
                                Confirm Rejection
                              </Button>
                              <Button
                                onClick={() => {
                                  setShowRejectionForm(null);
                                  setRejectionReason('');
                                }}
                                variant="outline"
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-6">
                  <Button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    variant="outline"
                    size="sm"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <Button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    variant="outline"
                    size="sm"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
