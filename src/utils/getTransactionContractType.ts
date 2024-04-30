export function getTransactionContractType(transaction: any) {
  try {
    return transaction.raw_data.contract[0].type;
  } catch (error) {
    return undefined;
  }
}
