export const formatCurrency = (val: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(val);

export const chartTooltipFormatter = (value: unknown) =>
  formatCurrency(Number(value ?? 0));
