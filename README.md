# TronLink Extension Core

This project is a TypeScript and JavaScript-based module that utilizes the Node.js runtime environment and npm as a package manager. 

The library serves as a core module within TronLink Extension,  which provides low-level wallet functionality for both Tron and Ethereum networks, primary features includes account generation and transaction signing.

Additionally, the library includes a UserStatistics module that enables tracking and reporting of user asset precipitation and transaction records. This module does not report the user's real address.

## Getting Started


### Installing

add @tronlink/core

```bash
npm install @tronlink/core
```

or

```bash
yarn add @tronlink/core
```

or

```bash
pnpm install @tronlink/core
```

## Usage

The project includes utility classes for generating accounts and signing transactions for Tron and Ethereum, as well as a UserStatistics module for reporting user asset and transaction data.


Please refer to below demo:

+ [Account generation](demo/create_account.ts)
+ [Ethereum transaction & message signing](demo/evm_signature.ts)
+ [Tron transaction & message signing](demo/tron_signature.ts)
+ [UserStatistics implementation](/Volumes/PrivateDisks/code/tronlink-extension-core-fork/demo/user_statistics.ts)


## Running the tests

The project includes a suite of tests for the TronLink Extension Core. To run these tests, use the following command:

```bash
pnpm test
```


## Local build

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.


### Prerequisites

- Node.js >= 18.19.0
- pnpm >= 7.32.0
- TypeScript >= 4.9.5


### Build @tronlink/core
##### 1. Install pnpm

This project recommends using `pnpm` as the build tool
Make sure node is installed:
```bash
node -v
```
and install `pnpm`:
```bash
npm i -g pnpm
```

##### 2. Clone the repository

```bash
git clone https://github.com/TronLink/tronlink-extension-core.git
```

##### 3. Install dependencies

```bash
pnpm install
```

##### 4. Compile TypeScript files

```bash
pnpm build
```
### Built With

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [TronLink Extension Core](https://github.com/TronLink/tronLink-extension-core)

## Integrity Check
The package files will be signed using a GPG key pair, and the correctness of the signature will be verified using the following public key:

  ```
  pub: 7B910EA80207596075E6D7BA5D34F7A6550473BA
  uid: build_tronlink <build@tronlink.org>
  ```


## License

This project is licensed under the Apache License Version 2.0 - see the [LICENSE](LICENSE) file for details

