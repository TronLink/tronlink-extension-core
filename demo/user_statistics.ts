import {
  getAndUpdateAddressAssetPrecipitation,
  getAndUpdateTransactionRecord,
  checkAndReportXY,
  ExternalDependencies,
  SystemConfig,
  BalanceInfo,
  SendStatisticsParams,
  SendStatisticsResult,
  AddressAssetPrecipitation,
  TransactionRecord,
  InitiatorType,
  FunctionName,
  TokenType,
  ContractType,
  UserStatisticsActionType,
  DelegateType,
} from '@tronlink/core';

export const tronLinkExternalDeps: ExternalDependencies = {
  /**
   * Get or create a unique UUID for the given address.
   * This UUID is used to anonymize the user's identity when reporting statistics.
   * Should persist the UUID in storage (e.g., IndexedDB) to maintain consistency across sessions.
   */
  async getOrCreateUuid(address: string): Promise<string> {
    throw new Error('Not implemented');
  },

  /**
   * Save asset accumulation data to persistent storage.
   * Records include balance information (TRX, USDT, total USD value, total value of whitelist tokens) for a specific date.
   * Typically stored in IndexedDB.
   */
  async saveAssetPrecipitation(data: AddressAssetPrecipitation): Promise<void> {
    throw new Error('Not implemented');
  },

  /**
   * Load asset accumulation data for a specific address and date.
   * Returns null if no data exists for the given address and date.
   * Used to check if asset data has already been recorded for today.
   */
  async loadAssetPrecipitation(
    address: string,
    date: string,
  ): Promise<AddressAssetPrecipitation | null> {
    throw new Error('Not implemented');
  },

  /**
   * Get all asset accumulation records that need to be reported to the backend.
   * Returns records where isNeedReport is true or undefined.
   * Used by checkAndReportXY to collect data for batch reporting.
   */
  async getAllNeedReportAssetPrecipitation(): Promise<AddressAssetPrecipitation[]> {
    throw new Error('Not implemented');
  },

  /**
   * Mark asset accumulation records as reported and optionally delete them from storage.
   * Called after successfully reporting data to the backend.
   * Completely deletes non-today's data that was marked as reported.
   */
  async updateAndDeleteReportedAssetPrecipitations(
    array: AddressAssetPrecipitation[],
  ): Promise<void> {
    throw new Error('Not implemented');
  },

  /**
   * Load all transaction records for a specific address.
   * Returns an array of transaction records that have been stored locally.
   * Used for aggregating transaction statistics before reporting.
   */
  async loadTransactionRecords(address: string): Promise<TransactionRecord[]> {
    throw new Error('Not implemented');
  },

  /**
   * Save or update a transaction record in persistent storage.
   * If a similar record exists, it may aggregate the data (e.g., increment count, sum amounts).
   * Records include transaction type, token info, costs, and distribution data.
   */
  async setTransactionRecord(record: TransactionRecord): Promise<void> {
    throw new Error('Not implemented');
  },

  /**
   * Get all transaction records that need to be reported to the backend.
   * Returns records where isNeedReport is true or undefined.
   * Used by checkAndReportXY to collect transaction data for batch reporting.
   */
  async getAllNeedReportTransactionRecords(): Promise<TransactionRecord[]> {
    throw new Error('Not implemented');
  },

  /**
   * Mark transaction records as reported and optionally delete them from storage.
   * Called after successfully reporting data to the backend.
   * Completely deletes non-today's data that was marked as reported.
   */
  async updateAndDeleteReportedTransactionRecords(array: TransactionRecord[]): Promise<void> {
    throw new Error('Not implemented');
  },

  /**
   * Check if the current blockchain network should report statistics.
   * Typically returns true for mainnet and false for testnets (Shasta, Nile).
   * Can also check user preferences settings.
   */
  async checkIsNeedReportChain(): Promise<boolean> {
    throw new Error('Not implemented');
  },

  /**
   * Get system configuration for user statistics.
   * Currently includes isEncryptReportData flag to determine if data should be encrypted before sending.
   * Configuration is typically stored in chrome.storage or equivalent.
   */
  async getSystemConfig(): Promise<SystemConfig> {
    throw new Error('Not implemented');
  },

  /**
   * Update system configuration for user statistics.
   * Used to update the isEncryptReportData flag based on backend response.
   * The backend may instruct the client to enable/disable encryption.
   */
  async updateSystemConfig(config: SystemConfig): Promise<void> {
    throw new Error('Not implemented');
  },

  /**
   * Get balance information for a specific address on a specific node.
   * Should return TRX balance, USDT balance, total USD value, and real TRX price.
   */
  async getBalanceInfo(address: string, nodeId: string): Promise<BalanceInfo> {
    throw new Error('Not implemented');
  },

  /**
   * Get the address type for classification purposes.
   * Returns a number indicating how the address was generated:
   * - 1: Mnemonic wallet
   * - 2: Private key import
   * - 3: Hardware wallet
   * - etc.
   * Used for analytics to understand user wallet preferences.
   */
  async getAddressType(address: string): Promise<number> {
    throw new Error('Not implemented');
  },

  /**
   * Send statistics data to the backend server.
   */
  async sendStatistics(params: SendStatisticsParams): Promise<SendStatisticsResult> {
    throw new Error('Not implemented');
  },
};

/**
 * demo 1: Record asset precipitation
 */
async function demo1_RecordAssetPrecipitation() {
  console.log('Demo 1: Record Asset Precipitation');

  const deps = tronLinkExternalDeps;
  const address = 'your address';
  const nodeId = 'node uuid';

  await getAndUpdateAddressAssetPrecipitation(address, nodeId, deps);

  console.log('Asset precipitation recorded successfully!');
}

/**
 * demo 2: Record transaction record
 */
async function demo2_RecordTransactionRecord() {
  console.log('Demo 2: Record Transaction Record');

  const deps = tronLinkExternalDeps;
  const address = 'your address';

  // example: TRX transfer
  await getAndUpdateTransactionRecord(
    {
      address,
      transactionRawData: {
        contract: [
          {
            type: 'TransferContract',
            parameter: {
              type_url: 'url',
              value: {
                owner_address: 'hex addresses starting with 41',
                to_address: 'hex addresses starting with 41',
                amount: 1000000,
              },
            },
          },
        ],
      },
      selectedToken: {
        contractAddress: '',
        id: '',
        type: TokenType.TRX,
        precision: 6,
      },
      initiator: InitiatorType.TronLink,
      tokenAmountWithoutDecimal: '1000000', // 1 TRX (6 decimals)
      functionName: FunctionName.Transfer,
      transferCostInfo: {
        energy: '0',
        bandwidth: '265',
        burn: '0',
      },
    },
    deps,
  );

  console.log('Transaction record saved successfully!');
}

/**
 * demo 3: Check and report statistics
 */
async function demo3_CheckAndReportStatistics() {
  console.log('Demo 3: Check and Report Statistics');

  const deps = tronLinkExternalDeps;
  const address = 'your address';
  const nodeId = 'node uuid';

  // first, record some data
  await getAndUpdateAddressAssetPrecipitation(address, nodeId, deps);
  await getAndUpdateTransactionRecord(
    {
      address,
      transactionRawData: {
        contract: [
          {
            type: 'TransferContract',
          },
        ],
      },
      selectedToken: {
        contractAddress: '',
        id: '',
        type: TokenType.TRX,
        precision: 6,
      },
      initiator: InitiatorType.TronLink,
      tokenAmountWithoutDecimal: '5000000',
      functionName: FunctionName.Transfer,
      transferCostInfo: {
        energy: '0',
        bandwidth: '265',
        burn: '0',
      },
    },
    deps,
  );

  // then report it
  await checkAndReportXY(deps);

  console.log('Statistics reported successfully!');
}
/**
 * run all demos
 */
async function runAllDemos() {
  console.log('\n  TronLink Core User Statistics Demo  ');

  try {
    await demo1_RecordAssetPrecipitation();
    await demo2_RecordTransactionRecord();
    await demo3_CheckAndReportStatistics();

    console.log('  All demos completed successfully!  ');
  } catch (error) {
    console.error('Error running demos:', error);
  }
}

// run all demos
runAllDemos();
