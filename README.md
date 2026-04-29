# @tronlink/core

> Low-level wallet engine for TRON and Ethereum, used by the [TronLink browser extension](https://www.tronlink.org/) and embeddable in any TypeScript/JavaScript runtime.

[![npm](https://img.shields.io/npm/v/@tronlink/core.svg)](https://www.npmjs.com/package/@tronlink/core)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18.19-brightgreen.svg)](#prerequisites)
[![TypeScript](https://img.shields.io/badge/TypeScript-%3E%3D4.9-blue.svg)](https://www.typescriptlang.org/)

---

## Overview

[`@tronlink/core`](https://www.npmjs.com/package/@tronlink/core) is the wallet primitive layer that powers TronLink. It provides:

- **HD account derivation** for TRON and EVM chains from a single mnemonic.
- **Transaction, message, and EIP-712 typed-data signing** for both ecosystems.
- **Hardware wallet (Ledger) integration** over WebHID for both TRX and ETH apps.
- **Address & signature validation utilities**.
- **A privacy-preserving usage analytics module** whose design and guarantees are documented in [`PRIVACY.md`](./PRIVACY.md).

The package is **non-custodial and stateless**: no keys, mnemonics, or addresses ever leave the host process unless the embedding application explicitly chooses to persist them. The package is published under **Apache-2.0** and the source is fully open for audit.

---

## Table of Contents

- [Installation](#installation)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
  - [Generate a mnemonic and derive accounts](#generate-a-mnemonic-and-derive-accounts)
  - [Sign an EVM transaction](#sign-an-evm-transaction)
  - [Sign a TRON transaction](#sign-a-tron-transaction)
  - [Sign typed data (EIP-712)](#sign-typed-data-eip-712)
- [Public API](#public-api)
- [Hardware Wallet (Ledger) Support](#hardware-wallet-ledger-support)
- [Anonymous Analytics Module](#anonymous-analytics-module)
- [Project Structure](#project-structure)
- [Build & Development](#build--development)
- [Testing](#testing)
- [Package Verification (GPG)](#package-verification-gpg)
- [Versioning & Releases](#versioning--releases)
- [Privacy](#privacy)
- [License](#license)

---

## Installation

The package is published on npm: <https://www.npmjs.com/package/@tronlink/core>

```bash
# npm
npm install @tronlink/core

# yarn
yarn add @tronlink/core

# pnpm
pnpm add @tronlink/core
```

Both **CommonJS** and **ESM** entry points are shipped:

| Module system | Entry |
|---|---|
| CommonJS | `dist/commonjs/index.js` |
| ESM      | `dist/esm/index.js`      |

TypeScript declaration files (`.d.ts`) are included.

---

## Prerequisites

| Tool       | Required version |
|------------|------------------|
| Node.js    | `>= 18.19.0` (recommended `20.x`) |
| pnpm       | `>= 7.32.0` (used for development) |
| TypeScript | `>= 4.9.5` (consumers using TS) |

Browser usage requires bundlers that handle Node polyfills (the package depends on `buffer`, `crypto`, `stream` shims; see `webpack.config.js` for the configuration used internally).

---

## Quick Start

### Generate a mnemonic and derive accounts

```ts
import { BaseWallet, TronWallet, EvmWallet } from '@tronlink/core';

const mnemonic = BaseWallet.generateRandomMnemonic();

// TRON
const tron = new TronWallet();
const tronPath       = tron.derivePath({ accountIndex: 0, addressIndex: 0 });
const tronPrivateKey = tron.derivePrivateKey({ mnemonic, path: tronPath });
const tronAddress    = tron.getAddressBy({ privateKey: tronPrivateKey });

// EVM
const evm = new EvmWallet();
const evmPath        = evm.derivePath({ accountIndex: 0, addressIndex: 0 });
const evmPrivateKey  = evm.derivePrivateKey({ mnemonic, path: evmPath });
const evmAddress     = evm.getAddressBy({ privateKey: evmPrivateKey });
```

A fresh mnemonic, both private keys, and both addresses are produced **entirely in process**. Nothing is sent over the network.

### Sign an EVM transaction

```ts
import { EvmWallet } from '@tronlink/core';

const wallet = new EvmWallet();

const common = wallet.getCommonConfiguration({
  isSupportsEIP1559: true,
  chain: 'mainnet',
  chainId: 1,
  chainName: 'Ethereum',
});

const signed = wallet.signTransaction({
  privateKey,
  data: { common, unSignedTransaction },
});

// Optional verification
const ok = wallet.verifyEthTransactionSign(unSignedTransaction, signed.rsv, address);
```

### Sign a TRON transaction

```ts
import { TronWallet } from '@tronlink/core';

const wallet = new TronWallet();

const signed = wallet.signTransaction({
  privateKey,
  data: rawTransaction,
});

// Or generic signer with options (multi-sig, permission, signMessageV2 ...)
const sig = wallet.sign({
  privateKey,
  data: payload,
  options: {
    nodeInfo,
    isMultiSign: false,
    permissionId: 0,
    isSignMessageV2: true,
  },
});
```

### Sign typed data (EIP-712)

```ts
// EVM
evmWallet.signTypedData({ privateKey, data: typedData });

// TRON
tronWallet.signTypedData({ privateKey, data: typedData });
```

More end-to-end examples live in the [`demo/`](./demo) directory:

- [`demo/create_account.ts`](./demo/create_account.ts) — mnemonic & key derivation
- [`demo/evm_signature.ts`](./demo/evm_signature.ts) — EVM tx / message / typed-data signing
- [`demo/tron_signature.ts`](./demo/tron_signature.ts) — TRON tx / message / typed-data signing
- [`demo/user_statistics.ts`](./demo/user_statistics.ts) — anonymous analytics wiring

Run a demo:

```bash
cd demo
pnpm install
./node_modules/ts-node/dist/bin.js create_account.ts
```

---

## Public API

The package re-exports the following from `src/index.ts`:

| Module           | Exports |
|------------------|---------|
| `base_wallet`    | `BaseWallet`, `DeviceStatusType` |
| `evm_wallet`     | `EvmWallet`, `LedgerEvmSigner`, `LedgerEthWebHid`, `LedgerEthHidStatusChecker` |
| `tron_wallet`    | `TronWallet`, `LedgerTrxSigner`, `LedgerTrxWebHid`, `LedgerTrxHidStatusChecker` |
| `utils`          | `httpProxy` |
| `userStatistics` | `getAndUpdateAddressAssetPrecipitation`, `getAndUpdateTransactionRecord`, `checkAndReportXY`, plus types (`ExternalDependencies`, `BalanceInfo`, `TransactionRecord`, …) |

### `BaseWallet` (static helpers)

| Method                              | Purpose                                       |
|-------------------------------------|-----------------------------------------------|
| `BaseWallet.generateRandomMnemonic()` | Generate a fresh BIP-39 mnemonic.            |

### `TronWallet` / `EvmWallet` (per-chain wallets)

| Method                | Purpose                                       |
|-----------------------|-----------------------------------------------|
| `derivePath(opts)`    | Build a BIP-44 derivation path.              |
| `derivePrivateKey(opts)` | Derive a private key from `{ mnemonic, path }`. |
| `getAddressBy(opts)`  | Compute the chain-specific address.          |
| `validateAddress(opts)` | Validate an address string.                |
| `signTransaction(opts)` | Sign a chain-specific transaction.         |
| `signMessage(opts)`   | Sign a UTF-8 message.                        |
| `signTypedData(opts)` | Sign EIP-712 / TIP-712 typed data.           |
| `sign(opts)` *(TRON)* | Generic signer with `SignOptions`.           |
| `verifyEthTransactionSign(...)` *(EVM)* | Verify a signed transaction.        |
| `verifyEthMessageSign(...)` *(EVM)*     | Verify a signed message.            |
| `getCommonConfiguration(opts)` *(EVM)*  | Build an `@ethereumjs/common` config. |

All signing methods are **pure functions of their inputs**: they take a private key plus payload, return a signature, and have no side effects on storage or network.

---

## Hardware Wallet (Ledger) Support

Ledger devices are supported over WebHID for both networks. The connection lifecycle is the same on each chain — connect, read status, sign — only the signer class differs.

```ts
import {
  LedgerEthWebHid, LedgerEvmSigner, LedgerEthHidStatusChecker,
  LedgerTrxWebHid, LedgerTrxSigner, LedgerTrxHidStatusChecker,
} from '@tronlink/core';
```

| Class                          | Role                                         |
|--------------------------------|----------------------------------------------|
| `LedgerEthWebHid` / `LedgerTrxWebHid`           | WebHID transport bring-up.       |
| `LedgerEvmSigner` / `LedgerTrxSigner`           | High-level signer over the transport. |
| `LedgerEthHidStatusChecker` / `LedgerTrxHidStatusChecker` | Device status polling.    |

WebHID is browser-only. Hardware-wallet flows are gated to environments that expose `navigator.hid`.

---

## Anonymous Analytics Module

The `userStatistics` module implements **non-identifying** product telemetry:

- Wallet addresses are **never** sent. They are mapped, on-device only, to random UUIDs.
- Raw amounts are **never** sent. They are bucketed locally into a 9-tier logarithmic histogram (`0_1`, `1_10`, …, `10m_infinite`).
- Records are merged locally per `(uid, actionType, tokenAddress, day)` before any upload.
- Reporting is gated to mainnet via `checkIsNeedReportChain()` — testnet and custom-RPC activity are not reported.
- Payloads are encrypted in transit by default.

A consumer wires the module by implementing the `ExternalDependencies` interface and calling the entry points:

```ts
import {
  getAndUpdateAddressAssetPrecipitation,
  getAndUpdateTransactionRecord,
  checkAndReportXY,
  ExternalDependencies,
} from '@tronlink/core';

const deps: ExternalDependencies = {
  getOrCreateUuid,
  saveAssetPrecipitation,  loadAssetPrecipitation,
  setTransactionRecord,    loadTransactionRecords,
  getAllNeedReportAssetPrecipitation,
  getAllNeedReportTransactionRecords,
  checkIsNeedReportChain,
  getSystemConfig,         updateSystemConfig,
  getBalanceInfo,
  sendStatistics,
  getAddressType,
  // ...
};

await getAndUpdateAddressAssetPrecipitation(address, nodeId, deps);
await getAndUpdateTransactionRecord(txMeta, deps);
await checkAndReportXY(deps);  // batched, encrypted upload
```

The privacy guarantees, threat model, and exact on-the-wire payload format are documented separately in [`PRIVACY.md`](./PRIVACY.md). Auditors should start there.

---

## Project Structure

```
tronlink-extension-core/
├── src/
│   ├── base_wallet/         # Mnemonic, BIP-32/39/44, common helpers
│   ├── evm_wallet/          # EVM signing, Ledger ETH integration
│   ├── tron_wallet/         # TRON signing, Ledger TRX integration
│   ├── userStatistics/      # Privacy-preserving analytics
│   │   ├── addressUuidMap.ts       # Local-only address ↔ UUID
│   │   ├── userStatistics.ts       # Bucketing & record building
│   │   ├── report.ts               # Encrypted batch upload
│   │   ├── transactionRecord.ts    # Tx record schema
│   │   ├── assetPrecipitation.ts   # Daily asset snapshot schema
│   │   ├── actionType.ts           # Tracked action enums
│   │   ├── constants.ts            # Chains, contract types, tokens
│   │   ├── indexedDB/              # On-device persistence
│   │   ├── types.ts
│   │   └── index.ts
│   ├── utils/               # httpProxy and shared helpers
│   ├── tests/               # Jest unit tests
│   └── index.ts             # Package entry
├── demo/                    # Runnable usage examples
├── dist/                    # Built artifacts (commonjs, esm)
├── webpack.config.js
├── babel.config.js
├── tsconfig*.json
└── package.json
```

---

## Build & Development

Clone and install:

```bash
git clone https://github.com/TronLink/tronlink-extension-core.git
cd tronlink-extension-core
pnpm install
```

Available scripts:

| Script            | Description                                       |
|-------------------|---------------------------------------------------|
| `pnpm build`      | Clean + webpack + `tsc` for both CJS and ESM.    |
| `pnpm build:dev`  | Development build variant.                       |
| `pnpm start`      | Webpack dev server (for in-repo demo iteration). |
| `pnpm test`       | Run the Jest suite with coverage.                |
| `pnpm clean`      | Remove `dist/`.                                   |

Source is formatted with Prettier and type-checked with TypeScript in strict mode. Please run `pnpm test` before opening a PR.

---

## Testing

Tests live in `src/tests/` and run on Jest with `ts-jest`:

```bash
pnpm test
```

Coverage is emitted to `coverage/` by default. Mainnet code paths are tested against fixed fixtures — no live RPCs or real keys are involved.

---

## Package Verification (GPG)

Release tarballs published to npm are signed. To verify a downloaded artifact, import the build key and check the signature:

```
pub:  7B910EA80207596075E6D7BA5D34F7A6550473BA
uid:  build_tronlink <build@tronlink.org>
```

```bash
gpg --recv-keys 7B910EA80207596075E6D7BA5D34F7A6550473BA
gpg --verify <package>.tgz.asc <package>.tgz
```

A failed signature check is a security incident — please do not install the package.

---

## Versioning & Releases

This project follows [Semantic Versioning](https://semver.org/). Breaking changes to the public API in `src/index.ts` are reflected in the major version. The release history is on the [GitHub Releases page](https://github.com/TronLink/tronlink-extension-core/releases).

---

## Privacy

The technical mechanisms by which the TronLink extension avoids collecting device-resident wallet addresses are implemented in this package and documented in [`PRIVACY.md`](./PRIVACY.md).

Every claim in that document is anchored to specific files in `src/userStatistics/`. Independent audits are welcome.

---

## License

Licensed under the [Apache License, Version 2.0](./LICENSE).

```
Copyright (c) TronLink contributors
```
