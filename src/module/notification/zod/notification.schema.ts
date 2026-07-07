import { z } from 'zod';

export const notificationSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title is too long'),
  message: z.string().trim().min(1, 'Message is required').max(500, 'Message is too long'),
  image: z.any().optional(),
});

export type TNotificationForm = z.infer<typeof notificationSchema>;
