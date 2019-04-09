// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import TextTicker from 'react-native-text-ticker';

import Entypo from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import { deleteUserPinCode } from '@haskkor/react-native-pincode';

import {
    View, FlatList, Alert, Text, Linking, NetInfo, ScrollView, Platform
} from 'react-native';

import Config from './Config';
import ListItem from './ListItem';
import List from './ListContainer';
import Constants from './Constants';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { SeedComponent, CopyButton } from './SharedComponents';
import { savePreferencesToDatabase, setHaveWallet } from './Database';
import { navigateWithDisabledBack, toastPopUp, getArrivalTime } from './Utilities';

export class FaqScreen extends React.Component {
    static navigationOptions = {
        title: 'FAQ',
    };

    constructor(props) {
        super(props);
    }

    render() {
        let arrivalTime = getArrivalTime();
        /* Chop the '!' off the end */
        arrivalTime = arrivalTime.substr(0, arrivalTime.length - 1);

        return(
            <View style={{
                backgroundColor: this.props.screenProps.theme.backgroundColour,
                flex: 1,
            }}>
                <ScrollView contentContainerStyle={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                }}
                style={{
                    marginTop: 60,
                    marginLeft: 30,
                    marginRight: 15,
                }}>
                    <Text style={{
                        fontSize: 24,
                        color: this.props.screenProps.theme.primaryColour,
                        marginBottom: 5,
                    }}>
                        • Background Syncing
                    </Text>

                    <Text style={{
                        color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                        marginBottom: 20,
                    }}>
                        The wallet does support background syncing, however, it may take some time before you notice this.{'\n\n'}
                        Every 15 minutes, a background sync event is fired. (This is a limitation of the mobile platform){'\n\n'}
                        After that, background syncing will continue for {Platform.OS === 'ios' ? '30 seconds' : '14 minutes'}, until the next background sync event is fired.{'\n\n'}
                        However, depending upon your phone model, battery, and OS, these background syncs may occur later than expected, or not at all.{'\n\n'}
                        For further information, see{' '}
                        <Text
                            style={{
                                color: '#3399ff'
                            }}
                            onPress={() => Linking.openURL('https://dontkillmyapp.com/').catch((err) => Globals.logger.addLogMessage('Failed to open url: ' + err))}
                        >
                            https://dontkillmyapp.com/
                        </Text>
                    </Text>

                    <Text style={{
                        fontSize: 24,
                        color: this.props.screenProps.theme.primaryColour,
                        marginBottom: 5,
                    }}>
                        • Importing a wallet faster
                    </Text>

                    <Text style={{
                        color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                        marginBottom: 20,
                    }}>
                        Sadly, phones are quite slow at syncing the blockchain, due to being less powerful than desktops.{'\n\n'}
                        If you are wanting to import a wallet, there are a few ways we can speed this up.{'\n\n'}
                        The easiest way is to sync your wallet on your PC, make a new wallet on your phone, and send all the funds to that wallet.{'\n\n'}
                        If you want to keep the same address, then the process is a little more complicated.{'\n\n'}
                        Send all your funds to yourself. You may need to optimize your wallet first, to do it all in one transaction.{'\n\n'}
                        Note down the block height you sent the funds. Then, import your wallet, and choose 'Pick an exact block height' when importing.{'\n\n'}
                        Finally, enter the block height that you sent all your funds to yourself. You should now see your full balance in your mobile wallet.
                    </Text>

                    <Text style={{
                        fontSize: 24,
                        color: this.props.screenProps.theme.primaryColour,
                        marginBottom: 5,
                    }}>
                        • My balance disappeared
                    </Text>

                    <Text style={{
                        color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                        marginBottom: 20,
                    }}>
                        If you can no longer see your balance or sync status, you probably accidentally tapped the QR code.{'\n\n'}
                        Tap it again and your balance should reappear.{'\n\n'}
                        This is intentional, so you can let someone scan your QR code, without revealing how much {Config.coinName} you have.
                    </Text>

                    <Text style={{
                        fontSize: 24,
                        color: this.props.screenProps.theme.primaryColour,
                        marginBottom: 5,
                    }}>
                        • Why is my balance locked?
                    </Text>

                    <Text style={{
                        color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                        marginBottom: 20,
                    }}>
                        When you send a transaction, part of your balance gets locked.{'\n\n'}
                        This is because your balance is comprised of multiple 'chunks' of {Config.coinName}.{'\n\n'}
                        It's similar to buying something with a $10 note, and getting back some change from the cashier.{'\n\n'}
                        Don't worry, your balance should unlock once the transaction confirms. (Normally in {arrivalTime})
                    </Text>


                </ScrollView>
            </View>
        );
    }
}

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
            <Text style={{
                color: this.props.screenProps.theme.primaryColour,
                marginRight: 20,
                marginTop: 10,
                marginBottom: 20,
                fontSize: 16,
            }}>
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
            <View style={{
                justifyContent: 'flex-start',
                flex: 1,
                backgroundColor: this.props.screenProps.theme.backgroundColour
            }}>
                <ScrollView style={{
                    flex: 1,
                }}>
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
                </ScrollView>
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
                                    this.props.navigation.navigate('Main', { reloadBalance: true } );
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
            pinConfirmation: Globals.preferences.pinConfirmation,
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
                                onClick: () => {
                                    if (Globals.preferences.pinConfirmation) {
                                        this.props.navigation.navigate('RequestPin', {
                                            subtitle: 'to backup your keys',
                                            finishFunction: () => {
                                                this.props.navigation.dispatch(navigateWithDisabledBack('Settings'));
                                                this.props.navigation.navigate('ExportKeys');
                                            }
                                        });
                                    } else {
                                        this.props.navigation.navigate('ExportKeys');
                                    }
                                },
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
                                title: 'Enable Notifications',
                                description: 'Get notified when you are sent money',
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
                                checkbox: true,
                                checked: this.state.notifsEnabled,
                            },
                            {
                                title: 'Scan Coinbase Transactions',
                                description: 'Enable this if you have solo mined',
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
                                checkbox: true,
                                checked: this.state.scanCoinbase,
                            },
                            {
                                title: 'Limit data',
                                description: 'Only sync when connected to WiFi',
                                icon: {
                                    iconName: this.state.limitData ? 'signal-off' : 'signal',
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
                                checkbox: true,
                                checked: this.state.limitData,
                            },
                            {
                                title: 'Enable dark mode',
                                description: 'Swap between light and dark mode',
                                icon: {
                                    iconName: this.state.darkMode ? 'light-down' : 'light-up',
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
                                        Globals.update();
                                    }

                                    toastPopUp(Globals.preferences.theme === 'darkMode' ? 'Dark mode enabled' : 'Light mode enabled');
                                    savePreferencesToDatabase(Globals.preferences);
                                },
                                checkbox: true,
                                checked: this.state.darkMode,
                            },
                            {
                                title: 'Enable PIN confirmation',
                                description: 'Require PIN for sensitive operations',
                                icon: {
                                    iconName: 'security',
                                    IconType: MaterialCommunityIcons,
                                },
                                onClick: () => {
                                    /* Require pin to disable */
                                    if (Globals.preferences.pinConfirmation) {
                                        this.props.navigation.navigate('RequestPin', {
                                            subtitle: 'to disable pin confirmation',
                                            finishFunction: () => {
                                                Globals.preferences.pinConfirmation = !Globals.preferences.pinConfirmation;

                                                this.props.navigation.navigate('Settings');

                                                savePreferencesToDatabase(Globals.preferences);

                                                this.setState({
                                                    pinConfirmation: Globals.preferences.pinConfirmation,
                                                });
                                            }
                                        });
                                    } else {
                                        Globals.preferences.pinConfirmation = !Globals.preferences.pinConfirmation;

                                        this.setState({
                                            pinConfirmation: Globals.preferences.pinConfirmation,
                                        });

                                        toastPopUp(Globals.preferences.pinConfirmation ? 'Pin Confirmation Enabled' : 'Pin Confirmation Disabled');
                                        savePreferencesToDatabase(Globals.preferences);
                                    }
                                },
                                checkbox: true,
                                checked: this.state.pinConfirmation,
                            },
                            {
                                title: 'FAQ',
                                description: 'Find answers to common questions',
                                icon: {
                                    iconName: 'question',
                                    IconType: SimpleLineIcons,
                                },
                                onClick: () => {
                                    this.props.navigation.navigate('Faq');
                                },
                            },
                            {
                                title: `View ${Config.appName} on ${Platform.OS === 'ios' ? 'the App Store' : 'Google Play'}`,
                                description: 'Leave a rating or send the link to your friends',
                                icon: {
                                    iconName: Platform.OS === 'ios' ? 'app-store' : 'google-play',
                                    IconType: Platform.OS === 'ios' ? Entypo : FontAwesome,
                                },
                                onClick: () => {
                                    const link = Platform.OS === 'ios' ? Config.appStoreLink : Config.googlePlayLink;

                                    Linking.openURL(link)
                                           .catch((err) => Globals.logger.addLogMessage('Failed to open url: ' + err));
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
                                title: 'Resync Wallet',
                                description: 'Resync wallet from scratch',
                                icon: {
                                    iconName: 'ios-refresh',
                                    IconType: Ionicons,
                                },
                                onClick: () => {
                                    if (Globals.preferences.pinConfirmation) {
                                        this.props.navigation.navigate('RequestPin', {
                                            subtitle: 'to resync your wallet',
                                            finishFunction: () => {
                                                this.props.navigation.navigate('Settings');
                                                resetWallet(this.props.navigation);
                                            }
                                        });
                                    } else {
                                        resetWallet(this.props.navigation);
                                    }
                                },
                            },
                            {
                                title: 'Delete Wallet',
                                description: 'Delete your wallet',
                                icon: {
                                    iconName: 'delete',
                                    IconType: AntDesign,
                                },
                                onClick: () => {
                                    if (Globals.preferences.pinConfirmation) {
                                        this.props.navigation.navigate('RequestPin', {
                                            subtitle: 'to delete your wallet',
                                            finishFunction: () => {
                                                this.props.navigation.navigate('Settings');
                                                deleteWallet(this.props.navigation)
                                            }
                                        });
                                    } else {
                                        deleteWallet(this.props.navigation)
                                    }
                                },
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
                                rightIcon={item.checkbox &&
                                    <View style={{width: 30, alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
                                        <MaterialIcons name={item.checked ? 'check-box' : 'check-box-outline-blank'} size={25} color={this.props.screenProps.theme.primaryColour}/>
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
                (async () => {
                    /* Disabling saving */
                    clearInterval(Globals.backgroundSaveTimer);

                    /* Delete pin code */
                    deleteUserPinCode();

                    await setHaveWallet(false);

                    Globals.wallet.stop();

                    Globals.reset();

                    /* And head back to the wallet choose screen */
                    navigation.navigate('Login');
                })();
            }},
            {text: 'Cancel', style: 'cancel'},
        ],
    );
}

function resetWallet(navigation) {
    Alert.alert(
        'Resync Wallet?',
        'Are you sure you want to resync your wallet? This may take a long time.',
        [
            {text: 'Resync', onPress: () => {
                Globals.wallet.rescan();
                toastPopUp('Wallet resync initiated');
                navigation.navigate('Main', { reloadBalance: true } );
            }},
            {text: 'Cancel', style: 'cancel'},
        ],
    );
}
