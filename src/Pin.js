// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import PINCode from '@haskkor/react-native-pincode';

import React from 'react';

import {
    BlockchainCacheApi, WalletBackend
} from 'turtlecoin-wallet-backend';

import {
    View
} from 'react-native';

import Config from './Config';
import Globals from './Globals';

import { FadeView } from './FadeView';
import { navigateWithDisabledBack } from './Utilities';
import { loadFromDatabase } from './Database';

/**
 * Enter a pin for the new wallet
 */
export class SetPinScreen extends React.Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);
    }
    
    /* Pin entered, go create a wallet */
    continue(pinCode) {
        Globals.pinCode = pinCode;
        this.props.navigation.dispatch(navigateWithDisabledBack('CreateWallet'));
    }

    render() {
        const subtitle = `to keep your ${Config.coinName} secure`;

        return(
            <View style={{flex: 1}}>
                <PINCode
                    status={'choose'}
                    finishProcess={this.continue.bind(this)}
                    subtitleChoose={subtitle}
                    passwordLength={6}
                    touchIDDisabled={true}
                />
            </View>
        );
    }
}

/**
 * Prompt for the stored pin to unlock the wallet
 */
export class RequestPinScreen extends React.Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);
    }

    /**
     * Called once the pin has been correctly been entered
     */
    async continue(pinCode) {
        (async () => {
            Globals.pinCode = pinCode;

            /* Wallet already loaded, probably from previous launch, then
               sending app to background. */
            if (Globals.wallet !== undefined) {
                this.props.navigation.dispatch(navigateWithDisabledBack('Home'));
            }

            /* Decrypt wallet data from DB */
            let walletData = await loadFromDatabase(pinCode);

            const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);

            /* Load from JSON if we got it from the DB */
            if (walletData !== undefined) {
                let wallet = WalletBackend.loadWalletFromJSON(daemon, walletData);

                /* TODO: Dedupe this stuff */
                if (wallet instanceof WalletBackend) {
                    Globals.wallet = wallet;
                    this.props.navigation.dispatch(navigateWithDisabledBack('Home'));
                } else {
                    console.log('Error loading wallet: ' + wallet);
                    this.props.navigation.dispatch(navigateWithDisabledBack('Create'));
                }
            } else {
                console.log('Wallet not found in DB...');

                /* TODO: Clear DB, or something, this will infinite loop rn */
                this.props.navigation.dispatch(navigateWithDisabledBack('Create'));
            }
        })().catch(err => {
            console.log('Error loading from DB: ' + err);

            /* TODO: Clear DB, or something, this will infinite loop rn */
            this.props.navigation.dispatch(navigateWithDisabledBack('Create'));
        });
    }

    render() {
        return(
            /* Fade in over 1.5 secs */
            <FadeView duration={1500} startValue={0.2} style={{flex: 1}}>
                <PINCode
                    status={'enter'}
                    finishProcess={this.continue.bind(this)}
                    subtitleEnter="to unlock your wallet"
                    passwordLength={6}
                    touchIDDisabled={true}
                />
            </FadeView>
        );
    }
}
