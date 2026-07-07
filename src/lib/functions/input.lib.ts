import { FormEvent, KeyboardEvent } from 'react';

import regex from '../regex';

const allowedControlKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

export type TTextInputMode = 'default' | 'numeric' | 'alphabetic' | 'alphanumeric';

export type TNumericOptions = {
  typeSkip?: boolean;
  maxDecimalPlaces?: number;
  specialCharacters?: string[];
};

export function handleTextInput(
  e: React.KeyboardEvent<HTMLInputElement>,
  mode: TTextInputMode,
  allowSpaces = true,
  specialCharacters: string[] = [],
) {
  const key = e.key;

  if (allowedControlKeys.includes(key)) return;

  if (e.ctrlKey || e.metaKey) return;

  if (specialCharacters.includes(key)) return;

  let pattern: RegExp | undefined;

  if (mode === 'alphabetic') {
    pattern = allowSpaces ? regex.alphabetic : regex.alphabeticNoSpace;
  } else if (mode === 'alphanumeric') {
    pattern = allowSpaces ? regex.alphanumeric : regex.alphanumericNoSpace;
  }

  if (pattern && !pattern.test(key)) {
    e.preventDefault();
  }
}
export function handleNumericInput(
  e: KeyboardEvent<HTMLInputElement> | FormEvent<HTMLInputElement>,
  { maxDecimalPlaces = 2, specialCharacters = [] }: TNumericOptions = {},
) {
  if ('key' in e) {
    const key = e.key;
    const allowedNumbers = new Set([
      '0',
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      ...specialCharacters,
    ]);
    const allowedControl = new Set(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']);
    if (allowedControl.has(key)) return;
    if (!allowedNumbers.has(key)) return e.preventDefault();

    const input = e.currentTarget;
    const val = input.value;

    if (key === '.' && specialCharacters.includes('.') && val.includes('.'))
      return e.preventDefault();

    if (regex.singleDigit.test(key)) {
      const dotIndex = val.indexOf('.');
      if (dotIndex !== -1) {
        const cursor = input.selectionStart ?? val.length;
        const afterDot = val.length - dotIndex - 1;
        if (cursor > dotIndex && afterDot >= maxDecimalPlaces) return e.preventDefault();
      }
    }
  }

  if ('currentTarget' in e) {
    const input = e.currentTarget;
    const regex = new RegExp(`[^0-9${specialCharacters.join('')}]`, 'g');
    let cleaned = input.value.replace(regex, '');
    if (specialCharacters.includes('.') && cleaned.includes('.')) {
      const [int, dec = ''] = cleaned.split('.');
      cleaned = `${int}.${dec.slice(0, maxDecimalPlaces)}`;
    }
    if (cleaned !== input.value) input.value = cleaned;
  }
}
