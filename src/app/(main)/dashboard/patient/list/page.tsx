'use client';
import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import PatientListPage from '@/module/patient/pages/PatientListPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="patient" action="list">
        <PatientListPage />
      </PermissionGuard>
    </Suspense>
  );
}
