// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import React from 'react';

import { View, StatusBar } from 'react-native';

import {
    createStackNavigator, createAppContainer, createBottomTabNavigator,
    createSwitchNavigator,
} from 'react-navigation';

import Config from './Config';

import { Themes } from './Themes';
import { Globals } from './Globals';
import { MainScreen } from './MainScreen';
import { SplashScreen } from './SplashScreen';
import { DisclaimerScreen } from './DisclaimerScreen';
import { loadPreferencesFromDatabase, openDB } from './Database';
import { ModifyPayeeScreen, RecipientsScreen } from './Recipients';
import { WalletOptionScreen, CreateWalletScreen } from './CreateScreen';
import { TransactionsScreen, TransactionDetailsScreen } from './TransactionsScreen';

import {
    SetPinScreen, RequestPinScreen, ForgotPinScreen, RequestHardwareAuthScreen,
    ChooseAuthMethodScreen,
} from './Authenticate';

import {
    SettingsScreen, SwapCurrencyScreen, ExportKeysScreen, LoggingScreen, FaqScreen,
    DisableDozeScreen, SwapNodeScreen, OptimizeScreen,
} from './SettingsScreen';

import {
    PickMonthScreen, PickBlockHeightScreen, PickExactBlockHeightScreen,
} from './ScanHeightScreen';

import {
    TransferScreen, ChoosePayeeScreen, NewPayeeScreen, ConfirmScreen,
    QrScannerScreen, SendTransactionScreen,
} from './TransferScreen';

import {
    ImportWalletScreen, ImportKeysOrSeedScreen, ImportSeedScreen,
    ImportKeysScreen,
} from './ImportScreen';

/* Transactions screen and more info on transactions */
const TransactionNavigator = createStackNavigator(
    {
        Transactions: TransactionsScreen,
        TransactionDetails: TransactionDetailsScreen,
    },
    {
        initialRouteName: 'Transactions',
        headerLayoutPreset: 'center',
        defaultNavigationOptions: {
            headerTitleStyle: {
                fontWeight: 'bold',
                color: 'Themes.darkMode.primaryColour',
            },
            headerTransparent: true,
            headerTintColor: Themes.darkMode.primaryColour,
        },
    }
);

TransactionNavigator.navigationOptions = ({ navigation, screenProps }) => ({
    tabBarOptions: {
        activeBackgroundColor: screenProps.theme.backgroundColour,
        inactiveBackgroundColor: screenProps.theme.backgroundColour,
        activeTintColor: screenProps.theme.primaryColour,
        inactiveTintColor: screenProps.theme.slightlyMoreVisibleColour,
    }
});

const TransferNavigator = createStackNavigator(
    {
        Transfer: TransferScreen,
        ChoosePayee: ChoosePayeeScreen,
        NewPayee: NewPayeeScreen,
        Confirm: ConfirmScreen,
        QrScanner: QrScannerScreen,
        SendTransaction: SendTransactionScreen,
        RequestPin: RequestPinScreen,
        RequestHardwareAuth: RequestHardwareAuthScreen,
    },
    {
        initialRouteName: 'ChoosePayee',
        headerLayoutPreset: 'center',
        defaultNavigationOptions: {
            headerTitleStyle: {
                fontWeight: 'bold',
                color: Themes.darkMode.primaryColour,
            },
            headerTransparent: true,
            headerTintColor: Themes.darkMode.primaryColour,
        },
    }
);

TransferNavigator.navigationOptions = ({ navigation, screenProps }) => {
    return {
        tabBarVisible: navigation.state.index === 0, /* Only show tab bar on ChoosePayee */
        tabBarOptions: {
            activeBackgroundColor: screenProps.theme.backgroundColour,
            inactiveBackgroundColor: screenProps.theme.backgroundColour,
            activeTintColor: screenProps.theme.primaryColour,
            inactiveTintColor: screenProps.theme.slightlyMoreVisibleColour,
        }
    };
};

const SettingsNavigator = createStackNavigator(
    {
        Settings: SettingsScreen,
        SwapCurrency: SwapCurrencyScreen,
        SwapNode: SwapNodeScreen,
        ExportKeys: ExportKeysScreen,
        Logging: LoggingScreen,
        Faq: FaqScreen,
        DisableDoze: DisableDozeScreen,
        RequestPin: RequestPinScreen,
        ForgotPin: ForgotPinScreen,
        SetPin: SetPinScreen,
        ChooseAuthMethod: ChooseAuthMethodScreen,
        RequestHardwareAuth: RequestHardwareAuthScreen,
        Optimize: OptimizeScreen,
    },
    {
        initialRouteName: 'Settings',
        headerLayoutPreset: 'center',
        defaultNavigationOptions: {
            headerTitleStyle: {
                fontWeight: 'bold',
                color: Themes.darkMode.primaryColour,
            },
            headerTransparent: true,
            headerTintColor: Themes.darkMode.primaryColour,
        },
    }
);

SettingsNavigator.navigationOptions = ({ navigation, screenProps }) => ({
    tabBarOptions: {
        activeBackgroundColor: screenProps.theme.backgroundColour,
        inactiveBackgroundColor: screenProps.theme.backgroundColour,
        activeTintColor: screenProps.theme.primaryColour,
        inactiveTintColor: screenProps.theme.slightlyMoreVisibleColour,
    }
});

const RecipientNavigator = createStackNavigator(
    {
        Recipients: RecipientsScreen,
        ModifyPayee: ModifyPayeeScreen,
        NewPayee: NewPayeeScreen,
    },
    {
        initialRouteName: '',
        headerLayoutPreset: 'center',
        defaultNavigationOptions: {
            headerTitleStyle: {
                fontWeight: 'bold',
                color: Themes.darkMode.primaryColour,
            },
            headerTransparent: true,
            headerTintColor: Themes.darkMode.primaryColour,
        },
    }
);

RecipientNavigator.navigationOptions = ({ navigation, screenProps }) => ({
    tabBarOptions: {
        activeBackgroundColor: screenProps.theme.backgroundColour,
        inactiveBackgroundColor: screenProps.theme.backgroundColour,
        activeTintColor: screenProps.theme.primaryColour,
        inactiveTintColor: screenProps.theme.slightlyMoreVisibleColour,
    }
});

/* Main screen for a logged in wallet */
const HomeNavigator = createBottomTabNavigator(
    {
        Main: MainScreen,
        Transactions: TransactionNavigator,
        Transfer: TransferNavigator,
        Recipients: RecipientNavigator,
        Settings: SettingsNavigator,
    },
    {
        initialRouteName: 'Main',
        tabBarOptions: {
            activeTintColor: "Themes.darkMode.primaryColour",

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
                } else if (routeName === 'Recipients') {
                    IconComponent = SimpleLineIcons;
                    iconName = 'people';
                } else if (routeName === 'Settings') {
                    IconComponent = Ionicons;
                    iconName = 'ios-settings';
                }

                return <IconComponent name={iconName} size={25} color={tintColor}/>;
            },
        }),
    }
);

/* Login or create/import a wallet */
const LoginNavigator = createStackNavigator(
    {
        /* Create a wallet */
        CreateWallet: CreateWalletScreen,

        /* Set a pin for the created wallet */
        SetPin: SetPinScreen,

        /* Request the pin for an existing wallet */
        RequestPin: RequestPinScreen,

        /* Allow deleting the wallet if pin forgotten */
        ForgotPin: ForgotPinScreen,

        /* Launcing screen */
        Splash: SplashScreen,

        /* Create a wallet, import a wallet */
        WalletOption: WalletOptionScreen,

        /* Import a wallet */
        ImportWallet: ImportWalletScreen,

        /* Pick between seed or keys */
        ImportKeysOrSeed: ImportKeysOrSeedScreen,

        /* Import with a mnemonic seed */
        ImportSeed: ImportSeedScreen,

        /* Import with a set of keys */
        ImportKeys: ImportKeysScreen,

        /* Pick a month to start the wallet scanning from */
        PickMonth: PickMonthScreen,

        /* Pick a block range to start the wallet scanning from */
        PickBlockHeight: PickBlockHeightScreen,

        /* Pick a specific height to start the wallet scanning from */
        PickExactBlockHeight: PickExactBlockHeightScreen,

        /* Explain fee, I'm not responsible for anything, etc */
        Disclaimer: DisclaimerScreen,

        /* Request authentication via fingerprint, touchid, etc */
        RequestHardwareAuth: RequestHardwareAuthScreen,

        /* Whether we should use pin, fingerprint, or no auth */
        ChooseAuthMethod: ChooseAuthMethodScreen,
    },
    {
        initialRouteName: 'Splash',
        headerLayoutPreset: 'center',
        defaultNavigationOptions: {
            headerTitleStyle: {
                fontWeight: 'bold',
                color: Themes.darkMode.primaryColour,
            },
            headerTransparent: true,
            headerTintColor: Themes.darkMode.primaryColour,
        },
    }
);

const AppContainer = createAppContainer(createSwitchNavigator(
    {
        Login: {
            screen: LoginNavigator,
        },
        Home: {
           screen: HomeNavigator,
        },
    },
    {
        initialRouteName: 'Login',
    }
));

/* TODO: Need to load preferences to set theme */
export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            loaded: false,
            screenProps: {
                theme: Themes[Globals.preferences.theme],
            },
        }

        this.init();
    }

    async init() {
        await openDB();

        const prefs = await loadPreferencesFromDatabase();

        if (prefs !== undefined) {
            Globals.preferences = prefs;
        }

        this.setState({
            screenProps: {
                theme: Themes[Globals.preferences.theme],
            },
            loaded: true,
        });

        Globals.updateTheme = () => {
            this.setState({
                screenProps: {
                    theme: Themes[Globals.preferences.theme],
                }
            });
        };
    }


    render() {
        const loadedComponent = <AppContainer screenProps={this.state.screenProps}/>;
        const notLoadedComponent = <View></View>;

        return(
            <View style={{ flex: 1 }}>
            <StatusBar hidden />
                {this.state.loaded ? loadedComponent : notLoadedComponent}
            </View>
        );
    }
}
