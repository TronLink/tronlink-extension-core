import { SignError } from '../../../base_wallet/error';
import { LedgerTrxSigner } from '../../../tron_wallet';
import { typedData } from '../constants';

jest.mock('../../../tron_wallet/ledger/LedgerTrxWebHid', () => {
  const originalModule = jest.requireActual('../../../tron_wallet/ledger/LedgerTrxWebHid');
  return {
    __esModule: true,
    ...originalModule,
    LedgerTrxWebHid: class MockLedgerTrxWebHid {
      signTransactionHash() {
        return jest.fn().mockResolvedValueOnce('success')();
      }
    },
  };
});

describe('ledgerSignTypedData test', () => {
  const ledgerTrxSigner = new LedgerTrxSigner();

  it('happy path', async () => {
    const signature = await ledgerTrxSigner.ledgerSignTypedData({
      data: typedData,
      path: `m/44'/195'/0'/0/0`,
    });

    expect(signature).toMatch('success');
  });

  it('params is invalid', async () => {
    try {
      await ledgerTrxSigner.ledgerSignTypedData({
        data: '',
        path: '',
      });
    } catch (error) {
      expect(error).toEqual(new SignError('Cannot convert undefined or null to object'));
    }
  });
});
