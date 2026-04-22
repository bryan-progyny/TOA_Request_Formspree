export const formatCurrency = (value: string): string => {
  const numericValue = value.replace(/[^0-9.]/g, '');
  if (!numericValue) return '';

  const parts = numericValue.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  const formatted = parts.join('.');
  return `$${formatted}`;
};

export const formatPercentage = (value: string): string => {
  const numericValue = value.replace(/[^0-9.]/g, '');
  if (!numericValue) return '';
  return `${numericValue}%`;
};

export const unformatCurrency = (value: string): string => {
  return value.replace(/[^0-9.]/g, '');
};

export const unformatPercentage = (value: string): string => {
  return value.replace(/[^0-9.]/g, '');
};

export const formatNumberWithCommas = (value: string): string => {
  const numericValue = value.replace(/[^0-9.]/g, '');
  if (!numericValue) return '';

  const parts = numericValue.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
};

export const unformatNumber = (value: string): string => {
  return value.replace(/,/g, '');
};
