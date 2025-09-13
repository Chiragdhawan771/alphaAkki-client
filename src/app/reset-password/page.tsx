'use client';

import { Suspense } from 'react';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

function ResetPasswordContent() {
  return <ResetPasswordForm />;
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
