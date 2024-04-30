import { LedgerEthWebHid } from '../../../evm_wallet/ledger';
import AppEth from '@ledgerhq/hw-app-eth';
import { TypedDataUtils } from 'eth-sig-util';

jest.mock('@ledgerhq/hw-app-eth');
jest.mock('eth-sig-util');

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

const testTypeData1 = {
  types: {
    EIP712Domain: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'version',
        type: 'string',
      },
      {
        name: 'chainId',
        type: 'uint256',
      },
      {
        name: 'verifyingContract',
        type: 'address',
      },
    ],
    Person: [
      {
        name: 'name',
        type: 'string',
      },
      {
        name: 'wallet',
        type: 'address',
      },
    ],
    Mail: [
      {
        name: 'from',
        type: 'Person',
      },
      {
        name: 'to',
        type: 'Person',
      },
      {
        name: 'contents',
        type: 'string',
      },
    ],
  },
  primaryType: 'Mail',
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  message: {
    from: {
      name: 'Cow',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
};

describe('LedgerEthWebHid - signTypedData', () => {
  let ledgerEthWebHid: LedgerEthWebHid;

  beforeEach(() => {
    ledgerEthWebHid = new LedgerEthWebHid();
    // @ts-ignore
    ledgerEthWebHid.makeApp = jest.fn();
    // @ts-ignore
    ledgerEthWebHid.cleanUp = jest.fn();
    TypedDataUtils.hashStruct = jest.fn();
  });

  test('signs typed data successfully', async () => {
    const mockData = testTypeData1;
    const mockPath = "44'/60'/0'/0/0";
    const mockSignature = {
      test: 'testString',
    };
    TypedDataUtils.hashStruct = jest.fn().mockReturnValue(Buffer.from('mockHash'));
    AppEth.prototype.signEIP712HashedMessage = jest.fn().mockResolvedValue(mockSignature);
    // @ts-ignore
    ledgerEthWebHid._app = new AppEth();

    const response = await ledgerEthWebHid.signTypedData(mockData, mockPath);
    expect(response).toEqual(mockSignature);
  });

  test('handles exceptions during typed data signing', async () => {
    const mockData = mockUnSignTransaction;
    const mockPath = "44'/60'/0'/0/0";
    TypedDataUtils.hashStruct = jest.fn().mockReturnValue(Buffer.from('mockHash'));
    AppEth.prototype.signEIP712HashedMessage = jest
      .fn()
      .mockRejectedValue(new Error('Signing failed'));
    // @ts-ignore
    ledgerEthWebHid._app = new AppEth();

    await expect(ledgerEthWebHid.signTypedData(mockData, mockPath)).rejects.toThrow(
      'Signing failed',
    );
  });

  test('signTypedData performs cleanup after signing', async () => {
    const mockData = {
      /* typed data */
    };
    const mockPath = "44'/60'/0'/0/0";
    TypedDataUtils.hashStruct = jest.fn().mockReturnValue(Buffer.from('mockHash', 'hex'));
    AppEth.prototype.signEIP712HashedMessage = jest.fn().mockResolvedValue({ test: 'testString' });
    // @ts-ignore
    ledgerEthWebHid._app = new AppEth();

    await ledgerEthWebHid.signTypedData(mockData, mockPath);
    // @ts-ignore
    expect(ledgerEthWebHid.cleanUp).toHaveBeenCalled();
  });

  test('signTypedData correctly signs different typed data', async () => {
    const mockData1 = {
      /* typed data 1 */
    };
    const mockData2 = {
      /* typed data 2 */
    };
    const mockPath = "44'/60'/0'/0/0";
    const mockSignature1 = { signature: 'signatureData1' };
    const mockSignature2 = { signature: 'signatureData2' };
    TypedDataUtils.hashStruct = jest
      .fn()
      .mockReturnValueOnce(Buffer.from('mockHash1', 'hex'))
      .mockReturnValueOnce(Buffer.from('mockHash2', 'hex'))
      .mockReturnValueOnce(Buffer.from('mockHash3', 'hex'))
      .mockReturnValueOnce(Buffer.from('mockHash4', 'hex'));
    AppEth.prototype.signEIP712HashedMessage = jest
      .fn()
      .mockResolvedValueOnce(mockSignature1)
      .mockResolvedValueOnce(mockSignature2);
    // @ts-ignore
    ledgerEthWebHid._app = new AppEth();

    const response1 = await ledgerEthWebHid.signTypedData(mockData1, mockPath);
    const response2 = await ledgerEthWebHid.signTypedData(mockData2, mockPath);
    expect(response1).toEqual(mockSignature1);
    expect(response2).toEqual(mockSignature2);
  });
});
