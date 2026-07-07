'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import FaqListPage from '@/module/faq/pages/FaqListPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="faq" action="list">
        <FaqListPage />
      </PermissionGuard>
    </Suspense>
  );
}
