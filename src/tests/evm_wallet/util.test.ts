import { InvalidParameterError } from '../../base_wallet/error';
import { buildUnsignedTransaction, isHexMessage, messageToBuffer } from '../../evm_wallet/util';

describe('isHexMessage', () => {
  test('returns true for 0x-prefixed even-length hex', () => {
    expect(isHexMessage('0xae16f78a')).toBe(true);
  });

  test('returns true for 0x-prefixed odd-length hex', () => {
    expect(isHexMessage('0xabc')).toBe(true);
  });

  test('returns true for uppercase hex', () => {
    expect(isHexMessage('0xAE16F78A')).toBe(true);
  });

  test('returns false for bare hex without 0x prefix', () => {
    expect(isHexMessage('ae16f78a')).toBe(false);
  });

  test('returns false for plain text', () => {
    expect(isHexMessage('hello')).toBe(false);
  });

  test('returns false for empty string', () => {
    expect(isHexMessage('')).toBe(false);
  });

  test('returns false for "0x" alone (no hex digits)', () => {
    expect(isHexMessage('0x')).toBe(false);
  });

  test('returns false for 0x-prefixed string with non-hex chars', () => {
    expect(isHexMessage('0xZZZ')).toBe(false);
  });
});

describe('messageToBuffer', () => {
  test('hex-decodes 0x-prefixed even-length hex into raw bytes', () => {
    const buf = messageToBuffer('0xae16f78a');
    expect(Array.from(buf)).toEqual([0xae, 0x16, 0xf7, 0x8a]);
  });

  test('left-pads 0x-prefixed odd-length hex with a leading zero', () => {
    const buf = messageToBuffer('0xabc');
    expect(Array.from(buf)).toEqual([0x0a, 0xbc]);
  });

  test('utf8-encodes plain text', () => {
    const buf = messageToBuffer('hello');
    expect(Array.from(buf)).toEqual([0x68, 0x65, 0x6c, 0x6c, 0x6f]);
  });

  test('utf8-encodes bare hex (no 0x) as a string of ASCII characters', () => {
    const buf = messageToBuffer('ae16f78a');
    expect(Array.from(buf)).toEqual([0x61, 0x65, 0x31, 0x36, 0x66, 0x37, 0x38, 0x61]);
  });

  test('utf8-encodes empty string to empty buffer', () => {
    expect(messageToBuffer('').length).toBe(0);
  });

  test('utf8-encodes multi-byte unicode text', () => {
    const buf = messageToBuffer('你好');
    expect(Array.from(buf)).toEqual([0xe4, 0xbd, 0xa0, 0xe5, 0xa5, 0xbd]);
  });
});

describe('buildUnsignedTransaction', () => {
  // Plain placeholder addresses: this helper only serializes (never signs or
  // recovers), so any valid address works — no need for the keypair-derived
  // DEFAULT_USER_ADDRESS constants the signing tests use.
  const TO = '0x0000000000000000000000000000000000000001';
  const FROM = '0x0000000000000000000000000000000000000002';

  // Serialized bytes below are hardcoded oracles, not recomputed from the current
  // ethers version — locking them is what catches a v6-style envelope regression.
  test('defaults a type-less transaction to legacy (type 0)', () => {
    const tx = buildUnsignedTransaction({
      to: TO,
      value: '0x1',
      gasLimit: '0x5208',
      nonce: '0xe',
      chainId: 1,
    });
    expect(tx.type).toBe(0);
    expect(tx.unsignedSerialized).toBe(
      '0xdf0e808252089400000000000000000000000000000000000000010180018080',
    );
  });

  test('normalizes a hex-string type "0x2" into an EIP-1559 (type 2) envelope', () => {
    const tx = buildUnsignedTransaction({
      to: TO,
      value: '0x1',
      gasLimit: '0x5208',
      nonce: '0xe',
      chainId: 1,
      type: '0x2',
      maxFeePerGas: '0x59682f0b',
      maxPriorityFeePerGas: '0x59682f00',
    });
    expect(tx.type).toBe(2);
    expect(tx.unsignedSerialized).toBe(
      '0x02e7010e8459682f008459682f0b8252089400000000000000000000000000000000000000010180c0',
    );
  });

  test('normalizes a hex-string type "0x1" into an EIP-2930 (type 1) envelope', () => {
    const tx = buildUnsignedTransaction({
      to: TO,
      value: '0x1',
      gasLimit: '0x5208',
      nonce: '0xe',
      chainId: 1,
      type: '0x1',
      gasPrice: '0x59682f00',
      accessList: [],
    });
    expect(tx.type).toBe(1);
    expect(tx.unsignedSerialized).toBe(
      '0x01e2010e8459682f008252089400000000000000000000000000000000000000010180c0',
    );
  });

  test('accepts a numeric type as-is (not reparsed as hex)', () => {
    const tx = buildUnsignedTransaction({
      to: TO,
      value: '0x1',
      gasLimit: '0x5208',
      nonce: '0xe',
      chainId: 1,
      type: 1,
      gasPrice: '0x59682f00',
      accessList: [],
    });
    expect(tx.type).toBe(1);
  });

  test('strips unknown wallet-only fields (from, isUserEdit) before building', () => {
    const clean = {
      to: TO,
      value: '0x1',
      gasLimit: '0x5208',
      nonce: '0xe',
      chainId: 1,
      type: '0x2',
      maxFeePerGas: '0x59682f0b',
      maxPriorityFeePerGas: '0x59682f00',
    };
    const dirty = { ...clean, from: FROM, isUserEdit: false };
    // Extra fields must not change the bytes: this proves they were filtered out
    // rather than passed to Transaction.from, which rejects `from` on unsigned txs.
    expect(buildUnsignedTransaction(dirty).unsignedSerialized).toBe(
      buildUnsignedTransaction(clean).unsignedSerialized,
    );
  });

  test('throws on a non-numeric type string', () => {
    expect(() =>
      buildUnsignedTransaction({ to: TO, value: '0x1', chainId: 1, type: 'abc' }),
    ).toThrow();
  });

  // chainId guard: without it ethers serializes a pre-EIP-155 payload and a
  // Ledger signature over it is replayable on every EVM chain.
  test('throws InvalidParameterError when chainId is missing', () => {
    expect(() => buildUnsignedTransaction({ to: TO, value: '0x1' })).toThrow(InvalidParameterError);
  });

  test.each([0, '0x0'])('throws InvalidParameterError when chainId is %p', chainId => {
    expect(() => buildUnsignedTransaction({ to: TO, value: '0x1', chainId })).toThrow(
      InvalidParameterError,
    );
  });
});
