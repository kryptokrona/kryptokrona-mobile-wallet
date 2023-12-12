// Copyright (C) 2018-2019, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React, { useState, useRef } from "react";

import FontAwesome from 'react-native-vector-icons/FontAwesome5';

import * as Animatable from 'react-native-animatable';

import QRCode from 'react-native-qrcode-svg';

import PushNotification from 'react-native-push-notification';

import { NavigationActions, NavigationEvents } from 'react-navigation';

import {
    Animated, Text, View, Image, ImageBackground, TouchableOpacity, PushNotificationIOS,
    AppState, Platform, Linking, ScrollView, RefreshControl, Dimensions,
} from 'react-native';

import NetInfo from "@react-native-community/netinfo";

import { prettyPrintAmount, LogLevel } from 'kryptokrona-wallet-backend-js';

import Config from './Config';

import { Styles } from './Styles';
import { handleURI, toastPopUp, getBestNode } from './Utilities';
import { ProgressBar } from './ProgressBar';
import { saveToDatabase, savePreferencesToDatabase } from './Database';
import { Globals, initGlobals } from './Globals';
import { reportCaughtException } from './Sentry';
import { processBlockOutputs, makePostRequest } from './NativeCode';
import { initBackgroundSync } from './BackgroundSync';
import { CopyButton, OneLineText } from './SharedComponents';
import { coinsToFiat, getCoinPriceFromAPI } from './Currency';

async function init(navigation) {
    Globals.wallet.scanCoinbaseTransactions(Globals.preferences.scanCoinbaseTransactions);
    Globals.wallet.enableAutoOptimization(Globals.preferences.autoOptimize);

    /* Remove any previously added listeners */
    Globals.wallet.removeAllListeners('incomingtx');
    Globals.wallet.removeAllListeners('transaction');
    Globals.wallet.removeAllListeners('createdtx');
    Globals.wallet.removeAllListeners('createdfusiontx');
    Globals.wallet.removeAllListeners('deadnode');
    Globals.wallet.removeAllListeners('heightchange');

    Globals.wallet.on('incomingtx', (transaction) => {
        sendNotification(transaction);
    });

    Globals.wallet.on('deadnode', async () => {
        toastPopUp('Node may be offline, auto swapping..', false);
        const recommended_node = await getBestNode();
        Globals.preferences.node = recommended_node.url + ':' + recommended_node.port + ':' + recommended_node.ssl;
        savePreferencesToDatabase(Globals.preferences);
        await Globals.wallet.swapNode(Globals.getDaemon());
        toastPopUp('Swapped node to ' + recommended_node.url);
    });

    Globals.wallet.setLoggerCallback((prettyMessage, message) => {
        Globals.logger.addLogMessage(message);
    });

    Globals.wallet.setLogLevel(LogLevel.WARNING);

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

export function sendNotification(transaction) {
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
        message: `You were sent ${prettyPrintAmount(transaction.totalAmount(), Config)}`,
        data: JSON.stringify(transaction.hash),
        largeIcon: 'ic_notification_color',
        smallIcon: 'ic_notification_color',
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
            showLabel: false,
            style: {
                borderTopWidth: 0,
                height: 64,
                textAlignVertical: "top",
                backgroundColor: "#FF00FF",
                marginBottom: 33
            }
        }
    });

    constructor(props) {
        super(props);

        this.refresh = this.refresh.bind(this);
        this.handleURI = this.handleURI.bind(this);
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
        this.handleNetInfoChange = this.handleNetInfoChange.bind(this);
        this.unsubscribe = () => {};

        this.state = {
            addressOnly: false,
            unlockedBalance: 0,
            lockedBalance: 0,
            address: Globals.wallet.getPrimaryAddress()
        }

        this.updateBalance();

        init(this.props.navigation);

        Globals.wallet.on('transaction', () => {
            this.updateBalance();
        });

        Globals.wallet.on('createdtx', () => {
            this.updateBalance();
        });

        Globals.wallet.on('createdfusiontx', () => {
            this.updateBalance();
        });
    }

    async componentDidMount() {
        const [unlockedBalance, lockedBalance] = await Globals.wallet.getBalance();

        this.setState({
            unlockedBalance,
            lockedBalance
        })
    }

    async updateBalance() {
        const tmpPrice = await getCoinPriceFromAPI();

        if (tmpPrice !== undefined) {
            Globals.coinPrice = tmpPrice;
        }

        const [unlockedBalance, lockedBalance] = await Globals.wallet.getBalance();

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

    async resumeSyncing() {
        const netInfo = await NetInfo.fetch();

        if (Globals.preferences.limitData && netInfo.type === 'cellular') {
            return;
        }

        /* Note: start() is a no-op when already started */
        Globals.wallet.start();
    }

    /* Update coin price on coming to foreground */
    async handleAppStateChange(appState) {
        if (appState === 'active') {
            this.updateBalance();
            this.resumeSyncing();
        }
    }

    async handleNetInfoChange({ type }) {
        if (Globals.preferences.limitData && type === 'cellular') {
            Globals.logger.addLogMessage("Network connection changed to cellular, and we are limiting data. Stopping sync.");
            Globals.wallet.stop();
        } else {
            /* Note: start() is a no-op when already started
             * That said.. it is possible for us to not want to restart here,
            * for example, if we are in the middle of a node swap. Need investigation */
            Globals.logger.addLogMessage("Network connection changed. Restarting sync process if needed.");
            Globals.wallet.start();
        }
    }

    componentWillMount() {
      this.animatedValue = new Animated.Value(0);
    }


    componentDidMount() {
        this.unsubscribe = NetInfo.addEventListener(this.handleNetInfoChange);
        AppState.addEventListener('change', this.handleAppStateChange);
        Linking.addEventListener('url', this.handleURI);
        initBackgroundSync();
        let flipFlop = false;

        let keepAnimating = () => {

          Animated.timing(this.animatedValue, {
            toValue: flipFlop ? 0 : 224,
            duration: 30000
          }).start(() => {
            flipFlop = flipFlop ? false : true;
            keepAnimating();
          });

        }

          Animated.timing(this.animatedValue, {
            toValue: 224,
            duration: 30000
          }).start(() => {
            keepAnimating();

      });
    }

    componentWillUnmount() {
        NetInfo.removeEventListener('connectionChange', this.handleNetInfoChange);
        AppState.removeEventListener('change', this.handleAppStateChange);
        Linking.removeEventListener('url', this.handleURI);
        this.unsubscribe();
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

           const interpolateColor =  this.animatedValue.interpolate({
           inputRange: [0, 32, 64, 96, 128, 160, 192, 224],
           outputRange:['#5f86f2','#a65ff2','#f25fd0','#f25f61','#f2cb5f','#abf25f','#5ff281','#5ff2f0']
           })

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
                      height: '14%',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      marginBottom: 30,
                      padding: 0,
                      opacity: this.state.addressOnly ? 0 : 100,
                      shadowColor: "#000",
                      shadowOffset: {
                      	width: 0,
                      	height: 7,
                      },
                      shadowOpacity: 0.43,
                      shadowRadius: 9.51,

                      elevation: 15,
                    }}>
                    <View style={{ flex: 1, borderBottomLeftRadius: 25, borderBottomRightRadius: 25}}>
                        <BalanceComponent
                            unlockedBalance={this.state.unlockedBalance}
                            lockedBalance={this.state.lockedBalance}
                            coinValue={this.state.coinValue}
                            {...this.props}
                        />

                    </View>

                    

                    <LineGraph points={priceHistory} color="#4484B2" />

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
                <Text style={ [Styles.centeredText, {
                    color: this.props.screenProps.theme.primaryColour,
                    fontSize: 20,
                    marginBottom: 15,
                    fontFamily: 'Montserrat-Regular'
                }]}>
                    Your Wallet Address:
                </Text>

                <View style={{ borderRadius: 5, borderWidth: 1, borderColor: this.props.screenProps.theme.borderColour, padding: 8, backgroundColor: this.props.screenProps.theme.qrCode.backgroundColour }}>
                    <QRCode
                        value={this.state.address}
                        size={200}
                        backgroundColor={this.props.screenProps.theme.qrCode.backgroundColour}
                        color={this.props.screenProps.theme.qrCode.foregroundColour}
                    />
                </View>

                <Text style={[Styles.centeredText, {
                    color: this.props.screenProps.theme.primaryColour,
                    width: 215,
                    fontSize: 15,
                    marginTop: 10,
                    marginRight: 20,
                    marginLeft: 20,
                    fontFamily: 'Montserrat-Regular'
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

        this.balanceRef = (ref) => this.balance = ref;
        this.valueRef = (ref) => this.value = ref;
    }



    componentWillReceiveProps(nextProps) {
        if (nextProps.unlockedBalance !== this.props.unlockedBalance ||
            nextProps.lockedBalance !== this.props.lockedBalance) {
            this.balance.bounce(800);
        }

        if (nextProps.coinValue !== this.props.coinValue) {
            this.value.bounce(800);
        }
    }

    render() {
        const compactBalance = <OneLineText
                                     style={{marginTop: 20, fontFamily: 'RobotoMono-Regular', color: this.props.screenProps.theme.accentColour, fontSize: 32}}
                                     onPress={() => this.setState({
                                         expandedBalance: !this.state.expandedBalance
                                     })}
                                >

                                     {prettyPrintAmount(this.props.unlockedBalance + this.props.lockedBalance, Config).slice(0,-4)}
                               </OneLineText>;

        const fiatBalance = <OneLineText
                                style={{marginTop: 20, fontFamily: 'RobotoMono-Regular', color: this.props.screenProps.theme.accentColour, fontSize: 32}}
                                onPress={() => this.setState({
                                    expandedBalance: !this.state.expandedBalance
                                })}
                                >

                                    {this.props.coinValue}
                                </OneLineText>;


        return(
            <View style={{flex: 1, padding: 20, paddingBottom: 10, paddingTop: 40, justifyContent: 'center', alignItems: 'center'}}>


                    <Animatable.View ref={this.balanceRef}>
                        {this.state.expandedBalance ? fiatBalance : compactBalance}
                    </Animatable.View>

                    <Animatable.Text
                        ref={this.valueRef}
                        style={{ color: this.props.screenProps.theme.slightlyMoreVisibleColour, fontSize: 20, marginTop: 30, fontFamily: 'Montserrat-Regular' }}
                    >
                    </Animatable.Text>
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

        this.updateSyncStatus = this.updateSyncStatus.bind(this);

        this.syncRef = (ref) => this.sync = ref;
    }

    updateSyncStatus(walletHeight, localHeight, networkHeight) {
        /* Since we update the network height in intervals, and we update wallet
           height by syncing, occasionaly wallet height is > network height.
           Fix that here. */
        if (walletHeight > networkHeight && networkHeight !== 0 && networkHeight + 10 > walletHeight) {
            networkHeight = walletHeight;
        }

        /* Don't divide by zero */
        let progress = networkHeight === 0 ? 100 : walletHeight / networkHeight;

        if (progress > 1) {
            progress = 1;
        }

        let percent = 100 * progress;

        /* Prevent bar looking full when it's not */
        if (progress > 0.97 && progress < 1) {
            progress = 0.97;
        }

        /* Prevent 100% when just under */
        if (percent > 99.99 && percent < 100) {
            percent = 99.99;
        } else if (percent > 100) {
            percent = 100;
        }

        const justSynced = progress === 1 && this.state.progress !== 1;

        this.setState({
            walletHeight,
            localHeight,
            networkHeight,
            progress,
            percent: percent.toFixed(2),
        }, () => { if (justSynced) { this.sync.bounce(800) } });
    }

    componentDidMount() {
        Globals.wallet.on('heightchange', this.updateSyncStatus);
    }

    componentWillUnmount() {
        if (Globals.wallet) {
            Globals.wallet.removeListener('heightchange', this.updateSyncStatus);
        }
    }

    render() {
        return(
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', bottom: 0, position: 'absolute', left: 0, right: 0 }}>
                <Animatable.Text ref={this.syncRef} style={{
                    fontFamily: 'Montserrat-Regular',
                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                }}>
                    {this.state.walletHeight} / {this.state.networkHeight} - {this.state.percent}%
                </Animatable.Text>
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
        await saveToDatabase(Globals.wallet);
        Globals.logger.addLogMessage('Save complete.');
    } catch (err) {
        reportCaughtException(err);
        Globals.logger.addLogMessage('Failed to background save: ' + err);
    }
}
