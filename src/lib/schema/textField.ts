import z from 'zod';

import { default as regex } from '@/lib/regex/index';

/* ------------------- TEXT  ------------------- */
const textField = <TRequired extends boolean = true>(
  label: string,
  opts?: {
    min?: number;
    max?: number;
    required?: TRequired;
    regex?: { pattern: RegExp; message?: string };
    alphabetic?: boolean;
    alphanumeric?: boolean;
    allowSpaces?: boolean;
  },
) => {
  const {
    required = true as TRequired,
    min,
    max,
    regex: customRegex,
    alphabetic = false,
    alphanumeric = false,
    allowSpaces = true,
  } = opts || {};

  const errorMap = {
    required_error: `${label} is Required`,
    invalid_type_error: `${label} is Required`,
  };

  const baseSchema = (required ? z.string(errorMap) : z.string(errorMap).optional()).superRefine(
    (v, ctx) => {
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

      // Alphabetic validation using regex from file
      if (alphabetic) {
        const alphabeticRegex = allowSpaces ? regex.alphabetic : regex.alphabeticNoSpace;
        if (!alphabeticRegex.test(v)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: allowSpaces
              ? `${label} must contain only Letters and Spaces`
              : `${label} must contain only Letters`,
          });
          return;
        }
      }

      if (alphanumeric) {
        const alphanumericRegex = allowSpaces ? regex.alphanumeric : regex.alphanumericNoSpace;
        if (!alphanumericRegex.test(v)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: allowSpaces
              ? `${label} must contain only Letters, Numbers and Spaces`
              : `${label} must contain only Letters and Numbers`,
          });
          return;
        }
      }

      if (min && trimmedValue.length < min) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_small,
          minimum: min,
          inclusive: true,
          type: 'string',
          message: `Must be at least ${min} Characters`,
        });
      }

      if (max && trimmedValue.length > max) {
        ctx.addIssue({
          code: z.ZodIssueCode.too_big,
          maximum: max,
          inclusive: true,
          type: 'string',
          message: `Must not be more than ${max} Characters`,
        });
      }

      if (customRegex && !customRegex.pattern.test(v)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: customRegex.message || `${label} format is Invalid`,
        });
      }
    },
  );

  return baseSchema as TRequired extends true
    ? z.ZodEffects<z.ZodString, string, string>
    : z.ZodOptional<z.ZodEffects<z.ZodString, string, string>>;
};

export default textField;
