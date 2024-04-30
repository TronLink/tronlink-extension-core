import { SignError, VerifySignError } from '../../base_wallet/error';
import { TronWallet } from '../../tron_wallet';
import { address, privateKey, signMessage } from './constants';

describe('tron walLet - signMessageV2', () => {
  const testTronWallet = new TronWallet();

  it('happy path', async () => {
    const message = signMessage;
    const signature = await testTronWallet.signMessageV2({
      privateKey,
      data: message,
    });

    const result = await testTronWallet.verifyMessageV2({
      data: message,
      signature,
    });
    expect(result).toEqual(address);
  });

  it('verifyMessageV2 error', async () => {
    try {
      const result = await testTronWallet.verifyMessageV2({ data: '', signature: '' });
    } catch (error) {
      expect(error).toEqual(new VerifySignError());
    }
  });

  it('checkSignParams error', async () => {
    try {
      const testTronWallet = new TronWallet();

      const signature = await testTronWallet.signMessageV2({
        privateKey,
        data: {},
      });
    } catch (error) {
      expect(error).toEqual(new SignError());
    }
  });
});
