'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import StateEditPage from '@/module/states/pages/StateEditPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="state" action="edit">
        <StateEditPage />
      </PermissionGuard>
    </Suspense>
  );
}
