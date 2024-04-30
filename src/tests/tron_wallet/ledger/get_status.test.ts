import { LedgerTrxHidStatusChecker } from '../../../tron_wallet/ledger';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import * as hwAppTrx from '@ledgerhq/hw-app-trx';

describe('LedgerTrxHidStatusChecker', () => {
  let checker: LedgerTrxHidStatusChecker;

  beforeEach(async () => {
    checker = new LedgerTrxHidStatusChecker();
  });

  test('returns AUTHORIZED when Ledger is connected and authorized', async () => {
    TransportWebHID.create = jest.fn().mockResolvedValue({
      deviceModel: { id: 'ledger_nano_s' },
      close: jest.fn(),
    });
    // @ts-ignore
    hwAppTrx.default = jest.fn().mockReturnValue({
      constructor: jest.fn(),
      getAddress: jest.fn().mockResolvedValue({}),
    });

    const status = await checker.getStatus();
    expect(status.deviceStatus).toBe('AUTHORIZED');
  });

  test('returns UNAUTHORIZED when Ledger is connected but unauthorized', async () => {
    TransportWebHID.create = jest.fn().mockResolvedValue({
      deviceModel: { id: 'ledger_nano_s' },
      close: jest.fn(),
    });
    // @ts-ignore
    hwAppTrx.default = jest.fn().mockReturnValue({
      constructor: jest.fn(),
      getAddress: jest.fn().mockRejectedValue(new Error('Unauthorized')),
    });

    const status = await checker.getStatus();
    expect(status.deviceStatus).toBe('UNAUTHORIZED');
  });

  test('returns LOCKED when Ledger is not connected', async () => {
    TransportWebHID.create = jest.fn().mockRejectedValue(new Error('Device not found'));

    const status = await checker.getStatus();
    expect(status.deviceStatus).toBe('LOCKED');
  });

  test('returns correct device type when Ledger is connected', async () => {
    const mockDeviceModel = { id: 'ledger_nano_x' };
    TransportWebHID.create = jest.fn().mockResolvedValue({
      deviceModel: mockDeviceModel,
      close: jest.fn(),
    });
    // @ts-ignore
    hwAppTrx.default = jest.fn().mockReturnValue({
      constructor: jest.fn(),
      getAddress: jest.fn().mockRejectedValue(new Error('Unauthorized')),
    });

    const status = await checker.getStatus();
    expect(status.deviceType).toBe(mockDeviceModel.id);
  });

  // test close
  test('cleans up transport when an exception occurs', async () => {
    const mockClose = jest.fn();
    TransportWebHID.create = jest.fn().mockResolvedValue({
      close: mockClose,
    });
    // @ts-ignore
    hwAppTrx.default = jest.fn().mockReturnValue({
      constructor: jest.fn(),
      getAddress: jest.fn().mockRejectedValue(new Error('Error')),
    });

    try {
      await checker.getStatus();
    } catch (e) {
      // error handling
    }
    expect(mockClose).toHaveBeenCalled();
  });
});
