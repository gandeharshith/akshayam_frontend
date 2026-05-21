/**
 * Shared IST (India Standard Time) date formatting utilities.
 * All dates stored in the DB are UTC — these helpers convert them to IST for display.
 */

const IST_LOCALE = 'en-IN';
const IST_TZ = 'Asia/Kolkata';

/** "21 May 2026" */
export const formatDateIST = (dateStr: string | Date): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString(IST_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: IST_TZ,
  });
};

/** "21 May 2026, 9:15 PM" */
export const formatDateTimeIST = (dateStr: string | Date): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString(IST_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: IST_TZ,
  });
};

/** "9:15 PM" */
export const formatTimeIST = (dateStr: string | Date): string => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleTimeString(IST_LOCALE, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: IST_TZ,
  });
};
