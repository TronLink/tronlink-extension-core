import { LedgerTrxWebHid } from '../../../tron_wallet/ledger';

import { EvmWallet } from '../../../evm_wallet';

describe('LedgerTrxWebHid - getAvailableAddress', () => {
  let ledgerTrxWebHid: LedgerTrxWebHid;

  beforeEach(() => {
    ledgerTrxWebHid = new LedgerTrxWebHid();
    ledgerTrxWebHid.getAddressByDefinePath = jest.fn();
  });

  test('returns first available address', async () => {
    ledgerTrxWebHid.getAddressByDefinePath = jest
      .fn()
      .mockResolvedValueOnce('TAddress1')
      .mockResolvedValueOnce('TAddress2');
    const addressItems = {
      addresses: ['TAddress1'],
    };

    const result = await ledgerTrxWebHid.getAvailableAddress(addressItems);
    expect(result).toEqual({ index: 1, address: 'TAddress2', path: "m/44'/195'/1'/0/0" });
  });

  test('handles empty address items', async () => {
    ledgerTrxWebHid.getAddressByDefinePath = jest.fn().mockResolvedValue('TAddress1');

    const result = await ledgerTrxWebHid.getAvailableAddress({ addresses: [] });
    expect(result).toEqual({ index: 0, address: 'TAddress1', path: "m/44'/195'/0'/0/0" });
  });

  test('continues searching when address already exists in the list', async () => {
    EvmWallet.prototype.derivePath = jest
      .fn()
      .mockReturnValueOnce('path/0')
      .mockReturnValueOnce('path/1')
      .mockReturnValueOnce('path/2');
    ledgerTrxWebHid.getAddressByDefinePath = jest
      .fn()
      .mockResolvedValueOnce('TAddress1')
      .mockResolvedValueOnce('TAddress2')
      .mockResolvedValueOnce('TAddress3');
    const addressItems = {
      addresses: ['TAddress1', 'TAddress2'],
    };

    const result1 = await ledgerTrxWebHid.getAvailableAddress(addressItems);
    expect(result1.address).toBe('TAddress3');
  });

  test('increments index correctly during address search', async () => {
    ledgerTrxWebHid.getAddressByDefinePath = jest
      .fn()
      .mockResolvedValueOnce('TAddress0')
      .mockResolvedValueOnce('TAddress1')
      .mockResolvedValueOnce('TAddress2');
    const addressItems = {
      addresses: ['TAddress0', 'TAddress1'],
    };

    const result = await ledgerTrxWebHid.getAvailableAddress(addressItems);
    expect(result.index).toBe(2);
  });

  test('handles exceptions when unable to get address', async () => {
    ledgerTrxWebHid.getAddressByDefinePath = jest
      .fn()
      .mockRejectedValue(new Error('Error fetching address'));

    await expect(ledgerTrxWebHid.getAvailableAddress({ addresses: [] })).rejects.toThrow(
      'Error fetching address',
    );
  });
});
