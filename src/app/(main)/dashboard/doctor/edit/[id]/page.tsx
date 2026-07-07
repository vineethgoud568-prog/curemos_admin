'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import DoctorEditPage from '@/module/doctor/pages/DoctorEditPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="doctor" action="edit">
        <DoctorEditPage />
      </PermissionGuard>
    </Suspense>
  );
}
