export enum DeviceStatusType {
  LOCKED = 'LOCKED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  AUTHORIZED = 'AUTHORIZED',
}

export abstract class LedgerHidStatusChecker {
  checkEnableUseHID(): boolean {
    // @ts-ignore
    return !!(window.navigator && window.navigator.hid);
  }

  abstract getStatus(): Promise<{ deviceType?: string; deviceStatus: DeviceStatusType }>;
}
