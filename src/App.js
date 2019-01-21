// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import * as _ from 'lodash';

import React from 'react';

import {
    StyleSheet, Text, View, Image, Button, Platform, Clipboard, ToastAndroid
} from 'react-native';

import { createStackNavigator, createAppContainer } from 'react-navigation';

import { 
    BlockchainCacheApi, ConventionalDaemon, WalletBackend
} from 'turtlecoin-wallet-backend';

class HomeScreen extends React.Component {
    static navigationOptions = {
        title: 'Home',
    };

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={styles.logo}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title='Create a wallet'
                        onPress={() => this.props.navigation.navigate('CreateWallet')}
                        color='#40C18E'
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title='Open a wallet'
                        onPress={() => this.props.navigation.navigate('OpenWallet')}
                        color='#40C18E'
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title='Import a wallet'
                        onPress={() => this.props.navigation.navigate('ImportWallet')}
                        color='#40C18E'
                    />
                </View>

            </View>
        );
    }
}

class CreateWalletScreen extends React.Component {
    static navigationOptions = {
        title: 'Create',
    };

    constructor(props) {
        super(props);

        const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);
        const wallet = WalletBackend.createWallet(daemon);

        this.state = {
            daemon,
            wallet
        };
    }

    render() {
        return(
            <View style={{flex: 1, alignItems: 'stretch', justifyContent: 'flex-start'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={styles.logo}
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
                    <SeedComponent seed={this.state.wallet.getMnemonicSeed()}>
                    </SeedComponent>
                </View>

                <View style={[styles.buttonContainer, {bottom: 30, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Continue'
                        onPress={() => this.props.navigation.navigate('Main', {
                            wallet: this.state.wallet
                        })}
                        color='#40C18E'
                    />
                </View>
            </View>
        );
    }
}

class SeedComponent extends React.Component {
    constructor(props) {
        super(props);

        const { navigation } = this.props;

        this.state = {
            wallet: props.wallet
        };
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

function toastPopUp(message) {
    /* IOS doesn't have toast support */
    /* TODO */
    if (Platform.OS === 'ios') {
        return;
    }

    ToastAndroid.show(message, ToastAndroid.SHORT);
}

class CopyButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={[styles.buttonContainer, {alignItems: 'flex-end', padding: 0, marginTop: 5}]}>
                <Button
                    title='Copy'
                    onPress={() => {
                        Clipboard.setString(this.props.seed);
                        toastPopUp('Seed copied');
                    }}
                    color='#40C18E'
                />
            </View>
        );
    }
}

function prettyPrintSeed(seed) {
    let result = '';
    let i = 1;

    for (const word of seed.split(' ')) {
        result += word + ' ';

        if (i % 5 == 0) {
            result += '\n';
        }

        i++;
    }

    return result;
}

function TextFixedWidth ({ children }) {
    const fontFamily = Platform.OS === 'ios' ? 'Courier' : 'monospace'

    return (
        <Text style={{fontFamily}}>{ children }</Text>
    )
}

class OpenWalletScreen extends React.Component {
    static navigationOptions = {
        title: 'Open',
    };

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={styles.logo}
                    />
                </View>
                <Text>Open a wallet!</Text>
            </View>
        );
    }
}

class ImportWalletScreen extends React.Component {
    static navigationOptions = {
        title: 'Import',
    };
    
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={styles.logo}
                    />
                </View>
                <Text>Import a wallet!</Text>
            </View>
        );
    }
}

class MainScreen extends React.Component {
    static navigationOptions = {
        title: 'Wallet',
    };

    constructor(props) {
        super(props);

        const { navigation } = this.props;

        this.state = {
            wallet: navigation.getParam('wallet'),
        };
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={styles.logo}
                    />
                </View>
                <Text>Your wallet address: {this.state.wallet.getPrimaryAddress()}</Text>
            </View>
        );
    }
}

const AppNavigator = createStackNavigator(
    {
        Home: HomeScreen,
        CreateWallet: CreateWalletScreen,
        OpenWallet: OpenWalletScreen,
        ImportWallet: ImportWalletScreen,
        Main: MainScreen,
    },
    {
        initialRouteName: 'Home',
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: '#40C18E',
            },
            headerTintColor: 'white',
            headerTitleStyle: {
                fontWeight: 'bold',
                color: 'white'
            }
        }
    }
);

const styles = StyleSheet.create({
    logo: {
        resizeMode: 'contain',
        width: 300,
        height: 150
    },
    buttonContainer: {
        borderRadius: 10,
        padding: 10,
        shadowColor: '#000000',
        shadowOffset: {
            width: 0,
            height: 3
        },
        shadowRadius: 10,
        shadowOpacity: 0.25
    }
});

const AppContainer = createAppContainer(AppNavigator);

export default class App extends React.Component {
    render() {
        return <AppContainer/>;
    }
}
