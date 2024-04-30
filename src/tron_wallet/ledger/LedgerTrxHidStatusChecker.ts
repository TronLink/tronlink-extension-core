import AppTrx from '@ledgerhq/hw-app-trx';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';

import { DeviceStatusType, LedgerHidStatusChecker } from '../../base_wallet/ledger';
import { TronWallet } from '../TronWallet';

export class LedgerTrxHidStatusChecker extends LedgerHidStatusChecker {
  async getStatus() {
    let deviceType = '';
    let deviceStatus = DeviceStatusType.LOCKED;

    let transport;

    try {
      const path = new TronWallet().derivePath({ accountIndex: 0, addressIndex: 0 });
      transport = await TransportWebHID.create(3000, 5000);

      const app = new AppTrx(transport);
      if (transport && transport.deviceModel) {
        deviceType = transport.deviceModel.id;
      }
      await app.getAddress(path, false);
      deviceStatus = DeviceStatusType.AUTHORIZED;
    } catch (e) {
      if (transport && transport.deviceModel) {
        deviceStatus = DeviceStatusType.UNAUTHORIZED;
      } else {
        deviceStatus = DeviceStatusType.LOCKED;
      }
    } finally {
      await transport?.close();
    }

    return {
      deviceType,
      deviceStatus,
    };
  }
}
