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
import { AreaChart, Grid } from 'react-native-svg-charts';
import * as shape from 'd3-shape';
import { Defs, LinearGradient, Stop } from 'react-native-svg'


/**
 * Sync screen, balance
 */
export class ReceiveScreen extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            address: Globals.wallet.getPrimaryAddress()
        }

    }

    async componentDidMount() {
        const [unlockedBalance, lockedBalance] = await Globals.wallet.getBalance();

        this.setState({
            unlockedBalance,
            lockedBalance
        })
    }


    async componentDidMount() {

    }

    componentWillUnmount() {

    }

    

    render() {

        return(
            <ScrollView
                style={{
                    backgroundColor: this.props.screenProps.theme.backgroundColour,
                }}
                contentContainerstyle={{
                    flex: 1,
                }}
            >
                <View style={{
                    justifyContent: 'space-around',
                    height: Dimensions.get('window').height - 73,
                }}>

                        <AddressComponent {...this.props}/>

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

                <View style={{ borderRadius: 5, borderWidth: 1, borderColor: this.props.screenProps.theme.borderColour, padding: 8, backgroundColor: 'transparent' }}>
                    <QRCode
                        value={this.state.address}
                        size={250}
                        backgroundColor={'transparent'}
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
