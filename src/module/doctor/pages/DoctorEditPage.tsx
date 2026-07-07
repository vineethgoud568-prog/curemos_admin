'use client';

import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import DoctorAddEditForm from '../components/DoctorAddEditForm';
import { resolveDoctorAssetUrls } from '../lib/upload-doctor-assets';
import { mapDoctorFormToPayload, TDoctorFormValues } from '../zod/doctor.schema';

import { useGetDoctorById, useUpdateDoctor } from '@/api/hooks/doctor/hooks';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function DoctorEditPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const { data: doctor, isLoading: isDoctorLoading, error } = useGetDoctorById(id);
  const { mutateAsync: updateDoctor, isPending } = useUpdateDoctor();

  const initialData = useMemo(() => {
    if (!doctor) return undefined;

    return {
      full_name: doctor.full_name || '',
      professional_name: doctor.professional_name || '',
      short_professional_bio: doctor.short_professional_bio || '',
      email: doctor.email || '',
      phone: doctor.phone || '',
      role: doctor.role,
      department_id: doctor.department?.id || doctor.department_id || '',
      secondary_contact: doctor.secondary_contact || '',
      hospital_name: doctor.hospital_name || '',
      medical_license_number: doctor.medical_license_number || '',
      location: doctor.location || '',
      country: doctor.country || 'India',
      state: doctor.state || '',
      district: doctor.district || '',
      pincode: doctor.pincode || '',
      hospital_affiliation: doctor.hospital_affiliation || '',
      years_of_experience: doctor.years_of_experience?.toString() || '',
      nmc_registration_year: doctor.nmc_registration_year?.toString() || '',
      state_medical_council: doctor.state_medical_council || '',
      medical_license: doctor.medical_license || '',
      avatar_url: doctor.avatar_url || '',
      specialization: doctor.specialization || '',
      specializations: doctor.specializations || [],
      department_name: doctor.department?.name || '',
    };
  }, [doctor]);

  const handleSubmit = async (data: TDoctorFormValues) => {
    try {
      setIsUploading(true);
      const resolvedValues = await resolveDoctorAssetUrls(data);
      await updateDoctor({ id, data: mapDoctorFormToPayload(resolvedValues) });
      toast.success('Doctor updated successfully');
      router.push(ROUTES.doctor.list);
    } catch (mutationError) {
      toast.error(
        mutationError instanceof Error ? mutationError.message : 'Failed to update doctor',
      );
    } finally {
      setIsUploading(false);
    }
  };

  if (isDoctorLoading) {
    return <div className="text-muted-foreground p-4 text-sm">Loading doctor details...</div>;
  }

  if (error || !doctor) {
    return (
      <div className="text-destructive p-4 text-sm">{error?.message || 'Doctor not found'}</div>
    );
  }

  return (
    <div className="w-full">
      <DoctorAddEditForm
        title="Edit Doctor"
        loading={isPending || isUploading}
        initialData={initialData}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
