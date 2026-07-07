'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import ContactEditPage from '@/module/contact/pages/ContactEditPage';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionGuard module="contact" action="edit">
        <ContactEditPage />
      </PermissionGuard>
    </Suspense>
  );
}
