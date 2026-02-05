import { BigNumber } from 'bignumber.js';
import { TokenType } from './constants';

export function getDappTransactionTokenAmount({
  contractType,
  paramsInfo,
  tokenType,
}: {
  contractType: string;
  paramsInfo: unknown;
  tokenType?: TokenType;
}): string {
  if (tokenType === TokenType.TRC721) {
    return '1';
  }

  switch (contractType) {
    case 'CancelAllUnfreezeV2Contract':
      return new BigNumber((paramsInfo as any)?.cancelAllUnfreezeV2Balance).shiftedBy(6).toFixed();
    case 'TriggerSmartContract':
      return (paramsInfo as any)?.amount || '0';
    case 'TransferContract':
      return new BigNumber((paramsInfo as any)?.amount).shiftedBy(6).toFixed();
    case 'TransferAssetContract':
      return (paramsInfo as any)?.amount;
    case 'VoteWitnessContract':
      return new BigNumber((paramsInfo as any)?.amount).toFixed();
    case 'FreezeBalanceContract':
      return new BigNumber((paramsInfo as any)?.frozenBalance).shiftedBy(6).toFixed();
    case 'UnfreezeBalanceContract':
      return '0';
    case 'FreezeBalanceV2Contract':
      return new BigNumber((paramsInfo as any)?.frozenBalance).shiftedBy(6).toFixed();
    case 'UnfreezeBalanceV2Contract':
      return new BigNumber((paramsInfo as any)?.unfreezeV2Balance).shiftedBy(6).toFixed();
    case 'DelegateResourceContract':
      return new BigNumber((paramsInfo as any)?.delegateBalance).shiftedBy(6).toFixed();
    case 'UnDelegateResourceContract':
      return new BigNumber((paramsInfo as any)?.delegateBalance).shiftedBy(6).toFixed();
    case 'WithdrawExpireUnfreezeContract':
      return new BigNumber((paramsInfo as any)?.withdrawBalance).shiftedBy(6).toFixed();
    default:
      break;
  }

  return (paramsInfo as any)?.amount || '0';
}

export function completeDappTransactionTokenInfo({
  tokenInfo,
  contractType,
}: {
  tokenInfo: unknown;
  contractType: string;
}): {
  tokenAddress: string;
  id: string;
  type: TokenType;
  precision: number;
} {
  if (contractType === 'VoteWitnessContract') {
    return {
      tokenAddress: '_',
      id: '_',
      type: TokenType.TRX,
      precision: 0,
    };
  }

  if (tokenInfo) {
    return tokenInfo as {
      tokenAddress: string;
      id: string;
      type: TokenType;
      precision: number;
    };
  }

  return {
    tokenAddress: '_',
    id: '_',
    type: TokenType.TRX,
    precision: 6,
  };
}
