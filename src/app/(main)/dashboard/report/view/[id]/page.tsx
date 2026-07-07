'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import ReportViewPage from '@/module/report/pages/ReportViewPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="report" action="view">
        <ReportViewPage />
      </PermissionGuard>
    </Suspense>
  );
}
