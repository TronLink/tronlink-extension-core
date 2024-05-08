import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import Transport from '@ledgerhq/hw-transport';
import AppEth from '@ledgerhq/hw-app-eth';
import { TypedDataUtils } from 'eth-sig-util';

import { LedgerWebHid } from '../../base_wallet/ledger';
import { EvmWallet } from '../EvmWallet';

export class LedgerEthWebHid extends LedgerWebHid {
  _transport?: Transport;
  _app?: AppEth;

  getWallet(): EvmWallet {
    return new EvmWallet();
  }

  async signTransaction(transaction: any, path: string) {
    try {
      await this.makeApp();
      const response = await this._app!.clearSignTransaction(path, transaction, {
        nft: true,
        externalPlugins: true,
        erc20: true,
      });
      return response;
    } finally {
      await this.cleanUp();
    }
  }

  async signTypedData(data: any, path: string) {
    try {
      await this.makeApp();
      const domainSeparatorHex = TypedDataUtils.hashStruct(
        'EIP712Domain',
        data.domain,
        data.types,
      ).toString('hex');
      const hashStructMessageHex = TypedDataUtils.hashStruct(
        data.primaryType,
        data.message,
        data.types,
      ).toString('hex');
      const response = await this._app!.signEIP712HashedMessage(
        path,
        domainSeparatorHex,
        hashStructMessageHex,
      );
      return response;
    } finally {
      await this.cleanUp();
    }
  }

  protected async makeApp(): Promise<AppEth> {
    this._transport = await TransportWebHID.create();
    this._app = new AppEth(this._transport);
    return this._app;
  }

  protected async cleanUp() {
    this._app = undefined;
    await this._transport?.close();
  }
}
