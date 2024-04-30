import { isPositiveInteger } from '../../utils';

describe('isPositiveInteger', () => {
  test('should return true for positive integers', () => {
    expect(isPositiveInteger(0)).toBe(true);
    expect(isPositiveInteger(5)).toBe(true);
    expect(isPositiveInteger(100)).toBe(true);
  });

  test('should return false for negative integers', () => {
    expect(isPositiveInteger(-5)).toBe(false);
    expect(isPositiveInteger(-100)).toBe(false);
  });

  test('should return false for non-integer numbers', () => {
    expect(isPositiveInteger(3.14)).toBe(false);
    expect(isPositiveInteger(-2.5)).toBe(false);
  });

  test('should return false for non-number values', () => {
    expect(isPositiveInteger('abc')).toBe(false);
    expect(isPositiveInteger(true)).toBe(false);
    expect(isPositiveInteger(null)).toBe(false);
    expect(isPositiveInteger(undefined)).toBe(false);
    expect(isPositiveInteger({})).toBe(false);
  });

  test('should return false for NaN', () => {
    expect(isPositiveInteger(NaN)).toBe(false);
  });
});
