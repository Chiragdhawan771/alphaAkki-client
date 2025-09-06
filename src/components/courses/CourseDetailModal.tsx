import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Star, 
  Clock, 
  Users, 
  BookOpen, 
  Play, 
  Award, 
  CheckCircle,
  MessageSquare,
  ThumbsUp
} from 'lucide-react';
import simplifiedCourseService, { SimplifiedCourse } from '@/services/simplifiedCourseService';

interface CourseDetailModalProps {
  course: SimplifiedCourse | null;
  isOpen: boolean;
  onClose: () => void;
  onEnroll: (courseId: string) => void;
  isEnrolled: boolean;
}

interface Review {
  _id: string;
  student: {
    firstName: string;
    lastName: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}

const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  isOpen,
  onClose,
  onEnroll,
  isEnrolled
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (course && isOpen) {
      fetchReviews();
    }
  }, [course, isOpen]);

  const fetchReviews = async () => {
    if (!course) return;
    
    try {
      setReviewsLoading(true);
      const response = await simplifiedCourseService.getCourseReviews(course._id);
      setReviews(response.reviews || []);
    } catch (error: any) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!course) return;

    try {
      await simplifiedCourseService.createReview(course._id, newReview);
      toast({
        title: "Review Submitted",
        description: "Your review has been submitted for approval"
      });
      setShowReviewForm(false);
      setNewReview({ rating: 5, comment: '' });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit review",
        variant: "destructive"
      });
    }
  };

  const renderStars = (rating: number, size = 'sm') => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'} ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (!course) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{course.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Course Header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Course Image */}
            <div className="md:col-span-1">
              {course.thumbnail ? (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full aspect-video object-cover rounded-lg"
                />
              ) : (
                <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-12 w-12 text-gray-400" />
                </div>
              )}
              
              {/* Preview Video */}
              {course.previewVideo && (
                <div className="mt-4">
                  <video
                    controls
                    className="w-full rounded-lg"
                    src={course.previewVideo}
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="md:col-span-2 space-y-4">
              {/* Price and Rating */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Badge variant={course.type === 'free' ? 'secondary' : 'default'} className="text-lg px-3 py-1">
                    {course.type === 'free' ? 'Free' : `$${course.price}`}
                  </Badge>
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.round(course.averageRating))}
                    <span className="font-medium text-sm ml-1">
                      {course.averageRating > 0 ? course.averageRating.toFixed(1) : 'No ratings'}
                    </span>
                    {course.totalReviews > 0 && (
                      <span className="text-sm text-gray-500">({course.totalReviews} reviews)</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Short Description */}
              {course.shortDescription && (
                <p className="text-gray-700 text-lg">{course.shortDescription}</p>
              )}

              {/* Course Stats */}
              <div className="grid grid-cols-3 gap-4 py-4 border-y">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">{course.estimatedDuration || 0}h</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Duration</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-gray-600">
                    <Users className="h-4 w-4" />
                    <span className="font-medium">{course.enrollmentCount}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Students</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-1 text-gray-600">
                    <Award className="h-4 w-4" />
                    <span className="font-medium">Certificate</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Included</p>
                </div>
              </div>

              {/* Enroll Button */}
              <div className="flex space-x-3">
                {isEnrolled ? (
                  <Button className="flex-1" variant="outline" disabled>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Enrolled
                  </Button>
                ) : (
                  <Button className="flex-1" onClick={() => onEnroll(course._id)}>
                    Enroll Now
                  </Button>
                )}
                {isEnrolled && !showReviewForm && (
                  <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Write Review
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Course Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">About This Course</h3>
            <p className="text-gray-700 leading-relaxed">{course.description}</p>
          </div>

          {/* Learning Outcomes */}
          {course.learningOutcomes && course.learningOutcomes.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">What You'll Learn</h3>
              <ul className="space-y-2">
                {course.learningOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Prerequisites</h3>
              <ul className="space-y-2">
                {course.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <BookOpen className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {course.tags && course.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Instructor */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Instructor</h3>
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-semibold">
                {course.instructor.firstName[0]}{course.instructor.lastName[0]}
              </div>
              <div>
                <p className="font-medium">{course.instructor.firstName} {course.instructor.lastName}</p>
                <p className="text-sm text-gray-500">{course.instructor.email}</p>
              </div>
            </div>
          </div>

          {/* Review Form */}
          {showReviewForm && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setNewReview({ ...newReview, rating: i + 1 })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-6 w-6 ${
                            i < newReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Comment</label>
                  <Textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your experience with this course..."
                    rows={4}
                  />
                </div>
                <div className="flex space-x-3">
                  <Button onClick={handleSubmitReview}>Submit Review</Button>
                  <Button variant="outline" onClick={() => setShowReviewForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Reviews */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Reviews</h3>
            {reviewsLoading ? (
              <div className="text-center py-4">Loading reviews...</div>
            ) : reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review._id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {review.student.firstName[0]}{review.student.lastName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {review.student.firstName} {review.student.lastName}
                          </p>
                          <div className="flex items-center space-x-1">
                            {renderStars(review.rating)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No reviews yet</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseDetailModal;
