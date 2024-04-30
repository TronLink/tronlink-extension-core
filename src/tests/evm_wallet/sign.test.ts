import { EvmWallet } from '../../evm_wallet';

const DEFAULT_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000001';
const DEFAULT_USER_ADDRESS1 = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'; // privateKey is 000...0001
const DEFAULT_USER_ADDRESS2 = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'; // privateKey is 000...0002

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
describe('EvmSignManager - sign', () => {
  let evmWallet: EvmWallet;

  beforeEach(() => {
    evmWallet = new EvmWallet();
    evmWallet.signMessage = jest.fn();
    evmWallet.signTypedData = jest.fn();
    evmWallet.signTransaction = jest.fn();
  });

  test('check signMessage', async () => {
    await evmWallet.sign({
      data: 'anyString',
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    expect(evmWallet.signMessage).toHaveBeenCalled();
  });

  test('check signTypedData', async () => {
    await evmWallet.sign({
      data: testTypeData1,
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    expect(evmWallet.signTypedData).toHaveBeenCalled();
  });

  test('check signTransaction', async () => {
    await evmWallet.sign({
      data: {
        testKey: 'testValue',
      },
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    expect(evmWallet.signTransaction).toHaveBeenCalled();
  });

  test('check InvalidParameterError', async () => {
    await expect(
      evmWallet.sign({
        data: [123],
        privateKey: DEFAULT_PRIVATE_KEY,
      }),
    ).rejects.toThrow();
  });

  test('check SignError', async () => {
    // @ts-ignore
    await expect(evmWallet.sign(null)).rejects.toThrow();
  });
});
