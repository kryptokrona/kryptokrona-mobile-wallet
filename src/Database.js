// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import Realm from 'realm';

import Constants from './Constants';

const WalletSchema = {
    name: 'Wallet',
    properties: {
        walletFileFormatVersion: 'int',
        subWallets: 'SubWallets',
        walletSynchronizer: 'WalletSynchronizer',
    }
};

const WalletSynchronizerSchema = {
    name: 'WalletSynchronizer',
    properties: {
        startTimestamp: 'int',
        startHeight: 'int',
        privateViewKey: 'string',
        transactionSynchronizerStatus: 'SynchronizationStatus',
    }
};

const SubWalletSchema = {
    name: 'SubWallet',
    properties: {
        unspentInputs: 'TransactionInput[]',
        lockedInputs: 'TransactionInput[]',
        spentInputs: 'TransactionInput[]',
        unconfirmedIncomingAmounts: 'UnconfirmedInput[]',
        publicSpendKey: 'string',
        privateSpendKey: 'string',
        syncStartTimestamp: 'int',
        syncStartHeight: 'int',
        address: 'string',
        isPrimaryAddress: 'bool'
    }
}

const TransactionSchema = {
    name: 'Transaction',
    properties: {
        transfers: 'Transfers[]',
        hash: 'string',
        fee: 'int',
        blockHeight: 'int',
        timestamp: 'int',
        paymentID: 'string',
        unlockTime: 'int',
        isCoinbaseTransaction: 'bool',
    }
}

const SubWalletsSchema = {
    name: 'SubWallets',
    properties: {
        publicSpendKeys: 'string[]',
        subWallet: 'SubWallet[]',
        transactions: 'Transaction[]',
        lockedTransactions: 'Transaction[]',
        privateViewKey: 'string',
        isViewWallet: 'bool',
        txPrivateKeys: 'TxPrivateKeys[]',
    }
}

const TxPrivateKeysSchema = {
    name: 'TxPrivateKeys',
    properties: {
        transactionHash: 'string',
        txPrivateKey: 'string',
    }
}

const TransfersSchema = {
    name: 'Transfers',
    properties: {
        amount: 'int',
        publicKey: 'string',
    }
}

const TransactionInputSchema = {
    name: 'TransactionInput',
    properties: {
        keyImage: 'string',
        amount: 'int',
        blockHeight: 'int',
        transactionPublicKey: 'string',
        transactionIndex: 'int',
        globalOutputIndex: 'int',
        key: 'string',
        spendHeight: 'int',
        unlockTime: 'int',
        parentTransactionHash: 'string',
    }
}

const UnconfirmedInputSchema = {
    name: 'UnconfirmedInput',
    properties: {
        amount: 'int',
        key: 'string',
        parentTransactionHash: 'string',
    }
}

const SynchronizationStatusSchema = {
    name: 'SynchronizationStatus',
    properties: {
        blockHashCheckpoints: 'string[]',
        lastKnownBlockHashes: 'string[]',
        lastKnownBlockHeight: 'int',
    }
}

function transactionInputToRealm(json, realm) {
    return realm.create('TransactionInput', json);
}

function unconfirmedInputToRealm(json, realm) {
    return realm.create('UnconfirmedInput', json);
}

function transfersToRealm(json, realm) {
    return realm.create('Transfers', json);
}

function transactionToRealm(json, realm) {
    return realm.create('Transaction', {
        transfers: json.transfers.map(transfersToRealm),
        hash: json.hash,
        fee: json.fee,
        blockHeight: json.blockHeight,
        timestamp: json.timestamp,
        paymentID: json.paymentID,
        unlockTime: json.unlockTime,
        isCoinbaseTransaction: json.isCoinbaseTransaction,
    });
}

function subWalletToRealm(json, realm) {
    return realm.create('SubWallet', {
        unspentInputs: json.unspentInputs.map((x) => transactionInputToRealm(x, realm)),
        spentInputs: json.spentInputs.map((x) => transactionInputToRealm(x, realm)),
        lockedInputs: json.lockedInputs.map((x) => transactionInputToRealm(x, realm)),
        unconfirmedIncomingAmounts: json.unconfirmedIncomingAmounts.map((x) => unconfirmedInputToRealm(x, realm)),
        publicSpendKey: json.publicSpendKey,
        privateSpendKey: json.privateSpendKey,
        syncStartTimestamp: json.syncStartTimestamp,
        syncStartHeight: json.syncStartHeight,
        address: json.address,
        isPrimaryAddress: json.isPrimaryAddress,
    });
}

function subWalletsToRealm(json, realm) {
    return realm.create('SubWallets', {
        publicSpendKeys: json.publicSpendKeys,
        subWallet: json.subWallet.map((x) => subWalletToRealm(x, realm)),
        transactions: json.transactions.map((x) => transactionToRealm(x, realm)),
        lockedTransactions: json.lockedTransactions.map((x) => transactionToRealm(x, realm)),
        privateViewKey: json.privateViewKey,
        isViewWallet: json.isViewWallet,
        txPrivateKeys: json.txPrivateKeys.map((x) => txPrivateKeyToRealm(x, realm))
    });
}

function synchronizationStatusToRealm(json, realm) {
    return realm.create('SynchronizationStatus', json);
}

function txPrivateKeyToRealm(json, realm) {
    return realm.create('TxPrivateKeys', json);
}

function walletSynchronizerToRealm(json, realm) {
    return realm.create('WalletSynchronizer', {
        startTimestamp: json.startTimestamp,
        startHeight: json.startHeight,
        privateViewKey: json.privateViewKey,
        transactionSynchronizerStatus: synchronizationStatusToRealm(json.transactionSynchronizerStatus, realm),
    });
}

/* Convert a wallet to a realm object so we can store it in the DB */
function walletToRealm(wallet, realm) {
    let json = JSON.parse(wallet.toJSONString());

    return realm.create('Wallet', {
        walletFileFormatVersion: Constants.walletFileFormatVersion,
        subWallets: subWalletsToRealm(json.subWallets, realm),
        walletSynchronizer: walletSynchronizerToRealm(json.walletSynchronizer, realm),
    });
}

function realmToTransactionInputJSON(realmObj) {
    return JSON.parse(JSON.stringify(realmObj));
}

function realmToIncomingAmountJSON(realmObj) {
    return JSON.parse(JSON.stringify(realmObj));
}

function realmToSubWalletJSON(realmObj) {
    let json = {};

    json.unspentInputs = realmObj.unspentInputs.map(realmToTransactionInputJSON);
    json.lockedInputs = realmObj.lockedInputs.map(realmToTransactionInputJSON);
    json.spentInputs = realmObj.spentInputs.map(realmToTransactionInputJSON);
    json.unconfirmedIncomingAmounts = realmObj.unconfirmedIncomingAmounts.map(realmToIncomingAmountJSON);
    json.publicSpendKey = realmObj.publicSpendKey;
    json.privateSpendKey = realmObj.privateSpendKey;
    json.syncStartTimestamp = realmObj.syncStartTimestamp;
    json.syncStartHeight = realmObj.syncStartHeight;
    json.address = realmObj.address;
    json.isPrimaryAddress = realmObj.isPrimaryAddress;

    return json;
}

function realmToTransfersJSON(realmObj) {
    return JSON.parse(JSON.stringify(realmObj));
}

function realmToTransactionJSON(realmObj) {
    let json = {};

    json.transfers = realmObj.transfers.map(realmToTransfersJSON);
    json.hash = realmObj.hash;
    json.fee = realmObj.fee;
    json.blockHeight = realmObj.blockHeight;
    json.timestamp = realmObj.timestamp;
    json.paymentID = realmObj.paymentID;
    json.unlockTime = realmObj.unlockTime;
    json.isCoinbaseTransaction = realmObj.isCoinbaseTransaction;

    return json;
}

function realmToTxPrivateKeyJSON(realmObj) {
    return JSON.parse(JSON.stringify(realmObj));
}

function realmToSubWalletsJSON(realmObj) {
    let json = {};

    json.publicSpendKeys = realmObj.publicSpendKeys.map((value, key) => value);
    json.subWallet = realmObj.subWallet.map(realmToSubWalletJSON);
    json.transactions = realmObj.transactions.map(realmToTransactionJSON);
    json.lockedTransactions = realmObj.lockedTransactions.map(realmToTransactionJSON);
    json.privateViewKey = realmObj.privateViewKey;
    json.isViewWallet = realmObj.isViewWallet;
    json.txPrivateKeys = realmObj.txPrivateKeys.map(realmToTxPrivateKeyJSON);

    return json;
}

function realmToTransactionSynchronizerJSON(realmObj) {
    return JSON.parse(JSON.stringify(realmObj));
}

function realmToWalletSynchronizerJSON(realmObj) {
    let json = {};

    json.startTimestamp = realmObj.startTimestamp;
    json.startHeight = realmObj.startHeight;
    json.privateViewKey = realmObj.privateViewKey;
    json.transactionSynchronizerStatus = realmToTransactionSynchronizerJSON(realmObj.transactionSynchronizerStatus);

    return json;
}

function realmToWalletJSON(realmObj) {
    let json = {};

    json.walletFileFormatVersion = realmObj.walletFileFormatVersion;
    json.subWallets = realmToSubWalletsJSON(realmObj.subWallets);
    json.walletSynchronizer = realmToWalletSynchronizerJSON(realmObj.walletSynchronizer);

    return JSON.stringify(json);
}

export function saveToDatabase(wallet, pinCode) {
    Realm.deleteFile({});

    Realm.open({
        schema: [
            WalletSchema, WalletSynchronizerSchema, SubWalletSchema,
            TransactionSchema, SubWalletsSchema, TxPrivateKeysSchema,
            TransfersSchema, TransactionInputSchema, UnconfirmedInputSchema,
            SynchronizationStatusSchema
        ]
    }).then(realm => {
        realm.write(() => {
            walletToRealm(wallet, realm)
        });
    }).catch(err => {
        console.log('Err saving wallet: ' + err);
    });
}

export async function loadFromDatabase(pinCode) {
    try {
        let realm = await Realm.open({
            schema: [
                WalletSchema, WalletSynchronizerSchema, SubWalletSchema,
                TransactionSchema, SubWalletsSchema, TxPrivateKeysSchema,
                TransfersSchema, TransactionInputSchema, UnconfirmedInputSchema,
                SynchronizationStatusSchema
            ]
        });

        if (realm.objects('Wallet').length >= 0) {
            return realmToWalletJSON(realm.objects('Wallet')[0]);
        }

        return undefined;
    } catch(err) {
        console.log('Error loading database: ' + err);
        return undefined;
    }
}
