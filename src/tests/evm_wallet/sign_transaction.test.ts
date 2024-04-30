import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { EvmWallet } from '../../evm_wallet';

const DEFAULT_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000001';
const DEFAULT_USER_ADDRESS1 = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'; // privateKey is 000...0001
const DEFAULT_USER_ADDRESS2 = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'; // privateKey is 000...0002

const testData1 = {
  signConfirmationTarget: 'publish',
  type: 10001,
  hostname: 'tronscan.org',
  unSignedTransaction: {
    from: DEFAULT_USER_ADDRESS1,
    to: DEFAULT_USER_ADDRESS2,
    value: '0x1',
    isUserEdit: false,
    type: '0x2',
    maxFeePerGas: '0x59682f0b',
    maxPriorityFeePerGas: '0x59682f00',
    gasLimit: '0x5208',
    nonce: '0xe',
  },
  archType: 'EVM',
};

const testData2 = {
  signConfirmationTarget: 'publish',
  type: 10001,
  hostname: 'tronscan.org',
  unSignedTransaction: {
    from: DEFAULT_USER_ADDRESS1,
    to: DEFAULT_USER_ADDRESS2,
    value: '0x2',
    isUserEdit: false,
    type: '0x2',
    maxFeePerGas: '0x59682f0b',
    maxPriorityFeePerGas: '0x59682f00',
    gasLimit: '0x5208',
    nonce: '0xe',
  },
  archType: 'EVM',
};

describe('EvmSignManager - signTransaction', () => {
  let evmWallet: EvmWallet;

  beforeEach(() => {
    evmWallet = new EvmWallet();
  });

  test('correctly signs testData1', async () => {
    const common = new Common({
      chain: Chain.Sepolia,
      hardfork: Hardfork.London,
    });
    const signedResult = await evmWallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common,
        unSignedTransaction: testData1.unSignedTransaction,
      },
    });
    expect(signedResult).toMatchObject({
      chainId: 11155111n,
      gasLimit: 21000n,
      maxFeePerGas: 1500000011n,
      maxPriorityFeePerGas: 1500000000n,
      nonce: 14n,
      r: 82552217860031236257262189774320206886921969997957768088049761858925779921356n,
      s: 44277519908154129783607303483533060174166546782227932007089120354007708566835n,
      to: Buffer.from('0x2b5ad5c4795c026514f8317c7a215e218dccd6cf', 'hex'),
      v: 0n,
      value: 1n,
    });
  });

  test('correctly signs testData2', async () => {
    const common = new Common({
      chain: Chain.Sepolia,
      hardfork: Hardfork.London,
    });
    const signedResult = await evmWallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common,
        unSignedTransaction: testData2.unSignedTransaction,
      },
    });
    expect(signedResult).toMatchObject({
      chainId: 11155111n,
      gasLimit: 21000n,
      maxFeePerGas: 1500000011n,
      maxPriorityFeePerGas: 1500000000n,
      nonce: 14n,
      r: 102786836553643070371821283903784973684464336535953044543474093202137060934067n,
      s: 18819295348751590590059766087041147896234657076623041988374853214513379187822n,
      to: Buffer.from('0x2b5ad5c4795c026514f8317c7a215e218dccd6cf', 'hex'),
      v: 1n,
      value: 2n,
    });
  });

  test('correctly signs testData1 with Mainnet', async () => {
    const common = new Common({
      chain: Chain.Mainnet,
      hardfork: Hardfork.London,
    });
    const signedResult = await evmWallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common,
        unSignedTransaction: testData1.unSignedTransaction,
      },
    });
    expect(signedResult).toMatchObject({
      chainId: 1n,
      gasLimit: 21000n,
      maxFeePerGas: 1500000011n,
      maxPriorityFeePerGas: 1500000000n,
      nonce: 14n,
      r: 47701208411639382262279436309631415971534907966931456034113119161138449231332n,
      s: 53089954557403696704412019592294120613950949918742843766564493592395627878938n,
      to: Buffer.from(DEFAULT_USER_ADDRESS2, 'hex'),
      v: 0n,
      value: 1n,
    });
  });

  test('correctly signs testData2 with Mainnet', async () => {
    const common = new Common({
      chain: Chain.Mainnet,
      hardfork: Hardfork.London,
    });
    const signedResult = await evmWallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common,
        unSignedTransaction: testData2.unSignedTransaction,
      },
    });
    expect(signedResult).toMatchObject({
      chainId: 1n,
      gasLimit: 21000n,
      maxFeePerGas: 1500000011n,
      maxPriorityFeePerGas: 1500000000n,
      nonce: 14n,
      r: 45292708979244215658235977418275926300531721159652448834403186685766263790192n,
      s: 56935919033277983564654049019165417600814962521049824669009737402520569887104n,
      to: Buffer.from(DEFAULT_USER_ADDRESS2, 'hex'),
      v: 0n,
      value: 2n,
    });
  });

  test('correctly signs testData1 with BSC_Mainnet', async () => {
    const common = Common.custom({
      name: 'BSC_MAINNET',
      chainId: parseInt('0x38', 16),
      networkId: parseInt('0x38', 16),
      // @ts-ignore
      hardfork: Hardfork.London,
    });
    const signedResult = await evmWallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common,
        unSignedTransaction: testData1.unSignedTransaction,
      },
    });
    expect(signedResult).toMatchObject({
      chainId: 56n,
      gasLimit: 21000n,
      maxFeePerGas: 1500000011n,
      maxPriorityFeePerGas: 1500000000n,
      nonce: 14n,
      r: 89359268620718557428512903920955114083443736980975891594705422362507881003443n,
      s: 19303558519313801548840998763188241761913783398954510027826734731807823663637n,
      to: Buffer.from(DEFAULT_USER_ADDRESS2, 'hex'),
      v: 0n,
      value: 1n,
    });
  });

  test('correctly signs testData1 with BTTC_Mainnet', async () => {
    const common = Common.custom({
      name: 'BTTC_MAINNET',
      chainId: parseInt('0xc7', 16),
      networkId: parseInt('0xc7', 16),
      // @ts-ignore
      hardfork: Hardfork.Berlin,
    });
    const signedResult = await evmWallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common,
        unSignedTransaction: testData1.unSignedTransaction,
      },
    });
    expect(signedResult).toMatchObject({
      chainId: 199n,
      gasLimit: 21000n,
      maxFeePerGas: 1500000011n,
      maxPriorityFeePerGas: 1500000000n,
      nonce: 14n,
      r: 73612903132878986794087279034057429745756267770773684053591558578682855552822n,
      s: 31959155942604330843184821648937260472018625119851790812329686686053629550719n,
      to: Buffer.from(DEFAULT_USER_ADDRESS2, 'hex'),
      v: 1n,
      value: 1n,
    });
  });

  test('different messages result in different signatures', async () => {
    const common = new Common({
      chain: Chain.Mainnet,
      hardfork: Hardfork.London,
    });
    const signature1 = await evmWallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common,
        unSignedTransaction: testData1.unSignedTransaction,
      },
    });
    const signature2 = await evmWallet.signTransaction({
      privateKey: DEFAULT_PRIVATE_KEY,
      data: {
        common,
        unSignedTransaction: testData2.unSignedTransaction,
      },
    });
    expect(signature1).not.toEqual(signature2);
  });
});
