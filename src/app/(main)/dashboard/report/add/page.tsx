'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import ReportAddPage from '@/module/report/pages/ReportAddPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="report" action="add">
        <ReportAddPage />
      </PermissionGuard>
    </Suspense>
  );
}
