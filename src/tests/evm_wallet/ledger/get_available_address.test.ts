import { LedgerEthWebHid } from '../../../evm_wallet/ledger';

import { EvmWallet } from '../../../evm_wallet';

describe('LedgerEthWebHid - getAvailableAddress', () => {
  let ledgerEthWebHid: LedgerEthWebHid;

  beforeEach(() => {
    ledgerEthWebHid = new LedgerEthWebHid();
    ledgerEthWebHid.getAddressByDefinePath = jest.fn();
  });

  test('returns first available address', async () => {
    ledgerEthWebHid.getAddressByDefinePath = jest
      .fn()
      .mockResolvedValueOnce('0xAddress1')
      .mockResolvedValueOnce('0xAddress2');
    const addressItems = {
      addresses: ['0xAddress1'],
    };

    const result = await ledgerEthWebHid.getAvailableAddress(addressItems);
    expect(result).toEqual({ index: 1, address: '0xAddress2', path: "m/44'/60'/1'/0/0" });
  });

  test('handles empty address items', async () => {
    ledgerEthWebHid.getAddressByDefinePath = jest.fn().mockResolvedValue('0xAddress1');

    const result = await ledgerEthWebHid.getAvailableAddress({ addresses: [] });
    expect(result).toEqual({ index: 0, address: '0xAddress1', path: "m/44'/60'/0'/0/0" });
  });

  test('continues searching when address already exists in the list', async () => {
    EvmWallet.prototype.derivePath = jest
      .fn()
      .mockReturnValueOnce('path/0')
      .mockReturnValueOnce('path/1')
      .mockReturnValueOnce('path/2');
    ledgerEthWebHid.getAddressByDefinePath = jest
      .fn()
      .mockResolvedValueOnce('0xAddress1')
      .mockResolvedValueOnce('0xAddress2')
      .mockResolvedValueOnce('0xAddress3');
    const addressItems = {
      addresses: ['0xAddress1', '0xAddress2'],
    };

    const result1 = await ledgerEthWebHid.getAvailableAddress(addressItems);
    expect(result1.address).toBe('0xAddress3');
  });

  test('increments index correctly during address search', async () => {
    ledgerEthWebHid.getAddressByDefinePath = jest
      .fn()
      .mockResolvedValueOnce('0xAddress0')
      .mockResolvedValueOnce('0xAddress1')
      .mockResolvedValueOnce('0xAddress2');
    const addressItems = {
      addresses: ['0xAddress0', '0xAddress1'],
    };

    const result = await ledgerEthWebHid.getAvailableAddress(addressItems);
    expect(result.index).toBe(2);
  });

  test('handles exceptions when unable to get address', async () => {
    ledgerEthWebHid.getAddressByDefinePath = jest
      .fn()
      .mockRejectedValue(new Error('Error fetching address'));

    await expect(ledgerEthWebHid.getAvailableAddress({ addresses: [] })).rejects.toThrow(
      'Error fetching address',
    );
  });
});
