'use client';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import MedicalDeptAddEditForm, { FormValues } from '../components/MedicalDeptAddEditForm';

import { ROUTES } from '@/navigation/sidebar/routes';

// import { BrandService } from '@/api/hooks/brand/hook'; ❌ API disabled

const MedicalDeptEdit = () => {
  const params = useParams();
  const id = params?.id;
  const router = useRouter();

  // ❌ API removed
  // const { data, isLoading } = BrandService.useGetBrand(id as string);
  // const { mutate: updateBrand, isPending } = BrandService.useBrandUpdate();

  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);

  // ✅ Mock initial data (simulate API response)
  const [initialData, setInitialData] = useState({
    name: '',
    description: '',
    icon: '',
  });

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setInitialData({
        name: 'Cardiology',
        description: 'Heart related department',
        icon: '', // can put image URL if needed
      });
      setIsLoading(false);
    }, 500);
  }, [id]);

  const onSubmit = (formData: FormValues) => {
    setIsPending(true);

    // Simulate API update
    setTimeout(() => {
      setIsPending(false);
      toast.success('Support updated successfully (static)');
      router.push(ROUTES.medicalDept.list);
    }, 700);

    // ❌ Original API logic (commented)
    /*
    const formPayload = new FormData();
    formPayload.append('name', formData.name);
    formPayload.append('description', formData.description);

    if (formData.icon instanceof File) {
      formPayload.append('icon', formData.icon);
    } else if (typeof formData.icon === 'string') {
      formPayload.append('icon', formData.icon);
    }

    updateBrand(
      {
        id: id as string,
        data: formPayload,
      },
      {
        onSuccess: () => {
          toast.success('Brand updated successfully');
          router.push(ROUTES.medicalDept.list);
        },
      }
    );
    */
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <MedicalDeptAddEditForm
      title="Update Support"
      isPending={isPending}
      initialData={initialData}
      onSubmit={onSubmit}
    />
  );
};

export default MedicalDeptEdit;
