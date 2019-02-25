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

import { FadeView } from './FadeView';
import { Globals } from './Globals';
import { navigateWithDisabledBack } from './Utilities';
import { loadFromDatabase, setHaveWallet } from './Database';

/**
 * Enter a pin for the new wallet
 */
export class SetPinScreen extends React.Component {
    static navigationOptions = {
        title: '',
    }

    constructor(props) {
        super(props);
    }
    
    continue(pinCode) {
        Globals.pinCode = pinCode;
        /* Continue on to create or import a wallet */
        this.props.navigation.navigate(this.props.navigation.state.params.nextRoute);
    }

    render() {
        const subtitle = `to keep your ${Config.coinName} secure`;

        return(
            <View style={{flex: 1}}>
                <PINCode
                    status={'choose'}
                    finishProcess={(pinCode) => this.continue(pinCode)}
                    subtitleChoose={subtitle}
                    passwordLength={6}
                    touchIDDisabled={true}
                    colorPassword={Config.theme.primaryColour}
                    stylePinCodeColorSubtitle={Config.theme.primaryColour}
                    stylePinCodeColorTitle={Config.theme.primaryColour}
                    stylePinCodeButtonCircle={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        backgroundColor: Config.theme.primaryColourLight,
                        borderRadius: 32
                    }}
                    stylePinCodeButtonNumber={Config.theme.primaryColour}
                    numbersButtonOverlayColor={Config.theme.secondaryColour}
                    stylePinCodeDeleteButtonColorShowUnderlay={Config.theme.primaryColour}
                    stylePinCodeDeleteButtonColorHideUnderlay={Config.theme.primaryColour}
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

    async fail(msg) {
        console.log(msg);

        /* So we don't infinite loop */
        await setHaveWallet(false);

        this.props.navigation.dispatch(navigateWithDisabledBack('Splash'));
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

            if (walletData === undefined) {
                await this.fail('Wallet not found in DB...');
            }

            const [wallet, error] = WalletBackend.loadWalletFromJSON(
                Config.defaultDaemon, walletData, Config
            );

            if (error) {
                await this.fail('Error loading wallet: ' + error);
            } else {
                Globals.wallet = wallet;
                this.props.navigation.navigate('Home');
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
                    finishProcess={(pinCode) => this.continue(pinCode)}
                    subtitleEnter="to unlock your wallet"
                    passwordLength={6}
                    touchIDDisabled={true}
                    colorPassword={Config.theme.primaryColour}
                    stylePinCodeColorSubtitle={Config.theme.primaryColour}
                    stylePinCodeColorTitle={Config.theme.primaryColour}
                    stylePinCodeButtonCircle={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        backgroundColor: Config.theme.primaryColourLight,
                        borderRadius: 32
                    }}
                    stylePinCodeButtonNumber={Config.theme.primaryColour}
                    numbersButtonOverlayColor={Config.theme.secondaryColour}
                    stylePinCodeDeleteButtonColorShowUnderlay={Config.theme.primaryColour}
                    stylePinCodeDeleteButtonColorHideUnderlay={Config.theme.primaryColour}
                />
            </FadeView>
        );
    }
}