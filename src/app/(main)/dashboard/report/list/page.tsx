'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import ReportListPage from '@/module/report/pages/ReportListPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="report" action="list">
        <ReportListPage />
      </PermissionGuard>
    </Suspense>
  );
}
