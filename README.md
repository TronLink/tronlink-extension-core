# TronLink Extension Core

This project is a TypeScript and JavaScript-based module that utilizes the Node.js runtime environment and npm as a package manager.

The library serves as a core module within TronLink Extension, which provides low-level wallet functionality for both Tron and Ethereum networks. Its primary features include account generation and transaction signing.

A lightweight analytics component is bundled to support internal product insights. This component is strictly non-identifying — it neither accesses nor transmits any data that could be linked to an individual user, wallet address, or on-chain activity.

## Table of Contents

- [Getting Started](#getting-started)
- [Usage](#usage)
- [Analytics Module](#analytics-module-privacy-first-design)
- [Local Build](#local-build)
- [Running Tests](#running-tests)
- [Integrity Check](#integrity-check)
- [License](#license)

## Getting Started

### Installation

Install `@tronlink/core` using your package manager of choice:

```bash
npm install @tronlink/core
```

```bash
yarn add @tronlink/core
```

```bash
pnpm install @tronlink/core
```

## Usage

The project includes utility classes for generating accounts and signing transactions for Tron and Ethereum, along with a lightweight analytics module for aggregated, non-identifying usage insights.

Please refer to the demos below:

- [Account generation](demo/create_account.ts)
- [Ethereum transaction & message signing](demo/evm_signature.ts)
- [Tron transaction & message signing](demo/tron_signature.ts)
- [UserStatistics implementation](demo/user_statistics.ts)

## Analytics Module (Privacy-First Design)

The `userStatistics` module (`src/userStatistics/`) is a lightweight, opt-in analytics component designed to give the product team aggregated usage insights without ever learning who the user is or what their wallet address is. This section describes the privacy model, the core design principles, and the user-facing mechanisms that make those guarantees hold.

### Privacy Model — What Is (and Isn't) Collected

Never collected, never transmitted:

- Wallet addresses (TRX / EVM / any form).
- Public keys, mnemonic phrases, private keys, or any signing material.
- Transaction hashes, counter-party addresses, memo fields, or contract call parameters.
- IP, device fingerprint, or any identifier derived from the host browser.
- The `address` argument accepted by the public API is used only as a local lookup key (to find the anonymous UUID and index the local IndexedDB store). It never appears in any outbound payload.

Collected and reported in aggregated form:

- An anonymous per-address UUID.
- A coarse wallet provenance enum (`addressType` — mnemonic / imported / hardware / etc.).
- Daily balance snapshots per UUID (TRX / USDT / whitelisted-token USD totals).
- Daily counts of transaction actions by action type, token address, and amount-range bucket.
- Aggregated resource cost (energy / bandwidth / burn).

### Address Anonymization

Every record carries an opaque `uid` field instead of the wallet address. The host application maintains a local `address → uuid` map:

1. On first use of an address, a fresh random UUID is generated and stored locally.
2. Subsequent calls return the same UUID so backend aggregation works across sessions.
3. The mapping itself never leaves the device. The backend only sees opaque UUIDs and has no way to reverse them into on-chain addresses.
4. UUIDs are uncorrelated with the address, so two wallets held by the same human appear as two independent UUIDs — no cross-wallet linkage is possible server-side.

The address is only used locally to look up the UUID; every record then references the UUID, not the address:

```ts
// src/userStatistics/userStatistics.ts
const uuid = await getOrCreateUuid(address, deps);
// ...record uses `uid: uuid`, never `address`
```

### Core Design Principles

- **Same-day aggregation.** Records are merged locally on the device before transmission. For each `(uid, actionType, tokenAddress, date)` tuple, matching rows are folded into a single row with amounts, counts and costs summed. Whether a user performs 1 or 500 identical transfers in a day, the backend receives exactly one row — individual transactions are not reconstructible from the report.

  ```ts
  // src/userStatistics/transactionRecord.ts
  const existing = records?.find(
    (record) =>
      record.uid === newRecord.uid &&
      record.actionType === newRecord.actionType &&
      record.tokenAddress === newRecord.tokenAddress &&
      record.date === newRecord.date,
  );

  if (existing) {
    existing.tokenAmount = safeAdd(existing.tokenAmount, newRecord.tokenAmount);
    existing.count       = Number(safeAdd(existing.count, newRecord.count));
    existing.energy      = safeAdd(existing.energy, newRecord.energy);
    existing.bandwidth   = safeAdd(existing.bandwidth, newRecord.bandwidth);
    existing.burn        = safeAdd(existing.burn, newRecord.burn);
    existing.txnAmountDistributions = mergeDistributions(
      existing.txnAmountDistributions,
      newRecord.txnAmountDistributions,
    );
  }
  ```

- **Amount bucketing instead of raw values.** Per-transaction token amounts would themselves be a weak fingerprint, so raw amounts are replaced with a 9-range logarithmic histogram (from `0_1` up to `10m_infinite`). At report time the range keys are further compressed to two-character codes (`A1`..`A9`).

  ```ts
  // src/userStatistics/userStatistics.ts
  const ranges = [
    { range: '0_1',          min: 0,          max: 1 },
    { range: '1_10',         min: 1,          max: 10 },
    { range: '10_100',       min: 10,         max: 100 },
    { range: '100_1k',       min: 100,        max: 1_000 },
    { range: '1k_10k',       min: 1_000,      max: 10_000 },
    { range: '10k_100k',     min: 10_000,     max: 100_000 },
    { range: '100k_1m',      min: 100_000,    max: 1_000_000 },
    { range: '1m_10m',       min: 1_000_000,  max: 10_000_000 },
    { range: '10m_infinite', min: 10_000_000, max: Infinity },
  ];
  ```

- **Closed-enum action classification.** The on-chain contract type, the initiator (TronLink UI vs. external DApp), and — for smart contracts — the resolved function name are mapped to a finite integer enum. This closed enum is the only "what happened" signal that reaches the backend; contract-call arguments, method selectors outside the known set, and arbitrary `data` payloads are discarded before they ever touch the storage layer.

  ```ts
  // src/userStatistics/types.ts
  export enum UserStatisticsActionType {
    TRX_TRANSFER              = 1051,
    TRC10_TRANSFER            = 1052,
    TRC20_TRANSFER            = 1053,
    TRC721_TRANSFER           = 1054,
    TRX_STAKE                 = 1061,
    TRX_VOTE                  = 1062,
    // ...
    DAPP_AUTH                 = 1071,
    DAPP_TRIGGER_CONTRACT     = 1076,
    UPDATE_ACCOUNT_PERMISSION = 1081,
  }
  ```

- **Upsert-only asset snapshots.** For each address, at most one balance record per UTC day exists, and it is only re-saved when balances actually change — guaranteeing one effective snapshot per user per day, not per reporting call.

  ```ts
  // src/userStatistics/assetPrecipitation.ts
  if (
    existingData &&
    (existingData.trxBalance !== newData.trxBalance ||
      existingData.usdtBalance !== newData.usdtBalance ||
      existingData.date !== newData.date)
  ) {
    saveAddressAssetPrecipitation(
      address,
      { ...newData, id: existingData.id, isNeedReport: true },
      deps,
    );
  }
  ```

## Local Build

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Node.js >= 18.19.0
- pnpm >= 7.32.0
- TypeScript >= 4.9.5

### Build @tronlink/core

#### 1. Install pnpm

This project recommends using `pnpm` as the build tool. Make sure Node.js is installed:

```bash
node -v
```

Then install `pnpm`:

```bash
npm i -g pnpm
```

#### 2. Clone the repository

```bash
git clone https://github.com/TronLink/tronlink-extension-core.git
```

#### 3. Install dependencies

```bash
pnpm install
```

#### 4. Compile TypeScript files

```bash
pnpm build
```

### Built With

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [TronLink Extension Core](https://github.com/TronLink/tronLink-extension-core)

## Running Tests

The project includes a suite of tests for the TronLink Extension Core. To run these tests, use the following command:

```bash
pnpm test
```

## Integrity Check

The package files will be signed using a GPG key pair, and the correctness of the signature will be verified using the following public key:

```
pub: 7B910EA80207596075E6D7BA5D34F7A6550473BA
uid: build_tronlink <build@tronlink.org>
```

## License

This project is licensed under the Apache License Version 2.0 — see the [LICENSE](LICENSE) file for details.
