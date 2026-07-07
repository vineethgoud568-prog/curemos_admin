import { z } from 'zod';

import { TLegalPagePayload, TLegalPageSlug } from '@/api/hooks/legalPages/schema';
import textField from '@/lib/schema/textField';

export const legalPageFormSchema = z.object({
  title: textField('Title', { required: true }),
  content: textField('Content', { required: true }).superRefine((val, ctx) => {
    // Tiptap outputs '<p></p>' when the editor is empty — strip all HTML tags
    // and check whether any visible text actually remains.
    const text = val.replace(/<[^>]*>/g, '').trim();
    if (!text) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Content is Required',
      });
    }
  }),
  is_published: z.boolean().default(true),
});

export type TLegalPageFormValues = z.infer<typeof legalPageFormSchema>;

export const mapLegalPageFormToPayload = (
  values: TLegalPageFormValues,
  slug: TLegalPageSlug,
): TLegalPagePayload => ({
  slug,
  title: values.title.trim(),
  content: values.content.trim(),
  is_published: values.is_published,
});
