import { STORE_NAME, storeConfig, storeList } from './config';

type KeyType = string | number;

interface IndexedDBStorageState {
  mode?: IDBTransactionMode;
  dbName: string;
  dbVersion: number;
  storeName: string;
}

export class IndexedDBStorage {
  mode: IDBTransactionMode;
  dbName: string;
  dbVersion: number;
  storeName: string;

  constructor({
    mode = 'readwrite' as IDBTransactionMode,
    dbName,
    dbVersion,
    storeName,
  }: IndexedDBStorageState) {
    this.mode = mode;
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeName = storeName;

    this.getObjectStore();
  }

  private createStore(db: IDBDatabase, storeName: STORE_NAME) {
    const { keyPath, autoIncrement, indexList } = storeConfig[storeName];
    const store = db.createObjectStore(storeName, {
      keyPath,
      autoIncrement,
    });

    if (indexList && indexList.length > 0) {
      indexList.forEach(({ name, unique }: { name: string; unique: boolean }) => {
        const parts = name.split('_');
        if (parts.length === 1) {
          store.createIndex(name, parts[0], { unique });
        } else {
          store.createIndex(name, parts, { unique });
        }
      });
    }
  }

  private getObjectStore(): Promise<IDBObjectStore> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        const objectStore = db?.transaction(this.storeName, this.mode).objectStore(this.storeName);
        resolve(objectStore);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        storeList.forEach((storeName: STORE_NAME) => {
          if (!db.objectStoreNames.contains(storeName)) {
            this.createStore(db, storeName);
          }
        });
      };

      request.onerror = (event) => {
        reject('create database error');
      };
    });
  }

  getAll() {
    return new Promise((resolve, reject) => {
      this.getObjectStore()
        .then((objectStore: IDBObjectStore) => {
          const request = objectStore.getAll();

          request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            if (result) {
              resolve(result);
            } else {
              resolve(null);
            }
          };

          request.onerror = (event) => {
            reject(false);
          };
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  getItem(key: KeyType) {
    return new Promise((resolve, reject) => {
      this.getObjectStore()
        .then((objectStore: IDBObjectStore) => {
          const request = objectStore.get(key);

          request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            if (result) {
              resolve(result);
            } else {
              resolve(null);
            }
          };

          request.onerror = (event) => {
            reject(false);
          };
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  getItemByIndex({ indexName, value }: { indexName: string; value: any }) {
    return new Promise((resolve, reject) => {
      this.getObjectStore()
        .then((objectStore: IDBObjectStore) => {
          const index = objectStore.index(indexName);
          const request = index.getAll(value);

          request.onsuccess = (event) => {
            const result = (event.target as IDBRequest).result;
            if (result) {
              resolve(result);
            } else {
              resolve(null);
            }
          };

          request.onerror = (event) => {
            reject(false);
          };
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  getItemByIndexList({ indexName, value }: { indexName: string; value: any }) {
    return new Promise((resolve, reject) => {
      this.getObjectStore()
        .then((objectStore: IDBObjectStore) => {
          const index = objectStore.index(indexName);
          const range = IDBKeyRange.only(value);
          const request = index.openCursor(range);
          const results: any[] = [];

          request.onsuccess = (e) => {
            // @ts-ignore
            const cursor = e.target.result;
            if (cursor) {
              results.push(cursor.value);
              cursor.continue();
            } else {
              resolve(results);
            }
          };

          request.onerror = (event) => {
            reject(false);
          };
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  setItem(value: any, key?: KeyType) {
    return new Promise((resolve, reject) => {
      this.getObjectStore()
        .then((objectStore: IDBObjectStore) => {
          let request;
          if (!objectStore.keyPath) {
            request = objectStore.put(value, key);
          } else {
            request = objectStore.put(value);
          }

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = (event) => {
            reject(false);
          };
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  setItems(values: any[], key?: KeyType[]) {
    return new Promise((resolve, reject) => {
      this.getObjectStore()
        .then((objectStore: IDBObjectStore) => {
          values.map((value, index) => {
            let request;

            if (!objectStore.keyPath) {
              request = objectStore.put(value, key![index]);
            } else {
              request = objectStore.put(value);
            }

            request.onsuccess = () => {
              resolve(true);
            };

            request.onerror = (event) => {
              reject(false);
            };
          });
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  removeItem(key: KeyType) {
    return new Promise((resolve, reject) => {
      this.getObjectStore()
        .then((objectStore: IDBObjectStore) => {
          const request = objectStore.delete(key);

          request.onsuccess = () => {
            resolve(true);
          };

          request.onerror = (event) => {
            reject(false);
          };
        })
        .catch((error) => {
          reject(false);
        });
    });
  }

  removeItems(keys: KeyType[]) {
    return new Promise((resolve, reject) => {
      this.getObjectStore()
        .then((objectStore: IDBObjectStore) => {
          keys.map((key) => {
            const request = objectStore.delete(key);

            request.onsuccess = () => {
              resolve(true);
            };

            request.onerror = (event) => {
              reject(false);
            };
          });
        })
        .catch((error) => {
          reject(false);
        });
    });
  }
}
