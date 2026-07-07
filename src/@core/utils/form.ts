import React from 'react';

/**
 * Reusable form helpers for consistent UX and 0 redundancy
 */

/**
 * Restricts input to numeric values only (strips non-digits)
 * Useful for phone numbers, internal IDs, etc.
 */
export const allowOnlyDigits =
  (onChange: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = e.target.value.replace(/\D/g, '');
      onChange(value);
    };

/**
 * Capitalizes the first letter of every word (for names)
 */
export const capitalizeWords = (value: string) => {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
};
