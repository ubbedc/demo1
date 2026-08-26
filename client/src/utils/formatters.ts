/**
 * Centralized Financial & Data Formatters
 * Modifying format rules here applies across the entire application instantly.
 */

export function formatPrice(price: number | undefined | null, assetClass?: string | null): string {
  if (price === undefined || price === null || isNaN(price)) return '$0.00';
  const isForex = assetClass === 'FOREX';
  const decimals = isForex ? 4 : 2;
  return `$${price.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '$0.00';
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPercent(percent: number | undefined | null): string {
  if (percent === undefined || percent === null || isNaN(percent)) return '0.00%';
  const prefix = percent > 0 ? '+' : '';
  return `${prefix}${percent.toFixed(2)}%`;
}

export function formatDateTime(isoOrTimestamp: string | number | undefined | null): string {
  if (!isoOrTimestamp) return '-';
  const date = new Date(isoOrTimestamp);
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatQuantity(qty: number | undefined | null, symbol?: string): string {
  if (qty === undefined || qty === null || isNaN(qty)) return '0';
  const isForex = symbol?.includes('EUR') || symbol?.includes('GBP') || symbol?.includes('JPY');
  return isForex ? qty.toLocaleString('en-US') : qty.toString();
}
