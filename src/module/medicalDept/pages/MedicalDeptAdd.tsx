'use client';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import MedicalDeptAddEditForm, { FormValues } from '../components/MedicalDeptAddEditForm';

import { ROUTES } from '@/navigation/sidebar/routes';

// import { BrandService } from '@/api/hooks/brand/hook'; // ❌ Commented for now

const MedicalDeptAdd = () => {
  const router = useRouter();

  // const { mutate: createBrand, isPending } = BrandService.useBrandSave(); ❌
  const isPending = false; // ✅ Static state

  const onSubmit = async (formData: FormValues) => {
    // ✅ Just log for now

    // ✅ Simulate API delay (optional)
    setTimeout(() => {
      toast.success('Support created successfully (static)');
      router.push(ROUTES.medicalDept.list);
    }, 500);

    // ❌ Original API logic (commented)
    /*
    const payload = new FormData();
    payload.append('name', formData.name);
    payload.append('description', formData.description || '');
    if (formData.icon instanceof File) {
      payload.append('icon', formData.icon);
    }

    createBrand(payload, {
      onSuccess: () => {
        toast.success('Support created successfully');
        router.push(ROUTES.medicalDept.list);
      },
    });
    */
  };

  return (
    <MedicalDeptAddEditForm title="Create Support" onSubmit={onSubmit} isPending={isPending} />
  );
};

export default MedicalDeptAdd;
