import { EvmWallet } from '../../evm_wallet';
import { InvalidParameterError } from '../../base_wallet/error';

describe('evm walLet - derivation path', () => {
  const wallet = new EvmWallet();

  it('should return the default derivation path', () => {
    expect(wallet.derivePath()).toBe("m/44'/60'/0'/0/0");
  });

  it('should return the correct derivation path', () => {
    expect(wallet.derivePath({ accountIndex: 1, addressIndex: 1 })).toBe("m/44'/60'/1'/0/1");

    expect(wallet.derivePath({ accountIndex: 0, addressIndex: 1 })).toBe("m/44'/60'/0'/0/1");

    expect(wallet.derivePath({ accountIndex: 1, addressIndex: 0 })).toBe("m/44'/60'/1'/0/0");
  });

  it('should throw error while giving invalid parameter', () => {
    expect(() => wallet.derivePath({ accountIndex: -1, addressIndex: 1 })).toThrow(
      InvalidParameterError,
    );

    expect(() => wallet.derivePath({ accountIndex: 1, addressIndex: -1 })).toThrow(
      InvalidParameterError,
    );

    expect(() => wallet.derivePath({ accountIndex: -1, addressIndex: -1 })).toThrow(
      InvalidParameterError,
    );
  });
});
