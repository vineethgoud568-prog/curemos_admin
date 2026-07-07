import { formatLabel } from './format.lib';

// import { IOption } from '@/components/GenericInputs/SelectInput';

export const generateOptionsFromValues = <T extends readonly string[]>(values: T) =>
  values.map((value) => ({
    value,
    label: formatLabel(value),
  })) as { value: T[number]; label: string }[];

export const generateOptionGroups = <T extends { [K in keyof T]: readonly string[] }>(
  groupedValues: T,
): {
  [K in keyof T]: { value: T[K][number]; label: string }[];
} => {
  return Object.fromEntries(
    Object.entries(groupedValues).map(([key, values]) => [
      key,
      generateOptionsFromValues(values as readonly string[]),
    ]),
  ) as {
    [K in keyof T]: { value: T[K][number]; label: string }[];
  };
};

type TBaseKeys = { _id: string };
type TFormatOption = 'none' | 'label' | 'description' | 'both';
interface ITransformOptions<T extends TBaseKeys> {
  data?: T[];
  labelKey: keyof T;
  format?: TFormatOption;
  descriptionKey?: keyof T;
}
const fmt = (v: string, f: TFormatOption, t: 'label' | 'description') =>
  f === t || f === 'both' ? formatLabel(v) : v;
// export const transformOptions = <T extends TBaseKeys>({
//   data = [],
//   labelKey,
//   descriptionKey,
//   format = 'none',
// }: ITransformOptions<T>): Array<IOption & T> =>
//     data.map(item => ({
//       ...item,
//       value: item._id,
//       label: fmt(String(item[labelKey]), format, 'label'),
//       ...(descriptionKey && {
//         description: fmt(String(item[descriptionKey]), format, 'description'),
//       }),
//     }));
