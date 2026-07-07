'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import StateAddPage from '@/module/states/pages/StateAddPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="state" action="add">
        <StateAddPage />
      </PermissionGuard>
    </Suspense>
  );
}
