import z from 'zod';

/* ------------------- BOOLEAN  ------------------- */
const booleanField = <TRequired extends boolean = true>(
  label: string,
  opts?: { required?: TRequired },
): TRequired extends true ? z.ZodLiteral<true> : z.ZodOptional<z.ZodBoolean> => {
  const { required = true } = opts ?? {};

  const schema = required
    ? z.literal(true, {
      errorMap: () => ({
        message: `${label} must be accepted`,
      }),
    })
    : z.boolean().optional();

  return schema as TRequired extends true ? z.ZodLiteral<true> : z.ZodOptional<z.ZodBoolean>;
};

export default booleanField;
