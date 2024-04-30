import { EvmWallet } from '../../evm_wallet';

describe('evm walLet - validateAddress', () => {
  const wallet = new EvmWallet();

  it('should return true for a valid address', () => {
    const params = { address: '0x0000000000000000000000000000000000000000' };
    const result = wallet.validateAddress(params);
    expect(result).toBe(true);
  });

  it('should return false for an invalid address', () => {
    const params = { address: '0000000000000000000000000000000000000000' };
    const result = wallet.validateAddress(params);
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
