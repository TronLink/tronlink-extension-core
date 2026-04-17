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

The metrics module collects aggregated usage data only. Wallet addresses, keys, mnemonics, transaction hashes, counter-parties, and device identifiers are never transmitted. The backend receives only opaque UUIDs and same-day aggregated buckets; individual transactions are not reconstructible.

### Address → UUID Anonymization

Each address is mapped to a random UUID stored locally only. The backend never sees the address, and the same user's two wallets appear as two independent UUIDs (no server-side linkage).

```ts
// src/userStatistics/addressUuidMap.ts — local-only address → uuid mapping
async getOrCreateUuid(address: string): Promise<string> {
  const entity = await uidMappingStore.getByAddress(address);
  if (!entity) {
    const uuid = crypto.randomUUID();          // fresh random UUID
    await uidMappingStore.insert(address, uuid); // persisted on-device only
    return uuid;
  }
  return entity.uid;
}
```

### What Is Uploaded

Records are merged locally per `(uid, actionType, tokenAddress, day)` before upload, and raw amounts are replaced with a 9-bucket logarithmic histogram (`A1..A9`). Only these two payloads are sent (encrypted):

```ts
// Record — aggregated daily action counts
export type TransactionRecord = {
  uid: string;
  addressType: number;
  contractType: number;
  actionType: number;       // closed enum; unknown contract calls discarded
  count: number;
  tokenAddress: string;     // TRX / TRC10 / TRC20 id
  tokenAmount: string;
  energy: string;
  bandwidth: string;
  burn: string;
  date: string;
  txnAmountDistributions: TransactionDistribution[]; // bucketed, e.g. [{range:'A1',count:1},{range:'A2',count:3}]
};
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
