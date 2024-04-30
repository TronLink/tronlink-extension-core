import { TronWallet } from '../../tron_wallet';

describe('tron walLet - validateAddress', () => {
  const wallet = new TronWallet();

  it('should return true for a valid address', () => {
    const validAddress = 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwb';
    const params = { address: validAddress };
    const result = wallet.validateAddress(params);
    expect(result).toBe(true);
  });

  it('should return false for an invalid address', () => {
    const result = wallet.validateAddress({ address: 'T9yD14Nj9j7xAB4dbGeiX9h8unkKHxuWwc' });
    expect(result).toBe(false);

    const result2 = wallet.validateAddress({ address: 'abcdefg' });
    expect(result2).toBe(false);
  });

  it('should return false for empty address', () => {
    const result = wallet.validateAddress({ address: '' });
    expect(result).toBe(false);
  });

  it('should return false for undefined address', () => {
    const result = wallet.validateAddress({ address: undefined });
    expect(result).toBe(false);
  });
});
