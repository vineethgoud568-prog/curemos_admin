'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import StateListPage from '@/module/states/pages/StateListPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="state" action="list">
        <StateListPage />
      </PermissionGuard>
    </Suspense>
  );
}
