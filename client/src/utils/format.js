const CURRENCY = import.meta.env.VITE_CURRENCY || 'USD';
const LOCALE = import.meta.env.VITE_LOCALE || 'en-US';

const currencyFormatter = new Intl.NumberFormat(LOCALE, {
  style: 'currency',
  currency: CURRENCY,
});

export const formatCurrency = (value = 0) => currencyFormatter.format(value);

// Dates are stored as UTC midnight, so format in UTC to avoid off-by-one days
export const formatDate = (value) =>
  new Date(value).toLocaleDateString(LOCALE, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });

// "YYYY-MM-DD" for <input type="date">
export const toInputDate = (value = new Date()) => new Date(value).toISOString().slice(0, 10);

export const todayInput = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};
