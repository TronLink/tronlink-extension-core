import { TronWallet } from '../../tron_wallet';
import { MNEMONIC_FOR_TEST_1 } from '../common/constants';

describe('tron walLet - getPrivateKeyFromMnemonicAndPath', () => {
  const wallet = new TronWallet();

  it('should return the correct private key', () => {
    const path = "m/44'/195'/0'/0/0";
    const privateKey = wallet.derivePrivateKey({ mnemonic: MNEMONIC_FOR_TEST_1, path });
    expect(privateKey).toBe('15f0bbb1774be40b7a8d7965d637f324bda2f711fc5726a3dcc19585c6950954');
  });
});
