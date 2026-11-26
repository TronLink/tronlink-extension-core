import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';

import { GetAddressByDefinePathParams, GetAvailableAddressParams } from '../types';
import { BaseWallet } from '../wallet';

export abstract class LedgerWebHid {
  private static ledgerTransports = new Map<Transport, () => void>();

  protected abstract makeApp(): Promise<LedgerAppBase>;

  protected abstract cleanUp(): Promise<void>;

  isBusy(): boolean {
    for (const transport of LedgerWebHid.ledgerTransports.keys()) {
      if (
        transport._appAPIlock === 'signTransaction' ||
        transport._appAPIlock === 'signTransactionHash' ||
        transport._appAPIlock === 'signPersonalMessage' ||
        transport._appAPIlock === 'signEIP712HashedMessage'
      ) {
        return true;
      }
    }
    return false;
  }

  protected registerTransport(transport: Transport) {
    const unregister = () => {
      LedgerWebHid.ledgerTransports.delete(transport);
      transport.off('disconnect', unregister);
    };
    LedgerWebHid.ledgerTransports.set(transport, unregister);
    transport.on('disconnect', unregister);
  }

  protected unregisterTransport(transport?: Transport) {
    if (transport) LedgerWebHid.ledgerTransports.get(transport)?.();
  }

  async isConnected(): Promise<boolean> {
    return (await TransportWebHID.list()).length > 0;
  }

  async getAppName(): Promise<string> {
    let transport: Transport | undefined;
    try {
      transport = await TransportWebHID.create();
      const response = await transport.send(0xb0, 0x01, 0x00, 0x00);
      const nameLength = response[1];
      if (response[0] !== 1 || !nameLength || nameLength + 2 > response.length - 2) {
        throw new Error('Invalid Ledger app info');
      }
      return response.subarray(2, 2 + nameLength).toString('ascii');
    } finally {
      await transport?.close();
    }
  }

  async getAddressByDefinePath(
    params: GetAddressByDefinePathParams,
    onConnected?: () => void,
  ): Promise<string> {
    try {
      const { path } = params;
      const app = await this.makeApp();
      onConnected?.();
      const { address } = await app.getAddress(path);
      return address;
    } finally {
      await this.cleanUp();
    }
  }

  protected abstract getWallet(): BaseWallet;

  async getAvailableAddress(
    params: GetAvailableAddressParams,
  ): Promise<{ index: number; address: string; path: string }> {
    let index = 0;
    let address: string;
    let path = '';
    const wallet = this.getWallet();
    const { addresses } = params;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      path = wallet.derivePath({ accountIndex: index, addressIndex: 0 });
      address = await this.getAddressByDefinePath({ path });

      if (!addresses.includes(address)) {
        break;
      }

      index++;
    }

    return {
      index,
      address,
      path,
    };
  }

  async signPersonalMessage(transaction: any, path: string): Promise<any> {
    try {
      const app = await this.makeApp();
      const response = await app.signPersonalMessage(path, transaction);
      return response;
    } finally {
      await this.cleanUp();
    }
  }
}
