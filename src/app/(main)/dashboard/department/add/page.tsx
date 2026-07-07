'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import DepartmentAddPage from '@/module/department/pages/DepartmentAddPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="department" action="add">
        <DepartmentAddPage />
      </PermissionGuard>
    </Suspense>
  );
}
