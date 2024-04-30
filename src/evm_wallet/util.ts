import { stripHexPrefix } from '@ethereumjs/util';

export function isHex(hex: string) {
  return /^[A-Fa-f0-9]+$/.test(hex);
}

export const splitStringByLength = ({ str, length }: { str: string; length: number }) => {
  const arr = [];
  let index = 0;
  if (length < 1) {
    length = 1;
  }
  while (index < str.length) {
    arr.push(str.slice(index, (index += length)));
  }
  return arr;
};

export function strInsert(str: string) {
  const arr = splitStringByLength({ str, length: 2 }).map((item) => {
    return String.fromCharCode(parseInt(`0x${item}`));
  });
  return arr.join('');
}

export function msgHexToText(hex: string) {
  try {
    const stripped = stripHexPrefix(hex);
    const buff = Buffer.from(stripped, 'hex');
    if (hex.indexOf('0x') === 0) {
      return buff.toString('utf8');
    } else if (isHex(hex)) {
      return strInsert(hex);
    }
    return hex;
  } catch (e) {
    return hex;
  }
}
