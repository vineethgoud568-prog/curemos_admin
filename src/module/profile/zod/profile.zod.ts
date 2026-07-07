import { z } from 'zod';

import regex from '@/lib/regex';
import passwordField from '@/lib/schema/passwordField';
import textField from '@/lib/schema/textField';

export const profileSchema = z.object({
  fullName: textField('Full Name', {
    min: 2,
    alphabetic: true,
  }),
  email: textField('Email'),
  phone: textField('Phone', {
    regex: { pattern: regex.phone, message: 'Please enter a valid phone number' },
  }),
  profileImage: z.any().optional(),
});

export type TProfileFormValues = z.infer<typeof profileSchema>;

export const passwordSchema = z
  .object({
    currentPassword: passwordField('Current Password'),
    password: passwordField('New Password'),
    confirmPassword: passwordField('Confirm Password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type TPasswordFormValues = z.infer<typeof passwordSchema>;
