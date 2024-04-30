import { Chain } from '@ethereumjs/common';
import { EvmWallet } from '../../evm_wallet';

const DEFAULT_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000001';
const DEFAULT_USER_ADDRESS1 = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'; // privateKey is 000...0001
const DEFAULT_USER_ADDRESS2 = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'; // privateKey is 000...0002

const rawUnsignedTransaction1 = {
  to: DEFAULT_USER_ADDRESS2,
  value: '0x1',
  gasLimit: '0x5208',
  nonce: '0xe',
  chainId: 1,
};
const rawUnsignedTransaction2 = {
  to: DEFAULT_USER_ADDRESS2,
  value: '0x1',
  gasLimit: '0x5208',
  nonce: '0xe',
  chainId: 11155111,
};
const rawUnsignedTransaction3 = {
  to: DEFAULT_USER_ADDRESS2,
  value: '0x1',
  gasLimit: '0x5208',
  nonce: '0xe',
  chainId: parseInt('0x38'),
};

const testData1 = {
  signConfirmationTarget: 'publish',
  type: 10001,
  hostname: 'tronscan.org',
  unSignedTransaction: {
    ...rawUnsignedTransaction1,
    from: DEFAULT_USER_ADDRESS1,
    isUserEdit: false,
    type: '0x2',
    maxFeePerGas: '0x59682f0b',
    maxPriorityFeePerGas: '0x59682f00',
  },
  archType: 'EVM',
};

describe('evm walLet - verifyEthTransactionSign', () => {
  const wallet = new EvmWallet();

  it('base check', async () => {
    const signedTx = await wallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common: wallet.getCommonConfiguration({
          isSupportsEIP1559: true,
          chain: Chain.Mainnet,
          chainId: '0x1',
          chainName: 'Mainnet',
        }),
        unSignedTransaction: rawUnsignedTransaction1,
      },
    });
    const rsvSignature = {
      r: '0x' + signedTx.r.toString(16),
      s: '0x' + signedTx.s.toString(16),
      v: Number(signedTx.v),
    };
    expect(
      wallet.verifyEthTransactionSign(rawUnsignedTransaction1, rsvSignature, DEFAULT_USER_ADDRESS1),
    ).toBe(true);
  });

  it('different chain should return false', async () => {
    const signedTx = await wallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common: wallet.getCommonConfiguration({
          isSupportsEIP1559: true,
          chain: Chain.Sepolia,
          chainId: '0xaa36a7',
          chainName: 'Sepolia',
        }),
        unSignedTransaction: rawUnsignedTransaction1,
      },
    });
    const rsvSignature = {
      r: '0x' + signedTx.r.toString(16),
      s: '0x' + signedTx.s.toString(16),
      v: Number(signedTx.v),
    };
    expect(
      wallet.verifyEthTransactionSign(rawUnsignedTransaction1, rsvSignature, DEFAULT_USER_ADDRESS1),
    ).toBe(false);
  });

  it('Sepolia chain', async () => {
    const signedTx = await wallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common: wallet.getCommonConfiguration({
          isSupportsEIP1559: true,
          chain: Chain.Sepolia,
          chainId: '0xaa36a7',
          chainName: 'Sepolia',
        }),
        unSignedTransaction: rawUnsignedTransaction2,
      },
    });
    const rsvSignature = {
      r: '0x' + signedTx.r.toString(16),
      s: '0x' + signedTx.s.toString(16),
      v: Number(signedTx.v),
    };
    expect(
      wallet.verifyEthTransactionSign(rawUnsignedTransaction2, rsvSignature, DEFAULT_USER_ADDRESS1),
    ).toBe(true);
  });

  it('NOT support EIP1559 chain', async () => {
    const signedTx = await wallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common: wallet.getCommonConfiguration({
          isSupportsEIP1559: false,
          chain: undefined,
          chainId: '0x38',
          chainName: 'bscMainnet',
        }),
        unSignedTransaction: rawUnsignedTransaction3,
      },
    });
    const rsvSignature = {
      r: '0x' + signedTx.r.toString(16),
      s: '0x' + signedTx.s.toString(16),
      v: Number(signedTx.v),
    };
    expect(
      wallet.verifyEthTransactionSign(rawUnsignedTransaction3, rsvSignature, DEFAULT_USER_ADDRESS1),
    ).toBe(true);
  });
});
