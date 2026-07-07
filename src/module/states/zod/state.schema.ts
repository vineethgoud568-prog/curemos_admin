import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const stateFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .regex(/^[a-zA-Z\s.'&-]*$/, 'Name contains invalid characters'),
});

export type TStateFormValues = z.infer<typeof stateFormSchema>;
