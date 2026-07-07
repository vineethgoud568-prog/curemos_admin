'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import PatientAddEditForm from '../components/PatientAddEditForm';
import { TPatientFormValues } from '../zod/patient.schema';

import { useGetPatientById, useUpdatePatient } from '@/api/hooks/patient/hooks';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function PatientEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const { data: patient, isLoading: isPatientLoading, error } = useGetPatientById(id);
  const { mutate: updatePatient, isPending } = useUpdatePatient();

  const handleSubmit = (data: Partial<TPatientFormValues>) => {
    updatePatient(
      {
        id,
        data: {
          ...(data as TPatientFormValues),
          gender: data.gender || null,
          address: null,
          current_medications: null,
          allergies: null,
          blood_type: null,
        },
      },
      {
        onSuccess: () => {
          toast.success('Patient updated successfully');
          router.push(ROUTES.patient.list);
        },
        onError: (mutationError) => {
          toast.error(mutationError.message || 'Failed to update patient');
        },
      },
    );
  };

  if (isPatientLoading) {
    return <div className="text-muted-foreground p-4 text-sm">Loading patient details...</div>;
  }

  if (error || !patient) {
    return (
      <div className="text-destructive p-4 text-sm">{error?.message || 'Patient not found'}</div>
    );
  }

  return (
    <div className="w-full">
      <PatientAddEditForm
        title="Edit Patient"
        loading={isPending}
        initialData={{
          full_name: patient.full_name,
          age: patient.age || '',
          gender: patient.gender || '',
          phone: patient.phone || '',
          email: patient.email || '',
          medical_history: patient.medical_history || '',
          doctor_a_id: patient.doctor_a_id,
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
