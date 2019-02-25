// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import { NetInfo } from 'react-native';

import { getCoinPriceFromAPI } from './Currency';
import { loadPreferencesFromDatabase, loadPayeeDataFromDatabase } from './Database';

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
    }

    reset() {
        this.wallet = undefined;
        this.pinCode = undefined;
        this.backgroundSaveTimer = undefined;

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

    const netInfo = NetInfo.getConnectionInfo();
    updateConnection(netInfo);

    NetInfo.addEventListener('connectionChange', updateConnection);

    Globals.wallet.scanCoinbaseTransactions(Globals.preferences.scanCoinbaseTransactions);

    const payees = await loadPayeeDataFromDatabase();

    if (payees !== undefined) {
        Globals.payees = payees;
    }
}
