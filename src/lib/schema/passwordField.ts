import z from 'zod';

import regex from '@/lib/regex';

/* ------------------- PASSWORD FIELD ------------------- */
const passwordField = <TRequired extends boolean = true>(
  label: string,
  opts?: {
    min?: number;
    max?: number;
    required?: TRequired;
  },
) => {
  const { required = true as TRequired, min, max } = opts || {};

  const baseSchema = (required ? z.string() : z.string().optional()).superRefine((v, ctx) => {
    // Handle required logic
    if (!v) {
      if (required) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is Required`,
        });
      }
      return;
    }

    const trimmedValue = v.trim();

    if (!trimmedValue) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} cannot be only Spaces`,
      });
      return;
    }

    // No spaces allowed
    if (regex.passwordSpace.test(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} cannot contain Spaces`,
      });
      return;
    }

    // Must follow password pattern
    if (!regex.password.test(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} must contain at least 1 uppercase, 1 lowercase, 1 number, and 1 special character`,
      });
      return;
    }

    // Length checks
    if (min && trimmedValue.length < min) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_small,
        minimum: min,
        inclusive: true,
        type: 'string',
        message: `${label} must be at least ${min} Characters`,
      });
    }

    if (max && trimmedValue.length > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.too_big,
        maximum: max,
        inclusive: true,
        type: 'string',
        message: `${label} must not be more than ${max} Characters`,
      });
    }
  });

  return baseSchema as TRequired extends true
    ? z.ZodEffects<z.ZodString, string, string>
    : z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
};

export default passwordField;
