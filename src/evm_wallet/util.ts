const HEX_MESSAGE_REGEX = /^0x[0-9a-fA-F]+$/;

export function isHexMessage(value: string): boolean {
  return HEX_MESSAGE_REGEX.test(value);
}

export function messageToBuffer(message: string): Buffer {
  if (isHexMessage(message)) {
    const stripped = message.slice(2);
    const padded = stripped.length % 2 === 0 ? stripped : `0${stripped}`;
    return Buffer.from(padded, 'hex');
  }
  return Buffer.from(message, 'utf8');
}
