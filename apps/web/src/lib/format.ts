import { format } from 'date-fns';

export function formatDateTime(value: string | Date) {
  return format(new Date(value), 'dd MMM, hh:mm a');
}

export function formatCurrencyInr(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}
