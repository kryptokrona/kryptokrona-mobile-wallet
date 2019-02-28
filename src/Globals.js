// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import { NetInfo, Platform } from 'react-native';
import { LogLevel } from 'turtlecoin-wallet-backend';

import Config from './Config';
import { Logger } from './Logger';
import { getCoinPriceFromAPI } from './Currency';
import { processBlockOutputs } from './NativeCode';

import {
    saveToDatabase, loadPreferencesFromDatabase, loadPayeeDataFromDatabase
} from './Database';

class globals {
    constructor() {
        /* Can't really pass wallet between tab screens, and need it everywhere */
        this.wallet = undefined;

        /* Need pincode so we can save wallet */
        this.pinCode = undefined;

        /* Need to be able to cancel the background saving if we make a new wallet */
        this.backgroundSaveTimer = undefined;

        /* Want to cache this so we don't have to keep loading from DB/internet */
        this.coinPrice = {};

        /* Preferences loaded from DB */
        this.preferences = {
            currency: 'usd',
            notificationsEnabled: true,
            scanCoinbaseTransactions: false,
            limitData: false,
        };

        /* People in our address book */
        this.payees = [];

        this.logger = new Logger();
    }

    reset() {
        this.wallet = undefined;
        this.pinCode = undefined;
        this.backgroundSaveTimer = undefined;
        this.logger = new Logger();

        NetInfo.removeEventListener('connectionChange', updateConnection);
    }
}

export let Globals = new globals();

function updateConnection(connection) {
    if (Globals.preferences.limitData && connection.type === 'cellular') {
        Globals.wallet.stop();
    } else {
        Globals.wallet.start();
    }
}

/* Note... you probably don't want to await this function. Can block for a while
   if no internet. */
export async function initGlobals() {
    Globals.coinPrice = await getCoinPriceFromAPI();

    const prefs = await loadPreferencesFromDatabase();

    if (prefs !== undefined) {
        Globals.preferences = prefs;
    }

    Globals.wallet.scanCoinbaseTransactions(Globals.preferences.scanCoinbaseTransactions);

    const payees = await loadPayeeDataFromDatabase();

    if (payees !== undefined) {
        Globals.payees = payees;
    }

    Globals.wallet.on('incomingtx', (transaction) => {
        sendNotification(transaction);
    });

    Globals.wallet.setLoggerCallback((prettyMessage, message) => {
        Globals.logger.addLogMessage(message);
    });

    Globals.wallet.setLogLevel(LogLevel.DEBUG);

    /* Don't launch if already started */
    if (Globals.backgroundSaveTimer === undefined) {
        Globals.backgroundSaveTimer = setInterval(backgroundSave, Config.walletSaveFrequency);
    }

    /* Use our native C++ func to process blocks, provided we're on android */
    /* TODO: iOS support */
    if (Platform.OS === 'android') {
        Globals.wallet.setBlockOutputProcessFunc(processBlockOutputs);
    }

    const netInfo = NetInfo.getConnectionInfo();

    /* Start syncing */
    if (!(Globals.preferences.limitData && connection.type === 'cellular')) {
        Globals.wallet.start();
    }

    NetInfo.addEventListener('connectionChange', updateConnection);
}

/**
 * Save wallet in background
 */
function backgroundSave() {
    console.log('Saving wallet...');

    try {
        saveToDatabase(Globals.wallet, Globals.pinCode);
        console.log('Save complete.');
    } catch (err) {
        console.log('Failed to background save: ' + err);
    }
}
