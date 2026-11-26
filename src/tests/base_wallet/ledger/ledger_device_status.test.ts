import { ledgerService } from '@ledgerhq/hw-app-eth';
import { Transaction } from 'ethers';
import { LedgerEthWebHid } from '../../../evm_wallet/ledger/LedgerEthWebHid';
import { LedgerTrxWebHid } from '../../../tron_wallet/ledger/LedgerTrxWebHid';

class HidDevice {
  vendorId = 0x2c97;
  productId = 0x0001;
  opened = false;
  reports: Buffer[] = [];
  listeners = new Set<(event: any) => void>();
  open = jest.fn(async () => {
    this.opened = true;
  });
  close = jest.fn(async () => {
    this.opened = false;
  });
  sendReport = jest.fn(async (_id: number, data: Buffer) => {
    this.reports.push(Buffer.from(data));
  });
  addEventListener(_name: string, listener: (event: any) => void) {
    this.listeners.add(listener);
  }
  removeEventListener(_name: string, listener: (event: any) => void) {
    this.listeners.delete(listener);
  }
  respond(body: Buffer, status = 0x9000) {
    const response = Buffer.concat([body, Buffer.from([status >> 8, status & 0xff])]);
    let offset = 0;
    let sequence = 0;
    while (offset < response.length) {
      const packet = Buffer.alloc(64);
      packet.writeUInt16BE(this.reports[this.reports.length - 1].readUInt16BE(0), 0);
      packet[2] = 5;
      packet.writeUInt16BE(sequence, 3);
      const header = sequence === 0 ? 7 : 5;
      if (sequence === 0) packet.writeUInt16BE(response.length, 5);
      offset += response.copy(packet, header, offset, offset + 64 - header);
      this.listeners.forEach((listener) => listener({ data: new DataView(packet.buffer) }));
      sequence++;
    }
  }
}

async function until(condition: () => boolean) {
  for (let i = 0; i < 100; i++) {
    if (condition()) return;
    await Promise.resolve();
  }
  throw new Error('The expected hardware operation did not start');
}

describe('Ledger device status and SDK errors', () => {
  let device: HidDevice;
  let devices: HidDevice[];
  let requestDevice: jest.Mock;
  let originalNavigator: PropertyDescriptor | undefined;
  let disconnectListeners: Set<(event: any) => void>;

  beforeEach(() => {
    device = new HidDevice();
    devices = [device];
    requestDevice = jest.fn(async () => []);
    disconnectListeners = new Set();
    originalNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
    Object.defineProperty(globalThis, 'navigator', {
      configurable: true,
      value: {
        hid: {
          getDevices: async () => devices,
          requestDevice,
          addEventListener: jest.fn((_name, listener) => disconnectListeners.add(listener)),
          removeEventListener: jest.fn((_name, listener) => disconnectListeners.delete(listener)),
        },
      },
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalNavigator) Object.defineProperty(globalThis, 'navigator', originalNavigator);
    else delete (globalThis as any).navigator;
  });

  test('discovery reports authorized devices without opening or requesting permission', async () => {
    expect(await new LedgerTrxWebHid().isConnected()).toBe(true);
    devices = [];
    expect(await new LedgerTrxWebHid().isConnected()).toBe(false);
    expect(device.open).not.toHaveBeenCalled();
    expect(requestDevice).not.toHaveBeenCalled();
  });

  test.each(['TRON', 'Ethereum', 'BOLOS'])('reads the official app-info name %s', async (name) => {
    const result = new LedgerTrxWebHid().getAppName();
    await until(() => device.reports.length > 0);
    expect(device.reports[0].subarray(7, 12).toString('hex')).toBe('b001000000');
    device.respond(
      Buffer.concat([Buffer.from([1, name.length]), Buffer.from(name), Buffer.from([0, 0])]),
    );
    await expect(result).resolves.toBe(name);
    expect(device.close).toHaveBeenCalledTimes(1);
  });

  test.each(['020454524f4e0000', '01055452'])('rejects malformed app-info %s', async (hex) => {
    const result = new LedgerTrxWebHid().getAppName();
    const error = result.catch((reason) => reason);
    await until(() => device.reports.length > 0);
    device.respond(Buffer.from(hex, 'hex'));
    expect(await error).toMatchObject({ message: 'Invalid Ledger app info' });
    expect(device.close).toHaveBeenCalledTimes(1);
  });

  test.each([0x5515, 0x6d00, 0x6e00, 0x6985])('preserves raw SDK status %s', async (status) => {
    const appName = new LedgerTrxWebHid().getAppName();
    const result = appName.catch((error) => error);
    await until(() => device.reports.length > 0);
    device.respond(Buffer.alloc(0), status);
    expect(await result).toMatchObject({ statusCode: status });
    expect(device.close).toHaveBeenCalledTimes(1);
  });
  const tronPath = "44'/195'/0'/0/0";
  const evmPath = "44'/60'/0'/0/0";
  const signOperations = [
    {
      name: 'TRON transaction',
      start: () => new LedgerTrxWebHid().signTransaction({ hex: '0a00', info: [] }, tronPath),
    },
    {
      name: 'TRON transaction hash',
      start: () => new LedgerTrxWebHid().signTransactionHash(tronPath, '00'.repeat(32)),
    },
    {
      name: 'TRON personal message',
      start: () => new LedgerTrxWebHid().signPersonalMessage('00', tronPath),
    },
    {
      name: 'EVM transaction',
      start: () => {
        jest.spyOn(ledgerService, 'resolveTransaction').mockResolvedValue(null as any);
        const transaction = Transaction.from({
          type: 0,
          chainId: 1,
          gasLimit: 21000,
          gasPrice: 1,
          to: '0x0000000000000000000000000000000000000001',
        });
        return new LedgerEthWebHid().signTransaction(
          transaction.unsignedSerialized.slice(2),
          evmPath,
        );
      },
    },
    {
      name: 'EVM personal message',
      start: () => new LedgerEthWebHid().signPersonalMessage('00', evmPath),
    },
    {
      name: 'EVM typed data',
      start: () =>
        new LedgerEthWebHid().signTypedData(
          {
            domain: {},
            types: { EIP712Domain: [], Message: [{ name: 'value', type: 'uint256' }] },
            primaryType: 'Message',
            message: { value: 1 },
          },
          evmPath,
        ),
    },
  ];

  test.each(signOperations)('detects the active SDK lock for $name', async ({ start }) => {
    expect(new LedgerTrxWebHid().isBusy()).toBe(false);
    const signature = start();
    await until(() => device.reports.length > 0);
    expect(new LedgerTrxWebHid().isBusy()).toBe(true);
    expect(new LedgerEthWebHid().isBusy()).toBe(true);
    device.respond(Buffer.concat([Buffer.from([37]), Buffer.alloc(64, 1)]));
    await signature;
    expect(new LedgerTrxWebHid().isBusy()).toBe(false);
    expect(device.open).toHaveBeenCalledTimes(1);
    expect(device.close).toHaveBeenCalledTimes(1);
  });

  test.each([LedgerTrxWebHid, LedgerEthWebHid])(
    'does not report a %p address read as a pending signature',
    async (Ledger) => {
      const ledger = new Ledger();
      const result = ledger.getAddressByDefinePath({ path: tronPath });
      await until(() => device.reports.length > 0);
      expect(ledger._transport?._appAPIlock).toBe('getAddress');
      expect(new LedgerTrxWebHid().isBusy()).toBe(false);
      device.respond(Buffer.concat([Buffer.from([65]), Buffer.alloc(65, 1), Buffer.from([1, 65])]));
      await result;
      expect(ledger._transport?._events.listenerCount('disconnect')).toBe(0);
      expect(device.close).toHaveBeenCalledTimes(1);
    },
  );

  test.each([LedgerTrxWebHid, LedgerEthWebHid])(
    'clears a %p signing lock after the original SDK rejection',
    async (Ledger) => {
      const ledger = new Ledger();
      const signature = ledger.signPersonalMessage('00', tronPath);
      const result = signature.catch((error) => error);
      await until(() => device.reports.length > 0);
      expect(new LedgerTrxWebHid().isBusy()).toBe(true);
      device.respond(Buffer.alloc(0), 0x6a80);
      expect(await result).toMatchObject({ statusCode: 0x6a80 });
      expect(new LedgerTrxWebHid().isBusy()).toBe(false);
      expect(ledger._transport?._events.listenerCount('disconnect')).toBe(0);
      expect(device.close).toHaveBeenCalledTimes(1);
    },
  );

  test('removes a disconnected transport without changing the original signing promise', async () => {
    const ledger = new LedgerTrxWebHid();
    const signature = ledger.signTransactionHash(tronPath, '00'.repeat(32));
    const settled = jest.fn();
    void signature.then(settled, settled);
    await until(() => device.reports.length > 0);
    expect(new LedgerTrxWebHid().isBusy()).toBe(true);
    disconnectListeners.forEach((listener) => listener({ device }));
    expect(new LedgerTrxWebHid().isBusy()).toBe(false);
    expect(ledger._transport?._events.listenerCount('disconnect')).toBe(0);
    await Promise.resolve();
    expect(settled).not.toHaveBeenCalled();
    device.respond(Buffer.alloc(65, 1));
    await signature;
    expect(device.close).toHaveBeenCalledTimes(1);
  });

  test('still opens and closes a fresh transport for each signature', async () => {
    const ledger = new LedgerTrxWebHid();
    for (let index = 0; index < 2; index++) {
      const reportsBeforeSigning = device.reports.length;
      const signature = ledger.signTransactionHash(tronPath, '00'.repeat(32));
      await until(() => device.reports.length > reportsBeforeSigning);
      expect(new LedgerTrxWebHid().isBusy()).toBe(true);
      device.respond(Buffer.alloc(65, 1));
      await signature;
      expect(new LedgerTrxWebHid().isBusy()).toBe(false);
    }
    expect(device.open).toHaveBeenCalledTimes(2);
    expect(device.close).toHaveBeenCalledTimes(2);
  });
});
