'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import DepartmentAddEditForm from '../components/DepartmentAddEditForm';
import { TDepartmentFormValues } from '../zod/department.schema';

import { useGeTDepartmentById, useUpdateDepartment } from '@/api/hooks/department/hook';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function DepartmentEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: department, isLoading: isDepartmentLoading, error } = useGeTDepartmentById(id);
  const { mutate: updateDepartment, isPending } = useUpdateDepartment();

  const handleSubmit = (data: Partial<TDepartmentFormValues>) => {
    updateDepartment(
      { id, data: data as TDepartmentFormValues },
      {
        onSuccess: () => {
          toast.success('Department updated successfully');
          router.push(ROUTES.department.list);
        },
        onError: (mutationError) => {
          toast.error(mutationError.message || 'Failed to update department');
        },
      },
    );
  };

  if (isDepartmentLoading) {
    return <div className="text-muted-foreground p-4 text-sm">Loading department details...</div>;
  }

  if (error || !department) {
    return (
      <div className="text-destructive p-4 text-sm">{error?.message || 'Patient not found'}</div>
    );
  }

  return (
    <div className="w-full">
      <DepartmentAddEditForm
        title="Edit Department"
        loading={isPending}
        initialData={{
          name: department.name,
          image: department.image as unknown as File,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
