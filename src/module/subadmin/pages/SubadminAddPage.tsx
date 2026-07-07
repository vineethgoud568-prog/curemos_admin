'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import SubadminAddEditForm from '../components/SubAdminAddEditForm';
import { TSubadminFormValues } from '../zod/subadmin.schema';

import { useAddSubadmin } from '@/api/hooks/subadmin/hooks';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function SubadminAddPage() {
  const { mutate: addSubadmin, isPending } = useAddSubadmin();
  const router = useRouter();

  const handleSubmit = (data: TSubadminFormValues) => {
    addSubadmin(data, {
      onSuccess: () => {
        toast.success('Subadmin added successfully');
        router.push(ROUTES.subadmin.list);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add patient');
      },
    });
  };

  return (
    <div className="w-full">
      <SubadminAddEditForm
        title="Add Subadmin"
        loading={isPending}
        initialData={{}}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
