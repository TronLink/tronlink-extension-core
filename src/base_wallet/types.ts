export type SignOptions = {
  nodeInfo?: any;

  isMultiSign?: boolean;
  permissionId?: number;

  isSignMessageV2?: boolean;
};

type SignData = string | any;

export type SignParams = {
  privateKey: string;
  data: SignData;
  options?: SignOptions;
};

export type VerifySignParams = {
  data: SignData;
  signature: any;
  address?: string;
};

export type DerivePathParams = {
  accountIndex: number;
  addressIndex: number;
};

export type DerivePrivateKeyParams = {
  mnemonic: string;
  path: string;
};

export type GetAddressParams = {
  privateKey: string;
};

export type ValidateAddressParams = {
  address: string | undefined;
};

export type GetAddressByDefinePathParams = {
  path: string;
};

export type GetAvailableAddressParams = {
  addresses: string[];
};

export type LedgerSignParams = {
  data: any;
  path: string;
  options?: Record<string, any>;
};
