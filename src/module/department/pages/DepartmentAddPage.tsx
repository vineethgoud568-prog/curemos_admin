'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import DepartmentAddEditForm from '../components/DepartmentAddEditForm';
import { TDepartmentFormValues } from '../zod/department.schema';

import { useAddDepartment } from '@/api/hooks/department/hook';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function DepartmentAddPage() {
  const { mutate: addDepartment, isPending } = useAddDepartment();
  const router = useRouter();

  const handleSubmit = (data: TDepartmentFormValues) => {
    addDepartment(data, {
      onSuccess: () => {
        toast.success('Department added successfully');
        router.push(ROUTES.department.list);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add patient');
      },
    });
  };

  return (
    <div className="w-full">
      <DepartmentAddEditForm
        title="Add Department"
        loading={isPending}
        initialData={{}}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
