import { BigNumber } from 'bignumber.js';

// month starts from 0, so we need to add 1
export function getCurrentUtcDate(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Keep at most 3 significant digits and at most 1 decimal place.
// Accepts number too: some callers (e.g. realTokenUsd from the @ts-ignore
// backendManager chain) may pass a runtime number despite the string type.
export function formatReportNumber(value: string | number): string {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return '0';
  }
  const bn = new BigNumber(value);
  if (!bn.isFinite()) {
    return '0';
  }
  return bn
    .precision(3, BigNumber.ROUND_DOWN)
    .decimalPlaces(1, BigNumber.ROUND_DOWN)
    .toFixed();
}
