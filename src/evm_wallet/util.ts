import { Transaction } from 'ethers';

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

const TX_FIELDS = new Set<string>([
  'type',
  'to',
  'nonce',
  'gasLimit',
  'gasPrice',
  'maxFeePerGas',
  'maxPriorityFeePerGas',
  'value',
  'data',
  'chainId',
  'accessList',
]);

// ethers v6 Transaction.from differs from v5 serializeTransaction in three ways
// that matter when verifying signatures or feeding bytes to a hardware wallet:
//   1. Without `type`, it may infer EIP-2930/EIP-1559 envelopes while @ethereumjs/tx
//      (used on the signing side) defaults to legacy — producing mismatched bytes.
//   2. `type` must be a number; hex strings like '0x2' throw INVALID_ARGUMENT.
//   3. Wallet payloads carry extra fields (`from`, `isUserEdit`, …) that v6
//      rejects on unsigned txs.
// This helper restores the v5-compatible legacy default, normalizes hex `type`,
// and strips unknown fields before building the Transaction.
export function buildUnsignedTransaction(raw: Record<string, any>): Transaction {
  const out: Record<string, any> = {};
  for (const k of Object.keys(raw)) {
    if (TX_FIELDS.has(k)) out[k] = raw[k];
  }
  if (out.type === undefined) {
    out.type = 0;
  } else if (typeof out.type === 'string') {
    out.type = parseInt(out.type, 16);
  }
  return Transaction.from(out);
}
