import { InvalidParameterError } from '../base_wallet/error';
import { SignParams } from '../base_wallet/types';

export function checkSignParams(params: SignParams) {
  if (!params || !params.privateKey || !params.data || Object.keys(params.data).length <= 0) {
    throw new InvalidParameterError();
  }
}
