import { z } from 'zod';

export const reportFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'Title must be at least 2 characters')
    .max(50, 'Title is too long')
    .regex(/^[a-zA-Z\s.'-]*$/, 'Title contains invalid characters'),
  type: z
    .string()
    .trim()
    .min(1, 'Title must be at least 2 characters')
    .max(50, 'Title is too long')
    .regex(/^[a-zA-Z\s.'-]*$/, 'Title contains invalid characters'),
  associated_user: z.string().min(2, 'Associated user is required'),
  report: z
    .union([
      z.instanceof(File), // for new upload
      z.string().url(), // for existing file URL
    ])
    .optional(),
});

export type TReportFormValues = z.infer<typeof reportFormSchema>;
