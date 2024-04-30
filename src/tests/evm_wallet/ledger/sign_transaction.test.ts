import { LedgerEthWebHid } from '../../../evm_wallet/ledger';
import AppEth from '@ledgerhq/hw-app-eth';

jest.mock('@ledgerhq/hw-app-eth');

const DEFAULT_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000001';
const DEFAULT_USER_ADDRESS1 = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'; // privateKey is 000...0001
const DEFAULT_USER_ADDRESS2 = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'; // privateKey is 000...0002

const mockUnSignTransaction = {
  from: DEFAULT_USER_ADDRESS1,
  to: DEFAULT_USER_ADDRESS2,
  value: '0x1',
  isUserEdit: false,
  type: '0x2',
  maxFeePerGas: '0x59682f0b',
  maxPriorityFeePerGas: '0x59682f00',
  gasLimit: '0x5208',
  nonce: '0xe',
};

describe('LedgerEthWebHid - signTransaction', () => {
  let ledgerEthWebHid: LedgerEthWebHid;

  beforeEach(() => {
    ledgerEthWebHid = new LedgerEthWebHid();
    // @ts-ignore
    ledgerEthWebHid.makeApp = jest.fn();
    // @ts-ignore
    ledgerEthWebHid.cleanUp = jest.fn();
  });

  test('signs transaction successfully', async () => {
    const mockTransaction = mockUnSignTransaction;
    const mockPath = "44'/60'/0'/0/0";
    AppEth.prototype.clearSignTransaction = jest.fn();
    // @ts-ignore
    LedgerEthWebHid.prototype.makeApp = jest.fn();
    // @ts-ignore
    ledgerEthWebHid._app = new AppEth();

    const response = await ledgerEthWebHid.signTransaction(mockTransaction, mockPath);
    expect(AppEth.prototype.clearSignTransaction).toHaveBeenCalledWith(
      mockPath,
      mockTransaction,
      expect.objectContaining({
        nft: false,
        externalPlugins: true,
        erc20: true,
      }),
    );
  });

  test('handles exceptions during transaction signing', async () => {
    const mockTransaction = mockUnSignTransaction;
    const mockPath = "44'/60'/0'/0/0";
    AppEth.prototype.clearSignTransaction = jest
      .fn()
      .mockRejectedValue(new Error('Signing failed'));
    // @ts-ignore
    LedgerEthWebHid.prototype.makeApp = jest.fn();
    // @ts-ignore
    ledgerEthWebHid._app = new AppEth();

    await expect(ledgerEthWebHid.signTransaction(mockTransaction, mockPath)).rejects.toThrow(
      'Signing failed',
    );
  });

  test('handles exceptions during makeApp call', async () => {
    const mockTransaction = mockUnSignTransaction;
    const mockPath = "44'/60'/0'/0/0";
    // @ts-ignore
    ledgerEthWebHid.makeApp = jest.fn().mockRejectedValue(new Error('Error creating app'));

    await expect(ledgerEthWebHid.signTransaction(mockTransaction, mockPath)).rejects.toThrow(
      'Error creating app',
    );
  });

  test('performs cleanup after signing transaction', async () => {
    const mockTransaction = mockUnSignTransaction;
    const mockPath = "44'/60'/0'/0/0";
    AppEth.prototype.clearSignTransaction = jest.fn();
    // @ts-ignore
    LedgerEthWebHid.prototype.makeApp = jest.fn();
    // @ts-ignore
    ledgerEthWebHid._app = new AppEth();

    // @ts-ignore
    ledgerEthWebHid.cleanUp = jest.fn();

    await ledgerEthWebHid.signTransaction(mockTransaction, mockPath);
    // @ts-ignore
    expect(ledgerEthWebHid.cleanUp).toHaveBeenCalled();
  });
});
