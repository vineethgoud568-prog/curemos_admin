import z from 'zod';

import { formatLabel } from '../functions/format.lib';

/* ------------------- ENUM  ------------------- */
const enumField = <T extends readonly [string, ...string[]]>(
  values: T,
  label: string,
  opts?: { required?: boolean; message?: string },
) =>
    z.preprocess(
      (val) => {
        if (val === '' || val === undefined) {
          return undefined;
        }
        return val;
      },
      z
        .union([z.enum(values), z.undefined()])
        .refine((val) => (opts?.required === false ? true : val !== undefined), {
          message:
          opts?.message ||
          `Please choose between ${values
            .map((v, i) =>
              i === values.length - 1 && i !== 0 ? `or ${formatLabel(v)}` : formatLabel(v),
            )
            .join(', ')} for ${label}`,
        }),
    );

export default enumField;
