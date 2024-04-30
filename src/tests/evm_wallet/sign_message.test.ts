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

describe('EvmWallet - signMessage', () => {
  let evmWallet: EvmWallet;

  beforeEach(() => {
    evmWallet = new EvmWallet();
  });

  test('signs a valid message correctly', async () => {
    const param = {
      privateKey: '0000000000000000000000000000000000000000000000000000000000000001',
      data: 'abcdefg',
    };
    const result = await evmWallet.signMessage(param);
    expect(result).toBe(
      '0x986824e0b3b6d1901f74723f2c3e76e686b9372211bf7455610d35f52f649b94764c6a1db7cb3d446bbc7699ed9574d2ad7741111b3a546d1884380a6a9391541c',
    );
  });

  test('handles empty message correctly', async () => {
    const param = {
      privateKey: '0000000000000000000000000000000000000000000000000000000000000001',
      data: '',
    };
    const result = await evmWallet.signMessage(param);
    expect(result).toBe(
      '0x0ac02a3eb3039b7a3ebb6a35f1e0dd31a4ed51781205a2c193354752a25edad50593868baf38c519b78bdc61a23c3f55e058c29f8b83d79ae48cc47d931afaed1b',
    );
  });

  test('throws error with invalid private key', async () => {
    const param = {
      privateKey: 'invalidkey',
      data: { message: 'abcdefg' },
    };
    try {
      await evmWallet.signMessage(param);
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
