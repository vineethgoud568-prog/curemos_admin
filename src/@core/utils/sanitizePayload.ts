type Primitive = string | number | boolean | symbol | bigint | null | undefined;

type SafePayload<T> = {
  [K in keyof T]: T[K] extends Primitive
    ? T[K]
    : T[K] extends File | Blob | Date
      ? T[K]
      : T[K] extends Array<infer U>
        ? SafePayload<U>[]
        : T[K] extends object
          ? SafePayload<T[K]>
          : never;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    value.constructor === Object &&
    !(value instanceof File) &&
    !(value instanceof Blob) &&
    !(value instanceof Date)
  );
};

const sanitizeFormData = (formData: FormData): FormData => {
  const sanitizedFormData = new FormData();

  formData.forEach((value, key) => {
    // FormData values are FormDataEntryValue (File | string)

    // XSS filter for string values
    if (typeof value === 'string') {
      if (value.trim().startsWith('<script')) {
        sanitizedFormData.append(key, '');
      } else {
        sanitizedFormData.append(key, value);
      }
      return;
    }

    // Keep Files as-is (File extends Blob)
    if (value instanceof File) {
      sanitizedFormData.append(key, value);
      return;
    }

    // For any other values, convert to string
    sanitizedFormData.append(key, String(value));
  });

  return sanitizedFormData;
};

// Overloaded function signatures for better type safety
export function sanitizePayload(payload: FormData): FormData;
export function sanitizePayload<T extends Record<string, unknown>>(payload: T): SafePayload<T>;
export function sanitizePayload<T extends Record<string, unknown> | FormData>(
  payload: T,
): T extends FormData ? FormData : SafePayload<T> {
  // If it's FormData, always sanitize and return as FormData to preserve file uploads
  if (payload instanceof FormData) {
    return sanitizeFormData(payload) as T extends FormData ? FormData : SafePayload<T>;
  }

  // Handle regular objects
  const rawPayload = payload as Record<string, unknown>;
  const cleanPayload = {} as Record<string, unknown>;

  Object.keys(rawPayload).forEach((key) => {
    const value = rawPayload[key];

    if (typeof value === 'function' || value === undefined) {
      return;
    }

    // XSS filter: remove suspicious script tags
    if (typeof value === 'string' && value.trim().startsWith('<script')) {
      cleanPayload[key] = '';
      return;
    }

    // Allow File, Blob, and Date as-is
    if (value instanceof File || value instanceof Blob || value instanceof Date) {
      cleanPayload[key] = value;
      return;
    }

    // Sanitize arrays
    if (Array.isArray(value)) {
      cleanPayload[key] = value.map((item) => {
        if (item instanceof File || item instanceof Blob || item instanceof Date) {
          return item;
        }
        // Type guard to ensure item is an object before recursion
        if (typeof item === 'object' && item !== null) {
          return sanitizePayload(item as Record<string, unknown>);
        }
        return item;
      });
      return;
    }

    // Sanitize nested objects
    if (isPlainObject(value)) {
      cleanPayload[key] = sanitizePayload(value);
      return;
    }

    // Assign primitives
    cleanPayload[key] = value;
  });

  return cleanPayload as T extends FormData ? FormData : SafePayload<T>;
}
