import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const departmentFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long')
    .regex(/^[a-zA-Z\s.'&-]*$/, 'Name contains invalid characters'),
  image: z.union([
    z
      .instanceof(File)
      .refine((file) => file.size <= MAX_FILE_SIZE, 'Max file size is 5MB.')
      .refine(
        (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
        'Only .jpg, .jpeg, .png and .webp formats are supported.',
      ),
    z.string().min(1, 'Image is required'),
  ]),
});

export type TDepartmentFormValues = z.infer<typeof departmentFormSchema>;
