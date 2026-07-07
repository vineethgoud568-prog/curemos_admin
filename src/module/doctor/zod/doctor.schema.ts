import { z } from 'zod';

import { TDoctorPayload } from '@/api/hooks/doctor/schema';
import { validationSchemas } from '@/lib/validation';

const fileOrUrlSchema = z.custom<string | File>(
  (value) => value === undefined || typeof value === 'string' || value instanceof File,
  {
    message: 'Invalid file value',
  },
);

export const doctorFormSchema = z.object({
  professional_name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .regex(/^[a-zA-Z\s.'-]*$/, 'Name contains invalid characters'),
  full_name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .regex(/^[a-zA-Z\s.'-]*$/, 'Name contains invalid characters'),

  short_professional_bio: z
    .string()
    .trim()
    .min(2, 'Bio must be at least 2 characters')
    .max(250, 'Bio is too long'),
  role: validationSchemas.requiredSelect('Role'),
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number must be at most 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  department_id: validationSchemas.optionalText,
  hospital_name: z.string().trim().min(1, 'Hospital/Clinic name is required'),
  medical_license_number: z
    .string()
    .trim()
    .min(1, 'Registration/Medical License number is required'),
  location: z.string().trim().min(2, 'Address must be at least 2 characters'),
  country: validationSchemas.optionalText,
  state: z.string().trim().min(1, 'State is required'),
  district: z.string().trim().min(1, 'District is required'),
  pincode: z
    .string()
    .trim()
    .min(6, 'Pincode must be at least 6 digits')
    .max(6, 'Pincode must be at most 6 digits'),
  hospital_affiliation: z.string().trim().optional(),
  years_of_experience: z
    .string()
    .trim()
    .min(1, 'Years of experience is required')
    .regex(/^\d+(\.\d)?$/, 'Years of experience must be a number with at most 1 decimal place'),
  nmc_registration_year: z
    .string()
    .trim()
    .min(1, 'Year of Registration is required')
    .length(4, 'Year must be exactly 4 digits')
    .regex(/^\d{4}$/, 'Year must be a 4-digit number'),
  state_medical_council: z.string().trim().min(1, 'State Medical Council is required'),
  medical_license: fileOrUrlSchema,
  avatar_url: fileOrUrlSchema,
  specialization: validationSchemas.optionalText,
  specializations: z.array(z.string()).min(1, 'Department is required'),
  department_name: z.string().optional(),
});
// .superRefine((values, ctx) => {
//   if (values.role === 'doctor_a' && !values.department_id.trim()) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Department is required',
//       path: ['specializations'],
//     });
//   }

//   if (
//     values.role === 'doctor_b' &&
//     (!values.specializations || values.specializations.length === 0)
//   ) {
//     ctx.addIssue({
//       code: z.ZodIssueCode.custom,
//       message: 'Department is required',
//       path: ['specializations'],
//     });
//   }
// });

export type TDoctorFormValues = {
  full_name: string;
  professional_name: string;
  short_professional_bio: string;
  email: string;
  phone: string;
  role: string;
  department_id: string;
  hospital_name: string;
  medical_license_number: string;
  location: string;
  country: string;
  state: string;
  district: string;
  pincode: string;
  hospital_affiliation: string;
  years_of_experience: string;
  nmc_registration_year: string;
  state_medical_council: string;
  medical_license: string | File;
  avatar_url: string | File;
  specialization: string;
  specializations: string[];
  department_name?: string;
};

export type TDoctorMappedFormValues = Omit<TDoctorFormValues, 'medical_license' | 'avatar_url'> & {
  medical_license: string;
  avatar_url: string;
};

const toNullableString = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

const toNullableNumber = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

export const mapDoctorFormToPayload = (values: TDoctorMappedFormValues): TDoctorPayload => ({
  full_name: values.full_name.trim(),
  short_professional_bio: values.short_professional_bio.trim(),
  professional_name: values.professional_name.trim(),
  email: values.email.trim(),
  phone: values.phone.trim(),
  role: values.role as TDoctorPayload['role'],
  department_id: toNullableString(values.department_id),
  hospital_name: toNullableString(values.hospital_name),
  medical_license_number: toNullableString(values.medical_license_number),
  location: toNullableString(values.location),
  state: toNullableString(values.state),
  district: toNullableString(values.district),
  pincode: toNullableString(values.pincode),
  hospital_affiliation: toNullableString(values.hospital_affiliation),
  years_of_experience: toNullableNumber(values.years_of_experience),
  nmc_registration_year: toNullableNumber(values.nmc_registration_year),
  state_medical_council: toNullableString(values.state_medical_council),
  medical_license: toNullableString(values.medical_license),
  avatar_url: toNullableString(values.avatar_url),
  specialization: null,
  specializations:
    values.specializations && values.specializations.length > 0 ? values.specializations : null,
  department: toNullableString(values.department_name || ''),
});
