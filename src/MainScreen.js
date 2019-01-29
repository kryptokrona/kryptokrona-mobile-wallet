// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import FontAwesome from 'react-native-vector-icons/FontAwesome5';

import {
    Text, View, Image, Platform
} from 'react-native';

import { 
    LogLevel, prettyPrintAmount,
} from 'turtlecoin-wallet-backend';

import Config from './Config';
import Globals from './Globals';

import { ProgressBar } from './ProgressBar';
import { saveToDatabase } from './Database';
import { processBlockOutputs } from './NativeCode';

/**
 * Sync screen, balance
 */
export class MainScreen extends React.Component {
    constructor(props) {
        super(props);

        /* Use our native C++ func to process blocks, provided we're on android */
        /* TODO: iOS support */
        if (Platform.OS === 'android') {
            Globals.wallet.setBlockOutputProcessFunc(processBlockOutputs);
        }

        /* Start syncing */
        Globals.wallet.start();

        Globals.wallet.setLogLevel(LogLevel.DEBUG);

        /* Don't launch if already started */
        if (Globals.backgroundSaveTimer === undefined) {
            Globals.backgroundSaveTimer = setInterval(backgroundSave, Config.walletSaveFrequency);
        }
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'space-between' }}>
                <BalanceComponent/>
                <SyncComponent/>
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
        };
    }

    tick() {
        const [unlockedBalance, lockedBalance] = Globals.wallet.getBalance();

        this.setState({
            unlockedBalance,
            lockedBalance
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
            <View style={{ height: '20%', backgroundColor: Config.theme.primaryColour, flexDirection: 'row', justifyContent: 'space-between'}}>
                <View style={{flex: 1, padding: 20, justifyContent: 'center', alignItems: 'flex-start'}}>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 10}}>
                        <FontAwesome name={'lock'} size={22} color={'white'} style={{marginRight: 10}}/>
                        <Text style={{ color: 'white', fontSize: 25}}>
                            {prettyPrintAmount(this.state.lockedBalance)}
                        </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <FontAwesome name={'unlock'} size={22} color={'white'} style={{marginRight: 10}}/>
                        <Text style={{ color: 'white', fontSize: 25}}>
                            {prettyPrintAmount(this.state.unlockedBalance)}
                        </Text>
                    </View>
                </View>

                <View style={{ justifyContent: 'center'}}>
                    <Image
                        source={require('../assets/img/icon-white.png')}
                        style={{resizeMode: 'contain', height: 100, width: 100}}
                    />
                </View>
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
            <View style={{ justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20 }}>
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
    } catch (err) {
        console.log('Failed to background save: ' + err);
    }
}
