'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import PrivacyPolicyPage from '@/module/legalPages/pages/PrivacyPolicyPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="privacy-policy" action="edit">
        <PrivacyPolicyPage />
      </PermissionGuard>
    </Suspense>
  );
}
