// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import FontAwesome from 'react-native-vector-icons/FontAwesome5';

import QRCode from 'react-native-qrcode-svg';

import moment from 'moment';

import PushNotification from 'react-native-push-notification';

import { NavigationActions } from 'react-navigation';

import {
    Text, View, Image, Platform, TouchableOpacity, PushNotificationIOS,
    AppState,
} from 'react-native';

import { 
    LogLevel, prettyPrintAmount
} from 'turtlecoin-wallet-backend';

import Config from './Config';

import { Styles } from './Styles';
import { coinsToFiat } from './Currency';
import { ProgressBar } from './ProgressBar';
import { saveToDatabase } from './Database';
import { CopyButton } from './SharedComponents';
import { Globals, initGlobals } from './Globals';
import { processBlockOutputs } from './NativeCode';
import { initBackgroundSync } from './BackgroundSync';

function init() {
    initGlobals();

    /* Use our native C++ func to process blocks, provided we're on android */
    /* TODO: iOS support */
    if (Platform.OS === 'android') {
        Globals.wallet.setBlockOutputProcessFunc(processBlockOutputs);
    }

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


    Globals.wallet.on('incomingtx', (transaction) => {
        sendNotification(transaction);
    });

    /* Start syncing */
    Globals.wallet.start();

    Globals.wallet.setLogLevel(LogLevel.DEBUG);

    /* Don't launch if already started */
    if (Globals.backgroundSaveTimer === undefined) {
        Globals.backgroundSaveTimer = setInterval(backgroundSave, Config.walletSaveFrequency);
    }
}

function handleNotification(notification) {
    console.log('Notification received');
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
    static navigationOptions = {
        title: 'Home',
    };

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
            <View style={{ flex: 1, justifyContent: 'space-between' }}>

                <View style={{ 
                    height: '20%', 
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    margin: 10,
                    borderRadius: 10,
                    opacity: this.state.addressOnly ? 0 : 100,
                }}>
                    <BalanceComponent/>
                </View>

                <TouchableOpacity onPress={() => this.setState({ addressOnly: !this.state.addressOnly })}>
                    <AddressComponent/>
                </TouchableOpacity>

                <View style={{ flex: 1, opacity: this.state.addressOnly ? 0 : 100 }}>
                    <SyncComponent/>
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
                    color: Config.theme.primaryColour,
                    fontSize: 20,
                    marginBottom: 15,
                }]}>
                    Your Wallet Address:
                </Text>

                <QRCode
                    value={this.state.address}
                    size={200}
                    color='gray'
                />

                <Text style={[Styles.centeredText, {
                    color: Config.theme.primaryColour,
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
            unlockedBalance: 0,
            lockedBalance: 0,
            coinValue: 0,
            expandedBalance: false,
        };

        (async () => {
            const [unlockedBalance, lockedBalance] = Globals.wallet.getBalance();

            const coinValue = await coinsToFiat(
                unlockedBalance + lockedBalance, Globals.preferences.currency
            );

            this.setState({
                unlockedBalance,
                lockedBalance,
                coinValue,
            });

        })();
    }

    tick() {
        (async () => {
            const [unlockedBalance, lockedBalance] = Globals.wallet.getBalance();

            const coinValue = await coinsToFiat(
                unlockedBalance + lockedBalance, Globals.preferences.currency
            );

            this.setState({
                unlockedBalance,
                lockedBalance,
                coinValue,
            });
        })();
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        const compactBalance = <Text style={{ color: this.state.lockedBalance === 0 ? Config.theme.primaryColour : 'orange', fontSize: 35}}
                                     onPress={() => this.setState({
                                         expandedBalance: !this.state.expandedBalance
                                     })}>
                                     {prettyPrintAmount(this.state.unlockedBalance + this.state.lockedBalance)}
                               </Text>;

        const lockedBalance = <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: 'orange', fontSize: 25, paddingLeft: 5}}
                                          onPress={() => this.setState({
                                             expandedBalance: !this.state.expandedBalance
                                          })}>
                                        {prettyPrintAmount(this.state.lockedBalance)}
                                    </Text>
                                    <FontAwesome name={'lock'} size={22} color={'orange'} style={{marginLeft: 7}}/>
                              </View>;

        const unlockedBalance = <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                    <FontAwesome name={'unlock'} size={22} color={Config.theme.primaryColour} style={{marginRight: 7}}/>
                                    <Text style={{ color: Config.theme.primaryColour, fontSize: 25, paddingRight: 5}}
                                          onPress={() => this.setState({
                                             expandedBalance: !this.state.expandedBalance
                                          })}>
                                        {prettyPrintAmount(this.state.unlockedBalance)}
                                    </Text>
                                </View>;

        const expandedBalance = <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                                    {unlockedBalance}
                                    <Text style={{ color: 'lightgray', fontSize: 30 }}
                                          onPress={() => this.setState({
                                            expandedBalance: !this.state.expandedBalance
                                          })}>
                                        |
                                    </Text>
                                    {lockedBalance}
                                </View>;

        return(
            <View style={{flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{ color: 'lightgray', fontSize: 15 }}>
                        TOTAL BALANCE
                    </Text>

                    {this.state.expandedBalance ? expandedBalance : compactBalance}

                    <Text style={{ color: 'gray', fontSize: 20 }}>
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
                <Text>
                    {this.state.walletHeight} / {this.state.networkHeight} - {this.state.percent}%
                </Text>
                <ProgressBar
                    progress={this.state.progress}
                    style={{justifyContent: 'flex-end', alignItems: 'center', width: 300, marginTop: 10}}
                />
            </View>
        );
    }
}

/**
 * Save wallet in background
 */
function backgroundSave() {
    console.log('Saving wallet...');

    try {
        saveToDatabase(Globals.wallet, Globals.pinCode);
        console.log('Save complete.');
    } catch (err) {
        console.log('Failed to background save: ' + err);
    }
}
