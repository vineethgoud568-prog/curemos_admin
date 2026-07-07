'use client';
import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import DoctorListPage from '@/module/doctor/pages/DoctorListPage';

export default function Page() {
  return (
    <Suspense>
      <PermissionGuard module="doctor" action="list">
        <DoctorListPage />
      </PermissionGuard>
    </Suspense>
  );
}
