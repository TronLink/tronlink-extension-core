import { GetAddressByDefinePathParams, GetAvailableAddressParams } from '../types';
import { BaseWallet } from '../wallet';

export abstract class LedgerWebHid {
  protected abstract makeApp(): Promise<LedgerAppBase>;

  protected abstract cleanUp(): Promise<void>;

  async getAddressByDefinePath(params: GetAddressByDefinePathParams): Promise<string> {
    try {
      const { path } = params;
      const app = await this.makeApp();
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
