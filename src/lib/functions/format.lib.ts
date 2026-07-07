export const formatLabel = (value: string) => {
  if (!value) return '';

  // Handle boolean strings
  const lower = value.toLowerCase();
  if (lower === 'true') return 'True';
  if (lower === 'false') return 'False';

  // Replace dots, underscores, hyphens, and camelCase with spaces
  return value
    .replace(/\./g, ' ') // handle dot paths like address.geo_address
    .replace(/([a-z])([A-Z])/g, '$1 $2') // handle camelCase
    .replace(/[-_]/g, ' ') // handle snake_case, kebab-case
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export type TTransform =
  | 'uppercase'
  | 'lowercase'
  | 'capitalize'
  | 'capitalize-first-letter'
  | 'none';
export const formatText = ({
  input,
  position,
  separator,
  format = 'none',
}: {
  input: string;
  format?: TTransform;
  separator?: string;
  position?: number; // 1-based index
}): string | null => {
  if (!input) return '';

  let value = input;

  // Optional split
  if (separator && position !== undefined) {
    const parts = input.split(separator);
    const index = position - 1;
    if (index < 0 || index >= parts.length) return null;
    value = parts[index] ?? '';
  }

  // Apply formatting
  switch (format) {
    case 'uppercase':
      return value.toUpperCase();

    case 'lowercase':
      return value.toLowerCase();

    case 'capitalize':
      // Capitalize each word
      return value.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

    case 'capitalize-first-letter':
      return value.charAt(0).toUpperCase();

    default:
      return value;
  }
};
