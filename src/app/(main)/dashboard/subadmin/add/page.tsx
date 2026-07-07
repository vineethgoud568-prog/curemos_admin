'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import SubadminAddPage from '@/module/subadmin/pages/SubadminAddPage';

export default function Page() {
  return (
    <Suspense fallback={<div className="flex h-96 items-center justify-center">Loading...</div>}>
      <PermissionGuard module="subadmin" action="add">
        <SubadminAddPage />
      </PermissionGuard>
    </Suspense>
  );
}
