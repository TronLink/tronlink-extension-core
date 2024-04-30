import AppEth from '@ledgerhq/hw-app-eth';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';

import { DeviceStatusType, LedgerHidStatusChecker } from '../../base_wallet/ledger';
import { EvmWallet } from '../EvmWallet';

export class LedgerEthHidStatusChecker extends LedgerHidStatusChecker {
  async getStatus() {
    let deviceType = '';
    let deviceStatus = DeviceStatusType.LOCKED;

    let transport;

    try {
      const path = new EvmWallet().derivePath({ accountIndex: 0, addressIndex: 0 });
      transport = await TransportWebHID.create(3000, 5000);
      const app = new AppEth(transport);
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
