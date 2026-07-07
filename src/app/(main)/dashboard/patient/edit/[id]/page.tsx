'use client';
import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import PatientEditPage from '@/module/patient/pages/PatientEditPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="patient" action="edit">
        <PatientEditPage />
      </PermissionGuard>
    </Suspense>
  );
}
