import z from 'zod';

import { default as Regex } from '@/lib/regex/index';

/* ------------------- EMAIL  ------------------- */
const emailField = <TRequired extends boolean = true>(
  label: string,
  { required = true as TRequired }: { required?: TRequired } = {},
) => {
  return (required ? z.string() : z.string().optional()).superRefine((v, ctx) => {
    if (!v) {
      if (required) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `${label} is Required`,
        });
      }
      return;
    }

    if (!Regex.space.test(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `${label} cannot be only Spaces`,
      });
    }

    if (!Regex.email.test(v)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Invalid Email Format',
      });
    }
  }) as TRequired extends true
    ? z.ZodEffects<z.ZodString, string, string>
    : z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
};

export default emailField;
