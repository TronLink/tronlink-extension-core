// @ts-ignore
import TronWeb from 'tronweb';

import { InvalidParameterError, SignError } from '../../base_wallet/error';
import { LedgerSigner } from '../../base_wallet/ledger/LedgerSigner';
import { LedgerSignParams } from '../../base_wallet/types';
import { getTransactionContractType } from '../../utils';
import { LedgerTrxWebHid } from './LedgerTrxWebHid';
import exchangeList, { ExchangeItem } from './config/exchanges';
import tokenList, { TokenItem } from './config/tokens';

export class LedgerTrxSigner extends LedgerSigner {
  async ledgerSign(params: LedgerSignParams) {
    let isSignMessageV2;
    let transaction;
    let path;
    let tronWebInstance;
    let options;
    ({ data: transaction, path, options } = params);
    ({ isSignMessageV2, tronWebInstance } = options || { isSignMessageV2: false });

    let contractType;
    const ledgerWebHid = new LedgerTrxWebHid();
    try {
      if (typeof transaction === 'string') {
        const tx = isSignMessageV2 ? Buffer.from(transaction).toString('hex') : transaction;
        return await ledgerWebHid.signPersonalMessage(tx, path);
      }

      contractType = getTransactionContractType(transaction);

      const tokenInfo: string[] = [];

      let extra: any = {};

      switch (contractType) {
        case 'TransferContract': {
          //Transfer
          if (transaction.raw_data.data) {
            extra.note = transaction.raw_data.data;
          }
          break;
        }
        case 'TransferAssetContract': {
          const ID = TronWeb.toUtf8(transaction.raw_data.contract[0].parameter.value.asset_name);
          // get token info
          extra = await getTokenExtraInfo(
            transaction.raw_data.contract[0].parameter.value.asset_name,
            tronWebInstance,
          );
          if (transaction.raw_data.data) {
            extra.note = transaction.raw_data.data;
          }
          const tokenObj = await getLedgerTokenInfo(ID);
          if (tokenObj.message) {
            tokenInfo.push(tokenObj.message);
          }
          break;
        }
        case 'WitnessCreateContract':
        case 'ProposalCreateContract':
        case 'ProposalApproveContract':
        case 'ProposalDeleteContract':
        case 'TriggerSmartContract':
        case 'AccountPermissionUpdateContract': {
          extra = transaction.extra || {};
          break;
        }
        case 'ExchangeCreateContract': {
          const token1 = await getTokenExtraInfo(
            transaction.raw_data.contract[0].parameter.value.first_token_id,
            tronWebInstance,
          );
          const token2 = await getTokenExtraInfo(
            transaction.raw_data.contract[0].parameter.value.second_token_id,
            tronWebInstance,
          );
          if (token1 !== undefined && token2 !== undefined) {
            extra = {
              token1: token1.token_name,
              decimals1: token1.decimals,
              token2: token2.token_name,
              decimals2: token2.decimals,
            };
            if (token1.id !== 0) {
              tokenInfo.push(getLedgerTokenInfo(token1.id).message);
            }
            if (token2.id !== 0) {
              tokenInfo.push(getLedgerTokenInfo(token2.id).message);
            }
          }
          break;
        }
        case 'ExchangeInjectContract': {
          //ExchangeInjectContract
          const exchangeDepositID = transaction.raw_data.contract[0].parameter.value.exchange_id;
          const exchangeDeposit = getLedgerExchangeInfo(exchangeDepositID);
          const exchangeDepositToken = getLedgerTokenInfo(
            TronWeb.toUtf8(transaction.raw_data.contract[0].parameter.value.token_id),
          );
          // get exchange info
          extra = {
            pair: exchangeDeposit.pair,
            // @ts-ignore
            token: exchangeDepositToken.token_name,
            // @ts-ignore
            decimals: exchangeDepositToken.decimals,
          };
          if (exchangeDepositToken.id !== 0) {
            tokenInfo.push(exchangeDepositToken.message);
          }
          break;
        }
        case 'ExchangeWithdrawContract': {
          //ExchangeWithdrawContract
          const exchangeWithdrawID = transaction.raw_data.contract[0].parameter.value.exchange_id;
          const exchangeWithdraw = getLedgerExchangeInfo(exchangeWithdrawID);
          const exchangeWithdrawToken = getLedgerTokenInfo(
            TronWeb.toUtf8(transaction.raw_data.contract[0].parameter.value.token_id),
          );
          // get exchange info
          extra = {
            pair: exchangeWithdraw.pair,
            // @ts-ignore
            token: exchangeWithdrawToken.token_name,
            // @ts-ignore
            decimals: exchangeWithdrawToken.decimals,
          };
          if (exchangeWithdrawToken.id !== 0) {
            tokenInfo.push(exchangeWithdrawToken.message);
          }
          break;
        }
        case 'ExchangeTransactionContract': {
          //ExchangeTransactionContract
          const exchangeID = transaction.raw_data.contract[0].parameter.value.exchange_id;
          const exchange = getLedgerExchangeInfo(exchangeID);
          // get exchange info
          extra = {
            pair: exchange.pair,
            decimals1: exchange.decimals1,
            decimals2: exchange.decimals2,
            action:
              transaction.raw_data.contract[0].parameter.value.token_id === exchange.firstToken
                ? 'Sell'
                : 'Buy',
          };
          tokenInfo.push(exchange.message);
          break;
        }
      }

      extra.hash = transaction.txID;
      const signedResponse = await ledgerWebHid.signTransaction(
        {
          hex: transaction.raw_data_hex,
          info: tokenInfo,
        },
        path,
      );
      if (Array.isArray(transaction.signature)) {
        if (!transaction.signature.includes(signedResponse))
          transaction.signature.push(signedResponse);
      } else {
        transaction.signature = [signedResponse];
      }
      return transaction;
    } catch (error: any) {
      const stakeV2Contracts = [
        'FreezeBalanceV2Contract',
        'UnfreezeBalanceV2Contract',
        'WithdrawExpireUnfreezeContract',
        'DelegateResourceContract',
        'UnDelegateResourceContract',
        'CancelAllUnfreezeV2Contract',
      ];

      if (/Too many bytes to encode/.test(error.message)) {
        return await signHash(ledgerWebHid, transaction, path);
      } else if (error.toString().includes('0x6a80') && stakeV2Contracts.includes(contractType)) {
        return await signHash(ledgerWebHid, transaction, path);
      } else {
        throw new SignError(error.message);
      }
    }
  }

  async ledgerSignTypedData(params: LedgerSignParams) {
    try {
      const { data, path } = params;
      const ledgerWebHid = new LedgerTrxWebHid();
      const TypedDataEncoder = TronWeb.utils._TypedDataEncoder;
      const messageDigest = TypedDataEncoder.hash(data.domain, data.types, data.message).replace(
        '0x',
        '',
      );

      return await ledgerWebHid.signTransactionHash(path, messageDigest);
    } catch (e: any) {
      throw new SignError(e.message);
    }
  }
}

async function signHash(ledgerWebHid: LedgerTrxWebHid, transaction: any, path: string) {
  try {
    const signedResponse = await ledgerWebHid.signTransactionHash(path, transaction.txID);

    if (Array.isArray(transaction.signature)) {
      if (!transaction.signature.includes(signedResponse))
        transaction.signature.push(signedResponse);
    } else {
      transaction.signature = [signedResponse];
    }
    return transaction;
  } catch (e: any) {
    throw e.message;
  }
}

const getTokenExtraInfo = async (ID: any, tronWebInstance: any) => {
  let tokenID = ID;
  if (typeof tokenID != 'number') {
    tokenID = TronWeb.toUtf8(tokenID);
    if (tokenID === '') return { id: 0, decimals: 6, token_name: 'TRX' };
    else tokenID = parseInt(tokenID);
  }
  const { id, precision, name } = await tronWebInstance.trx.getTokenByID(tokenID);
  return { id, decimals: precision, token_name: name };
};

const getLedgerTokenInfo = (ID: any): TokenItem => {
  let tokenID = ID;
  if (typeof tokenID != 'number') {
    if (tokenID === '') tokenID = 0;
    else tokenID = parseInt(tokenID);
  }
  return (
    tokenList.find((o: any) => o.id === tokenID) ?? {
      id: 0,
      message: '',
    }
  );
};

const getLedgerExchangeInfo = (ID: any): ExchangeItem => {
  let exchangeID = ID;
  if (typeof exchangeID !== 'number') {
    exchangeID = parseInt(exchangeID);
  }
  return (
    exchangeList.find((o: any) => o.id === exchangeID) ?? {
      id: 0,
      message: '',
      firstToken: '',
      pair: '',
      decimals1: 0,
      decimals2: 0,
    }
  );
};
