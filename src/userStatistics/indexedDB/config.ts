export enum CHAIN_ID {
  MAINNET = '0x2b6653dc',
  SHASTA = '0x94a9059e',
  NILE = '0xcd8690dc',
}

export const dbVersion = 1;

export const DB_NAME = {
  [CHAIN_ID.MAINNET]: 'TRONLINK_WALLET_MAINNET',
  [CHAIN_ID.NILE]: 'TRONLINK_WALLET_NILE',
  [CHAIN_ID.SHASTA]: 'TRONLINK_WALLET_SHASTA',
};

export enum STORE_NAME {
  TRANSACTION_RECORD = 'transaction_record',
  ADDRESS_UUID_MAP = 'address_uuid_map',
  ASSET_PRECIPITATION = 'asset_precipitation',
}

export const chainIdList = [CHAIN_ID.MAINNET, CHAIN_ID.NILE];

export const storeList = [
  STORE_NAME.ADDRESS_UUID_MAP,
  STORE_NAME.TRANSACTION_RECORD,
  STORE_NAME.ASSET_PRECIPITATION,
];

export const storeConfig = {
  [STORE_NAME.TRANSACTION_RECORD]: {
    keyPath: 'id',
    indexList: [
      { name: 'uid', unique: false },
      { name: 'date', unique: false },
      { name: 'uid_date', unique: false },
    ],
    autoIncrement: true,
  },
  [STORE_NAME.ADDRESS_UUID_MAP]: {
    keyPath: 'address',
    indexList: [{ name: 'uid', unique: true }],
    autoIncrement: false,
  },
  [STORE_NAME.ASSET_PRECIPITATION]: {
    keyPath: 'id',
    indexList: [
      { name: 'uid', unique: false },
      { name: 'date', unique: false },
      { name: 'uid_date', unique: false },
    ],
    autoIncrement: true,
  },
};

export const transactionTimeoutMs = 2000;
