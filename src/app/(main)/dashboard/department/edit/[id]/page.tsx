'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import DepartmentEditPage from '@/module/department/pages/DepartmentEditPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="department" action="edit">
        <DepartmentEditPage />
      </PermissionGuard>
    </Suspense>
  );
}
