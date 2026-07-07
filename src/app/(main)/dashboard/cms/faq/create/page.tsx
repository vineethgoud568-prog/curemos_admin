'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

import PermissionGuard from '@/components/auth/PermissionGuard';
import FaqAddEditForm from '@/module/faq/components/FaqAddEditForm';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function AddFaqPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PermissionGuard module="faq" action="add">
        <div className="flex-1 space-y-4 p-4 lg:p-6">
          <div className="flex items-center gap-4">
            <Link
              href={ROUTES.faq.list}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
            >
              <ChevronLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">Create New FAQ</h1>
              <p className="text-sm text-slate-500">
                Add a new frequently asked question to the practitioners help center.
              </p>
            </div>
          </div>

          <FaqAddEditForm />
        </div>
      </PermissionGuard>
    </Suspense>
  );
}
