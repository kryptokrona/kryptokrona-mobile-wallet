// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import * as _ from 'lodash';

import React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PINCode from '@haskkor/react-native-pincode';
import { hasUserSetPinCode } from '@haskkor/react-native-pincode';

import {
    StyleSheet, Text, View, Image, Button, Platform, Clipboard, ToastAndroid,
    Animated,
} from 'react-native';

import {
    createStackNavigator, createAppContainer, createBottomTabNavigator,
    NavigationActions, StackActions,
} from 'react-navigation';

import { 
    BlockchainCacheApi, ConventionalDaemon, WalletBackend
} from 'turtlecoin-wallet-backend';

import config from './Config';
import { saveToDatabase, loadFromDatabase } from './Database';

/* Blegh - we need to access our wallet from everywhere, really */
let wallet = undefined;

class SplashScreen extends React.Component {
    static navigationOptions = {
        title: 'SplashScreen',
        header: null,
    };

    constructor(props) {
        super(props);

        (async () => {
            if (await hasUserSetPinCode()) {
                this.props.navigation.dispatch(navigateWithDisabledBack('RequestPin'));
            } else {
                this.props.navigation.dispatch(navigateWithDisabledBack('Load'));
            }
        })().catch(err => {
            console.log('Error loading from DB: ' + err);
            this.props.navigation.dispatch(navigateWithDisabledBack('Load'));
        });
    }

    render() {
        return(
            <View style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}>
                <Spinner></Spinner>
            </View>
        )
    }
}

class Spinner extends React.Component {
    constructor(props) {
        super(props);
        this.animation = new Animated.Value(0);
    }

    componentDidMount() {
        Animated.loop(
            Animated.timing(this.animation, {toValue: 1, duration: 2000, useNativeDriver: true})
        ).start();
    }

    render() {
        const rotation = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        return(
            <Animated.View style={{transform: [{rotate: rotation}], justifyContent: 'center', alignItems: 'center'}}>
                <Image
                    source={require('../assets/img/spinner.png')}
                    style={{resizeMode: 'contain', width: 200, height: 200}}
                />
            </Animated.View>
        );
    }
}

class RequestPinScreen extends React.Component {
    static navigationOptions = {
        title: 'Set Pin',
        header: null,
    }

    constructor(props) {
        super(props);
    }
    
    async continue(pinCode) {
        (async () => {
            /* Decrypt wallet data from DB */
            let walletData = await loadFromDatabase(pinCode);

            const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);

            /* Load from JSON if we got it from the DB */
            if (walletData !== undefined) {
                wallet = WalletBackend.loadWalletFromJSON(daemon, walletData);

                this.props.navigation.dispatch(navigateWithDisabledBack('Home'));
            }
        })().catch(err => {
            console.log('Error loading from DB: ' + err);

            /* TODO: Clear DB, or something, this will infinite loop rn */
            this.props.navigation.dispatch(navigateWithDisabledBack('Load'));
        });
    }

    render() {
        return(
            <View style={{flex: 1}}>
                <PINCode
                    status={'enter'}
                    finishProcess={this.continue.bind(this)}
                    subtitleChoose="to unlock your wallet"
                    passwordLength={6}
                    touchIDDisabled={true}
                />
            </View>
        );
    }
}

class LoadScreen extends React.Component {
    static navigationOptions = {
        title: 'Load',
        header: null,
    };

    constructor(props) {
        super(props);
    }

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
        /* TODO: Save wallet with pin here */
        this.props.navigation.dispatch(navigateWithDisabledBack('CreateWallet', {pinCode: pinCode}));
    }

    render() {
        const subtitle = `to keep your ${config.coinName} secure`;

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

class CreateWalletScreen extends React.Component {
    static navigationOptions = {
        title: 'Create',
    };

    constructor(props) {
        super(props);

        const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);
        wallet = WalletBackend.createWallet(daemon);
        saveToDatabase(wallet, this.props.navigation.state.params.pinCode);

        this.state = {
            daemon,
            wallet,
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
                        onPress={() => this.props.navigation.dispatch(navigateWithDisabledBack('RequestPin'))}
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

        this.state = {
            wallet: wallet
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

/* Navigate to a route, resetting the stack, so the user cannot go back.
   We want to do this so when we go from the splash screen to the menu screen,
   the user can't return, and get stuck there. */
function navigateWithDisabledBack(route, routeParams) {
    return StackActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({ 
                routeName: route,
                params: routeParams,
            }),
        ]
    });
}

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
        RequestPin: RequestPinScreen,
        Splash: SplashScreen,
        CreateWallet: CreateWalletScreen,
        ImportWallet: ImportWalletScreen,
        Home: TabNavigator,
    },
    {
        initialRouteName: 'Splash',
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
