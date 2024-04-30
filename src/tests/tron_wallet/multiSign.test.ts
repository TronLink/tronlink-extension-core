import { SignError } from '../../base_wallet/error';
import { TronWallet } from '../../tron_wallet';
import { nodeInfo, privateKey, transaction } from './constants';

jest.mock('../../tron_wallet/generateTronWeb', () => {
  const originalModule = jest.requireActual('../../tron_wallet/generateTronWeb');
  return {
    __esModule: true,
    ...originalModule,
    generateTronWeb: () => ({
      trx: {
        multiSign: () => 'success',
      },
    }),
  };
});

describe('tron walLet - multiSign', () => {
  const testTronWallet = new TronWallet();

  it('happy path', async () => {
    const signature = await testTronWallet.multiSign({
      privateKey,
      data: transaction,
      options: {
        permissionId: 1,
        nodeInfo,
      },
    });
    expect(signature).toMatch('success');
  });

  it('checkSignParams error', async () => {
    try {
      const testTronWallet = new TronWallet();

      const signature = await testTronWallet.multiSign({
        privateKey,
        data: transaction,
      });
    } catch (error) {
      expect(error).toEqual(new SignError());
    }
  });
});
