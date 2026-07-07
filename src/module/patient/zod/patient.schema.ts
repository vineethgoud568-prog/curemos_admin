import { z } from 'zod';

import { validationSchemas } from '@/lib/validation';

export const patientFormSchema = z.object({
  full_name: validationSchemas.name,
  age: validationSchemas.age,
  gender: z.string().optional().or(z.literal('')),
  phone: validationSchemas.phone,
  email: validationSchemas.email,
  medical_history: validationSchemas.optionalText,
  doctor_a_id: z.string().min(1, 'Doctor ID is required'),
});

export type TPatientFormValues = z.infer<typeof patientFormSchema>;
