'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import SubAdminListPage from '@/module/subadmin/pages/SubadminListPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center">Loading...</div>}>
      <PermissionGuard module="subadmin" action="list">
        <SubAdminListPage />
      </PermissionGuard>
    </Suspense>
  );
}
