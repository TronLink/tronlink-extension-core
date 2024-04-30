import { ethers } from 'ethers';
import { SignError } from '../../../base_wallet/error';
import { LedgerEthWebHid, LedgerEvmSigner } from '../../../evm_wallet';

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

describe('evm ledgerSignTypeData test', () => {
  const ledgerWebHid = new LedgerEthWebHid();
  const ledgerEvmSigner = new LedgerEvmSigner();

  it('normal ledgerSignTypeData', async () => {
    const testPath = "44'/60'/0'/0/0";
    const testR = 'testMessageR';
    const testS = 'testMessageS';
    const testV = 1132;
    LedgerEthWebHid.prototype.signTypedData = jest
      .fn()
      .mockResolvedValue({ r: testR, s: testS, v: testV });

    const result = await ledgerEvmSigner.ledgerSignTypedData({
      data: testTypeData1,
      path: testPath,
    });
    expect(result).toBe(`${testR}${testS}${testV.toString(16)}`);
  });

  it('ledgerSignTypeData throw error', async () => {
    const testPath = "44'/60'/0'/0/0";
    const testR = 'testMessageR';
    const testS = 'testMessageS';
    const testV = 1132;
    LedgerEthWebHid.prototype.signTypedData = jest
      .fn()
      .mockRejectedValue(new SignError('testSignError'));

    expect(
      ledgerEvmSigner.ledgerSignTypedData({
        data: testTypeData1,
        path: testPath,
      }),
    ).rejects.toThrow('testSignError');
  });
});
