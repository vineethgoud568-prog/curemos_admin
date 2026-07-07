import { z } from 'zod';

/**
 * Generic validation schemas for industry-standard practices
 */
export const validationSchemas = {
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .regex(/^[a-zA-Z\s.'-]*$/, 'Name contains invalid characters'),
  age: z
    .string()
    .min(1, 'Age is required')
    .max(3, 'Age is too long')
    .regex(/^\d+$/, 'Age must contain only digits'),

  email: z.string().min(1, 'Email is required').email('Invalid email address'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .min(10, 'Phone number must be at least 10 digits')
    .max(10, 'Phone number must be at most 10 digits')
    .regex(/^\d+$/, 'Phone number must contain only digits'),

  requiredSelect: (name: string) =>
    z.string({ required_error: `${name} is required` }).min(1, `${name} is required`),

  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      if (!date) return true;
      return new Date(date) <= new Date();
    }, 'Date of birth cannot be in the future'),

  year: z
    .string()
    .min(1, 'Year is required')
    .max(4, 'Year must be exactly 4 digits')
    .regex(/^\d+$/, 'Year must contain only digits')
    .optional(),

  optionalText: z.string().optional().default(''),
};
