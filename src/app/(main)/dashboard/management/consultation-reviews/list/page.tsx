'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import ConsultationReviewListPage from '@/module/consultationReview/pages/ConsultationReviewListPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionGuard module="consultation-review" action="list">
        <ConsultationReviewListPage />
      </PermissionGuard>
    </Suspense>
  );
}
