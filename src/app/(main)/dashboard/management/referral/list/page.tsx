'use client';

import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import ReferralListPage from '@/module/referral/pages/ReferralListPage';

// export const metadata = {
//   title: 'Referrals | Curemos Admin',
// };

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionGuard module="referral" action="list">
        <ReferralListPage />
      </PermissionGuard>
    </Suspense>
  );
}
