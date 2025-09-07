const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export interface PaymentOrder {
  orderId: string;
  amount: number;
  currency: string;
  course: {
    id: string;
    title: string;
    price: number;
  };
  key: string;
}

export interface PaymentVerification {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  courseId: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId: string;
  enrollmentId: string;
  message: string;
}

export interface PaymentHistory {
  payments: Array<{
    _id: string;
    course: {
      title: string;
      thumbnail?: string;
      price: number;
    };
    amount: number;
    status: string;
    method?: string;
    createdAt: string;
    capturedAt?: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class PaymentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    };
  }

  async createPaymentOrder(courseId: string, couponCode?: string): Promise<PaymentOrder> {
    const token = localStorage.getItem('access_token');
    console.log('paymentService: Token from localStorage:', token ? 'exists' : 'missing');
    
    const response = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        courseId,
        couponCode,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment order');
    }

    return await response.json();
  }

  async verifyPayment(verificationData: PaymentVerification): Promise<PaymentResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/payments/verify`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(verificationData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Payment verification failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw error;
    }
  }

  async getPaymentHistory(page = 1, limit = 10): Promise<PaymentHistory> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/payments/history?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: this.getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch payment history');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
  }

  // Load Razorpay script dynamically
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      const existingScript = document.getElementById('razorpay-script');
      
      if (existingScript) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'razorpay-script';
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      
      document.body.appendChild(script);
    });
  }

  // Initiate Razorpay payment
  async initiatePayment(
    paymentOrder: PaymentOrder,
    onSuccess: (response: any) => void,
    onError: (error: any) => void
  ): Promise<void> {
    try {
      await this.loadRazorpayScript();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency,
        name: 'AlphaAkki LMS',
        description: `Payment for ${paymentOrder.course.title} - ₹${paymentOrder.course.price}`,
        order_id: paymentOrder.orderId,
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            const verificationData: PaymentVerification = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              courseId: paymentOrder.course.id,
            };

            const verificationResult = await this.verifyPayment(verificationData);
            onSuccess(verificationResult);
          } catch (verificationError) {
            onError(verificationError);
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#f97316', // Orange theme
        },
        modal: {
          ondismiss: () => {
            onError(new Error('Payment cancelled by user'));
          },
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      onError(error);
    }
  }
}

export const paymentService = new PaymentService();
