// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

class Globals {
    constructor() {
        /* Can't really pass wallet between tab screens, and need it everywhere */
        this.wallet = undefined;

        /* Need pincode so we can save wallet */
        this.pinCode = undefined;

        /* Need to be able to cancel the background saving if we make a new wallet */
        this.backgroundSaveTimer = undefined;
    }

    reset() {
        this.wallet = undefined;
        this.pinCode = undefined;
        this.backgroundSaveTimer = undefined;
    }
}

export default new Globals();
