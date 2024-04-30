import { ethers } from 'ethers';

import { SignError } from '../../base_wallet/error';
import { LedgerSigner } from '../../base_wallet/ledger/LedgerSigner';
import { LedgerSignParams } from '../../base_wallet/types';
import { isHex, msgHexToText } from '../util';
import { LedgerEthWebHid } from './LedgerEthWebHid';

const regStartWithZeroX = new RegExp(/^0x/i);

export class LedgerEvmSigner extends LedgerSigner {
  async ledgerSign(params: LedgerSignParams): Promise<any> {
    try {
      const { data: transaction, path } = params;
      const ledgerWebHid = new LedgerEthWebHid();
      let signedResponse;
      if (typeof transaction === 'string') {
        signedResponse = await ledgerWebHid.signPersonalMessage(
          isHex(transaction.replace(regStartWithZeroX, ''))
            ? msgHexToText(Buffer.from(transaction.replace(regStartWithZeroX, ''), 'utf8').toString('hex'))
            : Buffer.from(transaction, 'utf8').toString('hex'),
          path,
        );
      } else {
        signedResponse = await ledgerWebHid.signTransaction(
          ethers.utils.serializeTransaction(transaction).replace(regStartWithZeroX, ''),
          path,
        );
      }

      signedResponse.r = `0x${signedResponse.r}`;
      signedResponse.s = `0x${signedResponse.s}`;
      if (typeof transaction !== 'string') {
        signedResponse.v = parseInt(signedResponse.v, 16);
      }

      return signedResponse;
    } catch (error: any) {
      throw new SignError(error.message);
    }
  }

  async ledgerSignTypedData(params: LedgerSignParams): Promise<any> {
    try {
      const { data, path } = params;
      const ledgerWebHid = new LedgerEthWebHid();
      const signedResponse = await ledgerWebHid.signTypedData(data, path);

      const { r, s, v } = signedResponse;
      return r.replace(regStartWithZeroX, '') + s.replace(regStartWithZeroX, '') + v.toString(16);
    } catch (error: any) {
      throw new SignError(error.message);
    }
  }
}
