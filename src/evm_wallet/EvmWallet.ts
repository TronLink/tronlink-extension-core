// @ts-ignore
import bip39 from 'bip39';
import { HDKey } from 'ethereum-cryptography/hdkey';
import {
  bufferToHex,
  isValidAddress,
  privateToPublic,
  publicToAddress,
  stripHexPrefix,
  toChecksumAddress,
  bigIntToBuffer,
  ecsign,
  ecrecover,
  fromRpcSig,
  hashPersonalMessage,
} from '@ethereumjs/util';
import { ethers } from 'ethers';
import { TransactionFactory } from '@ethereumjs/tx';
import { Chain, Common, Hardfork } from '@ethereumjs/common';
import { signTypedData_v4 } from 'eth-sig-util';

import type {
  DerivePrivateKeyParams,
  GetAddressParams,
  SignParams,
  ValidateAddressParams,
} from '../base_wallet/types';
import { BaseWallet } from '../base_wallet';
import { CoinType } from '../base_wallet/constants';
import { msgHexToText } from './util';
import { checkSignParams } from '../utils';
import { InvalidParameterError, SignError } from '../base_wallet/error';

export class EvmWallet extends BaseWallet {
  protected getCoinType(): CoinType {
    return CoinType.ETHER;
  }

  derivePrivateKey(params: DerivePrivateKeyParams): string {
    const seed = bip39.mnemonicToSeed(params.mnemonic);

    const hdWallet = HDKey.fromMasterSeed(seed);
    const wallet = hdWallet.derive(params.path);
    const privateKey = stripHexPrefix(bufferToHex(Buffer.from(wallet.privateKey!)));
    return privateKey;
  }

  getAddressBy(params: GetAddressParams): string {
    const strippedHexPrivateKey = stripHexPrefix(params.privateKey);
    const evmPrivateKey = Buffer.from(strippedHexPrivateKey, 'hex');
    const publicKey = privateToPublic(evmPrivateKey);

    const evmAddress = toChecksumAddress(
      bufferToHex(publicToAddress(Buffer.from(publicKey), true)),
    );
    return evmAddress;
  }

  validateAddress(params: ValidateAddressParams): boolean {
    if (!params.address) {
      return false;
    }

    return isValidAddress(params.address);
  }

  async sign(params: SignParams): Promise<any> {
    try {
      checkSignParams(params);

      const { data } = params;

      if (typeof data === 'string') {
        return this.signMessage(params);
      } else if (typeof data === 'object' && data.domain && data.types && data.message) {
        return this.signTypedData(params);
      } else if (typeof data === 'object' && !Array.isArray(data)) {
        return this.signTransaction(params);
      } else {
        throw new InvalidParameterError();
      }
    } catch (error: any) {
      throw new SignError(error.message);
    }
  }

  async signMessage(param: SignParams): Promise<any> {
    if (typeof param.data !== 'string') {
      throw new SignError(
        'The "data" parameter of the function "signMessage" must be passed in string type',
      );
    }
    const textMessage = msgHexToText(param.data);
    const signature = ecsign(
      hashPersonalMessage(Buffer.from(textMessage)),
      Buffer.from(param.privateKey, 'hex'),
    );
    const rawMsgSign = this.signedConvertRSVtoHex({
      r: signature.r,
      s: signature.s,
      v: signature.v,
    });
    return rawMsgSign;
  }

  async signTransaction(
    params: SignParams & {
      data: {
        common: Common;
        unSignedTransaction: Record<string, any>;
      };
    },
  ): Promise<any> {
    const tx = TransactionFactory.fromTxData(params.data.unSignedTransaction, {
      common: params.data.common,
    });
    const hexPrivateKey = Buffer.from(params.privateKey, 'hex');
    const signedTX = tx.sign(hexPrivateKey);
    return signedTX;
  }

  public verifyEthMessageSign(signature: string, message: string, expectAddress: string) {
    const { r, s, v } = fromRpcSig(signature);
    const publicKey = ecrecover(hashPersonalMessage(Buffer.from(msgHexToText(message))), v, r, s);
    const address = publicToAddress(publicKey, true);
    return `${address.toString('hex').toLowerCase()}` === expectAddress.slice(2).toLowerCase();
  }

  public verifyEthTransactionSign(
    rawTransaction: any,
    rsvSignature: { r: string; s: string; v: number },
    expectAddress: string,
  ) {
    const serializedTransaction = ethers.utils.serializeTransaction(rawTransaction);
    const txHash = ethers.utils.keccak256(serializedTransaction);
    const recoveredAddress = ethers.utils.recoverAddress(txHash, rsvSignature);
    return expectAddress.toLowerCase() === recoveredAddress.toLowerCase();
  }

  async signTypedData(params: SignParams): Promise<string> {
    if (typeof params.data === 'string') {
      throw new SignError(
        'The "data" parameter of the function "signTypedData" must be passed in type of a specific structure',
      );
    }
    return signTypedData_v4(Buffer.from(params.privateKey, 'hex'), { data: params.data as any });
  }

  signedConvertRSVtoHex({ r, s, v }: { r: Buffer; s: Buffer; v: bigint }) {
    const vBuffer = bigIntToBuffer(v);
    const rHex = r.toString('hex');
    const sHex = s.toString('hex');
    const vHex = vBuffer.toString('hex');
    const rPadded = rHex.padStart(64, '0');
    const sPadded = sHex.padStart(64, '0');
    const vPadded = vHex;
    return `0x${rPadded}${sPadded}${vPadded}`;
  }

  getCommonConfiguration({
    isSupportsEIP1559,
    chain,
    chainId,
    chainName,
  }: {
    isSupportsEIP1559: boolean;
    chain?: Chain;
    chainId: string;
    chainName: string;
  }) {
    const hardfork = isSupportsEIP1559 ? Hardfork.London : Hardfork.Berlin;

    if (chain && [Chain.Sepolia, Chain.Goerli, Chain.Mainnet].includes(chain)) {
      return new Common({
        chain,
        hardfork,
      });
    } else {
      return Common.custom({
        name: chainName,
        chainId: parseInt(chainId, 16),
        networkId: parseInt(chainId, 16),
        // @ts-ignore
        hardfork,
      });
    }
  }
}
