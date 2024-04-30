import { BaseWallet, TronWallet, EvmWallet } from '@tronlink/core';

enum WalletType {
  TRON = 'TRON',
  EVM = 'EVM',
}

interface MnemonicAccount {
  mnemonic: string;
  privateKey: string;
  address: string;
  accountIndex: number;
  addressIndex: number;
  type: WalletType;
}

export function createTronMnemonicAccount(): MnemonicAccount {
  const wallet = new TronWallet();
  const mnemonic = BaseWallet.generateRandomMnemonic();
  const accountIndex = 0;
  const addressIndex = 0;
  const path = wallet.derivePath({ accountIndex, addressIndex });
  const privateKey = wallet.derivePrivateKey({
    mnemonic,
    path,
  });
  const address = wallet.getAddressBy({ privateKey });

  const account: MnemonicAccount = {
    mnemonic,
    privateKey,
    address,
    accountIndex,
    addressIndex,
    type: WalletType.TRON,
  };
  console.log(account);
  return account;
}

export function createEvmMnemonicAccount(): MnemonicAccount {
  const wallet = new EvmWallet();
  const mnemonic = BaseWallet.generateRandomMnemonic();
  const accountIndex = 0;
  const addressIndex = 0;
  const path = wallet.derivePath({ accountIndex, addressIndex });
  const privateKey = wallet.derivePrivateKey({
    mnemonic,
    path,
  });
  const address = wallet.getAddressBy({ privateKey });

  const account: MnemonicAccount = {
    mnemonic,
    privateKey,
    address,
    accountIndex,
    addressIndex,
    type: WalletType.EVM,
  };
  console.log(account);
  return account;
}


createTronMnemonicAccount();
createEvmMnemonicAccount();
