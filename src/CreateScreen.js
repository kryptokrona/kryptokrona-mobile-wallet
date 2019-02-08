// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import {
    View, Text, Button, Image,
} from 'react-native';

import {
    BlockchainCacheApi, WalletBackend
} from 'turtlecoin-wallet-backend';

import Config from './Config';

import { Styles } from './Styles';
import { FadeView } from './FadeView';
import { saveToDatabase } from './Database';
import { updateCoinPrice } from './Currency';
import { CopyButton } from './SharedComponents';
import { Globals, initGlobals } from './Globals';
import { SeedComponent } from './SharedComponents';
import { navigateWithDisabledBack } from './Utilities';

/**
 * Create or import a wallet
 */
export class WalletOptionScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return(
            /* Fade in over 1.5 secs */
            <FadeView duration={1500} startValue={0.2} style={{ flex: 1, justifyContent: 'flex-start'}}>

                <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={Styles.logo}
                    />
                    <Text style={{fontSize: 20}}>
                        Fast. Safe. Easy.
                    </Text>
                </View>

                <View style={[Styles.buttonContainer, {bottom: 100, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Create New Wallet'
                        /* Request a pin for the new wallet */
                        onPress={() => this.props.navigation.navigate('Disclaimer', { nextRoute: 'CreateWallet' })}
                        color={Config.theme.primaryColour}
                    />
                </View>

                <View style={[Styles.buttonContainer, {bottom: 40, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Recover Wallet'
                        /* Get the import data */
                        onPress={() => this.props.navigation.navigate('Disclaimer', { nextRoute: 'ImportWallet' })}
                        color={Config.theme.primaryColour}
                    />
                </View>

            </FadeView>
        );
    }
}

/**
 * Create a new wallet
 */
export class CreateWalletScreen extends React.Component {
    static navigationOptions = {
        title: 'Create',
        header: null,
    };

    constructor(props) {
        super(props);
        
        (async () => {
            const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);

            Globals.wallet = WalletBackend.createWallet(daemon, Config);

            /* Encrypt wallet with pincode in DB */
            saveToDatabase(Globals.wallet, Globals.pinCode);

            await initGlobals();
        })();
    };

    render() {
        return(
            <View style={{flex: 1, alignItems: 'stretch', justifyContent: 'flex-start'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={Styles.logo}
                    />
                </View>

                <View style={{alignItems: 'center'}}>
                    <Text style={{margin: 10, textAlignVertical: 'center', textAlign: 'center'}}>
                        <Text style={{fontWeight: 'bold'}}>
                            Your wallet has been created!{"\n\n"}
                        </Text>
                        Please save the following backup words somewhere safe.{"\n\n"}
                        <Text style={{fontWeight: 'bold', color: 'red'}}>
                            Without this seed, if your phone gets lost, or your wallet gets corrupted,
                            you cannot restore your wallet, and your funds will be lost forever!
                        </Text>
                    </Text>
                    <SeedComponent
                        seed={Globals.wallet.getMnemonicSeed()}
                        borderColour={'red'}
                    />
                </View>

                <View style={[Styles.buttonContainer, {bottom: 30, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Continue'
                        /* Go to the menu screen */
                        onPress={() => this.props.navigation.navigate('Home')}
                        color={Config.theme.primaryColour}
                    />
                </View>
            </View>
        );
    }
}
