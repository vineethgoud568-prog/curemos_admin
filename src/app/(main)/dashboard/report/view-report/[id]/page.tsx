'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import ViewPatients from '@/module/report/components/ViewPatients';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="report" action="view">
        <ViewPatients />
      </PermissionGuard>
    </Suspense>
  );
}
