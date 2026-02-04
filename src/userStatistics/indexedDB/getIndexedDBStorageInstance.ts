import {
  CHAIN_ID,
  chainIdList,
  DB_NAME,
  dbVersion,
  storeList,
  transactionTimeoutMs,
} from './config';
import { IndexedDBStorage } from './storage';

class AnalyticsIndexedDBStorage {
  private static instanceMap = new Map<string, IndexedDBStorage>();

  static init() {
    chainIdList.forEach((chainId: CHAIN_ID) => {
      const dbName = DB_NAME[chainId];

      if (!dbName) {
        throw new Error('No valid chainId found');
      }

      storeList.forEach((storeName: string) => {
        const key = `${dbName}_${storeName}`;

        if (this.instanceMap.has(key)) {
          return this.instanceMap.get(key);
        }

        const instance = withTimeout(
          new IndexedDBStorage({
            mode: 'readwrite',
            dbName,
            dbVersion,
            storeName,
          }),
          transactionTimeoutMs,
        );

        this.instanceMap.set(key, instance);
      });
    });
  }

  static get(storeName: string, chainId: CHAIN_ID): IndexedDBStorage {
    const dbName = DB_NAME[chainId];

    const key = `${dbName}_${storeName}`;

    const instance = this.instanceMap.get(key);

    if (!instance) {
      throw new Error(
        `IndexedDB store "${storeName}" not initialized. Call init("${storeName}") first.`,
      );
    }

    return instance;
  }
}

export function initAnalyticsIndexedDBStorage() {
  try {
    AnalyticsIndexedDBStorage.init();
  } catch (error) {
    // handle error
  }
}

export function getIndexedDBStorageInstance(storeName: string, chainId: CHAIN_ID) {
  try {
    return AnalyticsIndexedDBStorage.get(storeName, chainId);
  } catch (error) {
    return;
  }
}

// add timeout for indexedDB to avoid block
function withTimeout(obj: IndexedDBStorage, timeoutMs = 1000) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);

      if (typeof value === 'function') {
        return (...args: any) => {
          const result = value.apply(target, args);

          if (result instanceof Promise) {
            return Promise.race([
              result,
              new Promise((_, reject) =>
                setTimeout(
                  // @ts-ignore
                  () => reject(new Error(`Method "${prop}" timed out after ${timeoutMs}ms`)),
                  timeoutMs,
                ),
              ),
            ]);
          }
          return result;
        };
      }

      return value;
    },
  });
}
