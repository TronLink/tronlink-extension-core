import { LedgerEthWebHid } from '../../../evm_wallet/ledger';
import AppEth from '@ledgerhq/hw-app-eth';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';

jest.mock('@ledgerhq/hw-app-eth');
jest.mock('@ledgerhq/hw-transport-webhid');

describe('LedgerEthWebHid - makeApp & cleanUp', () => {
  let ledgerEthWebHid: LedgerEthWebHid;

  beforeEach(() => {
    ledgerEthWebHid = new LedgerEthWebHid();
  });

  test('makeApp', async () => {
    const mockValue = {
      testKey: 'testVal',
    };
    jest.mock('@ledgerhq/hw-transport-webhid', () => {
      return {
        create: jest.fn().mockResolvedValue(mockValue),
      };
    });
    // @ts-ignore
    await ledgerEthWebHid.makeApp();
    expect(TransportWebHID.create).toHaveBeenCalled();
  });

  test('cleanUp', async () => {
    // @ts-ignore
    ledgerEthWebHid._transport = {
      close: jest.fn(),
    };
    // @ts-ignore
    await ledgerEthWebHid.cleanUp();
    expect(ledgerEthWebHid._transport?.close).toHaveBeenCalled();
  });
});
