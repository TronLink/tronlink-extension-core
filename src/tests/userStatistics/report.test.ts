import { buildFundReportString, truncateDecimals } from '../../userStatistics/report';
import { AddressAssetPrecipitation } from '../../userStatistics/types';

describe('truncateDecimals', () => {
  it('truncates the fractional part without rounding', () => {
    expect(truncateDecimals('123.99')).toBe('123');
    expect(truncateDecimals('0.9')).toBe('0');
    expect(truncateDecimals('9.5')).toBe('9');
  });

  it('keeps integer strings unchanged', () => {
    expect(truncateDecimals('123')).toBe('123');
    expect(truncateDecimals('0')).toBe('0');
  });

  it('strips leading zeros', () => {
    expect(truncateDecimals('007')).toBe('7');
    expect(truncateDecimals('00')).toBe('0');
    expect(truncateDecimals('000.5')).toBe('0');
  });

  it('trims surrounding whitespace', () => {
    expect(truncateDecimals('  42.7  ')).toBe('42');
  });

  it('handles negative values and avoids "-0"', () => {
    expect(truncateDecimals('-123.99')).toBe('-123');
    expect(truncateDecimals('-0.5')).toBe('0');
    expect(truncateDecimals('-0')).toBe('0');
  });

  it('does not lose precision for large integers (beyond 2^53)', () => {
    expect(truncateDecimals('9999999999999999')).toBe('9999999999999999');
    expect(truncateDecimals('123456789012345678901234.56')).toBe(
      '123456789012345678901234',
    );
  });

  it('never emits scientific notation for very large numbers', () => {
    const result = truncateDecimals('1000000000000000000000');
    expect(result).toBe('1000000000000000000000');
    expect(result).not.toContain('e');
  });

  it('falls back to "0" for non-numeric or malformed input', () => {
    expect(truncateDecimals('')).toBe('0');
    expect(truncateDecimals('abc')).toBe('0');
    expect(truncateDecimals('NaN')).toBe('0');
    expect(truncateDecimals('1e21')).toBe('0');
    expect(truncateDecimals('12.')).toBe('0');
    expect(truncateDecimals('.5')).toBe('0');
    expect(truncateDecimals('1,000')).toBe('0');
    expect(truncateDecimals('12 34')).toBe('0');
  });

  it('falls back to "0" for non-string input', () => {
    expect(truncateDecimals(undefined as unknown as string)).toBe('0');
    expect(truncateDecimals(null as unknown as string)).toBe('0');
    expect(truncateDecimals(123 as unknown as string)).toBe('0');
  });
});

describe('buildFundReportString', () => {
  const baseRecord: AddressAssetPrecipitation = {
    uid: 'uid1',
    addressType: 1,
    trxBalance: '100.123456',
    usdtBalance: '50.999',
    totalBalanceInUSD: '150.5',
    realTokenUsd: '9.87',
    date: '2026-07-06',
  };

  it('truncates trxBalance, usdtBalance and realTokenUsd in the output string', () => {
    expect(buildFundReportString([baseRecord])).toBe(
      'V1X|uid1|1|100|50|9|2026-07-06|',
    );
  });

  it('applies the "0" fallback to malformed numeric fields', () => {
    const record: AddressAssetPrecipitation = {
      ...baseRecord,
      trxBalance: '',
      usdtBalance: 'abc',
      realTokenUsd: '1e21',
    };
    expect(buildFundReportString([record])).toBe('V1X|uid1|1|0|0|0|2026-07-06|');
  });

  it('concatenates multiple records', () => {
    const second: AddressAssetPrecipitation = {
      ...baseRecord,
      uid: 'uid2',
      trxBalance: '7.7',
      usdtBalance: '8.8',
      realTokenUsd: '9.9',
    };
    expect(buildFundReportString([baseRecord, second])).toBe(
      'V1X|uid1|1|100|50|9|2026-07-06|V1X|uid2|1|7|8|9|2026-07-06|',
    );
  });

  it('returns an empty string for no records', () => {
    expect(buildFundReportString([])).toBe('');
  });
});
