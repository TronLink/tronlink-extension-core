import { EvmWallet } from '../../evm_wallet/EvmWallet';

describe('EvmWallet - signedConvertRSVtoHex', () => {
  let evmWallet: EvmWallet;

  beforeEach(() => {
    evmWallet = new EvmWallet();
  });

  test('converts RSV to Hex correctly with normal values', () => {
    const r = Buffer.from('abcd', 'hex');
    const s = Buffer.from('1234', 'hex');
    const v = BigInt(1);
    const result = evmWallet.signedConvertRSVtoHex({ r, s, v });
    expect(result).toBe(
      '0x000000000000000000000000000000000000000000000000000000000000abcd000000000000000000000000000000000000000000000000000000000000123401',
    );
  });

  test('converts RSV to Hex with small r and s values', () => {
    const r = Buffer.from('01', 'hex');
    const s = Buffer.from('02', 'hex');
    const v = BigInt(1);
    const result = evmWallet.signedConvertRSVtoHex({ r, s, v });
    expect(result).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000201',
    );
  });

  test('converts RSV to Hex with large r and s values', () => {
    const r = Buffer.from('aabbccddeeff', 'hex');
    const s = Buffer.from('112233445566', 'hex');
    const v = BigInt(27);
    const result = evmWallet.signedConvertRSVtoHex({ r, s, v });
    expect(result).toBe(
      '0x0000000000000000000000000000000000000000000000000000aabbccddeeff00000000000000000000000000000000000000000000000000001122334455661b',
    );
  });

  test('converts RSV to Hex with maximum v value', () => {
    const r = Buffer.from('abcd', 'hex');
    const s = Buffer.from('1234', 'hex');
    const v = BigInt(255);
    const result = evmWallet.signedConvertRSVtoHex({ r, s, v });
    expect(result).toBe(
      '0x000000000000000000000000000000000000000000000000000000000000abcd0000000000000000000000000000000000000000000000000000000000001234ff',
    );
  });

  test('handles empty r and s buffer values', () => {
    const r = Buffer.from('', 'hex');
    const s = Buffer.from('', 'hex');
    const v = BigInt(0);
    const result = evmWallet.signedConvertRSVtoHex({ r, s, v });
    expect(result).toBe(
      '0x0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    );
  });

  test('handles non-hexadecimal buffer values', () => {
    const r = Buffer.from('ggggsss', 'utf8');
    const s = Buffer.from('hhhh', 'utf8');
    const v = BigInt(1);
    const result = evmWallet.signedConvertRSVtoHex({ r, s, v });
    expect(result).toBe(
      '0x0000000000000000000000000000000000000000000000000067676767737373000000000000000000000000000000000000000000000000000000006868686801',
    );
  });
});
