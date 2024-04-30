export function isPositiveInteger(value: any): value is number {
  return typeof value === 'number' && value >= 0 && Number.isInteger(value);
}
