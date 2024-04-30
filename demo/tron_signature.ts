import { TronWallet } from '@tronlink/core';

interface SignOptions {
  nodeInfo?: any;
  isMultiSign?: boolean;
  permissionId?: number;
  isSignMessageV2?: boolean;
}

const privateKey = '0000000000000000000000000000000000000000000000000000000000000001';
const signMessage = 'hello world';
const transaction = {
  visible: false,
  txID: 'd3b084669573cb5f705e7203e895091c7a5e6a75cc7d3a1be8e62f6cc816780c',
  raw_data_hex:
    '0a02d12e220899534aaee554cf4840e0eca6a7f1315a67080112630a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412320a15417e5f4552091a69125d5dfcb7b8c2659029395bdf12154128bab6aa995449b5232e38ae7cf263d6302a684f18c0843d708098a3a7f131',
  raw_data: {
    contract: [
      {
        parameter: {
          value: {
            to_address: '4128bab6aa995449b5232e38ae7cf263d6302a684f',
            owner_address: '417e5f4552091a69125d5dfcb7b8c2659029395bdf',
            amount: 1000000,
          },
          type_url: 'type.googleapis.com/protocol.TransferContract',
        },
        type: 'TransferContract',
      },
    ],
    ref_block_bytes: 'd12e',
    ref_block_hash: '99534aaee554cf48',
    expiration: 1714042812000,
    timestamp: 1714042752000,
  },
};
const transaction2 = {
  visible: false,
  txID: 'd3b084669573cb5f705e7203e895091c7a5e6a75cc7d3a1be8e62f6cc816780c',
  raw_data_hex:
    '0a02d12e220899534aaee554cf4840e0eca6a7f1315a67080112630a2d747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e5472616e73666572436f6e747261637412320a15417e5f4552091a69125d5dfcb7b8c2659029395bdf12154128bab6aa995449b5232e38ae7cf263d6302a684f18c0843d708098a3a7f131',
  raw_data: {
    contract: [
      {
        parameter: {
          value: {
            to_address: '4128bab6aa995449b5232e38ae7cf263d6302a684f',
            owner_address: '417e5f4552091a69125d5dfcb7b8c2659029395bdf',
            amount: 1000000,
          },
          type_url: 'type.googleapis.com/protocol.TransferContract',
        },
        type: 'TransferContract',
      },
    ],
    ref_block_bytes: 'd12e',
    ref_block_hash: '99534aaee554cf48',
    expiration: 1714042812000,
    timestamp: 1714042752000,
  },
};
const nodeInfo = {
  fullNode: 'https://api.nileex.io',
  solidityNode: 'https://api.nileex.io',
  eventServer: 'https://event.nileex.io',
  headers: {},
};

const typedData = {
  domain: {
    name: 'TRON Mail',
    version: '1',
    chainId: '0x2b6653dc',
    verifyingContract: 'TUe6BwpA7sVTDKaJQoia7FWZpC9sK8WM2t',
  },

  types: {
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

  message: {
    from: {
      name: 'Cow',
      wallet: 'TUg28KYvCXWW81EqMUeZvCZmZw2BChk1HQ',
    },
    to: {
      name: 'Bob',
      wallet: 'TT5rFsXYCrnzdE2q1WdR9F2SuVY59A4hoM',
    },
    contents: 'Hello, Bob!',
  },
};

async function tronSign(privateKey: string, data: any, options: SignOptions) {
  try {
    const wallet = new TronWallet();
    const result = await wallet.sign({
      privateKey,
      data,
      options,
    });

    console.log(result);
    return result;
  } catch (error) {}
}

async function tronSignTransaction(privateKey: string, transaction: any) {
  try {
    const wallet = new TronWallet();
    const result = await wallet.signTransaction({
      privateKey,
      data: transaction,
    });

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
}

async function tronSignTypedData(privateKey: string, data: any) {
  try {
    const wallet = new TronWallet();
    const result = await wallet.signTypedData({
      privateKey,
      data,
    });

    console.log(result);
    return result;
  } catch (error) {
    console.log(error);
  }
}

tronSign(privateKey, signMessage, { isSignMessageV2: true });
tronSign(privateKey, transaction, { isMultiSign: true, permissionId: 1, nodeInfo });

tronSignTransaction(privateKey, transaction2);
tronSignTypedData(privateKey, typedData);
