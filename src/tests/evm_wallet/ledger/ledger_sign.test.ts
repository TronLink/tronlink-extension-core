import { SignError } from '../../../base_wallet/error';
import { LedgerEthWebHid, LedgerEvmSigner } from '../../../evm_wallet';

const DEFAULT_PRIVATE_KEY = '0000000000000000000000000000000000000000000000000000000000000001';
const DEFAULT_USER_ADDRESS1 = '0x7E5F4552091A69125d5DfCb7b8C2659029395Bdf'; // privateKey is 000...0001
const DEFAULT_USER_ADDRESS2 = '0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF'; // privateKey is 000...0002

describe('evm ledgerSign test', () => {
  const ledgerWebHid = new LedgerEthWebHid();
  const ledgerEvmSigner = new LedgerEvmSigner();

  it('normal ledger sign message', async () => {
    const testPath = "44'/60'/0'/0/0";
    const testMessageTransaction = 'testMessageTransaction';
    LedgerEthWebHid.prototype.signPersonalMessage = jest
      .fn()
      .mockResolvedValue({ r: 'testMessageR', s: 'testMessageS', v: 'testMessageV' });
    LedgerEthWebHid.prototype.signTransaction = jest
      .fn()
      .mockResolvedValue({ r: 'testTransactionR', s: 'testTransactionS', v: 'testTransactionV' });

    await ledgerEvmSigner.ledgerSign({
      data: testMessageTransaction,
      path: testPath,
    });
    expect(ledgerWebHid.signPersonalMessage).toHaveBeenCalledWith(
      Buffer.from(testMessageTransaction, 'utf8').toString('hex'),
      testPath,
    );
  });

  it('normal ledger sign transaction', async () => {
    const testPath = "44'/60'/0'/0/0";
    const testObjectTransaction = {
      to: DEFAULT_USER_ADDRESS1,
      value: 1111,
    };
    LedgerEthWebHid.prototype.signPersonalMessage = jest
      .fn()
      .mockResolvedValue({ r: 'testMessageR', s: 'testMessageS', v: 'testMessageV' });
    LedgerEthWebHid.prototype.signTransaction = jest
      .fn()
      .mockResolvedValue({ r: 'testTransactionR', s: 'testTransactionS', v: 'testTransactionV' });

    await ledgerEvmSigner.ledgerSign({
      data: testObjectTransaction,
      path: testPath,
    });
    // Hardcoded oracle: legacy unsigned RLP for { to: ADDR1, value: 1111 }
    // produced by ethers v5 `serializeTransaction`. Locking the bytes here
    // (rather than recomputing them with the current ethers version) is what
    // catches the v6-style envelope regression the user surfaced.
    const expectedSerialized =
      'dc808080947e5f4552091a69125d5dfcb7b8c2659029395bdf82045780';
    expect(ledgerWebHid.signTransaction).toHaveBeenCalledWith(expectedSerialized, testPath);
  });

  it('throw error', async () => {
    const testPath = "44'/60'/0'/0/0";
    const testObjectTransaction = {
      to: DEFAULT_USER_ADDRESS1,
      value: 1111,
    };
    LedgerEthWebHid.prototype.signTransaction = jest
      .fn()
      .mockRejectedValue(new SignError('testSignError'));

    expect(
      ledgerEvmSigner.ledgerSign({
        data: testObjectTransaction,
        path: testPath,
      }),
    ).rejects.toThrow('testSignError');
  });
});
