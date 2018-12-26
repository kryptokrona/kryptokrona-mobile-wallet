// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import './shim';

import React from 'react';
import { StyleSheet, Text, View, Image, Button } from 'react-native';
import { createStackNavigator, createAppContainer } from 'react-navigation';

import CryptoUtils from 'turtlecoin-utils';

const CN = new CryptoUtils();

/*
import CryptoNote from './bundle';

const CN = new CryptoNote();
*/

class HomeScreen extends React.Component {
    static navigationOptions = {
        title: 'Home',
    };

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('./assets/img/logo.png')}
                        style={styles.logo}
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Create a wallet"
                        onPress={() => this.props.navigation.navigate('CreateWallet')}
                        color='#40C18E'
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Open a wallet"
                        onPress={() => this.props.navigation.navigate('OpenWallet')}
                        color='#40C18E'
                    />
                </View>

                <View style={styles.buttonContainer}>
                    <Button
                        title="Import a wallet"
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

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('./assets/img/logo.png')}
                        style={styles.logo}
                    />
                </View>
                <Text style={{fontWeight: 'bold'}}>Your New Wallet:</Text>
                <AddressComponent></AddressComponent>
                <Text style={{color: 'red', padding: 10}}>Please save the seed and/or keys somewhere safe, so you can restore your wallet later</Text>
            </View>
        );
    }
}

class AddressComponent extends React.Component {
    constructor(props) {
        super(props);

        console.log('Creating address: ' + new Date());

        const addressData = CN.createNewAddress();

        console.log('Finished created address: ' + new Date());

        console.log(addressData);

        this.state = {
            address: addressData.address,
            privateSpendKey: addressData.spend.privateKey,
            privateViewKey: addressData.view.privateKey,
            mnemonicSeed: addressData.mnemonic,
        }
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingHorizontal: 15}}>
                <Text style={{fontWeight: 'bold', padding: 10}}>
                    Address:{'\n'}
                    <Text style={{fontWeight: 'normal'}}>
                        {this.state.address}
                    </Text>
                </Text>

                <Text style={{fontWeight: 'bold', padding: 10}}>
                    Mnemonic Seed:{'\n'}
                    <Text style={{fontWeight: 'normal'}}>
                        {this.state.mnemonicSeed}
                    </Text>
                </Text>

                <Text style={{fontWeight: 'bold', padding: 10}}>
                    Private Spend Key:{'\n'}
                    <Text style={{fontWeight: 'normal'}}>
                        {this.state.privateSpendKey}
                    </Text>
                </Text>

                <Text style={{fontWeight: 'bold', padding: 10}}>
                    Private View Key:{'\n'}
                    <Text style={{fontWeight: 'normal'}}>
                        {this.state.privateViewKey}
                    </Text>
                </Text>
            </View>
        );
    }
}

class OpenWalletScreen extends React.Component {
    static navigationOptions = {
        title: 'Open',
    };

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('./assets/img/logo.png')}
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

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('./assets/img/logo.png')}
                        style={styles.logo}
                    />
                </View>
                <Text>Import a wallet!</Text>
            </View>
        );
    }
}

const AppNavigator = createStackNavigator(
    {
        Home: HomeScreen,
        CreateWallet: CreateWalletScreen,
        OpenWallet: OpenWalletScreen,
        ImportWallet: ImportWalletScreen
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
