'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import PatientAddPage from '@/module/patient/pages/PatientAddPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="patient" action="add">
        <PatientAddPage />
      </PermissionGuard>
    </Suspense>
  );
}
