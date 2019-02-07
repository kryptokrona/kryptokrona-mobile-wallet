// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import Realm from 'realm';

import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { deleteUserPinCode } from '@haskkor/react-native-pincode';

import { List, ListItem } from 'react-native-elements';

import { View, FlatList, Alert, Text } from 'react-native';

import Config from './Config';
import Constants from './Constants';

import { Globals } from './Globals';
import { navigateWithDisabledBack } from './Utilities';
import { setHaveWallet, savePreferencesToDatabase } from './Database';

export class SwapCurrencyScreen extends React.Component {
    static navigationOptions = {
        title: 'Swap Currency',
        header: null,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <List>
                <FlatList
                    data={Constants.currencies}
                    keyExtractor={item => item.ticker}
                    renderItem={({item}) => (
                        <ListItem
                            title={item.coinName}
                            subtitle={item.symbol + ' / ' + item.ticker.toUpperCase()}
                            leftIcon={
                                <View style={{width: 30, alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
                                    <Text>
                                        {item.symbol}
                                    </Text>
                                </View>
                            }
                            onPress={() => {
                                Globals.preferences.currency = item.ticker;

                                savePreferencesToDatabase(Globals.preferences);

                                /* And go back to the settings screen. */
                                this.props.navigation.navigate('Settings');
                            }}
                        />
                    )}
                />
            </List>
        );
    }
}

/**
 * Fuck w/ stuff
 */
export class SettingsScreen extends React.Component {
    static navigationOptions = {
        title: 'Settings',
        header: null,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <List>
                <FlatList
                    data={[
                        {
                            title: 'Swap Currency',
                            description: 'Swap your wallet display currency',
                            icon: {
                                iconName: 'currency-usd',
                                IconType: MaterialCommunityIcons,
                            },
                            onClick: () => { this.props.navigation.navigate('SwapCurrency') },
                        },
                        {
                            title: 'Reset Wallet',
                            description: 'Discard sync data and resync from scratch',
                            icon: {
                                iconName: 'ios-search',
                                IconType: Ionicons,
                            },
                            /* TODO */
                            onClick: () => {},
                        },
                        {
                            title: 'Delete Wallet',
                            description: 'Delete your wallet to create or import another',
                            icon: {
                                iconName: 'delete',
                                IconType: AntDesign,
                            },
                            onClick: () => { deleteWallet(this.props.navigation) },
                        },

                    ]}
                    keyExtractor={item => item.title}
                    renderItem={({item}) => (
                        <ListItem
                            title={item.title}
                            subtitle={item.description}
                            leftIcon={
                                <View style={{width: 30, alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
                                    <item.icon.IconType name={item.icon.iconName} size={22} color={Config.theme.primaryColour}/>
                                </View>
                            }
                            onPress={item.onClick}
                        />
                    )}
                />
            </List>
        );
    }
}

/**
 *
 */
function deleteWallet(navigation) {
    Alert.alert(
        'Delete Wallet?',
        'Are you sure you want to delete your wallet? If your seed is not backed up, your funds will be lost!',
        [
            {text: 'Delete', onPress: () => {
                /* Disabling saving */
                clearInterval(Globals.backgroundSaveTimer);

                /* Delete pin code */
                deleteUserPinCode();

                /* Delete old wallet */
                Realm.deleteFile({});

                setHaveWallet(false);

                Globals.wallet.stop();

                Globals.wallet = undefined;
                Globals.pinCode = undefined;
                Globals.backgroundSaveTimer = undefined;

                /* And head back to the wallet choose screen */
                navigation.navigate('Login');
            }},
            {text: 'Cancel', style: 'cancel'},
        ],
    )
}
