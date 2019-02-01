// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import React from 'react';

import {
    createStackNavigator, createAppContainer, createBottomTabNavigator,
    createSwitchNavigator,
} from 'react-navigation';

import Config from './Config';

import { Styles } from './Styles';
import { Spinner } from './Spinner';
import { FadeView } from './FadeView';
import { MainScreen } from './MainScreen';
import { SplashScreen } from './SplashScreen';
import { TransferScreen } from './TransferScreen';
import { SettingsScreen } from './SettingsScreen';
import { ImportWalletScreen } from './ImportScreen';
import { SetPinScreen, RequestPinScreen } from './Pin.js';
import { WalletOptionScreen, CreateWalletScreen } from './CreateScreen';
import { TransactionsScreen, TransactionDetailsScreen } from './TransactionsScreen';

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
                color: Config.theme.primaryColour,
            },
            headerTransparent: true,
            headerTintColor: Config.theme.primaryColour,
        },
    }
);

/* Main screen for a logged in wallet */
const HomeNavigator = createBottomTabNavigator(
    {
        Main: MainScreen,
        Transfer: TransferScreen,
        Transactions: TransactionNavigator,
        Settings: SettingsScreen
    },
    {
        initialRouteName: 'Main',
        tabBarOptions: {
            activeTintColor: Config.theme.primaryColour,
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

/* Login or create/import a wallet */
const LoginNavigator = createStackNavigator(
    {
        /* Create a wallet */
        CreateWallet: CreateWalletScreen,

        /* Set a pin for the created wallet */
        SetPin: SetPinScreen,

        /* Request the pin for an existing wallet */
        RequestPin: RequestPinScreen,

        /* Launcing screen */
        Splash: SplashScreen,

        /* Create a wallet, import a wallet */
        WalletOption: WalletOptionScreen,

        /* Import a wallet */
        ImportWallet: ImportWalletScreen,
    },
    {
        initialRouteName: 'Splash',
        headerLayoutPreset: 'center',
        defaultNavigationOptions: {
            headerTitleStyle: {
                fontWeight: 'bold',
                color: Config.theme.primaryColour,
            },
            headerTransparent: true,
            headerTintColor: Config.theme.primaryColour,
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

export default class App extends React.Component {
    render() {
        return <AppContainer/>;
    }
}
