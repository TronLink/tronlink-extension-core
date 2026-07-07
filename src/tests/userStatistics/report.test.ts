import { buildFundReportString } from '../../userStatistics/report';
import { AddressAssetPrecipitation } from '../../userStatistics/types';

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

  it('formats trxBalance, usdtBalance and realTokenUsd in the output string', () => {
    expect(buildFundReportString([baseRecord])).toBe(
      'V1X|uid1|1|100|50.9|9.8|2026-07-06|',
    );
  });

  it('applies the "0" fallback to malformed numeric fields', () => {
    const record: AddressAssetPrecipitation = {
      ...baseRecord,
      trxBalance: '',
      usdtBalance: 'abc',
      realTokenUsd: 'NaN',
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
      'V1X|uid1|1|100|50.9|9.8|2026-07-06|V1X|uid2|1|7.7|8.8|9.9|2026-07-06|',
    );
  });

  it('returns an empty string for no records', () => {
    expect(buildFundReportString([])).toBe('');
  });
});
