import { SignError } from '../../../base_wallet/error';
import { LedgerTrxSigner } from '../../../tron_wallet';
import { transaction } from '../constants';

// 这些 mock 名字以 mock 开头,才能在被 hoist 的 jest.mock 工厂里引用
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

// 模拟 Ledger app-tron 无法解析合约类型时设备返回的 APDU 错误
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

  // 本次新增到 hashFallbackContracts 的超级代表相关合约类型
  const witnessContracts = [
    'WitnessCreateContract',
    'WitnessUpdateContract',
    'UpdateBrokerageContract',
  ];

  it.each(witnessContracts)(
    '%s: 设备返回 0x6a80 时应回退到 signTransactionHash',
    async (contractType) => {
      mockSignTransaction.mockRejectedValue(error0x6a80);
      mockSignTransactionHash.mockResolvedValue('hash signature');

      const tx = buildTx(contractType);
      const result = await ledgerTrxSigner.ledgerSign({ data: tx, path: 'm/44/195/0' });

      // 回退路径被走到,且用交易 hash 调用
      expect(mockSignTransactionHash).toHaveBeenCalledTimes(1);
      expect(mockSignTransactionHash).toHaveBeenCalledWith('m/44/195/0', tx.txID);
      // 签名结果来自 hash 签名
      expect(result.signature).toEqual(['hash signature']);
    },
  );

  it('未列入 hashFallbackContracts 的类型遇到 0x6a80 仍抛 SignError(不回退)', async () => {
    mockSignTransaction.mockRejectedValue(error0x6a80);
    mockSignTransactionHash.mockResolvedValue('hash signature');

    const tx = buildTx('AccountCreateContract');

    await expect(ledgerTrxSigner.ledgerSign({ data: tx, path: '' })).rejects.toThrow(SignError);
    // 不应触发 hash 回退签名
    expect(mockSignTransactionHash).not.toHaveBeenCalled();
  });

  it('超级代表交易若设备直接签名成功,则不会触发 hash 回退', async () => {
    mockSignTransaction.mockResolvedValue('device signature');

    const tx = buildTx('WitnessCreateContract');
    const result = await ledgerTrxSigner.ledgerSign({ data: tx, path: '' });

    expect(mockSignTransactionHash).not.toHaveBeenCalled();
    expect(result.signature).toEqual(['device signature']);
  });
});
