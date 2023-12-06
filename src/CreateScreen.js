// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import {
    View, Text, Button, Image,
} from 'react-native';

import { WalletBackend } from 'kryptokrona-wallet-backend-js';

import Config from './Config';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { saveToDatabase, savePreferencesToDatabase } from './Database';
import { XKRLogo } from './XKRLogo';
import { updateCoinPrice } from './Currency';
import { getBestNode, navigateWithDisabledBack } from './Utilities';
import { BottomButton, SeedComponent } from './SharedComponents';

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
            <View style={{ flex: 1, justifyContent: 'flex-start', backgroundColor: this.props.screenProps.theme.backgroundColour }}>
                <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 250}}>
                    <XKRLogo />
                    <Text style={{
                        fontSize: 28,
                        fontFamily: "Montserrat-Bold",
                        color: this.props.screenProps.theme.primaryColour,
                        textAlign: 'center'
                    }}>
                        kryptokrona {'\n'}
                    </Text>
                    <Text style={{
                        fontSize: 20,
                        fontFamily: "Montserrat-BoldItalic",
                        color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                        textAlign: 'center'
                    }}>
                         a nordic cryptocurrency
                    </Text>
                </View>

                <View style={[Styles.buttonContainer, {fontFamily: "Montserrat-Regular", bottom: 100, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Create New Wallet'
                        /* Request a pin for the new wallet */
                        onPress={() => this.props.navigation.navigate('Disclaimer', { nextRoute: 'CreateWallet' })}
                        color={this.props.screenProps.theme.buttonColour}
                    />
                </View>

                <View style={[Styles.buttonContainer, {bottom: 40, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Recover Wallet'
                        /* Get the import data */
                        onPress={() => this.props.navigation.navigate('Disclaimer', { nextRoute: 'ImportWallet' })}
                        color={this.props.screenProps.theme.buttonColour}
                    />
                </View>

            </View>
        );
    }
}
let changeNode = async () => {

    const node = await getBestNode();

    Globals.preferences.node = node.url + ':' + node.port + ':' + node.ssl;

    await savePreferencesToDatabase(Globals.preferences);

    Globals.wallet.swapNode(Globals.getDaemon());

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

        this.state = {
            seed: ''
        }

    };

    async componentDidMount() {

        const recommended_node = await getBestNode();
        Globals.preferences.node = recommended_node.url + ':' + recommended_node.port + ':' + recommended_node.ssl;
        savePreferencesToDatabase(Globals.preferences);

        Globals.wallet = await WalletBackend.createWallet(Globals.getDaemon(), Config);

        const [ seed ] = await Globals.wallet.getMnemonicSeed();

        this.setState({
            seed
        })

        /* Save wallet in DB */
        saveToDatabase(Globals.wallet);

        Globals.scanHeight = 0;

        changeNode();

    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', backgroundColor: this.props.screenProps.theme.backgroundColour }}>
                <View style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 60,
                    marginLeft: 30,
                    marginRight: 10,
                }}>
                    <Text style={{ color: this.props.screenProps.theme.primaryColour, fontSize: 25, marginBottom: 40, fontFamily: "Montserrat-SemiBold", }}>
                        Your wallet has been created!
                    </Text>

                    <Text style={{ fontFamily: "Montserrat-Regular",fontSize: 15, marginBottom: 20, color: this.props.screenProps.theme.slightlyMoreVisibleColour }}>
                        Please save the following backup words somewhere safe.
                    </Text>

                    <Text style={{ fontFamily: "Montserrat-SemiBold", color: '#BB4433', marginBottom: 20 }}>
                        Without this seed, if your phone gets lost, or your wallet gets corrupted,
                        you cannot restore your wallet, and your funds will be lost forever!
                    </Text>
                </View>

                <View style={{ alignItems: 'center', flex: 1, justifyContent: 'flex-start' }}>
                    {this.state.seed != '' && <SeedComponent
                        seed={this.state.seed}
                        borderColour={'#BB4433'}
                        {...this.props}
                    />}

                    <BottomButton
                        title="Continue"
                        onPress={() => this.props.navigation.navigate('Home')}
                        {...this.props}
                    />
                </View>

            </View>
        );
    }
}
