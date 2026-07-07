import { z } from 'zod';

export const subadminPermissionModules = [
  'doctor',
  'patient',
  'subadmin',
  'department',
  'report',
  'state',
  'referral',
  'consultation-review',
  'faq',
  'privacy-policy',
  'terms-and-conditions',
  'contact',
  'banners',
  'enquiry',
] as const;
export const subadminPermissionActions = ['list', 'add', 'edit', 'view', 'delete'] as const;

export const subadminPermissionsSchema = z.record(
  z.enum(subadminPermissionModules),
  z.array(z.enum(subadminPermissionActions)).optional(),
);

export const subadminFormSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Full name must be at least 2 characters')
    .max(50, 'Full name is too long')
    .regex(/^[a-zA-Z\s.'-]*$/, 'Full name contains invalid characters'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  category: z
    .string()
    .trim()
    .min(2, 'Role must be at least 2 characters')
    .max(50, 'Role is too long')
    .regex(/^[a-zA-Z\s.'-]*$/, 'Full name contains invalid characters'),
  image: z.union([
    z.instanceof(File).refine((file) => file.size > 0, {
      message: 'Image file is required',
    }),
    z.string().min(1, 'Image is required'),
  ]),
  permissions: subadminPermissionsSchema,
});

export type TSubadminFormValues = z.infer<typeof subadminFormSchema>;
export type TSubadminPermissionModule = (typeof subadminPermissionModules)[number];
export type TSubadminPermissionAction = (typeof subadminPermissionActions)[number];
