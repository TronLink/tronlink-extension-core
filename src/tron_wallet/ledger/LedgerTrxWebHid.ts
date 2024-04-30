import AppTrx from '@ledgerhq/hw-app-trx';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';

import { LedgerWebHid } from '../../base_wallet/ledger';
import { TronWallet } from '../TronWallet';

export class LedgerTrxWebHid extends LedgerWebHid {
  _transport?: Transport;
  _app?: AppTrx;

  getWallet(): TronWallet {
    return new TronWallet();
  }

  async signTransaction(transaction: any, path: string) {
    try {
      const app = await this.makeApp();
      const response = await app.signTransaction(path, transaction.hex, transaction.info);
      return response;
    } finally {
      await this.cleanUp();
    }
  }

  async signTransactionHash(path: string, rawTxHashHex: string) {
    try {
      const app = await this.makeApp();
      const response = await app.signTransactionHash(path, rawTxHashHex);
      return response;
    } finally {
      await this.cleanUp();
    }
  }

  protected async makeApp(): Promise<AppTrx> {
    this._transport = await TransportWebHID.create();
    this._app = new AppTrx(this._transport);
    return this._app;
  }

  protected async cleanUp() {
    this._app = undefined;
    await this._transport?.close();
  }
}
