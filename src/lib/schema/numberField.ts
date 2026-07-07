import z from 'zod';

/* ------------------- NUMBER  ------------------- */
interface INumberFieldOptions<TRequired extends boolean> {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  required?: TRequired;
  acceptZero?: boolean;
}

const numberField = <TRequired extends boolean = true>(
  label: string,
  {
    min,
    max,
    minLength,
    maxLength,
    required = true as TRequired,
    acceptZero = false,
  }: INumberFieldOptions<TRequired> = {},
) => {
  const coerceOpts = {
    required_error: `${label} is Required`,
    invalid_type_error: `${label} must be a Number`,
  };

  const hasLengthConstraints = minLength !== undefined || maxLength !== undefined;

  let base: z.ZodNumber;

  if (hasLengthConstraints) {
    let strSchema = z.string({
      invalid_type_error: `${label} must be a string`,
    });

    if (minLength !== undefined) {
      const len = minLength;
      strSchema = strSchema.min(len, `${label} must be at least ${len} characters`);
    }

    if (maxLength !== undefined) {
      const len = maxLength;
      strSchema = strSchema.max(len, `${label} must be at most ${len} characters`);
    }

    const inputSchema = z.union([z.number(), strSchema]);
    base = inputSchema.pipe(z.coerce.number(coerceOpts)) as unknown as z.ZodNumber;
  } else {
    base = z.coerce.number(coerceOpts);
  }

  if (min !== undefined) {
    base = base.gte(min, `${label} must be at least ${min}`);
  }

  if (max !== undefined) {
    base = base.lte(max, `${label} must be at most ${max}`);
  }

  if (required && !acceptZero) {
    base = base.refine((val) => val !== 0, {
      message: `${label} can't be 0`,
    }) as unknown as z.ZodNumber;
  }

  let schema: z.ZodSchema;
  if (required) {
    schema = base;
  } else {
    schema = z.preprocess(
      (val) => (typeof val === 'string' && val === '' ? undefined : val),
      base.optional(),
    );
  }

  return schema as TRequired extends true ? z.ZodNumber : z.ZodOptional<z.ZodNumber>;
};

export default numberField;
