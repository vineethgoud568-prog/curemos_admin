import z from 'zod';

import { default as Regex } from '@/lib/regex/index';

/* ------------------- LINK  ------------------- */
const linkField = (opts: { required?: boolean } = {}) => {
  const { required = true } = opts;
  let base = z.string();

  if (required) {
    base = base.min(1, 'Link is Required');
  }

  return base.refine(
    (value) => {
      if (!value) return true;
      return Regex.url.test(value);
    },
    { message: 'Please Enter a Valid URL' },
  );
};

export default linkField;
