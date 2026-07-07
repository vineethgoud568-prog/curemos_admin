'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import DoctorViewPage from '@/module/doctor/pages/DoctorViewPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="doctor" action="view">
        <DoctorViewPage />
      </PermissionGuard>
    </Suspense>
  );
}
