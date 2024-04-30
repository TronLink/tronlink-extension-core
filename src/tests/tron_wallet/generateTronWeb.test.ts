// @ts-ignore
import TronWeb from 'tronweb';

import { generateTronWeb } from '../../tron_wallet/generateTronWeb';
import { nodeInfo } from './constants';

describe('test generateTronWeb', () => {
  it('happy path', async () => {
    const result = generateTronWeb(nodeInfo);
    expect(result).toBeInstanceOf(TronWeb);
  });

  it('nodeInfo is empty', async () => {
    expect(() => generateTronWeb(null)).toThrow(/^initTronWeb failed$/);
  });
});
