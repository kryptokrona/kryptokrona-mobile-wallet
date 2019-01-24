// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import * as _ from 'lodash';

import React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';

import Entypo from 'react-native-vector-icons/Entypo';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode';

import {
    StyleSheet, Text, View, Image, Button, Clipboard, Animated,
} from 'react-native';

import {
    createStackNavigator, createAppContainer, createBottomTabNavigator,
    NavigationActions, StackActions,
} from 'react-navigation';

import { 
    BlockchainCacheApi, ConventionalDaemon, WalletBackend, LogLevel
} from 'turtlecoin-wallet-backend';

import config from './Config';
import { saveToDatabase, loadFromDatabase } from './Database';
import { Spinner } from './Spinner';
import { FadeView } from './FadeView';
import { delay, toastPopUp, TextFixedWidth } from './Utilities';

/* Blegh - we need to access our wallet from everywhere, really */
let wallet = undefined;

/**
 * Launch screen. See if the user has a pin, if so, request pin to unlock.
 * Otherwise, go to the create/import screen
 */
class SplashScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        (async () => {
            let hasPinCode: false;

            /* See if the user has set a pin code. If they have, they should
               have a corresponding saved wallet */
            if (await hasUserSetPinCode()) {
                hasPinCode = true;
            }

            /* Above operation takes some time. Loading animation is pretty ugly
               if it only stays for 0.5 seconds, and too slow if we don't have
               any animation at all..
               This way it looks nice, even if delaying interaction by a couple
               of seconds */
            await delay(2000);

            /* Get the pin, or create a wallet if no pin */
            this.props.navigation.dispatch(navigateWithDisabledBack(hasPinCode ? 'RequestPin' : 'Create'));

        })().catch(err => {
            console.log('Error loading from DB: ' + err);
            this.props.navigation.dispatch(navigateWithDisabledBack('Create'));
        });
    }

    render() {
        return(
            /* Fade in a spinner logo */
            <FadeView startValue={1} endValue={0} style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}>
                <Spinner></Spinner>
            </FadeView>
        );
    }
}

/**
 * Prompt for the stored pin to unlock the wallet
 */
class RequestPinScreen extends React.Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);
    }

    /**
     * Called once the pin has been correctly been entered
     */
    async continue(pinCode) {
        (async () => {
            /* Decrypt wallet data from DB */
            let walletData = await loadFromDatabase(pinCode);

            const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);

            /* Load from JSON if we got it from the DB */
            if (walletData !== undefined) {
                wallet = WalletBackend.loadWalletFromJSON(daemon, walletData);

                /* TODO: Dedupe this stuff */
                if (wallet instanceof WalletBackend) {
                    this.props.navigation.dispatch(navigateWithDisabledBack('Home'));
                } else {
                    console.log('Error loading wallet: ' + wallet);
                    this.props.navigation.dispatch(navigateWithDisabledBack('Create'));
                }
            } else {
                console.log('Wallet not found in DB...');

                /* TODO: Clear DB, or something, this will infinite loop rn */
                this.props.navigation.dispatch(navigateWithDisabledBack('Create'));
            }
        })().catch(err => {
            console.log('Error loading from DB: ' + err);

            /* TODO: Clear DB, or something, this will infinite loop rn */
            this.props.navigation.dispatch(navigateWithDisabledBack('Create'));
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

/**
 * Create or import a wallet
 */
class CreateScreen extends React.Component {
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
                        style={styles.logo}
                    />
                    <Text style={{fontSize: 20}}>
                        Fast. Safe. Easy.
                    </Text>
                </View>

                <View style={[styles.buttonContainer, {bottom: 100, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Create New Wallet'
                        /* Request a pin for the new wallet */
                        onPress={() => this.props.navigation.navigate('SetPin')}
                        color={config.theme.primaryColour}
                    />
                </View>

                <View style={[styles.buttonContainer, {bottom: 40, position: 'absolute', alignItems: 'stretch', justifyContent: 'center', width: '100%'}]}>
                    <Button
                        title='Recover Wallet'
                        /* Get the import data */
                        onPress={() => this.props.navigation.navigate('ImportWallet')}
                        color={config.theme.primaryColour}
                    />
                </View>

            </FadeView>
        );
    }
}

/**
 * Enter a pin for the new wallet
 */
class SetPinScreen extends React.Component {
    static navigationOptions = {
        header: null,
    }

    constructor(props) {
        super(props);
    }
    
    /* Pin entered, go create a wallet */
    continue(pinCode) {
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

/**
 * Create a new wallet
 */
class CreateWalletScreen extends React.Component {
    static navigationOptions = {
        title: 'Create',
    };

    constructor(props) {
        super(props);

        const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);
        wallet = WalletBackend.createWallet(daemon);

        /* Encrypt wallet with pincode in DB */
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
                        /* Go to the menu screen */
                        onPress={() => this.props.navigation.dispatch(navigateWithDisabledBack('Home'))}
                        color={config.theme.primaryColour}
                    />
                </View>
            </View>
        );
    }
}

/**
 * Import a wallet from keys/seed
 */
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

/**
 * Sync screen, balance
 */
class MainScreen extends React.Component {
    static navigationOptions = {
        title: 'Wallet',
    };

    constructor(props) {
        super(props);

        /* Start syncing */
        wallet.start();

        wallet.setLogLevel(LogLevel.DEBUG);

        const [walletHeight, localHeight, networkHeight] = wallet.getSyncStatus();

        this.state = {
            wallet,
            walletHeight,
            localHeight,
            networkHeight,
        };
    }

    tick() {
        const [walletHeight, localHeight, networkHeight] = wallet.getSyncStatus();

        this.setState({
            walletHeight,
            localHeight,
            networkHeight,
        });
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                <Text>
                    Sync status: {this.state.walletHeight} / {this.state.networkHeight}{"\n"}
                    Network sync status: {this.state.localHeight} / {this.state.networkHeight}
                </Text>
            </View>
        );
    }
}

/**
 * List of transactions sent + recieved
 */
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

/**
 * Send a transaction
 */
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

/**
 * Fuck w/ stuff
 */
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

/**
 * Bottom tabs for our main screens
 */
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

                if (routeName === 'Main') {
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

/**
 * Forward/back navigation for before we reach the main menu with tabs
 */
const MenuNavigator = createStackNavigator(
    {
        Create: CreateScreen,
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
