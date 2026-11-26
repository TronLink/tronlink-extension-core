import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import AppTrx from '@ledgerhq/hw-app-trx';
import AppEth from '@ledgerhq/hw-app-eth';
import { LedgerTrxWebHid } from '../../../tron_wallet/ledger/LedgerTrxWebHid';
import { LedgerEthWebHid } from '../../../evm_wallet/ledger/LedgerEthWebHid';

jest.mock('@ledgerhq/hw-transport-webhid', () => ({
  __esModule: true,
  default: { create: jest.fn() },
}));
jest.mock('@ledgerhq/hw-app-trx', () => jest.fn());
jest.mock('@ledgerhq/hw-app-eth', () => jest.fn());

const path = "44'/195'/0'/0/0";

describe('Ledger address connection notification', () => {
  let transport: any;
  let getAddress: jest.Mock;
  let events: string[];

  beforeEach(() => {
    jest.clearAllMocks();
    events = [];
    transport = {
      on: jest.fn(),
      off: jest.fn(),
      close: jest.fn().mockImplementation(async () => {
        events.push('close');
      }),
    };
    jest.mocked(TransportWebHID.create).mockImplementation(async () => {
      events.push('create');
      return transport;
    });
    getAddress = jest.fn().mockImplementation(async () => {
      events.push('read');
      return { address: 'address' };
    });
    (AppTrx as unknown as jest.Mock).mockImplementation(() => ({ getAddress }));
    (AppEth as unknown as jest.Mock).mockImplementation(() => ({ getAddress }));
  });

  test.each([LedgerTrxWebHid, LedgerEthWebHid])(
    'notifies after the original %p create and before its address read',
    async (Ledger) => {
      const ledger = new Ledger();
      const onConnected = jest.fn(() => {
        events.push('connected');
      });
      expect(await ledger.getAddressByDefinePath({ path }, onConnected)).toBe('address');
      expect(events).toEqual(['create', 'connected', 'read', 'close']);
      expect(onConnected).toHaveBeenCalledTimes(1);
      expect(TransportWebHID.create).toHaveBeenCalledTimes(1);
      expect(TransportWebHID.create).toHaveBeenCalledWith();
      expect(getAddress).toHaveBeenCalledWith(path);
    },
  );

  test.each([LedgerTrxWebHid, LedgerEthWebHid])(
    'preserves the original %p call when no notification is supplied',
    async (Ledger) => {
      expect(await new Ledger().getAddressByDefinePath({ path })).toBe('address');
      expect(events).toEqual(['create', 'read', 'close']);
    },
  );

  test('does not notify while the SDK is still selecting or opening a device', async () => {
    let finishCreate!: (value: any) => void;
    jest.mocked(TransportWebHID.create).mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishCreate = resolve;
        }),
    );
    const onConnected = jest.fn();
    const ledger = new LedgerTrxWebHid();
    const result = ledger.getAddressByDefinePath({ path }, onConnected);
    await Promise.resolve();
    expect(onConnected).not.toHaveBeenCalled();
    expect(getAddress).not.toHaveBeenCalled();
    finishCreate(transport);
    expect(await result).toBe('address');
    expect(onConnected).toHaveBeenCalledTimes(1);
  });

  test('preserves a selection error without reporting a connection', async () => {
    const error = { name: 'TransportOpenUserCancelled' };
    jest.mocked(TransportWebHID.create).mockRejectedValueOnce(error);
    const onConnected = jest.fn();
    const ledger = new LedgerTrxWebHid();
    await expect(ledger.getAddressByDefinePath({ path }, onConnected)).rejects.toBe(error);
    expect(onConnected).not.toHaveBeenCalled();
    expect(getAddress).not.toHaveBeenCalled();
  });

  test('preserves an address error and the original close after notification', async () => {
    const error = { statusCode: 0x5515 };
    getAddress.mockRejectedValueOnce(error);
    const onConnected = jest.fn();
    const ledger = new LedgerTrxWebHid();
    await expect(ledger.getAddressByDefinePath({ path }, onConnected)).rejects.toBe(error);
    expect(onConnected).toHaveBeenCalledTimes(1);
    expect(transport.close).toHaveBeenCalledTimes(1);
  });
});
