import { ExternalDependencies } from './ExternalDeps';
import { AddressAssetPrecipitation } from './types';
import { formatReportNumber, getCurrentUtcDate } from './utils';

async function saveAddressAssetPrecipitation(
  address: string,
  data: AddressAssetPrecipitation,
  deps: ExternalDependencies
): Promise<void> {
  await deps.saveAssetPrecipitation(data);
}

async function loadAssetPrecipitationBy(
  address: string,
  date: string,
  deps: ExternalDependencies
): Promise<AddressAssetPrecipitation | null> {
  return await deps.loadAssetPrecipitation(address, date);
}

export async function updateAddressAssetPrecipitation(
  address: string,
  rawData: AddressAssetPrecipitation,
  deps: ExternalDependencies
): Promise<AddressAssetPrecipitation> {
  const newData: AddressAssetPrecipitation = {
    ...rawData,
    trxBalance: formatReportNumber(rawData.trxBalance),
    usdtBalance: formatReportNumber(rawData.usdtBalance),
    totalBalanceInUSD: formatReportNumber(rawData.totalBalanceInUSD),
    realTokenUsd: formatReportNumber(rawData.realTokenUsd),
  };
  const date = getCurrentUtcDate();
  const existingData = await loadAssetPrecipitationBy(address, date, deps);

  if (!existingData) {
    saveAddressAssetPrecipitation(address, { ...newData, isNeedReport: true }, deps);
    return newData;
  }

  if (
    existingData &&
    (existingData.trxBalance !== newData.trxBalance ||
      existingData.usdtBalance !== newData.usdtBalance ||
      existingData.date !== newData.date)
  ) {
    saveAddressAssetPrecipitation(address, { ...newData, id: existingData.id, isNeedReport: true }, deps);
    return newData;
  }

  return existingData;
}

export async function getAllNeedReportAssetPrecipitation(
  deps: ExternalDependencies
): Promise<AddressAssetPrecipitation[]> {
  return await deps.getAllNeedReportAssetPrecipitation();
}

export async function updateAndDeleteAllReportedAssetPrecipitations(
  array: AddressAssetPrecipitation[],
  deps: ExternalDependencies
): Promise<void> {
  await deps.updateAndDeleteReportedAssetPrecipitations(array);
}
