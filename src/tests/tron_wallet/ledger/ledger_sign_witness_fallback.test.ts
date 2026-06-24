import { SignError } from '../../../base_wallet/error';
import { LedgerTrxSigner } from '../../../tron_wallet';
import { transaction } from '../constants';

// These mock names start with "mock" so they can be referenced inside the hoisted jest.mock factory
const mockSignTransaction = jest.fn();
const mockSignTransactionHash = jest.fn();

jest.mock('../../../tron_wallet/ledger/LedgerTrxWebHid', () => {
  const originalModule = jest.requireActual('../../../tron_wallet/ledger/LedgerTrxWebHid');
  return {
    __esModule: true,
    ...originalModule,
    LedgerTrxWebHid: class MockLedgerTrxWebHid {
      signTransaction() {
        return mockSignTransaction();
      }

      signTransactionHash(...args: any[]) {
        return mockSignTransactionHash(...args);
      }
    },
  };
});

// Simulates the APDU error the device returns when the Ledger app-tron cannot parse the contract type
const error0x6a80 = new Error('Ledger device: UNKNOWN_ERROR (0x6a80)');

const buildTx = (type: string) => {
  const tx = JSON.parse(JSON.stringify(transaction));
  tx.raw_data.contract[0].type = type;
  return tx;
};

describe('ledgerSign hash fallback for Ledger-unsupported contract types', () => {
  const ledgerTrxSigner = new LedgerTrxSigner();

  beforeEach(() => {
    mockSignTransaction.mockReset();
    mockSignTransactionHash.mockReset();
  });

  // Super Representative contract types newly added to hashFallbackContracts
  const witnessContracts = [
    'WitnessCreateContract',
    'WitnessUpdateContract',
    'UpdateBrokerageContract',
  ];

  it.each(witnessContracts)(
    '%s: should fall back to signTransactionHash when the device returns 0x6a80',
    async (contractType) => {
      mockSignTransaction.mockRejectedValue(error0x6a80);
      mockSignTransactionHash.mockResolvedValue('hash signature');

      const tx = buildTx(contractType);
      const result = await ledgerTrxSigner.ledgerSign({ data: tx, path: 'm/44/195/0' });

      // The fallback path is taken and called with the transaction hash
      expect(mockSignTransactionHash).toHaveBeenCalledTimes(1);
      expect(mockSignTransactionHash).toHaveBeenCalledWith('m/44/195/0', tx.txID);
      // The signature result comes from hash signing
      expect(result.signature).toEqual(['hash signature']);
    },
  );

  it('a type not in hashFallbackContracts still throws SignError on 0x6a80 (no fallback)', async () => {
    mockSignTransaction.mockRejectedValue(error0x6a80);
    mockSignTransactionHash.mockResolvedValue('hash signature');

    const tx = buildTx('AccountCreateContract');

    await expect(ledgerTrxSigner.ledgerSign({ data: tx, path: '' })).rejects.toThrow(SignError);
    // Hash fallback signing should not be triggered
    expect(mockSignTransactionHash).not.toHaveBeenCalled();
  });

  it('a Super Representative transaction signed directly by the device does not trigger hash fallback', async () => {
    mockSignTransaction.mockResolvedValue('device signature');

    const tx = buildTx('WitnessCreateContract');
    const result = await ledgerTrxSigner.ledgerSign({ data: tx, path: '' });

    expect(mockSignTransactionHash).not.toHaveBeenCalled();
    expect(result.signature).toEqual(['device signature']);
  });
});
