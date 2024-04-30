import AppTrx from '@ledgerhq/hw-app-trx';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';

import { LedgerTrxWebHid } from '../../../tron_wallet/ledger';

jest.mock('@ledgerhq/hw-transport-webhid');
jest.mock('@ledgerhq/hw-app-trx');

describe('ledgerTrxWebHid - makeApp', () => {
  it('happy path', async () => {
    TransportWebHID.create = jest.fn().mockReturnValue({ close: jest.fn() });
    AppTrx.constructor = jest.fn().mockReturnValue({});

    let ledgerTrxWebHid = new LedgerTrxWebHid();

    const response = await ledgerTrxWebHid.signTransactionHash(
      "44'/60'/0'/0/0",
      '0xaaaaaaaaaaaaaaa',
    );

    expect(ledgerTrxWebHid!._transport!.close).toHaveBeenCalled();
  });
});
