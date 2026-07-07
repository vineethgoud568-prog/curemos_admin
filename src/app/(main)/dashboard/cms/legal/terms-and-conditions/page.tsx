'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import TermsAndConditionsPage from '@/module/legalPages/pages/TermsAndConditionsPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="terms-and-conditions" action="edit">
        <TermsAndConditionsPage />
      </PermissionGuard>
    </Suspense>
  );
}
