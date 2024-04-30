import { EvmWallet } from '../../evm_wallet';
import { MNEMONIC_FOR_TEST_1 } from '../common/constants';

describe('evm walLet - getPrivateKeyFromMnemonicAndPath', () => {
  const wallet = new EvmWallet();

  it('should return the correct private key', () => {
    const path = "m/44'/60'/0'/0/0";
    const privateKey = wallet.derivePrivateKey({ mnemonic: MNEMONIC_FOR_TEST_1, path });
    expect(privateKey).toBe('ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80');
  });
});
