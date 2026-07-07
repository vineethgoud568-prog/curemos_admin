import z from 'zod';

import { singular } from '../functions/text.lib';

const arrayField = <T extends z.ZodTypeAny, TRequired extends boolean = true>(
  label: string,
  schema: T,
  opts?: {
    min?: number;
    max?: number;
    minMessage?: string;
    maxMessage?: string;
    required?: TRequired;
  },
) => {
  const { required = true as TRequired, min, max, minMessage, maxMessage } = opts || {};

  const baseLabel = singular(label);
  let baseSchema: z.ZodArray<T> | z.ZodOptional<z.ZodArray<T>> = z.array(schema);

  if (required && min === undefined) {
    (baseSchema as z.ZodArray<T>) = (baseSchema as z.ZodArray<T>).min(
      1,
      `At least 1 ${baseLabel} is Required`,
    );
  }

  // If min was provided by user
  if (min !== undefined) {
    (baseSchema as z.ZodArray<T>) = (baseSchema as z.ZodArray<T>).min(
      min,
      minMessage || `At least ${min} ${baseLabel} is Required`,
    );
  }

  if (max !== undefined) {
    (baseSchema as z.ZodArray<T>) = (baseSchema as z.ZodArray<T>).max(
      max,
      maxMessage || `No more than ${max} ${baseLabel}${max > 1 ? 's' : ''} are Allowed`,
    );
  }

  if (!required) {
    baseSchema = (baseSchema as z.ZodArray<T>).optional();
  }

  return baseSchema as TRequired extends true ? z.ZodArray<T> : z.ZodOptional<z.ZodArray<T>>;
};

export default arrayField;
