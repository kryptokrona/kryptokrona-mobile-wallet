// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import PINCode from '@haskkor/react-native-pincode';

import RNExitApp from 'react-native-exit-app';

import React from 'react';

import { WalletBackend } from 'turtlecoin-wallet-backend';

import { View, Alert, Text } from 'react-native';

import { Button } from 'react-native-elements';

import Config from './Config';

import { Globals } from './Globals';
import { FadeView } from './FadeView';
import { BottomButton } from './SharedComponents';
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
            <View style={{
                flex: 1,
                backgroundColor: this.props.screenProps.theme.backgroundColour
            }}>
                <PINCode
                    status={'choose'}
                    finishProcess={(pinCode) => this.continue(pinCode)}
                    subtitleChoose={subtitle}
                    passwordLength={6}
                    touchIDDisabled={true}
                    colorPassword={this.props.screenProps.theme.primaryColour}
                    stylePinCodeColorSubtitle={this.props.screenProps.theme.primaryColour}
                    stylePinCodeColorTitle={this.props.screenProps.theme.primaryColour}
                    stylePinCodeButtonCircle={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        backgroundColor: this.props.screenProps.theme.pinCodeBackgroundColour,
                        borderRadius: 32,
                    }}
                    stylePinCodeButtonNumber={this.props.screenProps.theme.pinCodeForegroundColour}
                    numbersButtonOverlayColor={this.props.screenProps.theme.secondaryColour}
                    stylePinCodeDeleteButtonColorShowUnderlay={this.props.screenProps.theme.primaryColour}
                    stylePinCodeDeleteButtonColorHideUnderlay={this.props.screenProps.theme.primaryColour}
                />
            </View>
        );
    }
}

export class ForgotPinScreen extends React.Component {
    static navigationOptions = {
        title: '',
    }

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{
                flex: 1,
                backgroundColor: this.props.screenProps.theme.backgroundColour,
            }}>
                <View style={{
                    flex: 1,
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 60,
                    backgroundColor: this.props.screenProps.theme.backgroundColour,
                }}>
                    <Text style={{
                        color: this.props.screenProps.theme.primaryColour,
                        fontSize: 25,
                        marginLeft: 30,
                        marginBottom: 20,
                    }}>
                        Your wallet is encrypted with your pin, so unfortunately, if you have forgotten your pin, it cannot be recovered.
                    </Text>
                    <Text style={{
                        color: this.props.screenProps.theme.primaryColour,
                        fontSize: 25,
                        marginLeft: 30
                    }}>
                        However, you can delete your wallet if you wish to create a new one.
                    </Text>
                </View>

                <BottomButton
                    title='Delete Wallet'
                    onPress={() => {
                        setHaveWallet(false);
                        this.props.navigation.dispatch(navigateWithDisabledBack('WalletOption'));
                    }}
                    buttonStyle={{
                        backgroundColor: 'red',
                        height: 50,
                        borderRadius: 0,
                    }}
                    {...this.props}
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
        Globals.logger.addLogMessage(msg);

        Alert.alert(
            'Failed to open wallet',
            msg + ' - Please report this error.',
            [
                {text: 'OK'},
            ]
        );
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
            let [walletData, dbError] = await loadFromDatabase(pinCode);

            if (dbError) {
                await this.fail(dbError);
                return;
            }

            const [wallet, walletError] = WalletBackend.loadWalletFromJSON(
                Config.defaultDaemon, walletData, Config
            );

            if (walletError) {
                await this.fail('Error loading wallet: ' + error);
            } else {
                Globals.wallet = wallet;
                this.props.navigation.navigate('Home');
            }
        })();
    }

    render() {
        return(
            /* Fade in over 1.5 secs */
            <View
                style={{
                    flex: 1,
                    backgroundColor: this.props.screenProps.theme.backgroundColour
                }}
            >
                <PINCode
                    status={'enter'}
                    finishProcess={(pinCode) => this.continue(pinCode)}
                    subtitleEnter="to unlock your wallet"
                    passwordLength={6}
                    touchIDDisabled={true}
                    colorPassword={this.props.screenProps.theme.primaryColour}
                    stylePinCodeColorSubtitle={this.props.screenProps.theme.primaryColour}
                    stylePinCodeColorTitle={this.props.screenProps.theme.primaryColour}
                    stylePinCodeButtonCircle={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 64,
                        height: 64,
                        backgroundColor: this.props.screenProps.theme.pinCodeBackgroundColour,
                        borderRadius: 32,
                    }}
                    stylePinCodeButtonNumber={this.props.screenProps.theme.pinCodeForegroundColour}
                    numbersButtonOverlayColor={this.props.screenProps.theme.secondaryColour}
                    stylePinCodeDeleteButtonColorShowUnderlay={this.props.screenProps.theme.primaryColour}
                    stylePinCodeDeleteButtonColorHideUnderlay={this.props.screenProps.theme.primaryColour}
                    onClickButtonLockedPage={() => RNExitApp.exitApp()}
                />

                <Button
                    title='Forgot PIN?'
                    onPress={() => {
                        this.props.navigation.navigate('ForgotPin');
                    }}
                    titleStyle={{
                        color: this.props.screenProps.theme.primaryColour,
                        textDecorationLine: 'underline',
                        marginBottom: 10,
                    }}
                    type='clear'
                />
            </View>
        );
    }
}
