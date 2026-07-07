import { z } from 'zod';

export const contactFormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(8, 'Phone number should be at least 8 digits')
    .max(15, 'Phone number should not be more than 15 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),
  address: z
    .string()
    .trim()
    .min(2, 'Address must be at least 2 characters')
    .max(100, 'Address is too long'),
  // .regex(/^[a-zA-Z\s.'-]*$/, 'Banner description contains invalid characters'),
});

export type TContactFormValues = z.infer<typeof contactFormSchema>;
