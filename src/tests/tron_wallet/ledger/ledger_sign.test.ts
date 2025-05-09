// @ts-ignore
import { TronWeb } from 'tronweb';

import { InvalidParameterError, SignError } from '../../../base_wallet/error';
import { LedgerTrxSigner } from '../../../tron_wallet';
import { defaultTronWeb } from '../../../tron_wallet/generateTronWeb';
import {
  signMessage,
  transaction,
  triggerSmartContractTransaction,
  transferAssetContractTransaction,
} from '../constants';

const mockFunc = jest
  .fn()
  .mockResolvedValueOnce('signTransaction success')
  .mockRejectedValueOnce(new Error('Too many bytes to encode'))
  .mockRejectedValueOnce(new Error('Too many bytes to encode'))
  .mockRejectedValueOnce(new Error('test'))
  .mockRejectedValueOnce(new Error('0x6a80'))
  .mockResolvedValue('success');

const mockFunc2 = jest
  .fn()
  .mockResolvedValueOnce('signTransactionHash success')
  .mockRejectedValueOnce(new Error('signTransactionHash error'))
  .mockResolvedValue('signTransactionHash success');

jest.mock('../../../tron_wallet/ledger/LedgerTrxWebHid', () => {
  const originalModule = jest.requireActual('../../../tron_wallet/ledger/LedgerTrxWebHid');
  return {
    __esModule: true,
    ...originalModule,
    LedgerTrxWebHid: class MockLedgerTrxWebHid {
      signPersonalMessage() {
        return jest.fn().mockResolvedValueOnce('signPersonalMessage success')();
      }

      signTransaction() {
        return mockFunc();
      }

      signTransactionHash() {
        return mockFunc2();
      }
    },
  };
});

describe('ledgerSign test', () => {
  let newTransaction: any;

  const ledgerTrxSigner = new LedgerTrxSigner();

  it('happy path: string', async () => {
    const signature = await ledgerTrxSigner.ledgerSign({
      data: signMessage,
      path: '',
    });

    expect(signature).toMatch('signPersonalMessage success');
  });

  it('happy path: transaction', async () => {
    newTransaction = { ...triggerSmartContractTransaction };

    const signature = await ledgerTrxSigner.ledgerSign({
      data: newTransaction,
      path: '',
    });

    expect(signature).toEqual({ ...newTransaction, signature: ['signTransaction success'] });
  });

  it('Too many bytes to encode: sign hash', async () => {
    newTransaction = { ...transaction };
    newTransaction.raw_data.data = '74657374';
    newTransaction.signature = ['success'];

    const signature = await ledgerTrxSigner.ledgerSign({
      data: newTransaction,
      path: '',
    });

    expect(signature).toEqual({
      ...newTransaction,
      signature: ['success', 'signTransactionHash success'],
    });
  });

  it('sign hash throw error', async () => {
    try {
      newTransaction = { ...transaction };
      newTransaction.raw_data.data = '74657374';

      const signature = await ledgerTrxSigner.ledgerSign({
        data: newTransaction,
        path: '',
      });
    } catch (error: any) {
      expect(error).toMatch('signTransactionHash error');
    }
  });

  it('ledger sign error', async () => {
    newTransaction = { ...transferAssetContractTransaction };

    try {
      const signature = await ledgerTrxSigner.ledgerSign({
        data: newTransaction,
        path: '',
        options: {
          tronWebInstance: defaultTronWeb,
        },
      });
    } catch (error) {
      expect(error).toEqual(new SignError('test'));
    }
  });

  it('FreezeBalanceV2Contract 0x6a80 error', async () => {
    newTransaction = { ...transaction };
    newTransaction.raw_data.contract[0].type = 'FreezeBalanceV2Contract';

    const signature = await ledgerTrxSigner.ledgerSign({
      data: newTransaction,
      path: '',
    });

    expect(signature).toEqual({ ...newTransaction, signature: ['signTransactionHash success'] });
  });

  it('ExchangeWithdrawContract success', async () => {
    TronWeb.toUtf8 = jest.fn().mockReturnValue('1000606');

    newTransaction = { ...transaction };
    newTransaction.raw_data.contract[0].type = 'ExchangeWithdrawContract';
    newTransaction.raw_data.contract[0].parameter.value.token_id = '0';
    newTransaction.raw_data.contract[0].parameter.value.exchange_id = 157;

    const signature = await ledgerTrxSigner.ledgerSign({
      data: newTransaction,
      path: '',
    });

    expect(signature).toEqual({ ...newTransaction, signature: ['success'] });
  });

  it('ExchangeInjectContract success', async () => {
    TronWeb.toUtf8 = jest.fn().mockReturnValue('1000606');

    newTransaction = { ...transaction };
    newTransaction.raw_data.contract[0].type = 'ExchangeInjectContract';
    newTransaction.raw_data.contract[0].parameter.value.token_id = '1000606';
    newTransaction.raw_data.contract[0].parameter.value.exchange_id = '157';
    newTransaction.signature = ['signTransactionHash success'];

    const signature = await ledgerTrxSigner.ledgerSign({
      data: newTransaction,
      path: '',
    });

    expect(signature).toEqual({
      ...newTransaction,
      signature: ['signTransactionHash success', 'success'],
    });
  });

  it('ExchangeTransactionContract success', async () => {
    newTransaction = { ...transaction };
    newTransaction.raw_data.contract[0].type = 'ExchangeTransactionContract';
    newTransaction.raw_data.contract[0].parameter.value.token_id = '1000606';

    const signature = await ledgerTrxSigner.ledgerSign({
      data: newTransaction,
      path: '',
    });

    expect(signature).toEqual({ ...newTransaction, signature: ['success'] });
  });

  it('ExchangeCreateContract success', async () => {
    newTransaction = { ...transaction };
    newTransaction.raw_data.contract[0].type = 'ExchangeCreateContract';
    newTransaction.raw_data.contract[0].parameter.value.first_token_id = '1000606';
    newTransaction.raw_data.contract[0].parameter.value.second_token_id = '1000606';

    defaultTronWeb.trx.getTokenByID = jest
      .fn()
      .mockReturnValue({ id: '1000606', precision: 6, name: 'name' });
    const signature = await ledgerTrxSigner.ledgerSign({
      data: newTransaction,
      path: '',
      options: {
        tronWebInstance: {
          ...defaultTronWeb,
        },
      },
    });

    expect(signature).toEqual({ ...newTransaction, signature: ['success'] });
  });
});
