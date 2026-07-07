import { z } from 'zod';

import { TFaqPayload } from '@/api/hooks/faq/schema';
import textField from '@/lib/schema/textField';

const requiredText = (name: string) =>
  z.string({ required_error: `${name} is required` }).min(1, `${name} is required`);

export const faqFormSchema = z.object({
  question: textField('Question'),
  answer: textField('Answer'),
  type: z.string({ required_error: 'Type is required' }).min(1, 'Type is required'),
});

export type TFaqFormValues = z.infer<typeof faqFormSchema>;

export const mapFaqFormToPayload = (
  values: TFaqFormValues,
  currentStatus?: TFaqPayload['status'],
): TFaqPayload => ({
  question: values.question.trim(),
  answer: values.answer.trim(),
  type: values.type as TFaqPayload['type'],
  status: currentStatus ?? 'active',
});
