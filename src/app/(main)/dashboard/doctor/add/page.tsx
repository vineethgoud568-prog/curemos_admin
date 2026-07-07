'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import DoctorAddPage from '@/module/doctor/pages/DoctorAddPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="doctor" action="add">
        <DoctorAddPage />
      </PermissionGuard>
    </Suspense>
  );
}
