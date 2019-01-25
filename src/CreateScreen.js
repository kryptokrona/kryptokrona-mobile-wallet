// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import * as _ from 'lodash';

import React from 'react';

import {
    View, Text, Button, StyleSheet, Image, Clipboard
} from 'react-native';

import {
    BlockchainCacheApi, WalletBackend
} from 'turtlecoin-wallet-backend';

import Globals from './Globals';
import Config from './Config';

import { FadeView } from './FadeView';
import { saveToDatabase } from './Database';
import { TextFixedWidth, toastPopUp, navigateWithDisabledBack } from './Utilities';
import { Styles } from './Styles';

/**
 * Create or import a wallet
 */
export class CreateScreen extends React.Component {
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
                        onPress={() => this.props.navigation.navigate('SetPin')}
                        color={Config.theme.primaryColour}
                    />
                </View>

                <View style={[Styles.buttonContainer, {bottom: 40, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Recover Wallet'
                        /* Get the import data */
                        onPress={() => this.props.navigation.navigate('ImportWallet')}
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
    };

    constructor(props) {
        super(props);

        const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);
        Globals.wallet = WalletBackend.createWallet(daemon);

        /* Encrypt wallet with pincode in DB */
        saveToDatabase(Globals.wallet, Globals.pinCode);

        this.state = {
            daemon,
        };
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
                    <SeedComponent seed={Globals.wallet.getMnemonicSeed()}>
                    </SeedComponent>
                </View>

                <View style={[Styles.buttonContainer, {bottom: 30, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Continue'
                        /* Go to the menu screen */
                        onPress={() => this.props.navigation.dispatch(navigateWithDisabledBack('Home'))}
                        color={Config.theme.primaryColour}
                    />
                </View>
            </View>
        );
    }
}

/**
 * Display the seed in a nice way
 */
class SeedComponent extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const split = this.props.seed.split(' ');
        const lines = _.chunk(split, 5);

        return(
            <View>
                <View style={{alignItems: 'center', marginTop: 10, borderWidth: 1, borderColor: 'red', padding: 10}}>
                    <TextFixedWidth>{lines[0].join(' ')}</TextFixedWidth>
                    <TextFixedWidth>{lines[1].join(' ')}</TextFixedWidth>
                    <TextFixedWidth>{lines[2].join(' ')}</TextFixedWidth>
                    <TextFixedWidth>{lines[3].join(' ')}</TextFixedWidth>
                    <TextFixedWidth>{lines[4].join(' ')}</TextFixedWidth>
                </View>
                <CopyButton></CopyButton>
            </View>
        );
    }
}

/**
 * Copy the seed to clipboard
 */
class CopyButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={[Styles.buttonContainer, {alignItems: 'flex-end', padding: 0, marginTop: 5}]}>
                <Button
                    title='Copy'
                    onPress={() => {
                        Clipboard.setString(this.props.seed);
                        toastPopUp('Seed copied');
                    }}
                    color={Config.theme.primaryColour}
                />
            </View>
        );
    }
}
