// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import { getCoinPriceFromAPI } from './Currency';
import { loadPreferencesFromDatabase } from './Database';

class globals {
    constructor() {
        /* Can't really pass wallet between tab screens, and need it everywhere */
        this.wallet = undefined;

        /* Need pincode so we can save wallet */
        this.pinCode = undefined;

        /* Need to be able to cancel the background saving if we make a new wallet */
        this.backgroundSaveTimer = undefined;

        /* Want to cache this so we don't have to keep loading from DB/internet */
        this.coinPrice = undefined;

        /* Preferences loaded from DB */
        this.preferences = {
            currency: 'usd',
        };
    }

    reset() {
        this.wallet = undefined;
        this.pinCode = undefined;
        this.backgroundSaveTimer = undefined;
        this.preferences = {
            currency: 'usd',
        }
    }
}

export let Globals = new globals();

export async function initGlobals() {
    Globals.coinPrice = await getCoinPriceFromAPI();

    const prefs = await loadPreferencesFromDatabase();

    if (prefs !== undefined) {
        Globals.preferences = prefs;
    }
}
