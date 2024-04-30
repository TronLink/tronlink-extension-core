// @ts-ignore
import bip39 from 'bip39';

import type {
  DerivePathParams,
  DerivePrivateKeyParams,
  GetAddressParams,
  SignParams,
  ValidateAddressParams,
} from './types';
import { isPositiveInteger } from '../utils';
import { InvalidParameterError } from './error';
import { CoinType } from './constants';

export abstract class BaseWallet {
  static generateRandomMnemonic(): string {
    return bip39.generateMnemonic(128);
  }

  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  protected abstract getCoinType(): CoinType;

  derivePath(params: DerivePathParams = { accountIndex: 0, addressIndex: 0 }): string {
    if (!isPositiveInteger(params.accountIndex) || !isPositiveInteger(params.addressIndex)) {
      throw new InvalidParameterError();
    }
    return `m/44'/${this.getCoinType()}'/${params.accountIndex}'/0/${params.addressIndex}`;
  }

  abstract derivePrivateKey(params: DerivePrivateKeyParams): string;

  abstract getAddressBy(params: GetAddressParams): string;

  abstract validateAddress(params: ValidateAddressParams): boolean;

  abstract sign(params: SignParams): Promise<any>;

  abstract signMessage(params: SignParams): Promise<any>;

  abstract signTransaction(params: SignParams): Promise<any>;

  abstract signTypedData(params: SignParams): Promise<string>;
}
