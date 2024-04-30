import { SignError, VerifySignError } from '../../base_wallet/error';
import { TronWallet } from '../../tron_wallet';
import { address, hexMessage, privateKey } from './constants';

describe('tron walLet - signMessage', () => {
  const testTronWallet = new TronWallet();

  it('happy path', async () => {
    const message = hexMessage;
    const signature = await testTronWallet.signMessage({
      privateKey,
      data: message,
    });

    const result = await testTronWallet.verifyMessage({
      data: message,
      signature,
      address,
    });

    expect(result).toBeTruthy();
  });

  it('verifyMessage error', async () => {
    try {
      const result = await testTronWallet.verifyMessage({ data: '', signature: '' });
    } catch (error) {
      expect(error).toEqual(new VerifySignError());
    }
  });

  it('checkSignParams error', async () => {
    try {
      const message = hexMessage;
      const signature = await testTronWallet.signMessage({
        privateKey,
        data: {},
      });
    } catch (error) {
      expect(error).toEqual(new SignError());
    }
  });
});
