'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import ContactEditForm from '../components/ContactEditForm';
import { TContactFormValues } from '../zod/contact.schema';

import { useGetContact, useUpdateContact } from '@/api/hooks/contact/hook';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function ContactEditPage() {
  const router = useRouter();

  const { data, isLoading: isContactLoading, error } = useGetContact();
  const id = data?.data?.[0]?.id as string;
  const contact = data?.data?.[0];

  // const { data: contact, isLoading: isContactLoading, error } = useGetContactById();
  const { mutate: updateContact, isPending } = useUpdateContact();

  const handleSubmit = (data: Partial<TContactFormValues>) => {
    updateContact(
      { id, data: data as TContactFormValues },
      {
        onSuccess: () => {
          toast.success('Contact updated successfully');
          router.push(ROUTES.contact);
        },
        onError: (mutationError) => {
          toast.error(mutationError.message || 'Failed to update contact');
        },
      },
    );
  };

  if (isContactLoading) {
    return <div className="text-muted-foreground p-4 text-sm">Loading contact details...</div>;
  }

  if (error || !contact) {
    return (
      <div className="text-destructive p-4 text-sm">{error?.message || 'Contact not found'}</div>
    );
  }

  return (
    <div className="w-full">
      <ContactEditForm
        title="Edit Contact"
        loading={isPending}
        initialData={{
          email: contact.email,
          phone: contact.phone,
          address: contact.address,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
