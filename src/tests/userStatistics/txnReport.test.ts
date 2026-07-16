import { buildTxnReportString } from '../../userStatistics/report';
import { TransactionRecord } from '../../userStatistics/types';

const baseRecord: TransactionRecord = {
  uid: 'uid1',
  addressType: 1,
  contractType: 3,
  actionType: 1053,
  count: 3,
  tokenAddress: 'token-addr-1',
  energy: '65000',
  bandwidth: '345',
  burn: '0',
  date: '2026-07-07',
  txnAmountDistributions: [{ range: '100_1k', count: 3 }],
};

describe('buildTxnReportString', () => {
  it('writes a literal 0 in the 7th (former tokenAmount) segment', () => {
    expect(buildTxnReportString([baseRecord])).toBe(
      'V1Y|uid1|1|1053|3|token-addr-1|0|65000|345|0|2026-07-07|A4:3|',
    );
  });

  it('keeps the V1Y layout at 12 pipe-delimited segments (trailing empty)', () => {
    const out = buildTxnReportString([baseRecord]);
    // trailing '|' yields an empty final element; the record occupies 12 segments
    const segments = out.split('|');
    expect(segments).toHaveLength(13);
    expect(segments[12]).toBe('');
    // 7th segment (index 6) is the placeholder
    expect(segments[6]).toBe('0');
  });

  it('maps distribution ranges and joins them', () => {
    const record: TransactionRecord = {
      ...baseRecord,
      txnAmountDistributions: [
        { range: '0_1', count: 2 },
        { range: '10m_infinite', count: 1 },
      ],
    };
    expect(buildTxnReportString([record])).toBe(
      'V1Y|uid1|1|1053|3|token-addr-1|0|65000|345|0|2026-07-07|A1:2,A9:1|',
    );
  });

  it('concatenates multiple records', () => {
    const second: TransactionRecord = { ...baseRecord, uid: 'uid2', count: 1 };
    expect(buildTxnReportString([baseRecord, second])).toBe(
      'V1Y|uid1|1|1053|3|token-addr-1|0|65000|345|0|2026-07-07|A4:3|' +
        'V1Y|uid2|1|1053|1|token-addr-1|0|65000|345|0|2026-07-07|A4:3|',
    );
  });

  it('returns an empty string for no records', () => {
    expect(buildTxnReportString([])).toBe('');
  });
});
