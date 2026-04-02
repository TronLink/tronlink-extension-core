import { BigNumber } from 'bignumber.js';
import { ExternalDependencies } from './ExternalDeps';
import { getOrCreateUuid } from './addressUuidMap';
import { updateAddressAssetPrecipitation } from './assetPrecipitation';
import { updateTransactionRecord } from './transactionRecord';
import { getActionType, getContractTypeNumber } from './actionType';
import {
  DelegateType,
  FunctionName,
  InitiatorType,
  SelectedTokenNecessaryInfo,
  TransactionDistribution,
  TransactionRawData,
  TransferCostInfo,
} from './types';
import { TokenType, ContractType } from './constants';
import { getCurrentUtcDate } from './utils';

export async function getAndUpdateAddressAssetPrecipitation(
  address: string,
  nodeId: string,
  deps: ExternalDependencies
): Promise<void> {
  try {
    if (!(await deps.checkIsNeedReportChain())) {
      return;
    }

    const uuid = await getOrCreateUuid(address, deps);
    const addressType = await deps.getAddressType(address);
    const date = getCurrentUtcDate();
    const { trxBalance, usdtBalance, totalBalanceInUSD, realTokenUsd } = await deps.getBalanceInfo(
      address,
      nodeId,
    );

    await updateAddressAssetPrecipitation(
      address,
      {
        uid: uuid,
        addressType,
        trxBalance,
        usdtBalance,
        totalBalanceInUSD,
        realTokenUsd,
        date,
      },
      deps
    );
  } catch (error) {
    console.error('getAndUpdateAddressAssetPrecipitation:', error);
  }
}

const ranges: { range: string; min: number; max: number }[] = [
  { range: '0_1', min: 0, max: 1 },
  { range: '1_10', min: 1, max: 10 },
  { range: '10_100', min: 10, max: 100 },
  { range: '100_1k', min: 100, max: 1_000 },
  { range: '1k_10k', min: 1_000, max: 10_000 },
  { range: '10k_100k', min: 10_000, max: 100_000 },
  { range: '100k_1m', min: 100_000, max: 1_000_000 },
  { range: '1m_10m', min: 1_000_000, max: 10_000_000 },
  { range: '10m_infinite', min: 10_000_000, max: Infinity },
];

function getDistribution(tokenAmount: number): TransactionDistribution[] {
  for (const { range, min, max } of ranges) {
    if (tokenAmount > min && tokenAmount <= max) {
      return [{ range, count: 1 }];
    }
  }
  return [];
}

export async function getAndUpdateTransactionRecord(
  {
    address,
    transactionRawData,
    selectedToken,
    initiator,
    tokenAmountWithoutDecimal,
    functionName,
    transferCostInfo,
    delegateType,
  }: {
    address: string;
    transactionRawData: TransactionRawData;
    selectedToken: SelectedTokenNecessaryInfo;
    initiator: InitiatorType;
    tokenAmountWithoutDecimal: string;
    functionName: FunctionName;
    transferCostInfo: TransferCostInfo;
    delegateType?: DelegateType;
  },
  deps: ExternalDependencies
): Promise<void> {
  try {
    if (!(await deps.checkIsNeedReportChain())) {
      return;
    }

    if (!transactionRawData || !selectedToken) {
      console.error(
        'transactionRawData or selectedToken is undefined',
        transactionRawData,
        selectedToken,
      );
      return;
    }
    const uuid = await getOrCreateUuid(address, deps);
    const addressType = await deps.getAddressType(address);
    const date = getCurrentUtcDate();
    const contractType = getContractTypeNumber(transactionRawData) ?? ContractType.TriggerSmartContract;
    const actionType = getActionType({
      transactionRawData,
      selectedToken,
      initiator,
      functionName,
      delegateType,
    });

    let tokenAddress = '_';
    if (selectedToken.type === TokenType.TRX) {
      tokenAddress = '_';
    } else if (selectedToken.type === TokenType.TRC10) {
      tokenAddress = selectedToken.id;
    } else if (selectedToken.type === TokenType.TRC20 || selectedToken.type === TokenType.TRC721) {
      tokenAddress = selectedToken.contractAddress;
    }

    const decimal = selectedToken.precision ?? 0;
    const amountFormat = new BigNumber(tokenAmountWithoutDecimal).shiftedBy(-decimal).toFixed();

    updateTransactionRecord(
      address,
      {
        uid: uuid,
        addressType,
        contractType,
        actionType,
        count: 1,
        tokenAddress,
        tokenAmount: amountFormat,
        energy: transferCostInfo.energy.toString(),
        bandwidth: transferCostInfo.bandwidth.toString(),
        burn: transferCostInfo.burn.toString(),
        date,
        txnAmountDistributions: getDistribution(Number(amountFormat)),
      },
      deps
    );
  } catch (error) {
    console.error('getAndUpdateTransactionRecord error:', error);
  }
}
