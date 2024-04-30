import { getTransactionContractType } from '../../utils';
import { transaction } from '../tron_wallet/constants';

describe('checkSignParams', () => {
  it('params data is empty', async () => {
    expect(getTransactionContractType(transaction)).toMatch('TransferContract');
  });

  it('transaction is empty', async () => {
    expect(getTransactionContractType(null)).toBeUndefined();
  });
});
