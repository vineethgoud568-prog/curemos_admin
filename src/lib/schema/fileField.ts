import z from 'zod';

import { mediaConfig } from '../constants';
import { getReadableExtensions, getReadableSize } from '../functions/file-input.lib';

import { TCommonSchema } from '@/types/common/common.schema';

interface IFileFieldOptions {
  min?: number;
  max?: number;
  required?: boolean;
  multiple?: boolean;
}

/**
 * Base validator for a single file or string reference.
 * - Ensures valid File instance
 * - Ensures correct MIME type
 * - Ensures max size constraint
 */
const buildSingleValidator = (types: TCommonSchema['media'][], label: string) => {
  const mimes = types.flatMap((t) => mediaConfig[t].mimes);
  const maxSize = Math.max(...types.map((t) => mediaConfig[t].size));
  const extensions = getReadableExtensions(types);

  return z.union([
    z
      .instanceof(File, { message: `Please Upload a Valid ${label}` })
      .refine((f) => (mimes as readonly string[]).includes(f.type), {
        message: `Only ${extensions} files Allowed`,
      })
      .refine((f) => f.size <= maxSize, {
        message: `File must be less than ${getReadableSize(maxSize)}`,
      }),
    z.string().min(1, { message: `Please Upload a Valid ${label}` }),
  ]);
};

/**
 * Main file validator creator
 */
const createFileValidator = (
  types: TCommonSchema['media'][],
  label: string,
  options: IFileFieldOptions = {},
) => {
  const { required = true, multiple = false, min, max } = options;

  const singleValidator = buildSingleValidator(types, label);

  // ---------- MULTIPLE MODE ----------
  if (multiple) {
    return z
      .array(singleValidator)
      .nullable()
      .transform((v) => v ?? [])
      .superRefine((val, ctx) => {
        const count = val.length;

        const minRequired = min ?? (required ? 1 : 0);

        if (count < minRequired) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              minRequired > 1
                ? `At least ${minRequired} ${label}${minRequired > 1 ? 's' : ''} Required`
                : `Please Upload a Valid ${label}`,
          });
        }

        if (typeof max === 'number' && count > max) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Maximum ${max} ${label}${max > 1 ? 's' : ''} allowed`,
          });
        }
      });
  }

  // ---------- SINGLE MODE ----------
  if (!required) {
    return z.union([singleValidator, z.literal(''), z.null()]).default('');
  }

  return singleValidator;
};

// --------- Convenience Validators ----------
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const imageField = (options?: IFileFieldOptions) =>
  createFileValidator(['image'], 'Image', options);

export const videoField = (options?: IFileFieldOptions) =>
  createFileValidator(['video'], 'Video', options);

export const audioField = (options?: IFileFieldOptions) =>
  createFileValidator(['audio'], 'Audio', options);

export const pdfField = (options?: IFileFieldOptions) =>
  createFileValidator(['pdf'], 'PDF', options);

export const excelField = (options?: IFileFieldOptions) =>
  createFileValidator(['excel'], 'Excel', options);

export const docField = (options?: IFileFieldOptions) =>
  createFileValidator(['doc'], 'Document', options);

export const txtField = (options?: IFileFieldOptions) =>
  createFileValidator(['text'], 'Text', options);

/**
 * Any media type validator with auto-labeling and automatic multiple/min logic.
 */
export const anyMediaField = (
  types: TCommonSchema['media'][] = ['image'],
  options?: IFileFieldOptions,
) => {
  const label = types.length === 1 ? capital(types[0]) : types.map((t) => capital(t)).join('/');

  const autoMultiple = options?.multiple ?? Boolean(options?.min && options.min > 1);

  return createFileValidator(types, label, {
    ...options,
    multiple: autoMultiple,
  });
};
