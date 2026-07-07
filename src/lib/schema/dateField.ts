import z, { ZodOptional, ZodType, ZodTypeDef } from 'zod';

/* ------------------- DATE  ------------------- */
const dateField = <TRequired extends boolean = true>(
  label: string,
  { required = true as TRequired }: { required?: TRequired } = {},
): TRequired extends true
  ? ZodType<Date, ZodTypeDef, string | Date>
  : ZodOptional<ZodType<Date, ZodTypeDef, string | Date>> => {
  const baseSchema = z
    .union([z.string(), z.date()])
    .transform((val) => (typeof val === 'string' ? new Date(val) : val))
    .refine((date) => date instanceof Date && !isNaN(date.getTime()), {
      message: `${label} must be a Valid Date`,
    });

  if (required) {
    return baseSchema as unknown as TRequired extends true
      ? ZodType<Date, ZodTypeDef, string | Date>
      : never;
  } else {
    return baseSchema.optional() as unknown as TRequired extends true
      ? never
      : ZodOptional<ZodType<Date, ZodTypeDef, string | Date>>;
  }
};

export default dateField;
