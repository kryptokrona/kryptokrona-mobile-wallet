// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import * as _ from 'lodash';

import React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PINCode from '@haskkor/react-native-pincode';

import {
    StyleSheet, Text, View, Image, Button, Platform, Clipboard, ToastAndroid
} from 'react-native';

import {
    createStackNavigator, createAppContainer, createBottomTabNavigator
} from 'react-navigation';

import { 
    BlockchainCacheApi, ConventionalDaemon, WalletBackend
} from 'turtlecoin-wallet-backend';

import config from './config';

/* Blegh - we need to access our wallet from everywhere, really */
let wallet = undefined;

class LoadScreen extends React.Component {
    static navigationOptions = {
        title: 'Load',
        header: null,
    };

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start'}}>

                <View style={{justifyContent: 'center', alignItems: 'center', marginTop: 50}}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={styles.logo}
                    />
                    <Text style={{fontSize: 20}}>
                        Fast. Safe. Easy.
                    </Text>
                </View>

                <View style={[styles.buttonContainer, {bottom: 100, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Create New Wallet'
                        onPress={() => this.props.navigation.navigate('SetPin')}
                        color={config.theme.primaryColour}
                    />
                </View>

                <View style={[styles.buttonContainer, {bottom: 40, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Recover Wallet'
                        onPress={() => this.props.navigation.navigate('ImportWallet')}
                        color={config.theme.primaryColour}
                    />
                </View>

            </View>
        );
    }
}

class SetPinScreen extends React.Component {
    static navigationOptions = {
        title: 'Set Pin',
        header: null,
    }

    constructor(props) {
        super(props);
    }
    
    continue(pinCode) {
        this.props.navigation.navigate('CreateWallet', {
            pinCode: pinCode
        });
    }

    render() {
        const subtitle = `To keep your ${config.coinName} secure`;

        return(
            <View style={{flex: 1}}>
                <PINCode
                    status={'choose'}
                    finishProcess={this.continue.bind(this)}
                    subtitleChoose={subtitle}
                    passwordLength={6}
                />
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
        wallet = WalletBackend.createWallet(daemon);
        /* TODO: Save wallet here, with pin */

        this.state = {
            daemon,
            wallet,
            pinCode: this.props.navigation.state.params.pinCode,
        };
    };

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
                        color={config.theme.primaryColour}
                    />
                </View>
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

        console.log(this.props.navigation);

        this.state = {
            wallet: this.props.navigation.state.params.wallet,
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

class TransactionsScreen extends React.Component {
    static navigationOptions = {
        title: 'Transactions',
    };

    constructor(props) {
        super(props);

        this.state = {
            wallet: wallet,
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

class TransferScreen extends React.Component {
    static navigationOptions = {
        title: 'Transfer',
    };

    constructor(props) {
        super(props);

        this.state = {
            wallet: wallet,
        }
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

class SettingsScreen extends React.Component {
    static navigationOptions = {
        title: 'Settings',
    };

    constructor(props) {
        super(props);

        this.state = {
            wallet: wallet,
        }
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

class SeedComponent extends React.Component {
    constructor(props) {
        super(props);

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
                    color={config.theme.primaryColour}
                />
            </View>
        );
    }
}

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

function TextFixedWidth ({ children }) {
    const fontFamily = Platform.OS === 'ios' ? 'Courier' : 'monospace'

    return (
        <Text style={{fontFamily}}>{ children }</Text>
    )
}

function toastPopUp(message) {
    /* IOS doesn't have toast support */
    /* TODO */
    if (Platform.OS === 'ios') {
        return;
    }

    ToastAndroid.show(message, ToastAndroid.SHORT);
}

const TabNavigator = createBottomTabNavigator(
    {
        Main: MainScreen,
        Transfer: TransferScreen,
        Transactions: TransactionsScreen,
        Settings: SettingsScreen
    },
    {
        initialRouteName: 'Main',
        tabBarOptions: {
            activeTintColor: config.theme.primaryColour,
        },
        defaultNavigationOptions: ({ navigation }) => ({
            tabBarIcon: ({focused, horizontal, tintColor}) => {
                const { routeName } = navigation.state;

                let iconName;
                let IconComponent;

                if (routeName === 'Load') {
                    IconComponent = MaterialCommunityIcons;
                    iconName = 'lock-open';
                } else if (routeName === 'Main') {
                    IconComponent = Entypo;
                    iconName = 'wallet';
                } else if (routeName === 'Transactions') {
                    IconComponent = Ionicons;
                    iconName = 'ios-list';
                } else if (routeName === 'Transfer') {
                    IconComponent = Ionicons;
                    iconName = 'ios-send';
                } else if (routeName === 'Settings') {
                    IconComponent = Ionicons;
                    iconName = 'ios-settings';
                }

                return <IconComponent name={iconName} size={25} color={tintColor}/>;
            },
        }),
    }
);

TabNavigator.navigationOptions = {
    header: null,
}

const MenuNavigator = createStackNavigator(
    {
        Load: LoadScreen,
        SetPin: SetPinScreen,
        CreateWallet: CreateWalletScreen,
        ImportWallet: ImportWalletScreen,
        Home: TabNavigator,
    },
    {
        initialRouteName: 'Load',
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: config.theme.primaryColour,
            },
            headerTintColor: 'white',
            headerTitleStyle: {
                fontWeight: 'bold',
                color: 'white'
            }
        },
    }
);

const MenuContainer = createAppContainer(MenuNavigator);

export default class App extends React.Component {
    render() {
        return <MenuContainer/>;
    }
}
