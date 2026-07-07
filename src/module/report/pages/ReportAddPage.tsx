'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import ReportAddEditForm from '../components/ReportAddEditForm';
import { TReportFormValues } from '../zod/report.schema';

import { useAddReport } from '@/api/hooks/report/hooks';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function ReportAddPage() {
  const { mutate: addReport, isPending } = useAddReport();
  const router = useRouter();

  const handleSubmit = (data: Partial<TReportFormValues>) => {
    addReport(data as TReportFormValues, {
      onSuccess: () => {
        toast.success('Report added successfully');
        router.push(ROUTES.report.list);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add patient');
      },
    });
  };

  return (
    <div className="w-full">
      <ReportAddEditForm
        title="Add Report"
        loading={isPending}
        initialData={{}}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
