// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import Realm from 'realm';

import TextTicker from 'react-native-text-ticker';

import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import { deleteUserPinCode } from '@haskkor/react-native-pincode';

import { View, FlatList, Alert, Text, Linking, NetInfo, ScrollView } from 'react-native';

import Config from './Config';
import ListItem from './ListItem';
import List from './ListContainer';
import Constants from './Constants';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { SeedComponent, CopyButton } from './SharedComponents';
import { navigateWithDisabledBack, toastPopUp } from './Utilities';
import { setHaveWallet, savePreferencesToDatabase } from './Database';

export class LoggingScreen extends React.Component {
    static navigationOptions = {
        title: 'Logs',
    };

    constructor(props) {
        super(props);

        this.state = {
            logs: Globals.logger.getLogs(),
        }
    }

    tick() {
        this.setState({
            logs: Globals.logger.getLogs(),
        });
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 10000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return(
            <View style={{ backgroundColor: this.props.screenProps.theme.backgroundColour, flex: 1 }}>
                <ScrollView
                    ref={ref => this.scrollView = ref}
                    onContentSizeChange={(contentWidth, contentHeight) => {
                        this.scrollView.scrollToEnd({animated: true});
                    }}
                    style={{
                        marginTop: 50,
                        marginBottom: 10,
                        marginHorizontal: 10,
                        backgroundColor: this.props.screenProps.theme.backgroundColour,
                    }}
                >
                    {this.state.logs.map((value, index) => {
                        return(
                            <Text key={index} style={{ color: this.props.screenProps.theme.slightlyMoreVisibleColour }}>
                                {value}
                            </Text>
                        );
                    })}
                </ScrollView>
            </View>
        );
    }
}

export class ExportKeysScreen extends React.Component {
    static navigationOptions = {
        title: '',
    };

    constructor(props) {
        super(props);

        let [mnemonicSeed, error] = Globals.wallet.getMnemonicSeed();

        const [privateSpendKey, privateViewKey] = Globals.wallet.getPrimaryAddressPrivateKeys();

        this.state = {
            privateSpendKey,
            privateViewKey,
            mnemonicSeed,
        }
    }

    render() {
        const noSeedComponent =
            <Text style={[Styles.centeredText, {
                color: this.props.screenProps.theme.primaryColour,
                marginLeft: 10,
                marginRight: 10,
                marginTop: 10,
                marginBottom: 20,
                fontSize: 16,
            }]}>
                Your wallet isn't a mnemonic seed capable wallet. Not to worry though, your
                private keys will work just as well for restoring your wallet.
            </Text>;

        const seedComponent =
            <SeedComponent
                seed={this.state.mnemonicSeed}
                borderColour={this.props.screenProps.theme.primaryColour}
                {...this.props}
            />;

        return(
            <View style={{ justifyContent: 'flex-start', flex: 1, backgroundColor: this.props.screenProps.theme.backgroundColour }}>

                <View style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 60,
                    marginLeft: 30,
                }}>
                    <Text style={{ color: this.props.screenProps.theme.primaryColour, fontSize: 25, marginBottom: 10 }}>
                        Mnemonic Seed:
                    </Text>

                    {this.state.mnemonicSeed === undefined ? noSeedComponent : seedComponent}
                </View>

                <View style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 10,
                    marginLeft: 30,
                }}>
                    <Text style={{ color: this.props.screenProps.theme.primaryColour, fontSize: 25, marginBottom: 10 }}>
                        Private Spend Key:
                    </Text>
                    <View style={{
                        marginTop: 10,
                        marginRight: 30,
                        borderWidth: 1,
                        borderColor: this.props.screenProps.theme.primaryColour,
                        padding: 10,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                        }}>
                            {this.state.privateSpendKey}
                        </Text>

                    </View>

                    <CopyButton
                        data={this.state.privateSpendKey}
                        name='Private Spend Key'
                        style={{ marginLeft: 0 }}
                        {...this.props}
                    />

                </View>

                <View style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 10,
                    marginLeft: 30,
                }}>
                    <Text style={{ color: this.props.screenProps.theme.primaryColour, fontSize: 25, marginBottom: 10 }}>
                        Private View Key:
                    </Text>
                    <View style={{
                        marginTop: 10,
                        marginRight: 30,
                        borderWidth: 1,
                        borderColor: this.props.screenProps.theme.primaryColour,
                        padding: 10,
                    }}>
                        <Text style={{
                            fontSize: 12,
                            color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                        }}>
                            {this.state.privateViewKey}
                        </Text>

                    </View>

                    <CopyButton
                        data={this.state.privateViewKey}
                        name='Private View Key'
                        style={{ marginLeft: 0 }}
                        {...this.props}
                    />

                </View>

            </View>
        );
    }
}

export class SwapCurrencyScreen extends React.Component {
    static navigationOptions = {
        title: '',
    };

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{
                backgroundColor: this.props.screenProps.theme.backgroundColour,
            }}>
                <List style={{
                    backgroundColor: this.props.screenProps.theme.backgroundColour,
                    marginTop: 50
                }}>
                    <FlatList
                        data={Constants.currencies}
                        keyExtractor={item => item.ticker}
                        renderItem={({item}) => (
                            <ListItem
                                title={item.coinName}
                                subtitle={item.symbol + ' / ' + item.ticker.toUpperCase()}
                                leftIcon={
                                    <View style={{width: 30, alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
                                        <Text style={{ fontSize: 25, color: this.props.screenProps.theme.primaryColour }}>
                                            {item.symbol}
                                        </Text>
                                    </View>
                                }
                                titleStyle={{
                                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                                }}
                                subtitleStyle={{
                                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                                }}
                                onPress={() => {
                                    Globals.preferences.currency = item.ticker;

                                    savePreferencesToDatabase(Globals.preferences);

                                    /* Reset this stack to be on the settings screen */
                                    this.props.navigation.dispatch(navigateWithDisabledBack('Settings'));

                                    /* And go back to the main screen. */
                                    this.props.navigation.navigate('Main');
                                }}
                            />
                        )}
                    />
                </List>
            </View>
        );
    }
}

/**
 * Fuck w/ stuff
 */
export class SettingsScreen extends React.Component {
    static navigationOptions = ({ navigation, screenProps }) => ({
        title: 'Settings',
        header: null,
    });

    constructor(props) {
        super(props);

        this.state = {
            notifsEnabled: Globals.preferences.notificationsEnabled,
            scanCoinbase: Globals.preferences.scanCoinbaseTransactions,
            limitData: Globals.preferences.limitData,
            darkMode: Globals.preferences.theme === 'darkMode',
        }
    }

    render() {
        return(
            <View style={{
                backgroundColor: this.props.screenProps.theme.backgroundColour,
                flex: 1,
            }}>
                <List style={{
                    backgroundColor: this.props.screenProps.theme.backgroundColour,
                }}>
                    <FlatList
                        data={[
                            {
                                title: 'Backup Keys',
                                description: 'Display your private keys/seed',
                                icon: {
                                    iconName: 'key-change',
                                    IconType: MaterialCommunityIcons,
                                },
                                onClick: () => { this.props.navigation.navigate('ExportKeys') },
                            },
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
                                title: this.state.notifsEnabled ? 'Disable Notifications' : 'Enable Notifications',
                                description: this.state.notifsEnabled ? 'Disable transaction notifications' : 'Get notified when you are sent money',
                                icon: {
                                    iconName: 'ios-notifications',
                                    IconType: Ionicons,
                                },
                                onClick: () => {
                                    Globals.preferences.notificationsEnabled = !Globals.preferences.notificationsEnabled;

                                    this.setState({
                                        notifsEnabled: Globals.preferences.notificationsEnabled,
                                    });

                                    toastPopUp(Globals.preferences.notificationsEnabled ? 'Notifications enabled' : 'Notifications disabled');
                                    savePreferencesToDatabase(Globals.preferences);
                                },
                            },
                            {
                                title: this.state.scanCoinbase ? 'Skip Coinbase Transactions' : 'Scan Coinbase Transactions',
                                description: 'Enable this if you have ever solo mined a block',
                                icon: {
                                    iconName: 'pickaxe',
                                    IconType: MaterialCommunityIcons,
                                },
                                onClick: () => {
                                    Globals.preferences.scanCoinbaseTransactions = !Globals.preferences.scanCoinbaseTransactions;

                                    this.setState({
                                        scanCoinbase: Globals.preferences.scanCoinbaseTransactions,
                                    });

                                    Globals.wallet.scanCoinbaseTransactions(Globals.preferences.scanCoinbaseTransactions);
                                    toastPopUp(Globals.preferences.scanCoinbaseTransactions ? 'Scanning Coinbase Transactions enabled' : 'Scanning Coinbase Transactions disabled');
                                    savePreferencesToDatabase(Globals.preferences);
                                },
                            },
                            {
                                title: this.state.limitData ? 'Disable data limit' : 'Limit data',
                                description: this.state.limitData ? 'Sync when using mobile data' : 'Only sync when connected to WiFi',
                                icon: {
                                    iconName: this.state.limitData ? 'signal' : 'signal-off',
                                    IconType: MaterialCommunityIcons,
                                },
                                onClick: async () => {
                                    Globals.preferences.limitData = !Globals.preferences.limitData;

                                    this.setState({
                                        limitData: Globals.preferences.limitData,
                                    });

                                    const netInfo = await NetInfo.getConnectionInfo();
                                    
                                    if (Globals.preferences.limitData && netInfo.type === 'cellular') {
                                        Globals.wallet.stop();
                                    } else {
                                        Globals.wallet.start();
                                    }

                                    toastPopUp(Globals.preferences.limitData ? 'Data limiting enabled' : 'Data limiting disabled');
                                    savePreferencesToDatabase(Globals.preferences);
                                },
                            },
                            {
                                title: this.state.darkMode ? 'Enable light mode' : 'Enable dark mode',
                                description: this.state.darkMode ? 'Enable light mode if you like eye strain' : 'Pretend you\'re a leet h4xor with dark mode',
                                icon: {
                                    iconName: this.state.darkMode ? 'light-up' : 'light-down',
                                    IconType: Entypo,
                                },
                                onClick: () => {
                                    const newTheme = Globals.preferences.theme === 'darkMode' ? 'lightMode' : 'darkMode';

                                    Globals.preferences.theme = newTheme;

                                    this.setState({
                                        darkMode: Globals.preferences.theme === 'darkMode',
                                    });

                                    /* Need to use a callback to setState() the
                                       theme prop which is passed down to all
                                       our components */
                                    if (Globals.updateTheme) {
                                        Globals.updateTheme();
                                    }

                                    toastPopUp(Globals.preferences.theme === 'darkMode' ? 'Dark mode enabled' : 'Light mode enabled');
                                    savePreferencesToDatabase(Globals.preferences);
                                },
                            },
                            {
                                title: `Find ${Config.appName} on Github`,
                                description: 'View the source code and give feedback',
                                icon: {
                                    iconName: 'github',
                                    IconType: AntDesign,
                                },
                                onClick: () => { 
                                    Linking.openURL(Config.repoLink)
                                           .catch((err) => Globals.logger.addLogMessage('Failed to open url: ' + err))
                                },
                            },
                            {
                                title: 'View logs',
                                description: 'View debugging information',
                                icon: {
                                    iconName: 'note-text',
                                    IconType: MaterialCommunityIcons,
                                },
                                onClick: () => {
                                    this.props.navigation.navigate('Logging');
                                },
                            },
                            {
                                title: 'Delete Wallet',
                                description: 'Delete your wallet',
                                icon: {
                                    iconName: 'delete',
                                    IconType: AntDesign,
                                },
                                onClick: () => { deleteWallet(this.props.navigation) },
                            },
                            {
                                title: Config.appName,
                                description: Config.appVersion,
                                icon: {
                                    iconName: 'info',
                                    IconType: SimpleLineIcons,
                                },
                                onClick: () => {},
                            },
                        ]}
                        keyExtractor={item => item.title}
                        renderItem={({item}) => (
                            <ListItem
                                title={item.title}
                                subtitle={item.description}
                                titleStyle={{
                                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                                }}
                                subtitleStyle={{
                                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                                }}
                                leftIcon={
                                    <View style={{width: 30, alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
                                        <item.icon.IconType name={item.icon.iconName} size={25} color={this.props.screenProps.theme.primaryColour}/>
                                    </View>
                                }
                                onPress={item.onClick}
                            />
                        )}
                    />
                </List>
            </View>
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

                Globals.reset();

                /* And head back to the wallet choose screen */
                navigation.navigate('Login');
            }},
            {text: 'Cancel', style: 'cancel'},
        ],
    )
}
