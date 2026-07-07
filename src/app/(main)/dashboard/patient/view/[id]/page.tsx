'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import PatientViewPage from '@/module/patient/pages/PatientViewPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="patient" action="view">
        <PatientViewPage />
      </PermissionGuard>
    </Suspense>
  );
}
