'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import DoctorAddEditForm from '../components/DoctorAddEditForm';
import { resolveDoctorAssetUrls } from '../lib/upload-doctor-assets';
import { mapDoctorFormToPayload, TDoctorFormValues } from '../zod/doctor.schema';

import { useAddDoctor } from '@/api/hooks/doctor/hooks';
import { ROUTES } from '@/navigation/sidebar/routes';

export default function DoctorAddPage() {
  const { mutateAsync: addDoctor, isPending } = useAddDoctor();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (data: TDoctorFormValues) => {
    try {
      setIsUploading(true);
      const resolvedValues = await resolveDoctorAssetUrls(data);
      await addDoctor(mapDoctorFormToPayload(resolvedValues));
      toast.success('Doctor added successfully');
      router.push(ROUTES.doctor.list);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save doctor');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <DoctorAddEditForm
        title="Add Doctor"
        loading={isPending || isUploading}
        initialData={undefined}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
