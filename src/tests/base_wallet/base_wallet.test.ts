import { BaseWallet } from '../../base_wallet';
import { MNEMONIC_FOR_TEST_1 } from '../common/constants';

describe('base walLet', () => {
  it('should generate mnemonic', () => {
    const res = BaseWallet.generateRandomMnemonic();
    expect(res.split(' ').length).toBe(12);
  });

  it('should validate mnemonic', () => {
    const mnemonic = BaseWallet.generateRandomMnemonic();
    const res = BaseWallet.validateMnemonic(mnemonic);
    expect(res).toBe(true);

    const res2 = BaseWallet.validateMnemonic(MNEMONIC_FOR_TEST_1);
    expect(res2).toBe(true);

    const res3 = BaseWallet.validateMnemonic('');
    expect(res3).toBe(false);

    const res4 = BaseWallet.validateMnemonic('invlid mnemonic');
    expect(res4).toBe(false);
  });
});
