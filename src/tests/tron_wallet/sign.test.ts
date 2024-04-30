import { InvalidParameterError, SignError } from '../../base_wallet/error';
import { TronWallet } from '../../tron_wallet';
import {
  address,
  hexMessage,
  privateKey,
  signMessage,
  transaction,
  typedData,
  nodeInfo,
} from './constants';

jest.mock('../../tron_wallet/generateTronWeb', () => {
  const originalModule = jest.requireActual('../../tron_wallet/generateTronWeb');
  return {
    __esModule: true,
    ...originalModule,
    generateTronWeb: () => ({
      trx: {
        multiSign: () => 'success',
      },
    }),
  };
});

describe('tron walLet - sign', () => {
  const testTronWallet = new TronWallet();

  it('happy path: signMessage', async () => {
    const signature = await testTronWallet.sign({
      privateKey,
      data: hexMessage,
    });

    const result = await testTronWallet.verifyMessage({
      data: hexMessage,
      signature,
      address,
    });

    expect(result).toBeTruthy();
  });

  it('happy path: signMessageV2', async () => {
    const signature = await testTronWallet.sign({
      privateKey,
      data: signMessage,
      options: { isSignMessageV2: true },
    });

    const result = await testTronWallet.verifyMessageV2({
      data: signMessage,
      signature,
    });
    expect(result).toEqual(address);
  });

  it('happy path: signTransaction', async () => {
    const result = await testTronWallet.sign({
      privateKey,
      data: transaction,
    });

    expect(result.signature[0]).toEqual(
      '1a378a47115c292cee0432decd1093769c2a4bafdb7cd455d7e28ce9b4ab2d7a1779382a344e241d0d41b3b318803210b2cbbc971e136ac964b5ed0d8d12876c1C',
    );
  });

  it('happy path: signTypedData', async () => {
    const signature = await testTronWallet.sign({
      privateKey,
      data: typedData,
    });

    const result = await testTronWallet.verifyTypedData({
      data: typedData,
      signature,
      address,
    });

    expect(result).toBeTruthy();
  });

  it('happy path: multiSign', async () => {
    const signature = await testTronWallet.sign({
      privateKey,
      data: transaction,
      options: {
        isMultiSign: true,
        permissionId: 1,
        nodeInfo,
      },
    });

    expect(signature).toMatch('success');
  });

  it('invalid params', async () => {
    try {
      const signature = await testTronWallet.sign({
        privateKey,
        data: {
          test: '',
        },
      });
    } catch (error) {
      expect(error).toEqual(new InvalidParameterError());
    }
  });

  it('checkSignParams error', async () => {
    try {
      const signature = await testTronWallet.sign({
        privateKey,
        data: {},
      });
    } catch (error) {
      expect(error).toEqual(new SignError());
    }
  });
});
