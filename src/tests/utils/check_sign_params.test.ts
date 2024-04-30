import { InvalidParameterError } from '../../base_wallet/error';
import { checkSignParams } from '../../utils';
import { privateKey } from '../tron_wallet/constants';

describe('checkSignParams', () => {
  it('params data is empty', async () => {
    expect(() =>
      checkSignParams({
        privateKey,
        data: {},
      }),
    ).toThrow(InvalidParameterError);
  });
});
