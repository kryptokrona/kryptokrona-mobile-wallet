// Copyright (C) 2018-2019, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import FontAwesome from 'react-native-vector-icons/FontAwesome5';

import QRCode from 'react-native-qrcode-svg';

import PushNotification from 'react-native-push-notification';

import { NavigationActions, NavigationEvents } from 'react-navigation';

import {
    Text, View, Image, TouchableOpacity, PushNotificationIOS,
    AppState, Platform, Linking, ScrollView, RefreshControl, Dimensions,
} from 'react-native';

import { prettyPrintAmount, LogLevel } from 'turtlecoin-wallet-backend';

import Config from './Config';

import { Styles } from './Styles';
import { handleURI } from './Utilities';
import { ProgressBar } from './ProgressBar';
import { saveToDatabase } from './Database';
import { Globals, initGlobals } from './Globals';
import { reportCaughtException } from './Sentry';
import { processBlockOutputs } from './NativeCode';
import { initBackgroundSync } from './BackgroundSync';
import { CopyButton, OneLineText } from './SharedComponents';
import { coinsToFiat, getCoinPriceFromAPI } from './Currency';

async function init(navigation) {
    Globals.wallet.scanCoinbaseTransactions(Globals.preferences.scanCoinbaseTransactions);

    Globals.wallet.on('incomingtx', (transaction) => {
        sendNotification(transaction);
    });

    Globals.wallet.setLoggerCallback((prettyMessage, message) => {
        Globals.logger.addLogMessage(message);
    });

    Globals.wallet.setLogLevel(LogLevel.DEBUG);

    /* Don't launch if already started */
    if (Globals.backgroundSaveTimer === undefined) {
        Globals.backgroundSaveTimer = setInterval(backgroundSave, Config.walletSaveFrequency);
    }

    /* Use our native C++ func to process blocks, provided we're on android */
    /* TODO: iOS support */
    if (Platform.OS === 'android') {
        Globals.wallet.setBlockOutputProcessFunc(processBlockOutputs);
    }

    initGlobals();

    PushNotification.configure({
        onNotification: handleNotification,

        permissions: {
            alert: true,
            badge: true,
            sound: true,
        },

        popInitialNotification: true,

        requestPermissions: true,
    });

    const url = await Linking.getInitialURL();

    if (url) {
        handleURI(url, navigation);
    }
}

function handleNotification(notification) {
    notification.finish(PushNotificationIOS.FetchResult.NoData);
}

function sendNotification(transaction) {
    /* Don't show notifications if disabled */
    if (!Globals.preferences.notificationsEnabled) {
        return;
    }

    /* Don't show notifications in foreground */
    if (AppState.currentState !== 'background') {
        return;
    }

    PushNotification.localNotification({
        title: 'Incoming transaction received!',
        message: `You were sent ${prettyPrintAmount(transaction.totalAmount())}`,
        data: JSON.stringify(transaction.hash),
    });
}

/**
 * Sync screen, balance
 */
export class MainScreen extends React.Component {
    static navigationOptions = ({ navigation, screenProps }) => ({
        title: 'Home',
        tabBarOptions: {
            activeBackgroundColor: screenProps.theme.backgroundColour,
            inactiveBackgroundColor: screenProps.theme.backgroundColour,
            activeTintColor: screenProps.theme.primaryColour,
            inactiveTintColor: screenProps.theme.slightlyMoreVisibleColour,
        }
    });

    constructor(props) {
        super(props);

        this.refresh = this.refresh.bind(this);
        this.handleURI = this.handleURI.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);

        const [unlockedBalance, lockedBalance] = Globals.wallet.getBalance();

        this.state = {
            addressOnly: false,
            unlockedBalance,
            lockedBalance,
        }

        this.updateBalance();

        init(this.props.navigation);

        Globals.wallet.on('transaction', () => {
            this.updateBalance();
        });

        Globals.wallet.on('createdtx', () => {
            this.updateBalance();
        });
    }

    async updateBalance() {
        const tmpPrice = await getCoinPriceFromAPI();

        if (tmpPrice !== undefined) {
            Globals.coinPrice = tmpPrice;
        }

        const [unlockedBalance, lockedBalance] = Globals.wallet.getBalance();

        const coinValue = await coinsToFiat(
            unlockedBalance + lockedBalance, Globals.preferences.currency
        );

        this.setState({
            unlockedBalance,
            lockedBalance,
            coinValue,
        });
    }

    handleURI(url) {
        handleURI(url, this.props.navigation);
    }

    /* Update coin price on coming to foreground */
    handleAppStateChange(appState) {
        if (appState === 'active') {
            this.updateBalance();
        }
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
        Linking.addEventListener('url', this.handleURI);
        initBackgroundSync();
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
        Linking.removeEventListener('url', this.handleURI);
    }

    async refresh() {
        this.setState({
            refreshing: true,
        });

        await this.updateBalance();

        this.setState({
            refreshing: false,
        });
    }

    render() {
        /* If you touch the address component, it will hide the other stuff.
           This is nice if you want someone to scan the QR code, but don't
           want to display your balance. */
        return(
            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={this.state.refreshing}
                        onRefresh={this.refresh}
                        title='Updating coin price...'
                    />
                }
                style={{
                    backgroundColor: this.props.screenProps.theme.backgroundColour,
                }}
                contentContainerstyle={{
                    flex: 1,
                }}
            >
                <NavigationEvents
                    onWillFocus={(payload) => {
                        if (payload && payload.action && payload.action.params && payload.action.params.reloadBalance) {
                            this.updateBalance();
                        }
                    }}
                />
                <View style={{
                    justifyContent: 'space-around',
                    height: Dimensions.get('window').height - 73,
                }}>
                    <View style={{ 
                        height: '20%', 
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        margin: 10,
                        borderRadius: 10,
                        opacity: this.state.addressOnly ? 0 : 100,
                    }}>
                        <BalanceComponent
                            unlockedBalance={this.state.unlockedBalance}
                            lockedBalance={this.state.lockedBalance}
                            coinValue={this.state.coinValue}
                            {...this.props}
                        />
                    </View>

                    <TouchableOpacity onPress={() => this.setState({ addressOnly: !this.state.addressOnly })}>
                        <AddressComponent {...this.props}/>
                    </TouchableOpacity>

                    <View style={{ opacity: this.state.addressOnly ? 0 : 100, flex: 1 }}>
                        <SyncComponent {...this.props}/>
                    </View>
                </View>
            </ScrollView>
        );
    }
}

/* Display address, and QR code */
class AddressComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            address: Globals.wallet.getPrimaryAddress(),
        };
    }

    render() {
        return(
            <View style={{ alignItems: 'center' }}>
                <Text style={[Styles.centeredText, {
                    color: this.props.screenProps.theme.primaryColour,
                    fontSize: 20,
                    marginBottom: 15,
                }]}>
                    Your Wallet Address:
                </Text>

                <View style={{ padding: 5, backgroundColor: this.props.screenProps.theme.qrCode.backgroundColour }}>
                    <QRCode
                        value={this.state.address}
                        size={200}
                        backgroundColor={this.props.screenProps.theme.qrCode.backgroundColour}
                        color={this.props.screenProps.theme.qrCode.foregroundColour}
                    />
                </View>

                <Text style={[Styles.centeredText, {
                    color: this.props.screenProps.theme.primaryColour,
                    fontSize: 15,
                    marginTop: 10,
                    marginRight: 20,
                    marginLeft: 20,
                }]}>
                    {this.state.address}
                </Text>

                <CopyButton
                    data={this.state.address}
                    name='Address'
                    {...this.props}
                />
            </View>
        );
    }
}

/**
 * Balance component at top of screen
 */
class BalanceComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            expandedBalance: false,
        };
    }

    render() {
        const compactBalance = <OneLineText
                                     style={{ color: this.props.lockedBalance === 0 ? this.props.screenProps.theme.primaryColour : 'orange', fontSize: 35}}
                                     onPress={() => this.setState({
                                         expandedBalance: !this.state.expandedBalance
                                     })}
                                >
                                     {prettyPrintAmount(this.props.unlockedBalance + this.props.lockedBalance)}
                               </OneLineText>;

        const lockedBalance = <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <FontAwesome name={'lock'} size={22} color={'orange'} style={{marginRight: 7}}/>
                                    <OneLineText style={{ color: 'orange', fontSize: 25}}
                                          onPress={() => this.setState({
                                             expandedBalance: !this.state.expandedBalance
                                          })}>
                                        {prettyPrintAmount(this.props.lockedBalance)}
                                    </OneLineText>
                              </View>;

        const unlockedBalance = <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <FontAwesome name={'unlock'} size={22} color={this.props.screenProps.theme.primaryColour} style={{marginRight: 7}}/>
                                    <OneLineText style={{ color: this.props.screenProps.theme.primaryColour, fontSize: 25}}
                                          onPress={() => this.setState({
                                             expandedBalance: !this.props.expandedBalance
                                          })}>
                                        {prettyPrintAmount(this.props.unlockedBalance)}
                                    </OneLineText>
                                </View>;

        const expandedBalance = <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                    {unlockedBalance}
                                    {lockedBalance}
                                </View>;

        return(
            <View style={{flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{ color: this.props.screenProps.theme.notVeryVisibleColour, fontSize: 15 }}>
                        TOTAL BALANCE
                    </Text>

                    {this.state.expandedBalance ? expandedBalance : compactBalance}

                    <Text style={{ color: this.props.screenProps.theme.slightlyMoreVisibleColour, fontSize: 20 }}>
                        {this.props.coinValue}
                    </Text>
            </View>
        );
    }
}

/**
 * Sync status at bottom of screen
 */
class SyncComponent extends React.Component {
    constructor(props) {
        super(props);

        const [walletHeight, localHeight, networkHeight] = Globals.wallet.getSyncStatus();

        this.state = {
            walletHeight,
            localHeight,
            networkHeight,
            progress: 0,
            percent: '0.00',
        };
    }

    tick() {
        let [walletHeight, localHeight, networkHeight] = Globals.wallet.getSyncStatus();

        /* Since we update the network height in intervals, and we update wallet
           height by syncing, occasionaly wallet height is > network height.
           Fix that here. */
        if (walletHeight > networkHeight && networkHeight !== 0 && networkHeight + 10 > walletHeight) {
            networkHeight = walletHeight;
        }

        /* Don't divide by zero */
        let progress = networkHeight === 0 ? 0 : walletHeight / networkHeight;

        let percent = 100 * progress;

        /* Prevent bar looking full when it's not */
        if (progress > 0.97 && progress < 1) {
            progress = 0.97;
        }

        /* Prevent 100% when just under */
        if (percent > 99.99 && percent < 100) {
            percent = 99.99;
        }

        this.setState({
            walletHeight,
            localHeight,
            networkHeight,
            progress,
            percent: percent.toFixed(2),
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
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', bottom: 20, position: 'absolute', left: 0, right: 0 }}>
                <Text style={{
                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                }}>
                    {this.state.walletHeight} / {this.state.networkHeight} - {this.state.percent}%
                </Text>
                <ProgressBar
                    progress={this.state.progress}
                    style={{justifyContent: 'flex-end', alignItems: 'center', width: 300, marginTop: 10}}
                    {...this.props}
                />
            </View>
        );
    }
}

/**
 * Save wallet in background
 */
async function backgroundSave() {
    Globals.logger.addLogMessage('Saving wallet...');

    try {
        await saveToDatabase(Globals.wallet, Globals.pinCode);
        Globals.logger.addLogMessage('Save complete.');
    } catch (err) {
        reportCaughtException(err);
        Globals.logger.addLogMessage('Failed to background save: ' + err);
    }
}
