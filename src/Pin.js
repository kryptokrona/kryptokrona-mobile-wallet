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
    
    continue(pinCode) {
        Globals.pinCode = pinCode;
        /* Continue on to create or import a wallet */
        this.props.navigation.dispatch(navigateWithDisabledBack(this.props.navigation.state.params.nextRoute));
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

    fail(msg) {
        console.log(msg);
        this.props.navigation.dispatch(navigateWithDisabledBack('WalletOption'));
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
                this.props.navigation.navigate('Home');
            }

            /* Decrypt wallet data from DB */
            let walletData = await loadFromDatabase(pinCode);

            const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);

            if (walletData === undefined) {
                this.fail('Wallet not found in DB...');
                return;
            }

            let wallet = WalletBackend.loadWalletFromJSON(daemon, walletData, Config);

            if (wallet instanceof WalletBackend) {
                Globals.wallet = wallet;
                this.props.navigation.navigate('Home');
            } else {
                this.fail('Error loading wallet: ' + wallet);
                return;
            }
        })().catch(err => {
            this.fail('Error loading from DB: ' + err);
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
