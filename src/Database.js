// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import Realm from 'realm';

import { AsyncStorage } from 'react-native';

import { sha512 } from 'js-sha512';

import Config from './Config';
import Constants from './Constants';

function getPriceDataSchema() {
    var obj = {
        name: 'PriceData',
        primaryKey: 'primaryKey',
        properties: {
            primaryKey: 'int',
        }
    }

    for (const currency of Constants.currencies) {
        obj.properties[currency.ticker] = 'double';
    }

    return obj;
}

const WalletSchema = {
    name: 'Wallet',
    /* Designate the 'primaryKey' property as the primary key. We can use
       this so we can update the wallet, rather than having to delete the old
       one, and resave it */
    primaryKey: 'primaryKey',
    properties: {
        primaryKey: 'int',
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

const PreferencesSchema = {
    name: 'Preferences',
    primaryKey: 'primaryKey',
    properties: {
        primaryKey: 'int',
        currency: 'string',
        notificationsEnabled: 'bool',
        scanCoinbaseTransactions: 'bool',
        limitData: 'bool',
    }
}

const PayeeSchema = {
    name: 'Payee',
    primaryKey: 'nickname',
    properties: {
        nickname: 'string',
        address: 'string',
        paymentID: 'string',
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
        transfers: json.transfers.map((x) => transfersToRealm(x, realm)),
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
        /* Only one wallet stored in the DB, so this can be constant at 0 */
        primaryKey: 0,
        walletFileFormatVersion: Constants.walletFileFormatVersion,
        subWallets: subWalletsToRealm(json.subWallets, realm),
        walletSynchronizer: walletSynchronizerToRealm(json.walletSynchronizer, realm),
    }, true /* Update with new wallet based on primary key */);
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
    let json = {};

    json.blockHashCheckpoints = realmObj.blockHashCheckpoints.map(x => x);
    json.lastKnownBlockHashes = realmObj.lastKnownBlockHashes.map(x => x);
    json.lastKnownBlockHeight = realmObj.lastKnownBlockHeight;

    return json;
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

export function savePreferencesToDatabase(preferences) {
    preferences['primaryKey'] = 1;

    Realm.open({
        schema: [PreferencesSchema],
        path: 'Preferences.realm',
        deleteRealmIfMigrationNeeded: true,
    }).then(realm => {
        realm.write(() => {
            return realm.create('Preferences', preferences, true);
        });
    }).catch(err => {
        console.log('Failed to save preferences to DB: ' + err);
    });
}

export async function loadPreferencesFromDatabase() {
    try {
        let realm = await Realm.open({
            schema: [PreferencesSchema],
            path: 'Preferences.realm',
            deleteRealmIfMigrationNeeded: true,
        });

        if (realm.objects('Preferences').length > 0) {
            return JSON.parse(JSON.stringify(realm.objects('Preferences')[0]));
        }

        return undefined;

    } catch (err) {
        console.log('Error loading preferences from database: ' + err);
        return undefined;
    }
}

export function savePriceDataToDatabase(priceData) {
    priceData['primaryKey'] = 1;

    Realm.open({
        schema: [getPriceDataSchema()],
        path: 'PriceData.realm',
        deleteRealmIfMigrationNeeded: true,
    }).then(realm => {
        realm.write(() => {
            return realm.create('PriceData', priceData, true);
        });
    }).catch(err => {
        console.log('Failed to save price data to DB: ' + err);
    });
}

export async function loadPriceDataFromDatabase() {
    try {
        let realm = await Realm.open({
            schema: [getPriceDataSchema()],
            path: 'PriceData.realm',
            deleteRealmIfMigrationNeeded: true,
        });

        if (realm.objects('PriceData').length > 0) {
            return JSON.parse(JSON.stringify(realm.objects('PriceData')[0]));
        }

        return undefined;

    } catch (err) {
        console.log('Error loading database: ' + err);
        return undefined;
    }
}

/**
 * Note - saves a single payee to the DB, which contains many payees
 */
export function savePayeeToDatabase(payee) {
    Realm.open({
        schema: [PayeeSchema],
        path: 'PayeeData.realm',
        deleteRealmIfMigrationNeeded: true,
    }).then(realm => {
        realm.write(() => {
            return realm.create('Payee', payee, true);
        });
    }).catch(err => {
        console.log('Failed to save payee data to DB: ' + err);
    });
}

export async function loadPayeeDataFromDatabase() {
    try {
        let realm = await Realm.open({
            schema: [PayeeSchema],
            path: 'PayeeData.realm',
            deleteRealmIfMigrationNeeded: true,
        });

        if (realm.objects('Payee').length > 0) {
            /* Has science gone too far? */
            return realm.objects('Payee').map((x) => JSON.parse(JSON.stringify((x))));
        }

        return undefined;

    } catch (err) {
        console.log('Error loading payee data from database: ' + err);
        return undefined;
    }
}

export function saveToDatabase(wallet, pinCode) {
    /* Get encryption key from pin code */
    var key = sha512.arrayBuffer(pinCode.toString());

    /* Open the DB */
    Realm.open({
        schema: [
            WalletSchema, WalletSynchronizerSchema, SubWalletSchema,
            TransactionSchema, SubWalletsSchema, TxPrivateKeysSchema,
            TransfersSchema, TransactionInputSchema, UnconfirmedInputSchema,
            SynchronizationStatusSchema
        ],
        encryptionKey: key,
    }).then(realm => {
        /* Write the wallet to the DB, overwriting old wallet */
        realm.write(() => {
            walletToRealm(wallet, realm)
            setHaveWallet(true);
        })
    }).catch(err => {
        console.log('Err saving wallet: ' + err);
    });
}

export async function loadFromDatabase(pinCode) {
    var key = sha512.arrayBuffer(pinCode.toString());

    try {
        let realm = await Realm.open({
            schema: [
                WalletSchema, WalletSynchronizerSchema, SubWalletSchema,
                TransactionSchema, SubWalletsSchema, TxPrivateKeysSchema,
                TransfersSchema, TransactionInputSchema, UnconfirmedInputSchema,
                SynchronizationStatusSchema
            ],
            encryptionKey: key,
        });

        if (realm.objects('Wallet').length > 0) {
            return realmToWalletJSON(realm.objects('Wallet')[0]);
        }

        return undefined;
    } catch(err) {
        console.log('Error loading database: ' + err);
        return undefined;
    }
}

export async function haveWallet() {
    try {
        const value = await AsyncStorage.getItem(Config.coinName + 'HaveWallet');
        
        if (value !== null) {
            return value === 'true';
        }

        return false;
    } catch (error) {
        console.log('Error determining if we have data: ' + error);
        return false;
    }
}

export async function setHaveWallet(haveWallet) {
    try {
        await AsyncStorage.setItem(Config.coinName + 'HaveWallet', haveWallet.toString());
    } catch (error) {
        console.log('Failed to save have wallet status: ' + error);
    }
}
