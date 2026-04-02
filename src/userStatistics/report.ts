import { ExternalDependencies } from './ExternalDeps';
import {
  getAllNeedReportAssetPrecipitation,
  updateAndDeleteAllReportedAssetPrecipitations,
} from './assetPrecipitation';
import {
  getAllNeedReportTransactionRecord,
  updateAndDeleteAllReportedTransactionRecord,
} from './transactionRecord';
import { AddressAssetPrecipitation, TransactionRecord } from './types';

function buildFundReportString(records: AddressAssetPrecipitation[]): string {
  return records
    .map(
      (record) =>
        `V1X|${record.uid}|${record.addressType}|${record.trxBalance}|${record.usdtBalance}|${record.realTokenUsd}|${record.date}|`,
    )
    .join('');
}

const rangeMap: Record<string, string> = {
  '0_1': 'A1',
  '1_10': 'A2',
  '10_100': 'A3',
  '100_1k': 'A4',
  '1k_10k': 'A5',
  '10k_100k': 'A6',
  '100k_1m': 'A7',
  '1m_10m': 'A8',
  '10m_infinite': 'A9',
};

function buildTxnReportString(records: TransactionRecord[]): string {
  return records
    .map((record) => {
      const distStr = (record.txnAmountDistributions || [])
        .map((d) => {
          const key = rangeMap[d.range] ?? d.range;
          return `${key}:${d.count}`;
        })
        .join(',');

      return `V1Y|${record.uid}|${record.addressType}|${record.actionType}|${record.count}|${record.tokenAddress}|${record.tokenAmount}|${record.energy}|${record.bandwidth}|${record.burn}|${record.date}|${distStr}|`;
    })
    .join('');
}

export const isDef = (val: unknown) => val !== undefined && val !== null;

export async function checkAndReportXY(deps: ExternalDependencies): Promise<void> {
  try {
    if (!(await deps.checkIsNeedReportChain())) {
      return;
    }

    const allNeedReportAssetPrecipitationArray = await getAllNeedReportAssetPrecipitation(deps);
    const allNeedReportTransactionRecord = await getAllNeedReportTransactionRecord(deps);
    const reportXString = allNeedReportAssetPrecipitationArray.length
      ? buildFundReportString(allNeedReportAssetPrecipitationArray)
      : undefined;
    const reportYString = allNeedReportTransactionRecord.length
      ? buildTxnReportString(allNeedReportTransactionRecord)
      : undefined;
    if (!reportXString && !reportYString) {
      return;
    }
    console.log('452_reportString', reportXString, reportYString);
    const config = await deps.getSystemConfig();

    const { success, data } = await deps.sendStatistics({
      xMessage: reportXString,
      yMessage: reportYString,
      isEncrypt: isDef(config?.isEncryptReportData) ? config?.isEncryptReportData : true,
    });
    if (success) {
      allNeedReportAssetPrecipitationArray.length &&
        (await updateAndDeleteAllReportedAssetPrecipitations(allNeedReportAssetPrecipitationArray, deps));
      allNeedReportTransactionRecord.length &&
        (await updateAndDeleteAllReportedTransactionRecord(allNeedReportTransactionRecord, deps));

      if (config.isEncryptReportData != !data?.visible) {
        await deps.updateSystemConfig({
          ...config,
          isEncryptReportData: !data?.visible, // default encrypt
        });
      }
    }
  } catch (error) {
    console.error('checkAndReportXY error:', error);
  }
}
