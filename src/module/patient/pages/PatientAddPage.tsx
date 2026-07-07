'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import PatientAddEditForm from '../components/PatientAddEditForm';
import { TPatientFormValues } from '../zod/patient.schema';

import { useAddPatient } from '@/api/hooks/patient/hooks';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function PatientAddPage() {
  const { mutate: addPatient, isPending } = useAddPatient();
  const router = useRouter();
  const [selectedDoctor, setSelectedDoctor] = useState({
    full_name: '',
    email: '',
  });

  const handleSubmit = (data: Partial<TPatientFormValues>) => {
    addPatient(
      {
        ...(data as TPatientFormValues),
        doctorname: selectedDoctor.full_name,
        doctoremail: selectedDoctor.email,
        gender: data.gender || null,
        address: null,
        current_medications: null,
        allergies: null,
        blood_type: null,
      },
      {
        onSuccess: () => {
          toast.success('Patient added successfully');
          router.push(ROUTES.patient.list);
        },
        onError: (error) => {
          toast.error(error.message || 'Failed to add patient');
        },
      },
    );
  };

  return (
    <div className="w-full">
      <PatientAddEditForm
        title="Add Patient"
        loading={isPending}
        initialData={{}}
        onSubmit={handleSubmit}
        setSelectedDoctor={setSelectedDoctor}
      />
    </div>
  );
}
