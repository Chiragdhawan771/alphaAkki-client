import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Shield, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { SimplifiedCourse } from '@/services/simplifiedCourseService';
import { usePayment } from '@/hooks/usePayment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: SimplifiedCourse;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  course
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const { paymentState, initiatePayment, enrollInFreeCourse } = usePayment();

  const handlePayment = async () => {
    if (course.type === 'free') {
      await enrollInFreeCourse(course._id);
      onClose();
    } else {
      await initiatePayment(course._id, couponCode || undefined);
      // Modal will close automatically after successful payment in the hook
    }
  };

  const applyCoupon = () => {
    if (couponCode.trim()) {
      // TODO: Implement coupon validation
      setAppliedCoupon(couponCode);
      setCouponCode('');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const finalPrice = course.price; // TODO: Apply coupon discount
  const discount = 0; // TODO: Calculate discount

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            {course.type === 'free' ? 'Enroll in Course' : 'Complete Payment'}
          </DialogTitle>
          <DialogDescription>
            {course.type === 'free' 
              ? 'Enroll in this free course to start learning'
              : 'Secure payment powered by Razorpay'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Course Info */}
          <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-16 h-12 object-cover rounded"
              />
            ) : (
              <div className="w-16 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2">{course.title}</h3>
              <p className="text-xs text-gray-500 mt-1">
                by {course?.instructor?.firstName} {course?.instructor?.lastName}
              </p>
              <Badge variant={course.type === 'free' ? 'secondary' : 'default'} className="mt-1">
                {course.type === 'free' ? 'Free' : `₹${course.price}`}
              </Badge>
            </div>
          </div>

          {/* Coupon Code (only for paid courses) */}
          {course.type === 'paid' && (
            <div className="space-y-2">
              <Label htmlFor="coupon">Coupon Code (Optional)</Label>
              {appliedCoupon ? (
                <div className="flex items-center justify-between p-2 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">{appliedCoupon}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removeCoupon}
                    className="text-green-600 hover:text-green-800"
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="coupon"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={applyCoupon}
                    disabled={!couponCode.trim()}
                  >
                    Apply
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Price Breakdown (only for paid courses) */}
          {course.type === 'paid' && (
            <div className="space-y-2">
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Course Price</span>
                  <span>₹{course.price}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Amount</span>
                  <span>₹{finalPrice}</span>
                </div>
              </div>
            </div>
          )}

          {/* Security Info */}
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-blue-50 p-2 rounded">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Secure payment powered by Razorpay. Your data is encrypted and safe.</span>
          </div>

          {/* Error Display */}
          {paymentState.error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
              <AlertCircle className="h-4 w-4" />
              <span>{paymentState.error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={paymentState.isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePayment}
              className="flex-1"
              disabled={paymentState.isProcessing}
            >
              {paymentState.isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {course.type === 'free' ? 'Enrolling...' : 'Processing...'}
                </>
              ) : (
                <>
                  {course.type === 'free' ? (
                    'Enroll Now'
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pay ₹{finalPrice}
                    </>
                  )}
                </>
              )}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>Instant access after payment</span>
            </div>
            <div className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              <span>30-day money-back guarantee</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
