'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import ReportAddEditForm from '../components/ReportAddEditForm';
import { TReportFormValues } from '../zod/report.schema';

import { useGetReportById, useUpdateReport } from '@/api/hooks/report/hooks';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function ReportEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: report, isLoading: isReportLoading, error } = useGetReportById(id);
  const { mutate: updateReport, isPending } = useUpdateReport();

  const handleSubmit = (data: Partial<TReportFormValues>) => {
    updateReport(
      { id, data: data as TReportFormValues },
      {
        onSuccess: () => {
          toast.success('Report updated successfully');
          router.push(ROUTES.report.list);
        },
        onError: (mutationError) => {
          toast.error(mutationError.message || 'Failed to update report');
        },
      },
    );
  };

  if (isReportLoading) {
    return <div className="text-muted-foreground p-4 text-sm">Loading report details...</div>;
  }

  if (error || !report) {
    return (
      <div className="text-destructive p-4 text-sm">{error?.message || 'Patient not found'}</div>
    );
  }

  return (
    <div className="w-full">
      <ReportAddEditForm
        title="Edit Report"
        loading={isPending}
        initialData={{
          title: report.title,
          type: report.type,
          associated_user: report.associated_user || '',
          report: report.report,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
