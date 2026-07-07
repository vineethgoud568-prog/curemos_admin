'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import StateAddEditForm from '../components/StateAddEditForm';
import { TStateFormValues } from '../zod/state.schema';

import { useAddState } from '@/api/hooks/state/hook';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function StateAddPage() {
  const { mutate: addState, isPending } = useAddState();
  const router = useRouter();

  const handleSubmit = (data: TStateFormValues) => {
    addState(data, {
      onSuccess: () => {
        toast.success('State added successfully');
        router.push(ROUTES.state.list);
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to add patient');
      },
    });
  };

  return (
    <div className="w-full">
      <StateAddEditForm
        title="Add State"
        loading={isPending}
        initialData={{}}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
