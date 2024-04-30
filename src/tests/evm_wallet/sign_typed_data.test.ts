import { EvmWallet } from '../../evm_wallet';

const DEFAULT_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000001';

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

const testTypeData2 = {
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
    contents: 'Hello, Bob!2',
  },
};

const testTypeData3 = {
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
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
      name: 'Alice',
      wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
    },
    to: {
      name: 'Bob',
      wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
    },
    contents: 'Hello, Bob!',
  },
};

describe('EvmSignManager - confirmSignTypeData', () => {
  let evmWallet: EvmWallet;

  beforeEach(() => {
    evmWallet = new EvmWallet();
  });

  test('correctly signs testTypeData1', async () => {
    const signedTypeData = await evmWallet.signTypedData({
      data: testTypeData1,
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    expect(signedTypeData).toEqual(
      '0x25ee9afa55806b99c9709a93ab967e487ad3a7cfdc421612e68cef7a737355246000f332e3f5e9ca5942275745c8b04523e17b57ef576e8362c74458fc62a6231c',
    );
  });

  test('correctly signs testTypeData2', async () => {
    const signedTypeData = await evmWallet.signTypedData({
      data: testTypeData2,
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    expect(signedTypeData).toEqual(
      '0x155368728bbb1198797c4952be7375c7551fe25b6227caaba0b0de5c312f4df70f3b53712b2a76c507744df159c7259fcbc3c3933f331110e6b0cac00d9c1dee1b',
    );
  });

  test('correctly signs testTypeData3', async () => {
    const signedTypeData = await evmWallet.signTypedData({
      data: testTypeData3,
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    expect(signedTypeData).toEqual(
      '0xf2ba880122e90f4948fa09ee884ce21851e6a6936de94e530b4bec577ec72fca38cd9e9627f3fd13cbe8687b9a74eac5cf9acfa4ee33fc67682c566e1beeb21d1b',
    );
  });

  test('different object result in different signatures', async () => {
    const signature1 = await evmWallet.signTypedData({
      data: testTypeData1,
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    const signature2 = await evmWallet.signTypedData({
      data: testTypeData2,
      privateKey: DEFAULT_PRIVATE_KEY,
    });
    expect(signature1).not.toEqual(signature2);
  });

  test('data is string', async () => {
    await expect(
      evmWallet.signTypedData({ data: 'anyString', privateKey: DEFAULT_PRIVATE_KEY }),
    ).rejects.toThrow(
      'The "data" parameter of the function "signTypedData" must be passed in type of a specific structure',
    );
  });
});
