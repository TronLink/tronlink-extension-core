import { LedgerSignParams } from '../types';

export abstract class LedgerSigner {
  abstract ledgerSign(params: LedgerSignParams): Promise<any>;

  abstract ledgerSignTypedData(params: LedgerSignParams): Promise<any>;
}
