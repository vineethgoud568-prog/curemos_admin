'use client';

import { TDoctorFormValues, TDoctorMappedFormValues } from '../zod/doctor.schema';

import { createClient } from '@/utils/supabase/client';

const DOCUMENTS_BUCKET = 'documents';
const DOCUMENTS_PATH = 'documents';

const sanitizeFileName = (fileName: string) =>
  fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');

const uploadFileAndGetPublicUrl = async (file: File) => {
  const supabase = createClient();
  const safeName = sanitizeFileName(file.name || 'file');
  const filePath = `${DOCUMENTS_PATH}/${Date.now()}_${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || undefined,
    });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data } = supabase.storage.from(DOCUMENTS_BUCKET).getPublicUrl(filePath);

  return data.publicUrl;
};

const resolveAssetValue = async (value: string | File) => {
  if (value instanceof File) {
    return uploadFileAndGetPublicUrl(value);
  }

  return value.trim();
};

export const resolveDoctorAssetUrls = async (
  values: TDoctorFormValues,
): Promise<TDoctorMappedFormValues> => ({
  ...values,
  medical_license: await resolveAssetValue(values.medical_license),
  avatar_url: await resolveAssetValue(values.avatar_url),
});
