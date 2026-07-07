import { z } from 'zod';

import { formatDateAndTime } from '@/lib/functions/date.lib';
import { formatLabel } from '@/lib/functions/format.lib';
import { isValueValid } from '@/lib/functions/valid.lib';

// ---------- Types ----------
type TFieldRequirement<T extends object> = {
  key: keyof T;
};

type TConditionalRequirement<T extends object> = {
  condition: (data: T) => boolean;
  requiredFields: TFieldRequirement<T>[];
  messageTemplate?: (field: keyof T, data: T) => string;
};

// ---------- Unique By ----------
export const uniqueBy = <T extends object>(
  data: T[],
  ctx: z.RefinementCtx,
  keyFn: (item: T) => string | number | null | undefined,
  message?: string,
  type?: 'time' | 'date' | 'slug',
  keyName?: string,
): void => {
  const seen = new Map<string, number>();

  data.forEach((item, index) => {
    const keyRaw = keyFn(item);

    if (!isValueValid(keyRaw)) return;

    const keyStr = String(keyRaw);

    const displayKey =
      type === 'time' || type === 'date'
        ? formatDateAndTime(keyStr, { includeWeekday: false })[type]
        : type === 'slug'
          ? formatLabel(keyName || keyStr)
          : keyStr;

    const firstIndex = seen.get(keyStr);
    if (firstIndex !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index],
        message:
          message ||
          `Duplicate value for '${displayKey}' at position ${index + 1} (first at ${firstIndex + 1})`,
      });
    } else {
      seen.set(keyStr, index);
    }
  });
};

// ---------- Conditional Required Fields ----------
export const requireFieldsConditionally = <T extends object>(
  data: T,
  ctx: z.RefinementCtx,
  requirements: TConditionalRequirement<T>[],
): void => {
  for (const { condition, requiredFields, messageTemplate } of requirements) {
    if (!condition(data)) continue;

    for (const { key } of requiredFields) {
      const value = data[key];
      const isEmpty =
        value === undefined || value === null || (typeof value === 'string' && value.trim() === '');

      if (isEmpty) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [key as string],
          message: messageTemplate?.(key, data) || `${formatLabel(String(key))} is required`,
        });
      }
    }
  }
};

// ---------- Must Match / Must Not Match ----------
export const mustMatch = <
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T,
>(
    data: T,
    ctx: z.RefinementCtx,
    key1: K1,
    key2: K2,
    options?: {
    inverse?: boolean;
    message?: string;
  },
  ): void => {
  const val1 = data[key1];
  const val2 = data[key2];

  const isEqual = `${val1}` === `${val2}`;
  const k1Label = formatLabel(String(key1));
  const k2Label = formatLabel(String(key2));

  const shouldError = options?.inverse ? isEqual : !isEqual;

  if (shouldError) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [key2 as string],
      message:
        options?.message ||
        (options?.inverse
          ? `${k2Label} must not match ${k1Label}`
          : `${k2Label} must match ${k1Label}`),
    });
  }
};

// ---------- Require Both Together ----------
export const requireBoth = <
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T,
>(
    data: T,
    ctx: z.RefinementCtx,
    key1: K1,
    key2: K2,
    options?: {
    fullError?: boolean;
    customValidate?: <K extends K1 | K2>(
      key: K,
      value: T[K],
      addIssue: (path: string[], message: string) => void,
    ) => void;
  },
  ): void => {
  const { fullError = true, customValidate } = options ?? {};

  const v1 = data[key1];
  const v2 = data[key2];

  const hasV1 = v1 !== undefined && v1 !== null && String(v1).trim() !== '';
  const hasV2 = v2 !== undefined && v2 !== null && String(v2).trim() !== '';

  const k1Label = formatLabel(String(key1));
  const k2Label = formatLabel(String(key2));

  if (hasV1 && !hasV2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [String(key2)],
      message: fullError ? `${k2Label} is required when ${k1Label} is provided` : 'Required',
    });
  }

  if (!hasV1 && hasV2) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [String(key1)],
      message: fullError ? `${k1Label} is required when ${k2Label} is provided` : 'Required',
    });
  }

  if (customValidate) {
    const addIssue = (path: string[], message: string) => {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path, message });
    };

    if (hasV1) customValidate(key1, v1, addIssue);
    if (hasV2) customValidate(key2, v2, addIssue);
  }
};

// ---------- End After Start ----------
export const endAfterStart = <
  T extends Record<string, unknown>,
  S extends keyof T,
  E extends keyof T,
>(
    data: T,
    ctx: z.RefinementCtx,
    startKey: S,
    endKey: E,
    options?: {
    message?: string;
    index?: number;
    timeOnly?: boolean;
    allowEqual?: boolean;
  },
  ): void => {
  const { message, index, timeOnly, allowEqual } = options || {};
  const start = new Date(String(data[startKey]));
  const end = new Date(String(data[endKey]));

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return;

  let isInvalid = false;

  if (timeOnly) {
    const startMins = start.getHours() * 60 + start.getMinutes();
    const endMins = end.getHours() * 60 + end.getMinutes();
    isInvalid = allowEqual ? endMins < startMins : endMins <= startMins;
  } else {
    isInvalid = allowEqual ? end < start : end <= start;
  }

  if (isInvalid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: index !== undefined ? [index, String(endKey)] : [String(endKey)],
      message:
        message ||
        `${formatLabel(String(endKey))} must be after ${
          allowEqual ? 'or equal to ' : ''
        }${formatLabel(String(startKey))}`,
    });
  }
};

// ---------- Between Bounds ----------
export const betweenBounds = <
  // Entire object being validated
  T extends Record<string, unknown>,
  // Key of the array field
  A extends keyof T,
  // Keys of the start/end date fields
  S extends keyof T,
  E extends keyof T,
  // Type of items inside the array. Must at least contain an optional "time" string.
  Item extends { time?: string },
>(
    data: T & Record<A, Item[]>, // ensures array is typed correctly
    ctx: z.RefinementCtx,
    arrayKey: A,
    startKey: S,
    endKey: E,
    options?: {
    message?: string;
    timeOnly?: boolean;
  },
  ): void => {
  const { message, timeOnly } = options || {};
  const arrayVal = data[arrayKey];
  const start = new Date(String(data[startKey]));
  const end = new Date(String(data[endKey]));

  // If shape is invalid or dates are invalid, skip validation
  if (!Array.isArray(arrayVal) || isNaN(start.getTime()) || isNaN(end.getTime())) return;

  arrayVal.forEach((item, index) => {
    if (!item || typeof item !== 'object') return;

    const timeStr = item.time;
    if (typeof timeStr !== 'string') return;

    const timeVal = new Date(timeStr);
    if (isNaN(timeVal.getTime())) return;

    // Actual validation
    let isInvalid = false;
    if (timeOnly) {
      const startMins = start.getHours() * 60 + start.getMinutes();
      const endMins = end.getHours() * 60 + end.getMinutes();
      const timeMins = timeVal.getHours() * 60 + timeVal.getMinutes();
      isInvalid = timeMins < startMins || timeMins > endMins;
    } else {
      isInvalid = timeVal < start || timeVal > end;
    }

    if (isInvalid) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [String(arrayKey), index, 'time'],
        message:
          message ??
          `${formatLabel(String(arrayKey))} time must be between ${formatLabel(
            String(startKey),
          )} and ${formatLabel(String(endKey))}`,
      });
    }
  });
};

// ---------- Compare Fields : key2 Gets the Validation Error ----------
export const compareFields = <
  T extends Record<string, unknown>,
  K1 extends keyof T,
  K2 extends keyof T,
>(
    data: T,
    ctx: z.RefinementCtx,
    key1: K1,
    key2: K2,
    options: {
    type: 'lessThan' | 'greaterThan';
    message?: string;
  },
  ): void => {
  const v1 = Number(data[key1]);
  const v2 = Number(data[key2]);

  if (Number.isNaN(v1) || Number.isNaN(v2)) return;

  const k1Label = formatLabel(String(key1));
  const k2Label = formatLabel(String(key2));

  const isInvalid =
    (options.type === 'lessThan' && !(v1 < v2)) || (options.type === 'greaterThan' && !(v1 > v2));

  if (isInvalid) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: [String(key2)],
      message:
        options.message ||
        (options.type === 'lessThan'
          ? `${k2Label} must be greater than ${k1Label}`
          : `${k2Label} must be less than ${k1Label}`),
    });
  }
};
