/**
 * Centralized list of suffixes to clean from location names
 */
export const LOCATION_SUFFIXES = [
  'district',
];

/**
 * Regex to match location suffixes at the end of a string
 */
const suffixRegex = new RegExp(
  `\\s+(?:${LOCATION_SUFFIXES.map((s) => s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')).join('|')})$`,
  'i',
);

/**
 * Strips configured suffixes from a location name
 */
export const cleanLocationName = (name: string): string => {
  if (!name) return '';
  return name.replace(suffixRegex, '').trim();
};

/**
 * Normalizes a location name for match comparisons by removing suffixes,
 * converting to lowercase, and collapsing multiple spaces.
 */
export const normalizeLocationName = (name: string): string => {
  const s = String(name || '');
  return s
    .toLowerCase()
    .replace(suffixRegex, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Checks if two location values match, ignoring case, suffixes, and whitespace differences.
 */
export const isLocationMatch = (val1: unknown, val2: unknown): boolean => {
  const s1 = String(val1 || '');
  const s2 = String(val2 || '');
  if (s1 === s2) return true;
  return normalizeLocationName(s1) === normalizeLocationName(s2);
};
