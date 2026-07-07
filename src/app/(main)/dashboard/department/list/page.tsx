'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import DepartmentListPage from '@/module/department/pages/DepartmentListPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="department" action="list">
        <DepartmentListPage />
      </PermissionGuard>
    </Suspense>
  );
}
