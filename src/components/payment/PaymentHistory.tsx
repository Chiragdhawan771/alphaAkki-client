import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CreditCard, Calendar, Download, RefreshCw, AlertCircle } from 'lucide-react';
import { paymentService, PaymentHistory as PaymentHistoryType } from '@/services/paymentService';

export const PaymentHistory: React.FC = () => {
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPaymentHistory = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      const history = await paymentService.getPaymentHistory(page, 10);
      setPaymentHistory(history);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentHistory();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'captured':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'created':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number) => {
    return `₹${(amount / 100).toFixed(2)}`;
  };

  if (loading && !paymentHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
          <Button 
            onClick={() => fetchPaymentHistory(currentPage)} 
            variant="outline" 
            className="w-full mt-4"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!paymentHistory?.payments.length ? (
          <div className="text-center py-8 text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No payment history found</p>
            <p className="text-sm">Your course purchases will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentHistory.payments.map((payment) => (
              <div key={payment._id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-sm line-clamp-2">
                      {payment.course.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                      {payment.method && (
                        <span className="text-xs text-gray-500 capitalize">
                          via {payment.method}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatAmount(payment.amount)}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(payment.createdAt)}
                    </div>
                  </div>
                </div>
                
                {payment.capturedAt && (
                  <div className="text-xs text-gray-500">
                    Completed: {formatDate(payment.capturedAt)}
                  </div>
                )}
                
                <Separator className="my-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    Payment ID: {payment._id.slice(-8)}
                  </span>
                  {payment.status === 'captured' && (
                    <Button variant="ghost" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Receipt
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Pagination */}
            {paymentHistory.pagination.pages > 1 && (
              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPaymentHistory(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-500">
                  Page {paymentHistory.pagination.page} of {paymentHistory.pagination.pages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchPaymentHistory(currentPage + 1)}
                  disabled={currentPage === paymentHistory.pagination.pages || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
