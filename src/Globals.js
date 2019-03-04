// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import { NetInfo, Alert } from 'react-native';

import { Logger } from './Logger';
import { getCoinPriceFromAPI } from './Currency';

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
            theme: 'darkMode',
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
    const payees = await loadPayeeDataFromDatabase();

    if (payees !== undefined) {
        Globals.payees = payees;
    }
    
    const netInfo = NetInfo.getConnectionInfo();

    /* Start syncing */
    if ((Globals.preferences.limitData && connection.type === 'cellular')) {
        Alert.alert(
            'Not Syncing',
            'You enabled data limits, and are on a limited connection. Not starting sync.',
            [
                {text: 'OK'},
            ]
        );
    } else {
        Globals.wallet.start();
    }

    NetInfo.addEventListener('connectionChange', updateConnection);
}
