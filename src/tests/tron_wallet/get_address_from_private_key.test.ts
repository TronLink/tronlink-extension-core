import { TronWallet } from '../../tron_wallet';
import { PRIVATE_KEY_FOR_TEST_1 } from '../common/constants';

describe('tron walLet - getAddressFromPrivateKey', () => {
  const wallet = new TronWallet();

  it('should return the correct address', () => {
    const address = wallet.getAddressBy({
      privateKey: PRIVATE_KEY_FOR_TEST_1,
    });
    expect(address).toBe('TMVQGm1qAQYVdetCeGRRkTWYYrLXuHK2HC');
  });
});
