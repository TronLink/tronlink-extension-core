import { Chain, Common, Hardfork } from "@ethereumjs/common";
import { EvmWallet } from "@tronlink/core";
import { createEvmMnemonicAccount } from './create_account';

const wallet = new EvmWallet();
const YOUR_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000001';
const OTHER_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000002';
const YOUR_ADDRESS = wallet.getAddressBy({ privateKey: YOUR_PRIVATE_KEY });
const TRANSFORM_ADDRESS = wallet.getAddressBy({ privateKey: OTHER_PRIVATE_KEY });

function getAddress() {
  const wallet = new EvmWallet();

  const address = wallet.getAddressBy({
      privateKey: YOUR_PRIVATE_KEY,
  });

  console.log('function getAddress:', address);
  return address;
}

async function signTransaction() {
  const wallet = new EvmWallet();
  const unSignedTransaction = {
    from: YOUR_ADDRESS,
    to: TRANSFORM_ADDRESS,
    value: '0x1',
    isUserEdit: false,
    type: '0x2',
    maxFeePerGas: '0x59682f0b',
    maxPriorityFeePerGas: '0x59682f00',
    gasLimit: '0x5208',
    nonce: '0xe',
  }
  const common = new Common({
    chain: Chain.Sepolia,
    hardfork: Hardfork.London,
  });
  const signedResult = await wallet.signTransaction({
    privateKey: YOUR_PRIVATE_KEY,
    data: {
      common,
      unSignedTransaction: unSignedTransaction,
    },
  });
  console.log('function signTransaction:', signedResult);
  return signedResult;
}

async function signMessage() {
  const wallet = new EvmWallet();
  const param = {
    privateKey: YOUR_PRIVATE_KEY,
    data: 'your_message',
  };
  const result = await wallet.signMessage(param);
  console.log('function signMessage:', result);
  return result;
}

async function signTypedData() {
  const wallet = new EvmWallet();
  const testTypeData = {
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
  const signedTypeData = await wallet.signTypedData({
    data: testTypeData,
    privateKey: YOUR_PRIVATE_KEY,
  });
  console.log('function signTypedData:', signedTypeData);
  return signedTypeData;
}

function validateAddress() {
  const wallet = new EvmWallet();
  const params = { address: YOUR_ADDRESS };
  const isValid: boolean = wallet.validateAddress(params);
  console.log('function validateAddress:', isValid);
  return isValid;
}

async function verifyEthTransactionSign() {
  const wallet = new EvmWallet();
  const rawUnsignedTransaction1 = {
    to: TRANSFORM_ADDRESS,
    value: '0x1',
    gasLimit: '0x5208',
    nonce: '0xe',
    chainId: 1,
  };
  const signedTx = await wallet.signTransaction({
    privateKey: YOUR_PRIVATE_KEY,
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
  
  const isValid = wallet.verifyEthTransactionSign(rawUnsignedTransaction1, rsvSignature, YOUR_ADDRESS);
  console.log('function verifyEthTransactionSign:', isValid);
  return isValid;
}

async function verifyEthMessageSign() {
  const wallet = new EvmWallet();
  const message = '0xae16f78a';
  const resultHash = await wallet.signMessage({
    privateKey: YOUR_PRIVATE_KEY,
    data: message,
  });
  const isValid = wallet.verifyEthMessageSign(resultHash, message, YOUR_ADDRESS);
  console.log('function verifyEthMessageSign:', isValid);
  return isValid;
}

getAddress();
signTransaction();
signMessage();
signTypedData();
validateAddress();
verifyEthTransactionSign();
verifyEthMessageSign();
