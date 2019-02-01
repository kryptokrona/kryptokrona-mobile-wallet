// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import React from 'react';

import {
    createStackNavigator, createAppContainer, createBottomTabNavigator,
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
import { CreateScreen, CreateWalletScreen } from './CreateScreen';
import { TransactionsScreen, TransactionDetailsScreen } from './TransactionsScreen';

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

/**
 * Bottom tabs for our main screens
 */
const TabNavigator = createBottomTabNavigator(
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

const MenuContainer = createAppContainer(MenuNavigator);

export default class App extends React.Component {
    render() {
        return <MenuContainer/>;
    }
}
