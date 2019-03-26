// Copyright (C) 2018-2019, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import FontAwesome from 'react-native-vector-icons/FontAwesome5';

import QRCode from 'react-native-qrcode-svg';

import PushNotification from 'react-native-push-notification';

import { NavigationActions } from 'react-navigation';

import {
    Text, View, Image, TouchableOpacity, PushNotificationIOS,
    AppState, Platform,
} from 'react-native';

import { prettyPrintAmount, LogLevel } from 'turtlecoin-wallet-backend';

import Config from './Config';

import { Styles } from './Styles';
import { ProgressBar } from './ProgressBar';
import { Globals, initGlobals } from './Globals';
import { reportCaughtException } from './Sentry';
import { processBlockOutputs } from './NativeCode';
import { initBackgroundSync } from './BackgroundSync';
import { CopyButton, OneLineText } from './SharedComponents';
import { coinsToFiat, getCoinPriceFromAPI } from './Currency';

import {
    saveToDatabase, saveLastUpdatedToDatabase, compactDBs, shouldCompactDB
} from './Database';

async function init() {
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

    /* More than 48 hours have passed since last compaction */
    if (await shouldCompactDB(2)) {
        /* Perform the operation in 2 minutes... hopefully they won't be bothered
           by the interruption then. */
        setTimeout(async () => {
            const success = await compactDBs(Globals.pinCode);

            if (success) {
                saveLastUpdatedToDatabase(new Date());
                Globals.logger.addLogMessage('Compaction completed successfully');
            }
        }, 1000 * 60 * 2);
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

        this.state = {
            addressOnly: false,
        }

        init();
    }

    componentDidMount() {
        initBackgroundSync();
    }

    render() {
        /* If you touch the address component, it will hide the other stuff.
           This is nice if you want someone to scan the QR code, but don't
           want to display your balance. */
        return(
            <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: this.props.screenProps.theme.backgroundColour }}>

                <View style={{ 
                    height: '20%', 
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    margin: 10,
                    borderRadius: 10,
                    opacity: this.state.addressOnly ? 0 : 100,
                }}>
                    <BalanceComponent {...this.props}/>
                </View>

                <TouchableOpacity onPress={() => this.setState({ addressOnly: !this.state.addressOnly })}>
                    <AddressComponent {...this.props}/>
                </TouchableOpacity>

                <View style={{ flex: 1, opacity: this.state.addressOnly ? 0 : 100 }}>
                    <SyncComponent {...this.props}/>
                </View>
            </View>
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

        const [unlockedBalance, lockedBalance] = Globals.wallet.getBalance();

        this.state = {
            unlockedBalance,
            lockedBalance,
            expandedBalance: false,
        };

        this.counter = 0;

        this.tick();
    }

    tick() {
        (async () => {
            /* Due to a limitation in react native, setting large values for
               setInterval() is discouraged. Instead, piggy back of the existing
               10000ms timer (10s), and refresh the coin price every 30 minutes. */
            if (this.counter % 180 === 0) {
                const tmpPrice = await getCoinPriceFromAPI();

                if (tmpPrice !== undefined) {
                    Globals.coinPrice = tmpPrice;
                }
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

            this.counter++;
        })();
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 10000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const compactBalance = <OneLineText
                                     style={{ color: this.state.lockedBalance === 0 ? this.props.screenProps.theme.primaryColour : 'orange', fontSize: 35}}
                                     onPress={() => this.setState({
                                         expandedBalance: !this.state.expandedBalance
                                     })}
                                >
                                     {prettyPrintAmount(this.state.unlockedBalance + this.state.lockedBalance)}
                               </OneLineText>;

        const lockedBalance = <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <FontAwesome name={'lock'} size={22} color={'orange'} style={{marginRight: 7}}/>
                                    <OneLineText style={{ color: 'orange', fontSize: 25}}
                                          onPress={() => this.setState({
                                             expandedBalance: !this.state.expandedBalance
                                          })}>
                                        {prettyPrintAmount(this.state.lockedBalance)}
                                    </OneLineText>
                              </View>;

        const unlockedBalance = <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <FontAwesome name={'unlock'} size={22} color={this.props.screenProps.theme.primaryColour} style={{marginRight: 7}}/>
                                    <OneLineText style={{ color: this.props.screenProps.theme.primaryColour, fontSize: 25}}
                                          onPress={() => this.setState({
                                             expandedBalance: !this.state.expandedBalance
                                          })}>
                                        {prettyPrintAmount(this.state.unlockedBalance)}
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
                        {this.state.coinValue}
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
            <View style={{ justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20, marginTop: 50 }}>
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
