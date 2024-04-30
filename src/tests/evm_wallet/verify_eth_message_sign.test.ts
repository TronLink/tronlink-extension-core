import { EvmWallet } from '../../evm_wallet';

const DEFAULT_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000001';
const DEFAULT_USER_ADDRESS1 = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'; // privateKey is 000...0001
const DEFAULT_USER_ADDRESS2 = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'; // privateKey is 000...0002

const rawUnsignedTransaction = {
  to: DEFAULT_USER_ADDRESS2,
  value: '0x1',
  gasLimit: '0x5208',
  nonce: '0xe',
  chainId: 1,
};

const testData1 = {
  signConfirmationTarget: 'publish',
  type: 10001,
  hostname: 'tronscan.org',
  unSignedTransaction: {
    ...rawUnsignedTransaction,
    from: DEFAULT_USER_ADDRESS1,
    isUserEdit: false,
    type: '0x2',
    maxFeePerGas: '0x59682f0b',
    maxPriorityFeePerGas: '0x59682f00',
  },
  archType: 'EVM',
};

describe('evm walLet - verifyEthMessageSign', () => {
  const wallet = new EvmWallet();

  it('normal message', async () => {
    const message = 'testMessage';
    const resultHash = await wallet.signMessage({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: message,
    });
    const result = wallet.verifyEthMessageSign(resultHash, message, DEFAULT_USER_ADDRESS1);
    expect(result).toBe(true);
  });

  it('0x message', async () => {
    const message = 'TestMessage';
    const resultHash = await wallet.signMessage({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: message,
    });
    const result = wallet.verifyEthMessageSign(resultHash, message, DEFAULT_USER_ADDRESS1);
    expect(result).toBe(true);
  });

  it('hex message, but without "0x"', async () => {
    const message = 'ae16f78a';
    const resultHash = await wallet.signMessage({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: message,
    });
    const result = wallet.verifyEthMessageSign(resultHash, message, DEFAULT_USER_ADDRESS1);
    expect(result).toBe(true);
  });

  it('hex message, with "0x"', async () => {
    const message = '0xae16f78a';
    const resultHash = await wallet.signMessage({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: message,
    });
    const result = wallet.verifyEthMessageSign(resultHash, message, DEFAULT_USER_ADDRESS1);
    expect(result).toBe(true);
  });
});
