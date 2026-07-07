import dayjs from 'dayjs';

export const getPatientAge = (dateOfBirth?: string | null) => {
  if (!dateOfBirth) return null;

  const dob = dayjs(dateOfBirth);

  if (!dob.isValid()) return null;

  return dayjs().diff(dob, 'year');
};
