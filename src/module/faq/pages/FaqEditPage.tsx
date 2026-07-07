'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { useGetFaqById } from '@/api/hooks/faq/hook';
import FaqAddEditForm from '@/module/faq/components/FaqAddEditForm';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function EditFaqPage({ id }: { id: string }) {
  const { data: faq, isLoading, isError } = useGetFaqById(id);

  if (isError) notFound();

  return (
    <div className="flex-1 space-y-4 p-4 lg:p-6">
      <div className="flex items-center gap-4">
        <Link
          href={ROUTES.faq.list}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 shadow-sm transition-all hover:bg-slate-50 hover:text-slate-900"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit FAQ</h1>
          <p className="text-sm text-slate-500">Update the question, answer, or target audience.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-400">
          Loading FAQ details...
        </div>
      ) : (
        <FaqAddEditForm initialData={faq} isEdit />
      )}
    </div>
  );
}
