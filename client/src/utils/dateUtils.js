/**
 * Formats a Date object or timestamp into YYYY-MM-DD
 */
export const formatDateKey = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats month key YYYY-MM
 */
export const formatMonthKey = (date = new Date()) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

/**
 * Returns month title e.g. "September 2026"
 */
export const getMonthName = (monthKey) => {
  if (!monthKey) return '';
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, 1));
  return date.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
};

/**
 * Returns number of days in given month key 'YYYY-MM'
 */
export const getDaysInMonth = (monthKey) => {
  if (!monthKey) return 30;
  const [year, month] = monthKey.split('-').map(Number);
  return new Date(year, month, 0).getDate();
};

/**
 * Generates array of day numbers [1, 2, ..., daysInMonth]
 */
export const getMonthDaysArray = (monthKey) => {
  const days = getDaysInMonth(monthKey);
  return Array.from({ length: days }, (_, i) => i + 1);
};
