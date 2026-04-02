import { ExternalDependencies } from './ExternalDeps';

export async function getOrCreateUuid(
  address: string,
  deps: ExternalDependencies
): Promise<string> {
  return await deps.getOrCreateUuid(address);
}
