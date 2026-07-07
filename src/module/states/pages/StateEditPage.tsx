'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import StateAddEditForm from '../components/StateAddEditForm';
import { TStateFormValues } from '../zod/state.schema';

import { useGeTStateById, useUpdateState } from '@/api/hooks/state/hook';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function StateEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: state, isLoading: isStateLoading, error } = useGeTStateById(id);
  const { mutate: updateState, isPending } = useUpdateState();

  const handleSubmit = (data: Partial<TStateFormValues>) => {
    updateState(
      { id, data: data as TStateFormValues },
      {
        onSuccess: () => {
          toast.success('State updated successfully');
          router.push(ROUTES.state.list);
        },
        onError: (mutationError) => {
          toast.error(mutationError.message || 'Failed to update state');
        },
      },
    );
  };

  if (isStateLoading) {
    return <div className="text-muted-foreground p-4 text-sm">Loading state details...</div>;
  }

  if (error || !state) {
    return (
      <div className="text-destructive p-4 text-sm">{error?.message || 'Patient not found'}</div>
    );
  }

  return (
    <div className="w-full">
      <StateAddEditForm
        title="Edit State"
        loading={isPending}
        initialData={{
          name: state.name,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
