// @ts-ignore
import TronWeb from 'tronweb';

import { httpProxy } from '../utils';
import { TRONGRID_API_URL } from './constants';

export function generateTronWeb(nodeInfo: any) {
  try {
    const { fullNode, solidityNode, eventServer, headers } = nodeInfo;
    const tronWeb = new TronWeb(
      new httpProxy({ host: fullNode, headers }),
      new httpProxy({ host: solidityNode, headers }),
      new httpProxy({ host: eventServer, headers }),
    );

    return tronWeb;
  } catch (error) {
    throw new Error('initTronWeb failed');
  }
}

const mainNetNodeInfo = {
  fullNode: TRONGRID_API_URL,
  solidityNode: TRONGRID_API_URL,
  eventServer: TRONGRID_API_URL,
  headers: {},
};

export const defaultTronWeb = generateTronWeb(mainNetNodeInfo);
