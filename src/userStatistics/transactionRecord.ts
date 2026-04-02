import { ExternalDependencies } from './ExternalDeps';
import { TransactionDistribution, TransactionRecord } from './types';

async function loadAddressTransactionRecords(
  address: string,
  deps: ExternalDependencies
): Promise<TransactionRecord[]> {
  return await deps.loadTransactionRecords(address);
}

async function setTransactionRecord(record: TransactionRecord, deps: ExternalDependencies) {
  await deps.setTransactionRecord(record);
}

function safeAdd(a: unknown, b: unknown): string {
  const numA = isNaN(Number(a)) ? 0 : Number(a);
  const numB = isNaN(Number(b)) ? 0 : Number(b);
  return (numA + numB).toString();
}

function mergeDistributions(
  existing: TransactionDistribution[],
  incoming: TransactionDistribution[],
): TransactionDistribution[] {
  const map: Record<string, number> = {};

  for (const dist of existing) {
    map[dist.range] = (map[dist.range] || 0) + dist.count;
  }

  for (const dist of incoming) {
    map[dist.range] = (map[dist.range] || 0) + dist.count;
  }

  return Object.entries(map).map(([range, count]) => ({ range, count }));
}

export async function updateTransactionRecord(
  address: string,
  newRecord: TransactionRecord,
  deps: ExternalDependencies
): Promise<void> {
  const records = await loadAddressTransactionRecords(address, deps);

  const existing = records?.find(
    (record) =>
      record.uid === newRecord.uid &&
      record.actionType === newRecord.actionType &&
      record.tokenAddress === newRecord.tokenAddress &&
      record.date === newRecord.date,
  );

  if (existing) {
    existing.tokenAmount = safeAdd(existing.tokenAmount, newRecord.tokenAmount);
    existing.count = Number(safeAdd(existing.count, newRecord.count));
    existing.energy = safeAdd(existing.energy, newRecord.energy);
    existing.bandwidth = safeAdd(existing.bandwidth, newRecord.bandwidth);
    existing.burn = safeAdd(existing.burn, newRecord.burn);

    existing.txnAmountDistributions = mergeDistributions(
      existing.txnAmountDistributions,
      newRecord.txnAmountDistributions,
    );
    existing.isNeedReport = true;
    await setTransactionRecord(existing, deps);
  } else {
    await setTransactionRecord(
      {
        ...newRecord,
        isNeedReport: true,
      },
      deps
    );
  }
}

export async function getAllNeedReportTransactionRecord(
  deps: ExternalDependencies
): Promise<TransactionRecord[]> {
  return await deps.getAllNeedReportTransactionRecords();
}

export async function updateAndDeleteAllReportedTransactionRecord(
  array: TransactionRecord[],
  deps: ExternalDependencies
): Promise<void> {
  await deps.updateAndDeleteReportedTransactionRecords(array);
}
