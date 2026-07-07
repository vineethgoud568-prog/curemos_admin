import { FieldError, FieldErrors } from 'react-hook-form';
import { toast } from 'sonner';

import { checkWindow } from '../helper.lib';

import { formatText } from './format.lib';

export const sToast = Object.fromEntries(
  (['success', 'error', 'warning'] as const).map((type) => [
    type,
    (message: string) => {
      if (checkWindow()) {
        toast[type](
          formatText({
            input: message,
            format: 'capitalize',
          }),
        );
      }
    },
  ]),
) as Record<'success' | 'error' | 'warning', (message: string) => void>;

export const singular = (word: string) => {
  if (word.endsWith('ies')) {
    return `${word.slice(0, -3)}y`;
  } else if (word.endsWith('s')) {
    return word.slice(0, -1);
  }
  return word;
};

export const convertMultipleSpacesToNbsp = (html: string) => {
  // Function to check if text contains meaningful content (not just spaces/nbsp)
  const hasRealTextContent = (text: string): boolean => {
    // Remove all types of spaces and check if anything remains
    return text.replace(/[\s\u00A0\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/g, '').length > 0;
  };

  // Check if HTML contains only whitespace/nbsp in paragraph tags
  const isEmptyParagraph = (htmlString: string): boolean => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    const paragraphs = tempDiv.querySelectorAll('p');

    if (paragraphs.length === 1 && tempDiv.children.length === 1) {
      const pContent = paragraphs[0].textContent || '';
      return !hasRealTextContent(pContent);
    }
    return false;
  };

  // If it's just an empty paragraph with spaces/nbsp, don't process it
  if (isEmptyParagraph(html)) {
    return html;
  }

  // Create a temporary DOM element to parse HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Function to process text nodes within an element
  const processTextNodes = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || '';
      if (text.includes('  ')) {
        // Only if there are multiple spaces
        node.textContent = text.replace(/ {2,}/g, (match) => '\u00A0'.repeat(match.length));
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;

      // Check if this element has real text content (not just spaces/nbsp)
      const elementText = element.textContent || '';
      if (hasRealTextContent(elementText)) {
        Array.from(element.childNodes).forEach((child) => processTextNodes(child));
      }
    }
  };

  // Process all child nodes
  Array.from(tempDiv.childNodes).forEach((child) => processTextNodes(child));

  return tempDiv.innerHTML;
};

export function getFieldError<T extends FieldErrors>(
  errors: T,
  path: string,
): FieldError | undefined {
  if (!path) return undefined;

  const error = path.split('.').reduce<unknown>((acc, key) => {
    if (acc == null) return undefined;
    if (Array.isArray(acc)) {
      const index = Number(key);
      return Number.isNaN(index) ? undefined : acc[index];
    }
    if (typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, errors);

  // ✅ Handle array with root errors like before
  if (Array.isArray(error)) {
    for (const item of error) {
      if (item && typeof item === 'object' && 'root' in item) {
        return item.root as FieldError;
      }
    }
  }

  // ✅ NEW: If the resolved error is an object with nested messages (e.g. slot.endTime)
  if (error && typeof error === 'object' && !('message' in error)) {
    for (const value of Object.values(error as Record<string, unknown>)) {
      if (value && typeof value === 'object' && 'message' in value) {
        return value as FieldError;
      }
    }
  }

  return error as FieldError | undefined;
}

export const getNestedValue = <T extends object, R = unknown>(
  obj: T,
  path: string,
): R | undefined => {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);

  return value === null || value === undefined || value === '' ? undefined : (value as R);
};

export const renderObject = <T extends Record<string, unknown>>(
  obj?: T,
  order?: string[],
): string => {
  if (!obj) return '---';

  const keys = order?.length ? order : Object.keys(obj);
  const values = keys
    .map((k) => getNestedValue(obj, k))
    .filter(
      (v): v is string | number =>
        v !== undefined &&
        v !== null &&
        v !== '' &&
        (typeof v === 'string' || typeof v === 'number'),
    )
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);

  return values.length > 0 ? values.join(', ') : '---';
};

export const filterByKeys = <
  T extends Record<string, unknown>, // The type of each object in the array
  K extends keyof T, // The type of the key that will be compared
>(
    data: T[], // The array of JSON objects
    keys: string[], // The array of strings to compare the key values with
    key: K, // The key to tally or compare against the strings
  ): T[] => {
  return data.filter((item) => keys.includes(String(item[key])));
};
