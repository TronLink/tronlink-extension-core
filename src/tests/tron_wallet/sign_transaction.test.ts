import { SignError } from '../../base_wallet/error';
import { TronWallet } from '../../tron_wallet';
import { privateKey, transaction } from './constants';

describe('tron walLet - signTransaction', () => {
  const testTronWallet = new TronWallet();

  it('happy path', async () => {
    const result = await testTronWallet.signTransaction({
      privateKey,
      data: transaction,
    });

    expect(result.signature[0]).toEqual(
      '1a378a47115c292cee0432decd1093769c2a4bafdb7cd455d7e28ce9b4ab2d7a1779382a344e241d0d41b3b318803210b2cbbc971e136ac964b5ed0d8d12876c1C',
    );
  });

  it('checkSignParams error', async () => {
    try {
      const result = await testTronWallet.signTransaction({
        privateKey,
        data: {},
      });
    } catch (error) {
      expect(error).toEqual(new SignError());
    }
  });
});
