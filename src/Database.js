// Copyright (C) 2018-2019, Zpalmtree
//
// Please see the included LICENSE file for more information.

import Realm from 'realm';

import { AsyncStorage } from 'react-native';

import { sha512 } from 'js-sha512';

import Config from './Config';
import Constants from './Constants';

import { Globals } from './Globals';

import { reportCaughtException } from './Sentry';

import SQLite from 'react-native-sqlite-storage';

/* TODO: Remove */
SQLite.DEBUG(true);
SQLite.enablePromise(true);

let database;

/* Perform conversion from realm to SQL, and delete old realm stuff */
async function realmToSql(pinCode) {
    const [wallet, error] = await loadWalletFromRealm(pinCode);

    await Realm.deleteFile({
    });

    await Realm.deleteFile({
        path: 'Preferences.realm'
    });

    await Realm.deleteFile({
        path: 'PriceData.realm'
    });

    await Realm.deleteFile({
        path: 'PayeeData.realm'
    });

    await Realm.deleteFile({
        path: 'TransactionDetailsData.realm'
    });

    /* Got the wallet from realm - store it in SQLite for future */
    if (wallet) {
        saveWallet(wallet);
    }

    return [wallet, error];
}

export async function deleteDB() {
    try {
        await setHaveWallet(false);

        await SQLite.deleteDatabase({
            name: 'data.DB',
            location: 'default',
        });
    } catch (err) {
        Globals.logger.addLogMessage(err);
    }
}

async function saveWallet(wallet) {
    await database.transaction((tx) => {
        tx.executeSql(
            `UPDATE
                wallet
            SET
                json = ?
            WHERE
                id = 0`,
            [wallet.toJSONString()]
        );
    });
}

async function loadWallet() {
    const [data] = await database.executeSql(
        `SELECT
            json
        FROM
            wallet
        WHERE
            id = 0`,
    );

    if (data && data.rows && data.rows.length >= 1) {
        return data.rows.item(0).json;
    }

    return undefined;
}

/* Create the tables if we haven't made them already */
async function createTables(DB) {
    await DB.transaction((tx) => {
        /* We get JSON out from our wallet backend, and load JSON in from our
           wallet backend - it's a little ugly, but it's faster to just read/write
           json to the DB rather than structuring it. */
        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS wallet (
                id INTEGER PRIMARY KEY,
                json TEXT
            )`
        );

        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS preferences (
                id INTEGER PRIMARY KEY,
                currency TEXT,
                notificationsenabled BOOLEAN,
                scancoinbasetransactions BOOLEAN,
                limitdata BOOLEAN,
                theme TEXT,
                pinconfirmation BOOLEAN
            )`
        );

        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS payees (
                nickname TEXT,
                address TEXT,
                paymentid TEXT
            )`
        );

        tx.executeSql(
            `CREATE TABLE IF NOT EXISTS transactiondetails (
                hash TEXT,
                memo TEXT,
                address TEXT,
                payee TEXT
            )`
        );

        /* Enter initial wallet value that we're going to overwrite later via
           primary key, provided it doesn't already exist */
        tx.executeSql(
            `INSERT OR IGNORE INTO wallet
                (id, json)
            VALUES
                (0, '')`
        );

        /* Setup default preference values */
        tx.executeSql(
            `INSERT OR IGNORE INTO preferences
                (id, currency, notificationsenabled, scancoinbasetransactions, limitdata, theme, pinconfirmation)
            VALUES
                (0, 'usd', 1, 0, 0, 'darkMode', 0)`
        );
    });
}

export async function openDB() {
    try {
        database = await SQLite.openDatabase({
            name: 'data.DB',
            location: 'default',
        });

        await createTables(database);
    } catch (err) {
        Globals.logger.addLogMessage('Failed to open DB: ' + err);
    }
}

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

const PayeeSchema = {
    name: 'Payee',
    primaryKey: 'nickname',
    properties: {
        nickname: 'string',
        address: 'string',
        paymentID: 'string',
    }
}

const TransactionDetailsSchema = {
    name: 'TransactionDetails',
    privateKey: 'hash',
    properties: {
        hash: 'string',
        memo: 'string',
        address: 'string',
        payee: 'string',
    }
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

export async function savePreferencesToDatabase(preferences) {
    await database.transaction((tx) => {
        tx.executeSql(
            `UPDATE
                preferences
            SET
                currency = ?,
                notificationsenabled = ?,
                scancoinbasetransactions = ?,
                limitdata = ?,
                theme = ?,
                pinconfirmation = ?
            WHERE
                id = 0`,
            [
                preferences.currency,
                preferences.notificationsEnabled ? 1 : 0,
                preferences.scanCoinbaseTransactions ? 1 : 0,
                preferences.limitData ? 1 : 0,
                preferences.theme,
                preferences.pinConfirmation ? 1 : 0,
            ]
        );
    });
}

export async function loadPreferencesFromDatabase() {
    const [data] = await database.executeSql(
        `SELECT
            currency,
            notificationsenabled,
            scancoinbasetransactions,
            limitdata,
            theme,
            pinconfirmation
        FROM
            preferences
        WHERE
            id = 0`,
    );

    if (data && data.rows && data.rows.length >= 1) {
        const item = data.rows.item(0);

        return {
            currency: item.currency,
            notificationsEnabled: item.notificationsenabled === 1,
            scanCoinbaseTransactions: item.scancoinbasetransactions === 1,
            limitData: item.limitdata === 1,
            theme: item.theme,
            pinConfirmation: item.pinconfirmation === 1,
        }
    }

    return undefined;
}

export async function savePriceDataToDatabase(priceData) {
    priceData['primaryKey'] = 1;

    withDB(
        [getPriceDataSchema()],
        'PriceData.realm',
        async (realm) => {
            await realm.write(() => {
                return realm.create('PriceData', priceData, true);
            });
        }
    );
}

export async function loadPriceDataFromDatabase() {
    return withDB(
        [getPriceDataSchema()],
        'PriceData.realm',
        (realm) => {
            if (realm.objects('PriceData').length > 0) {
                return JSON.parse(JSON.stringify(realm.objects('PriceData')[0]));
            }

            return undefined;
        }
    );
}

/**
 * Note - saves a single payee to the DB, which contains many payees
 */
export async function savePayeeToDatabase(payee) {
    withDB(
        [PayeeSchema],
        'PayeeData.realm',
        async (realm) => {
            await realm.write(() => {
                return realm.create('Payee', payee, true);
            });
        }
    );
}

export async function removePayeeFromDatabase(nickname) {
    withDB(
        [PayeeSchema],
        'PayeeData.realm',
        async (realm) => {
            const payee = realm.objects('Payee').filtered('nickname = $0', nickname);

            if (payee.length > 0) {
                await realm.write(() => {
                    realm.delete(payee);
                });
            }
        }
    );
}

export async function loadPayeeDataFromDatabase() {
    return withDB(
        [PayeeSchema],
        'PayeeData.realm',
        (realm) => {
            if (realm.objects('Payee').length > 0) {
                /* Has science gone too far? */
                return realm.objects('Payee').map((x) => JSON.parse(JSON.stringify((x))));
            }

            return undefined;
        }
    );
}

export async function saveToDatabase(wallet, pinCode) {
    try {
        await saveWallet(wallet);
        setHaveWallet(true);
    } catch (err) {
        reportCaughtException(err);
        Globals.logger.addLogMessage('Err saving wallet: ' + err);
    };
}

export async function loadFromDatabase(pinCode) {
    const wallet = await loadWallet();

    if (wallet) {
        return [wallet, undefined];
    }

    return realmToSql(pinCode);
}

export async function loadWalletFromRealm(pinCode) {
    /* Looks like we haven't converted from realm DB yet, lets try opening from
       there */
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

        try {
            if (realm.objects('Wallet').length > 0) {
                return [realmToWalletJSON(realm.objects('Wallet')[0]), undefined];
            }
        } finally {
            realm.close();
        }

        return [undefined, 'Wallet not present in database'];
    } catch(err) {
        reportCaughtException(err);
        Globals.logger.addLogMessage('Error loading database: ' + err);
        return [undefined, err];
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
        reportCaughtException(error);
        Globals.logger.addLogMessage('Error determining if we have data: ' + error);
        return false;
    }
}

export async function setHaveWallet(haveWallet) {
    try {
        await AsyncStorage.setItem(Config.coinName + 'HaveWallet', haveWallet.toString());
    } catch (error) {
        reportCaughtException(error);
        Globals.logger.addLogMessage('Failed to save have wallet status: ' + error);
    }
}

/**
 * Note - saves a single transactiondetails to the DB, which contains many payees
 */
export async function saveTransactionDetailsToDatabase(details) {
    withDB(
        [TransactionDetailsSchema],
        'TransactionDetailsData.realm',
        async (realm) => {
            await realm.write(() => {
                return realm.create('TransactionDetails', details, true);
            });
        }
    );
}

export async function removeTransactionDetailsFromDatabase(hash) {
    withDB(
        [TransactionDetailsSchema],
        'TransactionDetailsData.realm',
        async (realm) => {
            const details = realm.objects('TransactionDetails').filtered('hash = $0', hash);

            if (details.length > 0) {
                await realm.write(() => {
                    realm.delete(details);
                });
            }
        }
    );
}

export function loadTransactionDetailsFromDatabase() {
    return withDB(
        [TransactionDetailsSchema],
        'TransactionDetailsData.realm',
        (realm) => {
            if (realm.objects('TransactionDetails').length > 0) {
                /* Has science gone too far? */
                return realm.objects('TransactionDetails').map((x) => JSON.parse(JSON.stringify((x))));
            }

            return undefined;
        }
    );
}

async function withDB(schema, path, func, deleteIfMigrationNeeded) {
    try {
        let realm = await Realm.open({
            schema: schema,
            path: path,
            deleteRealmIfMigrationNeeded: deleteIfMigrationNeeded === undefined ? true : deleteIfMigrationNeeded,
        });

        try {
            return await func(realm);
        } finally {
            realm.close();
        }
    } catch (err) {
        reportCaughtException(err);
        Globals.logger.addLogMessage('Error interacting with DB: ' + err);
        return undefined;
    }
}
