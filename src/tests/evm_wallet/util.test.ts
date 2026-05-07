import { isHexMessage, messageToBuffer } from '../../evm_wallet/util';

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
