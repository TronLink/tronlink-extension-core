abstract class LedgerAppBase {
  abstract getAddress(path: string, boolDisplay?: boolean): Promise<{ address: string }>;

  /**
   * @param path
   * @param messageHex
   * @returns {Promise<{ v: string; r: string; s: string }> | Promise<string>}
   */
  abstract signPersonalMessage(path: string, messageHex: string): Promise<any>;
}
