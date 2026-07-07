export const queryKeyGenerator = (endpoint: string) => endpoint && endpoint?.replace(/\//g, '-');

export type TBuildPayload<T extends object> = {
  data: T;
  formFields?: readonly (keyof T)[];
  payloadType?: 'json' | 'formData';
  options?: { noIndexKeys?: (keyof T)[]; base64Keys?: (keyof T)[] };
};

const convertToBase64 = (value: unknown): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (value instanceof File || value instanceof Blob) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(value);
    } else {
      // If it's already a string or object, stringify and encode
      const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
      resolve(window.btoa(str));
    }
  });
};

export async function buildPayload<T extends object, TJson = never>({
  data,
  formFields,
  payloadType = 'formData',
  options,
}: TBuildPayload<T>): Promise<[TJson] extends [never] ? FormData : FormData | TJson> {
  const fieldsToUse = formFields ?? (Object.keys(data) as (keyof T)[]);
  const noIndexKeys = options?.noIndexKeys?.map(String) ?? [];
  const base64Keys = options?.base64Keys?.map(String) ?? [];

  //  Trim helper
  const trimValue = (value: unknown): unknown => {
    if (typeof value === 'string') return value.trim();
    if (value instanceof File) return value;
    if (Array.isArray(value)) return value.map(trimValue);
    if (value && typeof value === 'object')
      return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, trimValue(v)]));
    return value ?? '';
  };

  // const entries = fieldsToUse.map<[string, unknown]>((field) => [
  //   String(field),
  //   trimValue(data[field]),
  // ]);

  const entries: [string, unknown][] = await Promise.all(
    fieldsToUse.map(async (field) => {
      let value = trimValue(data[field]);
      if (base64Keys.includes(String(field))) {
        value = await convertToBase64(value);
      }
      return [String(field), value];
    }),
  );

  // If JSON mode
  if (payloadType === 'json') {
    return Object.fromEntries(entries) as [TJson] extends [never] ? never : TJson;
  }

  const formData = new FormData();

  //  Recursive appender
  const appendToFormData = (formData: FormData, key: string, value: unknown): void => {
    if (value === undefined || value === null) {
      formData.append(key, '');
      return;
    }

    // File
    if (value instanceof File) {
      formData.append(key, value);
      return;
    }

    // Array
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const skipIndex = noIndexKeys.includes(key);
        const newKey = skipIndex ? `${key}` : `${key}[${index}]`;
        appendToFormData(formData, newKey, item);
      });
      return;
    }

    // Object (any depth)
    if (typeof value === 'object') {
      for (const [subKey, subValue] of Object.entries(value)) {
        appendToFormData(formData, `${key}[${subKey}]`, subValue);
      }
      return;
    }

    // Primitive (string, number, boolean)
    formData.append(key, String(value));
  };

  //  Apply recursion for all top-level fields
  for (const [key, value] of entries) {
    appendToFormData(formData, key, value);
  }

  return formData as [TJson] extends [never] ? FormData : FormData;
}
