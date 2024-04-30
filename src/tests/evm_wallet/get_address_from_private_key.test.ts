import { EvmWallet } from '../../evm_wallet';
import { PRIVATE_KEY_FOR_TEST_1 } from '../common/constants';

describe('evm walLet - getAddressFromPrivateKey', () => {
  const wallet = new EvmWallet();

  it('should return the correct address', () => {
    // test TronWallet.getAddressFromPrivateKey
    const address = wallet.getAddressBy({
      privateKey: PRIVATE_KEY_FOR_TEST_1,
    });
    expect(address).toBe('0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf');
  });
});
