export interface TransferCostInfo {
  energy: string | number;
  bandwidth: string | number;
  burn: string | number;
}

export interface TransactionDetail {
  raw_data: TransactionRawData;
}

export interface TransactionRawData {
  contract: any[];
}

export interface SelectedTokenNecessaryInfo {
  contractAddress: string;
  id: string;
  type: number;
  precision?: number;
}

export enum UserStatisticsActionType {
  TRX_TRANSFER = 1051,
  TRC10_TRANSFER = 1052,
  TRC20_TRANSFER = 1053,
  TRC721_TRANSFER = 1054,
  TRX_STAKE = 1061,
  TRX_VOTE = 1062,
  UNLOCK = 1063,
  WITHDRAW_EXPIRE = 1064,
  DELEGATE_ENERGY = 1065,
  DELEGATE_BANDWIDTH = 1066,
  RECLAIM_ENERGY = 1067,
  RECLAIM_BANDWIDTH = 1068,
  CLAIM_VOTE_REWARD = 1069,
  DAPP_AUTH = 1071,
  DAPP_TRX_TRANSFER = 1072,
  DAPP_TRC10_TRANSFER = 1073,
  DAPP_TRC20_TRANSFER = 1074,
  DAPP_TRC721_TRANSFER = 1075,
  DAPP_TRIGGER_CONTRACT = 1076,
  UPDATE_ACCOUNT_PERMISSION = 1081,
}

export enum InitiatorType {
  TronLink = 'tronlink',
  DApp = 'dapp',
}

export enum FunctionName {
  Transfer = 'transfer',
  Approve = 'approve',
  Other = 'other',
}

export enum DelegateType {
  Energy = 'ENERGY',
  BandWidth = 'BANDWIDTH',
}

export type AddressAssetPrecipitation = {
  id?: number;
  uid: string;
  addressType: number;
  trxBalance: string;
  usdtBalance: string;
  totalBalanceInUSD: string;
  realTokenUsd: string;
  date: string;
  isNeedReport?: boolean;
};

export type TransactionDistribution = {
  range: string;
  count: number;
};

export type TransactionRecord = {
  id?: number;
  uid: string;
  addressType: number;
  contractType: number;
  actionType: number;
  count: number;
  tokenAddress: string;
  tokenAmount: string;
  energy: string;
  bandwidth: string;
  burn: string;
  date: string;
  txnAmountDistributions: TransactionDistribution[];
  isNeedReport?: boolean;
};
