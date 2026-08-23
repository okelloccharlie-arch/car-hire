// Formats a number as "12,000" — adds thousand separators, no decimals.
export function formatMoney(amount: number | string) {
  return new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 }).format(Number(amount));
}