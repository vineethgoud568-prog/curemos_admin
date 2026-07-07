type TDateToken = 'd' | 'm' | 'y' | string;

type TFormatDateAndTimeProps = {
  locale?: string;
  dateOrder?: TDateToken[];
  includeWeekday?: boolean;
  includeSeconds?: boolean;
  monthStyle?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
};

export const formatDateAndTime = (dateString: string, options: TFormatDateAndTimeProps = {}) => {
  const {
    locale = 'en-US',
    monthStyle = 'long',
    includeWeekday = true,
    includeSeconds = false,
    dateOrder = ['m', 'd', 'y'],
  } = options;

  if (!dateString || Number.isNaN(Date.parse(dateString))) {
    return { date: '-', time: '-', full: '-', timeWithSeconds: '-' };
  }

  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const givenDate = new Date(dateString);
  const givenLocal = new Date(givenDate.toLocaleString(locale, { timeZone: userTimeZone }));

  const y = givenLocal.getFullYear();
  const m = givenLocal.getMonth() + 1;
  const d = givenLocal.getDate();

  const monthFormatted =
    monthStyle === 'long' || monthStyle === 'short' || monthStyle === 'narrow'
      ? givenLocal.toLocaleDateString(locale, { month: monthStyle })
      : m.toString().padStart(monthStyle === '2-digit' ? 2 : 1, '0');

  const partsMap: Record<'m' | 'd' | 'y', string> = {
    m: monthFormatted,
    d: d.toString().padStart(2, '0'),
    y: y.toString(),
  };

  // Produce EXACT text based on array order and separators
  const date = dateOrder
    .map((token) => (token === 'm' || token === 'd' || token === 'y' ? partsMap[token] : token))
    .join(' '); // <--- NO SPACES ADDED HERE

  const finalDate = includeWeekday
    ? `${givenLocal.toLocaleDateString(locale, { weekday: 'long' })}, ${date}`
    : date;

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    ...(includeSeconds ? { second: '2-digit' } : {}),
  };

  const time = givenLocal.toLocaleTimeString(locale, timeOptions);
  const timeWithSeconds = givenLocal.toLocaleTimeString(locale, {
    ...timeOptions,
    second: '2-digit',
  });

  return {
    date: finalDate,
    time,
    full: `${finalDate} at ${time}`,
    timeWithSeconds,
  };
};

export const formatOrNA = (value: string) =>
  value
    ? formatDateAndTime(value, {
      includeWeekday: false,
      monthStyle: 'short' as const,
      dateOrder: ['d', ' ', 'm', ',', ' ', 'y'] as const,
    }).date
    : 'N/A';

export const toISOTime = (timeStr: string, baseDate?: string | Date): string => {
  if (!timeStr) return '';
  const date = baseDate ? new Date(baseDate) : new Date();
  const [hours, minutes, seconds = 0] = timeStr.split(':').map(Number) as number[];
  date.setHours(hours, minutes, seconds, 0);
  return date.toISOString();
};

export const fromISOTime = (iso: string): string => {
  if (!iso) return '';
  const date = new Date(iso);
  return date.toLocaleTimeString('en-GB', { hour12: false });
};
