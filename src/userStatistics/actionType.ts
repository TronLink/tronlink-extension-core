import { ContractType, contractTypeNumMapString, TokenType } from './constants';
import {
  DelegateType,
  FunctionName,
  InitiatorType,
  SelectedTokenNecessaryInfo,
  TransactionRawData,
  UserStatisticsActionType,
} from './types';

const methodSignatureTrc20MapFromTronLink: Record<
  FunctionName,
  UserStatisticsActionType | ContractType
> = {
  [FunctionName.Other]: ContractType.TriggerSmartContract,
  [FunctionName.Approve]: ContractType.TriggerSmartContract, // approve(address,uint256)
  [FunctionName.Transfer]: UserStatisticsActionType.TRC20_TRANSFER, // transfer(address,uint256)
};

const methodSignatureTrc721MapFromTronLink: Record<
  FunctionName,
  UserStatisticsActionType | ContractType
> = {
  [FunctionName.Other]: ContractType.TriggerSmartContract,
  [FunctionName.Approve]: ContractType.TriggerSmartContract, // approve(address,uint256)
  [FunctionName.Transfer]: UserStatisticsActionType.TRC721_TRANSFER, // transfer(address,uint256)
};

const methodSignatureTrc20MapFromDapp: Record<FunctionName, UserStatisticsActionType> = {
  [FunctionName.Other]: UserStatisticsActionType.DAPP_TRIGGER_CONTRACT,
  [FunctionName.Approve]: UserStatisticsActionType.DAPP_AUTH, // approve(address,uint256)
  [FunctionName.Transfer]: UserStatisticsActionType.DAPP_TRC20_TRANSFER, // transfer(address,uint256)
};

const methodSignatureTrc721MapFromDapp: Record<FunctionName, UserStatisticsActionType> = {
  [FunctionName.Other]: UserStatisticsActionType.DAPP_TRIGGER_CONTRACT,
  [FunctionName.Approve]: UserStatisticsActionType.DAPP_AUTH, // approve(address,uint256)
  [FunctionName.Transfer]: UserStatisticsActionType.DAPP_TRC721_TRANSFER, // transfer(address,uint256)
};

export function getContractTypeNumber(transactionRawData: TransactionRawData): number | undefined {
  const typeName = transactionRawData?.contract?.[0].type;
  for (const [key, value] of Object.entries(contractTypeNumMapString)) {
    if (value === typeName) {
      return Number(key);
    }
  }
  return undefined;
}

export function getActionType({
  transactionRawData,
  selectedToken,
  initiator,
  functionName,
  delegateType,
}: {
  transactionRawData: TransactionRawData;
  selectedToken: SelectedTokenNecessaryInfo;
  initiator: InitiatorType;
  functionName: FunctionName;
  delegateType?: DelegateType;
}): UserStatisticsActionType | ContractType {
  const contractTypeNum = getContractTypeNumber(transactionRawData);

  // If contract type cannot be determined, return undefined behavior as ContractType
  if (contractTypeNum === undefined) {
    return ContractType.TriggerSmartContract;
  }

  const tokenType: TokenType = selectedToken.type;

  switch (contractTypeNum) {
    case ContractType.TransferContract:
      if (initiator === InitiatorType.TronLink) {
        return UserStatisticsActionType.TRX_TRANSFER;
      } else if (initiator === InitiatorType.DApp) {
        return UserStatisticsActionType.DAPP_TRX_TRANSFER;
      }
      break;
    case ContractType.TransferAssetContract:
      if (initiator === InitiatorType.TronLink) {
        return UserStatisticsActionType.TRC10_TRANSFER;
      } else if (initiator === InitiatorType.DApp) {
        return UserStatisticsActionType.DAPP_TRC10_TRANSFER;
      }
      break;
    case ContractType.FreezeBalanceV2Contract:
      return UserStatisticsActionType.TRX_STAKE;
    case ContractType.VoteWitnessContract:
      return UserStatisticsActionType.TRX_VOTE;
    case ContractType.WithdrawBalanceContract:
      return UserStatisticsActionType.CLAIM_VOTE_REWARD;
    case ContractType.DelegateResourceContract:
      if (delegateType === DelegateType.Energy) {
        return UserStatisticsActionType.DELEGATE_ENERGY;
      } else if (delegateType === DelegateType.BandWidth) {
        return UserStatisticsActionType.DELEGATE_BANDWIDTH;
      }
      break;
    case ContractType.UnDelegateResourceContract:
      if (delegateType === DelegateType.Energy) {
        return UserStatisticsActionType.RECLAIM_ENERGY;
      } else if (delegateType === DelegateType.BandWidth) {
        return UserStatisticsActionType.RECLAIM_BANDWIDTH;
      }
      break;
    case ContractType.UnfreezeBalanceV2Contract:
      return UserStatisticsActionType.UNLOCK;
    case ContractType.WithdrawExpireUnfreezeContract:
      return UserStatisticsActionType.WITHDRAW_EXPIRE;
    case ContractType.AccountPermissionUpdateContract:
      return UserStatisticsActionType.UPDATE_ACCOUNT_PERMISSION;
    case ContractType.TriggerSmartContract:
      if (functionName !== FunctionName.Other) {
        let methodSignatureMap;
        if (initiator === InitiatorType.TronLink) {
          methodSignatureMap =
            tokenType === TokenType.TRC721
              ? methodSignatureTrc721MapFromTronLink
              : methodSignatureTrc20MapFromTronLink;
        } else if (initiator === InitiatorType.DApp) {
          methodSignatureMap =
            tokenType === TokenType.TRC721
              ? methodSignatureTrc721MapFromDapp
              : methodSignatureTrc20MapFromDapp;
        }
        if (methodSignatureMap && methodSignatureMap[functionName]) {
          return methodSignatureMap[functionName];
        }
      }
      return UserStatisticsActionType.DAPP_TRIGGER_CONTRACT;
    default:
      return contractTypeNum;
  }

  return contractTypeNum;
}
