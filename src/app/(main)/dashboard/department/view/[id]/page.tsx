'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import DepartmentViewPage from '@/module/department/pages/DepartmentViewPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="department" action="view">
        <DepartmentViewPage />
      </PermissionGuard>
    </Suspense>
  );
}
