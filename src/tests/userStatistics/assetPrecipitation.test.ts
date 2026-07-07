import { updateAddressAssetPrecipitation } from '../../userStatistics/assetPrecipitation';
import { ExternalDependencies } from '../../userStatistics/ExternalDeps';
import { AddressAssetPrecipitation } from '../../userStatistics/types';

function createDeps(
  existing: AddressAssetPrecipitation | null,
): { deps: ExternalDependencies; saved: AddressAssetPrecipitation[] } {
  const saved: AddressAssetPrecipitation[] = [];
  const deps = {
    saveAssetPrecipitation: async (data: AddressAssetPrecipitation) => {
      saved.push(data);
    },
    loadAssetPrecipitation: async () => existing,
  } as unknown as ExternalDependencies;
  return { deps, saved };
}

const rawData: AddressAssetPrecipitation = {
  uid: 'uid1',
  addressType: 1,
  trxBalance: '100.123456',
  usdtBalance: '50.999',
  totalBalanceInUSD: '150.55',
  realTokenUsd: '9.87',
  date: '2026-07-06',
};

describe('updateAddressAssetPrecipitation', () => {
  it('formats trxBalance, usdtBalance, totalBalanceInUSD and realTokenUsd before saving', async () => {
    const { deps, saved } = createDeps(null);

    const result = await updateAddressAssetPrecipitation('addr', rawData, deps);

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      trxBalance: '100',
      usdtBalance: '50.9',
      totalBalanceInUSD: '150',
      realTokenUsd: '9.8',
      isNeedReport: true,
    });
    // the returned value is the formatted data as well
    expect(result.trxBalance).toBe('100');
    expect(result.usdtBalance).toBe('50.9');
    expect(result.totalBalanceInUSD).toBe('150');
    expect(result.realTokenUsd).toBe('9.8');
  });

  it('compares against existing data using the formatted values', async () => {
    // existing already holds the formatted balances -> nothing new to save
    const existing: AddressAssetPrecipitation = {
      ...rawData,
      id: 7,
      trxBalance: '100',
      usdtBalance: '50.9',
      totalBalanceInUSD: '150',
      realTokenUsd: '9.8',
    };
    const { deps, saved } = createDeps(existing);

    const result = await updateAddressAssetPrecipitation('addr', rawData, deps);

    expect(saved).toHaveLength(0);
    expect(result).toBe(existing);
  });
});
