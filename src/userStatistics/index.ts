export {
  getAndUpdateAddressAssetPrecipitation,
  getAndUpdateTransactionRecord,
} from './userStatistics';
export { checkAndReportXY } from './report';

export type {
  ExternalDependencies,
  SystemConfig,
  BalanceInfo,
  SendStatisticsParams,
  SendStatisticsResult,
} from './ExternalDeps';

export type {
  TransferCostInfo,
  SelectedTokenNecessaryInfo,
  AddressAssetPrecipitation,
  TransactionRecord,
  TransactionDistribution,
  TransactionRawData,
} from './types';

export { InitiatorType, DelegateType, FunctionName, UserStatisticsActionType } from './types';

export {
  TokenType,
  ContractType,
  CHAIN_ID,
  USDTContractAddress,
  MAINNET_CHAIN_ID,
  contractTypeNumMapString,
} from './constants';

export {
  completeDappTransactionTokenInfo,
  getDappTransactionTokenAmount,
} from './entryDataProcessing';

export {
  getIndexedDBStorageInstance,
  initAnalyticsIndexedDBStorage,
  STORE_NAME,
} from './indexedDB';
