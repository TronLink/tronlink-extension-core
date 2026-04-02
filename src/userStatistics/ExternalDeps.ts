import { AddressAssetPrecipitation, TransactionRecord } from './types';

export interface ExternalDependencies {
  // data
  getOrCreateUuid(address: string): Promise<string>;
  saveAssetPrecipitation(data: AddressAssetPrecipitation): Promise<void>;
  loadAssetPrecipitation(address: string, date: string): Promise<AddressAssetPrecipitation | null>;
  getAllNeedReportAssetPrecipitation(): Promise<AddressAssetPrecipitation[]>;
  updateAndDeleteReportedAssetPrecipitations(array: AddressAssetPrecipitation[]): Promise<void>;
  loadTransactionRecords(address: string): Promise<TransactionRecord[]>;
  setTransactionRecord(record: TransactionRecord): Promise<void>;
  getAllNeedReportTransactionRecords(): Promise<TransactionRecord[]>;
  updateAndDeleteReportedTransactionRecords(array: TransactionRecord[]): Promise<void>;
  
  // configuration
  checkIsNeedReportChain(): Promise<boolean>;
  getSystemConfig(): Promise<SystemConfig>;
  updateSystemConfig(config: SystemConfig): Promise<void>;

  // backend data
  getBalanceInfo(address: string, nodeId: string): Promise<BalanceInfo>;
  getAddressType(address: string): Promise<number>;

  // reporting
  sendStatistics(params: SendStatisticsParams): Promise<SendStatisticsResult>;
}

export interface SystemConfig {
  isEncryptReportData?: boolean;
}

export interface BalanceInfo {
  trxBalance: string;
  usdtBalance: string;
  totalBalanceInUSD: string;
  realTokenUsd: string;
}

export interface SendStatisticsParams {
  xMessage?: string;
  yMessage?: string;
  isEncrypt: boolean;
}

export interface SendStatisticsResult {
  success: boolean;
  data?: {
    visible?: boolean;
  };
}
