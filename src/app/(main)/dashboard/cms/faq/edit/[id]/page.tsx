'use client';

import { Suspense, use } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import FaqEditPage from '@/module/faq/pages/FaqEditPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionGuard module="faq" action="edit">
        <FaqEditPage id={id} />
      </PermissionGuard>
    </Suspense>
  );
}
