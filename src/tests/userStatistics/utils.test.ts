import { formatReportNumber } from '../../userStatistics/utils';

describe('formatReportNumber', () => {
  it('keeps at most 3 significant digits, truncating (not rounding)', () => {
    expect(formatReportNumber('123.456')).toBe('123');
    expect(formatReportNumber('123.6')).toBe('123');
    expect(formatReportNumber('12345.6')).toBe('12300');
    expect(formatReportNumber('999.9')).toBe('999');
  });

  it('keeps at most 1 decimal place, truncating (more restrictive than 3 sig digits)', () => {
    expect(formatReportNumber('1.26')).toBe('1.2');
    expect(formatReportNumber('1.456')).toBe('1.4');
    expect(formatReportNumber('12.36')).toBe('12.3');
    expect(formatReportNumber('0.126')).toBe('0.1');
    expect(formatReportNumber('0.05')).toBe('0');
  });

  it('leaves values already within both limits unchanged', () => {
    expect(formatReportNumber('9.5')).toBe('9.5');
    expect(formatReportNumber('0.9')).toBe('0.9');
    expect(formatReportNumber('7.7')).toBe('7.7');
    expect(formatReportNumber('0')).toBe('0');
    expect(formatReportNumber('123')).toBe('123');
  });

  it('truncates sub-1 values toward zero', () => {
    expect(formatReportNumber('0.999')).toBe('0.9');
    expect(formatReportNumber('-0.99')).toBe('-0.9');
  });

  it('collapses any value below 0.1 to "0" (1-decimal-place limit)', () => {
    expect(formatReportNumber('0.09')).toBe('0');
    expect(formatReportNumber('0.001234')).toBe('0');
    expect(formatReportNumber('0.0001')).toBe('0');
    expect(formatReportNumber('1e-3')).toBe('0');
    expect(formatReportNumber('-0.05')).toBe('0');
  });

  it('trims surrounding whitespace', () => {
    expect(formatReportNumber('  42.5  ')).toBe('42.5');
  });

  it('falls back to "0" for infinite values', () => {
    expect(formatReportNumber('Infinity')).toBe('0');
    expect(formatReportNumber('-Infinity')).toBe('0');
  });

  it('handles negatives (truncating toward zero) and avoids "-0"', () => {
    expect(formatReportNumber('-123.99')).toBe('-123');
    expect(formatReportNumber('-0.5')).toBe('-0.5');
    expect(formatReportNumber('-0.04')).toBe('0');
  });

  it('never emits scientific notation for very large numbers', () => {
    const result = formatReportNumber('123456789012345678901234.56');
    expect(result).toBe('123000000000000000000000');
    expect(result).not.toContain('e');
  });

  it('accepts scientific-notation input and expands it', () => {
    expect(formatReportNumber('1e21')).toBe('1000000000000000000000');
  });

  it('falls back to "0" for non-numeric input', () => {
    expect(formatReportNumber('')).toBe('0');
    expect(formatReportNumber('abc')).toBe('0');
    expect(formatReportNumber('NaN')).toBe('0');
    expect(formatReportNumber('1,000')).toBe('0');
  });

  it('accepts number input (runtime type from @ts-ignore callers)', () => {
    expect(formatReportNumber(123)).toBe('123');
    expect(formatReportNumber(50.999)).toBe('50.9');
    expect(formatReportNumber(0)).toBe('0');
    expect(formatReportNumber(-0.99)).toBe('-0.9');
  });

  it('falls back to "0" for non-numeric number input', () => {
    expect(formatReportNumber(NaN)).toBe('0');
    expect(formatReportNumber(Infinity)).toBe('0');
    expect(formatReportNumber(-Infinity)).toBe('0');
  });

  it('falls back to "0" for null/undefined/other non-string, non-number input', () => {
    expect(formatReportNumber(undefined as unknown as string)).toBe('0');
    expect(formatReportNumber(null as unknown as string)).toBe('0');
    expect(formatReportNumber({} as unknown as string)).toBe('0');
  });
});
