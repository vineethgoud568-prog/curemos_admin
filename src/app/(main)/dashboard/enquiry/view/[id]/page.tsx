'use client';

import { useParams } from 'next/navigation';
import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import EnquiryDetailPage from '@/module/enquiry/pages/EnquiryDetailPage';

export default function Page() {
  const params = useParams();
  const id = params?.id as string;

  return (
    <Suspense>
      <PermissionGuard module="enquiry" action="view">
        <EnquiryDetailPage id={id} />
      </PermissionGuard>
    </Suspense>
  );
}
