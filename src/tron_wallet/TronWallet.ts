// @ts-ignore
import * as bip32 from 'bip32';
// @ts-ignore
import bip39 from 'bip39';
// @ts-ignore
import { TronWeb } from 'tronweb';

import type {
  DerivePrivateKeyParams,
  GetAddressParams,
  SignParams,
  ValidateAddressParams,
  VerifySignParams,
} from '../base_wallet/types';
import { BaseWallet } from '../base_wallet';
import { CoinType } from '../base_wallet/constants';
import { InvalidParameterError, SignError, VerifySignError } from '../base_wallet/error';
import { defaultTronWeb, generateTronWeb } from './generateTronWeb';
import { checkSignParams } from '../utils';

export class TronWallet extends BaseWallet {
  protected getCoinType(): CoinType {
    return CoinType.TRON;
  }

  derivePrivateKey(params: DerivePrivateKeyParams): string {
    const seed = bip39.mnemonicToSeed(params.mnemonic);
    // @ts-ignore
    const node = bip32.fromSeed(seed);
    const child = node.derivePath(params.path);
    const privateKey = child.privateKey!.toString('hex');
    return privateKey;
  }

  getAddressBy(params: GetAddressParams): string {
    // @ts-ignore
    const address = TronWeb.address.fromPrivateKey(params.privateKey);
    // @ts-ignore
    return address;
  }

  validateAddress(params: ValidateAddressParams): boolean {
    if (!params.address) {
      return false;
    }
    // @ts-ignore
    return TronWeb.isAddress(params.address);
  }

  async sign(params: SignParams): Promise<any> {
    try {
      checkSignParams(params);

      const { data, options } = params;
      const { isMultiSign, isSignMessageV2 } = options || {
        isMultiSign: false,
        isSignMessageV2: false,
      };

      if (
        typeof data === 'string' ||
        (data && data.constructor && data.constructor.name === 'String')
      ) {
        if (isSignMessageV2) {
          return this.signMessageV2(params);
        } else {
          return this.signMessage(params);
        }
      } else if (typeof data === 'object' && data.txID) {
        if (isMultiSign) {
          return this.multiSign(params);
        } else {
          return this.signTransaction(params);
        }
      } else if (typeof data === 'object' && data.domain && data.types && data.message) {
        return this.signTypedData(params);
      } else {
        throw new InvalidParameterError();
      }
    } catch (error: any) {
      throw new SignError(error.message);
    }
  }

  async signMessage(params: SignParams): Promise<any> {
    try {
      checkSignParams(params);

      const { privateKey, data: message } = params;

      return defaultTronWeb.trx.sign(message, privateKey);
    } catch (error: any) {
      throw new SignError(error.message);
    }
  }

  async verifyMessage(params: VerifySignParams): Promise<any> {
    try {
      const { data: message, signature, address } = params;
      if (!message || !signature) {
        throw new InvalidParameterError();
      }
      return defaultTronWeb.trx.verifyMessage(message, signature, address);
    } catch (error: any) {
      throw new VerifySignError(error.message);
    }
  }

  async signTransaction(params: SignParams): Promise<any> {
    try {
      checkSignParams(params);

      const { privateKey, data: transaction } = params;
      return defaultTronWeb.trx.sign(transaction, privateKey);
    } catch (error: any) {
      throw new SignError(error.message);
    }
  }

  async signTypedData(params: SignParams): Promise<string> {
    try {
      checkSignParams(params);

      const { privateKey, data } = params;
      if (typeof data !== 'object') {
        throw new InvalidParameterError();
      }

      const { domain, types, message } = data;
      return defaultTronWeb.trx._signTypedData(domain, types, message, privateKey);
    } catch (error: any) {
      throw new SignError(error.message);
    }
  }

  async verifyTypedData(params: VerifySignParams): Promise<any> {
    try {
      const { data, signature, address } = params;
      if (!data || !signature || !address || typeof data !== 'object') {
        throw new InvalidParameterError();
      }

      const { domain, types, message } = data;
      return defaultTronWeb.trx.verifyTypedData(domain, types, message, signature, address);
    } catch (error: any) {
      throw new VerifySignError(error.message);
    }
  }

  async multiSign(params: SignParams): Promise<any> {
    try {
      checkSignParams(params);

      const { privateKey, data: transaction, options } = params;
      if (!options) {
        throw new InvalidParameterError();
      }

      const { permissionId, nodeInfo } = options;
      const tronWeb = generateTronWeb(nodeInfo);
      return await tronWeb.trx.multiSign(transaction, privateKey, permissionId);
    } catch (error: any) {
      throw new SignError(error.message);
    }
  }

  async signMessageV2(params: SignParams): Promise<any> {
    try {
      checkSignParams(params);

      const { privateKey, data: message } = params;
      return defaultTronWeb.trx.signMessageV2(message, privateKey);
    } catch (error: any) {
      throw new SignError(error.message);
    }
  }

  async verifyMessageV2(params: VerifySignParams): Promise<any> {
    try {
      const { data: message, signature } = params;
      if (!message || !signature) {
        throw new InvalidParameterError();
      }
      return defaultTronWeb.trx.verifyMessageV2(message, signature);
    } catch (error: any) {
      throw new VerifySignError(error.message);
    }
  }
}
