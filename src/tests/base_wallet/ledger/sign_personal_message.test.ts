import { LedgerTrxWebHid } from '../../../tron_wallet';

describe('base walLet - getAddressByDefinePath', () => {
  let ledgerTrxWebHid: LedgerTrxWebHid;

  beforeEach(() => {
    ledgerTrxWebHid = new LedgerTrxWebHid();
    // @ts-ignore
    ledgerTrxWebHid.makeApp = jest
      .fn()
      .mockResolvedValue({ signPersonalMessage: jest.fn().mockReturnValue('success') });
    // @ts-ignore
    ledgerTrxWebHid.cleanUp = jest.fn();
  });

  it('happy path', async () => {
    const result = await ledgerTrxWebHid.signPersonalMessage('test', "m/44'/60'/0'/0/0");

    expect(result).toMatch('success');
  });
});
