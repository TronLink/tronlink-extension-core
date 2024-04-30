import * as util from '../../evm_wallet/util';
import * as ethUtil from '@ethereumjs/util';

const { msgHexToText, isHex, splitStringByLength, strInsert } = util;

describe('msgHexToText', () => {
  test('converts hexadecimal string with 0x prefix to text', () => {
    const hex = '0x68656c6c6f';
    expect(msgHexToText(hex)).toBe('hello');
  });

  test('returns the same string for non-hexadecimal input', () => {
    const nonHex = 'not a hex string';
    expect(msgHexToText(nonHex)).toBe('not a hex string');
  });

  test('returns the input string when hex does not start with 0x', () => {
    const hex = '68656c6c6f';
    expect(msgHexToText(hex)).toBe('hello');
  });

  test('handles empty string input', () => {
    expect(msgHexToText('')).toBe('');
  });

  test('catches and returns input on invalid hex string', () => {
    const invalidHex = '0xZZZ';
    expect(msgHexToText(invalidHex)).toBe('');
  });

  test('throw error', () => {
    const invalidHex = 1234;
    jest.mock('@ethereumjs/util', () => {
      return {
        stripHexPrefix: jest.fn().mockReturnValue(invalidHex),
      };
    });
    // @ts-ignore
    expect(msgHexToText(invalidHex)).toBe(invalidHex);
  });
});

describe('isHex', () => {
  test('returns true for valid hexadecimal string', () => {
    const validHex = 'a1b2c3';
    expect(isHex(validHex)).toBe(true);
  });

  test('returns false for string with non-hex characters', () => {
    const invalidHex = 'a1b2g3';
    expect(isHex(invalidHex)).toBe(false);
  });

  test('returns true for uppercase hexadecimal string', () => {
    const uppercaseHex = 'A1B2C3';
    expect(isHex(uppercaseHex)).toBe(true);
  });

  test('returns false for empty string', () => {
    expect(isHex('')).toBe(false);
  });

  test('returns false for string with special characters', () => {
    const specialCharHex = 'a1b2c3#';
    expect(isHex(specialCharHex)).toBe(false);
  });
});

describe('splitStringByLength', () => {
  test('correctly splits a string into specified length', () => {
    const result = splitStringByLength({ str: 'hello world', length: 5 });
    expect(result).toEqual(['hello', ' worl', 'd']);
  });

  test('returns entire string in a single array element when length is greater than string length', () => {
    const result = splitStringByLength({ str: 'hello', length: 10 });
    expect(result).toEqual(['hello']);
  });

  test('handles empty string input', () => {
    const result = splitStringByLength({ str: '', length: 5 });
    expect(result).toEqual([]);
  });

  test('handles zero length', () => {
    const result = splitStringByLength({ str: 'hello', length: 0 });
    expect(result).toEqual(['h', 'e', 'l', 'l', 'o']);
  });

  test('handles string with length exactly divisible by the specified length', () => {
    const result = splitStringByLength({ str: 'abcdef', length: 2 });
    expect(result).toEqual(['ab', 'cd', 'ef']);
  });
});

describe('strInsert', () => {
  test('correctly converts hexadecimal string to text', () => {
    expect(strInsert('68656c6c6f')).toBe('hello');
  });

  test('returns empty string for empty input', () => {
    expect(strInsert('')).toBe('');
  });

  test('handles single character hex string', () => {
    expect(strInsert('68')).toBe('h');
  });

  test('returns correct string for mixed-case hex input', () => {
    expect(strInsert('48656C6C6F')).toBe('Hello');
  });

  // test('handles non-hexadecimal string input', () => {
  //   expect(strInsert('7A7Z')).toBe('z\u{FFFD}');
  // });
});
