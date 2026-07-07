export const isValue = (value: unknown): boolean => {
  if (value === null || value === undefined) {
    return false;
  }
  return true;
};
export const isValueValid = (value: unknown): boolean => {
  if (value === null || value === undefined || value === '' || value === 0) {
    return false;
  }
  return true;
};
