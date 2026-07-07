'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import EnquiryListPage from '@/module/enquiry/pages/EnquiryListPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="enquiry" action="list">
        <EnquiryListPage />
      </PermissionGuard>
    </Suspense>
  );
}
