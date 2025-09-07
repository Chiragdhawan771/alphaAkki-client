import { useState } from 'react';
import { paymentService, PaymentOrder, PaymentVerification } from '@/services/paymentService';
import { enrollmentService } from '@/services/enrollmentService';
import { toast } from '@/hooks/use-toast';

export interface PaymentState {
  isProcessing: boolean;
  error: string | null;
  success: boolean;
}

export const usePayment = () => {
  const [paymentState, setPaymentState] = useState<PaymentState>({
    isProcessing: false,
    error: null,
    success: false,
  });

  const initiatePayment = async (courseId: string, couponCode?: string) => {
    try {
      console.log('usePayment: initiatePayment called for courseId:', courseId);
      setPaymentState({
        isProcessing: true,
        error: null,
        success: false,
      });

      // Create payment order
      console.log('usePayment: Creating payment order...');
      
      // Check if user is logged in
      const token = localStorage.getItem('access_token');
      console.log('usePayment: Token check:', token ? 'Token exists' : 'No token found');
      
      if (!token) {
        throw new Error('Please log in to enroll in courses');
      }
      
      const paymentOrder = await paymentService.createPaymentOrder(courseId, couponCode);
      console.log('usePayment: Payment order created:', paymentOrder);

      // Initiate Razorpay payment
      console.log('usePayment: Initiating Razorpay payment...');
      await paymentService.initiatePayment(
        paymentOrder,
        async (verificationResult) => {
          console.log('usePayment: Payment verification completed:', verificationResult);
          
          setPaymentState({
            isProcessing: false,
            error: null,
            success: true,
          });

          // Show success toast
          toast({
            title: "Payment Successful!",
            description: `${verificationResult.message}. You are now enrolled in the course.`,
            variant: "default"
          });
          
          // Refresh page after short delay to show toast
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        },
        (error: any) => {
          console.error('usePayment: Payment failed:', error);
          const errorMessage = error instanceof Error ? error.message : 'Payment failed';
          
          toast({
            title: "Payment Failed",
            description: errorMessage,
            variant: "destructive"
          });
          
          setPaymentState({
            isProcessing: false,
            error: errorMessage,
            success: false,
          });
        }
      );
    } catch (error) {
      console.error('usePayment: Error initiating payment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment';
      
      toast({
        title: "Payment Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      setPaymentState({
        isProcessing: false,
        error: errorMessage,
        success: false,
      });
    }
  };

  const enrollInFreeCourse = async (courseId: string) => {
    try {
      setPaymentState({
        isProcessing: true,
        error: null,
        success: false,
      });

      await enrollmentService.enrollInCourse(courseId);

      setPaymentState({
        isProcessing: false,
        error: null,
        success: true,
      });

      toast({
        title: "Enrollment Successful!",
        description: "You have been successfully enrolled in the free course.",
        variant: "default"
      });
      
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Error enrolling in free course:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to enroll in course';
      
      toast({
        title: "Enrollment Failed",
        description: errorMessage,
        variant: "destructive"
      });
      
      setPaymentState({
        isProcessing: false,
        error: errorMessage,
        success: false,
      });
    }
  };

  const resetPaymentState = () => {
    setPaymentState({
      isProcessing: false,
      error: null,
      success: false,
    });
  };

  return {
    paymentState,
    initiatePayment,
    enrollInFreeCourse,
    resetPaymentState,
  };
};
