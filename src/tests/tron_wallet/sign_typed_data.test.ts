import { SignError, VerifySignError } from '../../base_wallet/error';
import { TronWallet } from '../../tron_wallet';
import { address, privateKey, typedData } from './constants';

describe('tron walLet - sign typedData', () => {
  const testTronWallet = new TronWallet();

  it('happy path', async () => {
    const signature = await testTronWallet.signTypedData({
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

  it('verify sign error', async () => {
    try {
      const result = await testTronWallet.verifyTypedData({
        data: '',
        signature: '',
        address,
      });
    } catch (error) {
      expect(error).toEqual(new VerifySignError());
    }
  });

  it('checkSignParams error', async () => {
    try {
      const testTronWallet = new TronWallet();

      const signature = await testTronWallet.signTypedData({
        privateKey,
        data: {},
      });
    } catch (error) {
      expect(error).toEqual(new SignError());
    }
  });

  it('data is not object ', async () => {
    try {
      const testTronWallet = new TronWallet();

      const signature = await testTronWallet.signTypedData({
        privateKey,
        data: 'test',
      });
    } catch (error) {
      expect(error).toEqual(new SignError());
    }
  });
});
