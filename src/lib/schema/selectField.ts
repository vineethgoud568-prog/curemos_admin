import z, { ZodType } from 'zod';

/* ------------------- SELECT  ------------------- */
type TSelectFieldReturnType<
  Multiple extends boolean,
  Required extends boolean,
> = Multiple extends true
  ? Required extends true
    ? string[]
    : string[] | undefined
  : Required extends true
    ? string
    : string | undefined;

const selectField = <Multiple extends boolean = true, Required extends boolean = true>(
  label: string,
  opts?: {
    multiple?: Multiple;
    required?: Required;
    min?: number;
    max?: number;
  },
): ZodType<TSelectFieldReturnType<Multiple, Required>> => {
  const { multiple = true, required = true, min, max } = opts || {};

  if (multiple) {
    let schema = z.array(z.string().min(1, `${label} Option cannot be Empty`));

    if (min !== undefined) schema = schema.min(min, { message: `Select at Least ${min} ${label}` });
    else if (required) schema = schema.min(1, { message: `${label} is Required` });

    if (max !== undefined)
      schema = schema.max(max, { message: `You can Select at Most ${max} ${label}` });

    return (required ? schema : schema.optional()) as unknown as ZodType<
      TSelectFieldReturnType<Multiple, Required>
    >;
  } else {
    const baseSchema = z.string().transform((val) => (val === '' ? undefined : val));

    const finalSchema = required
      ? baseSchema.refine((val) => typeof val === 'string' && val.length > 0, {
        message: `Select ${label}`,
      })
      : baseSchema.optional();

    return finalSchema as unknown as ZodType<TSelectFieldReturnType<Multiple, Required>>;
  }
};

export default selectField;
