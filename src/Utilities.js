// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import moment from 'moment';

import { Text, Platform, ToastAndroid, Alert } from 'react-native';

import { StackActions, NavigationActions } from 'react-navigation';

import {
    validateAddresses, WalletErrorCode, validatePaymentID, prettyPrintAmount,
} from 'kryptokrona-wallet-backend-js';

import * as Qs from 'query-string';

import Config from './Config';

import { Globals } from './Globals';

import { addFee, toAtomic } from './Fee';

import Identicon from 'identicon.js';

const intToRGB = (int) => {

    if (typeof int !== 'number') throw new Error(errorMessage);
    if (Math.floor(int) !== int) throw new Error(errorMessage);
    if (int < 0 || int > 16777215) throw new Error(errorMessage);
  
    var red = int >> 16;
    var green = int - (red << 16) >> 8;
    var blue = int - (red << 16) - (green << 8);
  
    return {
      red: red,
      green: green,
      blue: blue
    }
  }

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toastPopUp(message, short = true) {
    /* IOS doesn't have toast support */
    /* TODO */
    if (Platform.OS === 'ios') {
        return;
    }

    ToastAndroid.show(message, short ? ToastAndroid.SHORT : ToastAndroid.LONG);
}

export async function getBestNode(ssl=true) {

    let recommended_node = undefined;

    await Globals.updateNodeList();
  
    let node_requests = [];
    let ssl_nodes =[];
    if (ssl) {
        ssl_nodes = Globals.daemons.filter(node => {return node.ssl});
    } else {
        ssl_nodes = Globals.daemons.filter(node => {return !node.ssl});
    }
  
    ssl_nodes = ssl_nodes.sort((a, b) => 0.5 - Math.random());
  
    for (node in ssl_nodes) {
      let this_node = ssl_nodes[node];
  
      let nodeURL = `${this_node.ssl ? 'https://' : 'http://'}${this_node.url}:${this_node.port}/info`;
      try {
        const resp = await fetch(nodeURL, {
           method: 'GET'
        }, 1000);
  
        if (resp.ok) {
            recommended_node = this_node;
            return(this_node);
        }
        } catch (e) {
        console.log(e);
        }

    }
}


/* Navigate to a route, resetting the stack, so the user cannot go back.
   We want to do this so when we go from the splash screen to the menu screen,
   the user can't return, and get stuck there. */
export function navigateWithDisabledBack(route, routeParams) {
    return StackActions.reset({
        index: 0,
        actions: [
            NavigationActions.navigate({
                routeName: route,
                params: routeParams,
            }),
        ]
    });
}

export function prettyPrintUnixTimestamp(timestamp) {
    console.log('tmsmp', timestamp);
    return prettyPrintDate(moment(timestamp * 1000));
}

export function prettyPrintDate(date) {

    return date.toLocaleString('en-us').split("GMT")[0];
    if (date === undefined) {
        date = moment();
    }

    if (moment().year() === date.year()) {
        return date.format('D MMM, HH:mm');
    }

    return date.format('D MMM, YYYY HH:mm');
}

/**
 * Gets the approximate height of the blockchain, based on the launch timestamp
 */
export function getApproximateBlockHeight(date) {
    const difference = (date - Config.chainLaunchTimestamp) / 1000;

    let blockHeight = Math.floor(difference / 90);

    if (blockHeight < 0) {
        blockHeight = 0;
    }

    return blockHeight;
}

/**
 * Converts a date to a scan height. Note, takes a moment date.
 */
export function dateToScanHeight(date) {
    let jsDate = date.toDate();
    const now = new Date();

    if (jsDate > now) {
        jsDate = now;
    }

    return getApproximateBlockHeight(jsDate);
}

export function getArrivalTime() {
    const minutes = Config.blockTargetTime >= 60;

    if (minutes) {
        return Math.ceil(Config.blockTargetTime / 60) + ' minutes!';
    } else {
        return Config.blockTargetTime + ' seconds!';
    }
}

export function handleURI(data, navigation) {
    const result = parseURI(data);

    if (!result.valid) {
        Alert.alert(
            'Cannot send transaction',
            result.error,
            [
                {text: 'OK'},
            ]
        );
    } else {
        /* Hop into the transfer stack */
        navigation.navigate('ChoosePayee');
        /* Then navigate to the nested route, if needed */
        navigation.navigate(result.suggestedAction, {...result});
    }
}

export function parseURI(qrData) {
    /* It's a URI, try and get the data from it */
    console.log(qrData);
    if (qrData.startsWith(Config.uriPrefix)) {
        /* Remove the turtlecoin:// prefix */
        let data = qrData.replace(Config.uriPrefix, '');
        let index = data.indexOf('?');

        /* Doesn't have any params */
        if (index === -1) {
            index = data.length;
        }

        const address = data.substr(0, index);
        const params = Qs.parse(data.substr(index));

        const amount = params.amount;
        const name = params.name;
        let paymentID = params.paymentid;

        if (paymentID) {
            const pidError = validatePaymentID(paymentID);

            /* Payment ID isn't valid. */
            if (pidError.errorCode !== WalletErrorCode.SUCCESS) {
                return {
                    valid: false,
                    error: 'QR Code is invalid',
                };
            }

            /* Both integrated address and payment ID given */
            if (address.length === Config.integratedAddressLength && paymentID.length !== 0) {
                return {
                    valid: false,
                    error: 'QR Code is invalid',
                };
            }
        }

        //const addressError = validateAddresses([address], true, Config);

        /* Address isn't valid */
        //if (addressError.errorCode !== WalletErrorCode.SUCCESS) {
        if (address.length != 99 || !address.startsWith('SEKR')) {
            console.log('IU suck')
            return {
                valid: false,
                error: 'QR Code is invalid',
            };
        }

        const amountAtomic = Number(amount);

        /* No name, need to pick one.. */
        if (!name) {
            return {
                paymentID: paymentID || '',
                address,
                amount: !isNaN(amountAtomic) ? amountAtomic : undefined,
                suggestedAction: 'NewPayee',
                valid: true,
            }
        }

        const newPayee = {
            nickname: name,
            address: address,
            paymentID: paymentID || '',
        }

        const existingPayee = Globals.payees.find((p) => p.nickname === name);

        /* Payee exists already */
        if (existingPayee) {
            /* New payee doesn't match existing payee, get them to enter a new name */
            if (existingPayee.address !== newPayee.address ||
                existingPayee.paymentID !== newPayee.paymentID) {
                return {
                    paymentID: paymentID || '',
                    address,
                    amount: amountAtomic,
                    suggestedAction: 'NewPayee',
                    valid: true,
                };
            }
        /* Save payee to database for later use */
        } else {
            Globals.addPayee(newPayee);
        }

        if (!amount) {
            return {
                payee: newPayee,
                suggestedAction: 'Transfer',
                valid: true,
            };
        } else {
            return {
                payee: newPayee,
                amount: amountAtomic,
                suggestedAction: 'Confirm',
                valid: true,
            };
        }
    /* It's a standard address, try and parse it (or something else) */
    } else {
        //const addressError = validateAddresses([qrData], true, Config);

        if (qrData.length != 99 || !qrData.startsWith('SEKR')) {
            return {
                valid: false,
                error: 'QR code is invalid',
            };
        }

        return {
            valid: true,
            address: qrData,
            suggestedAction: 'NewPayee',
        }
    }
}

export function validAmount(amount, unlockedBalance) {
    if (amount === '' || amount === undefined || amount === null) {
        return [false, ''];
    }

    /* Remove commas in input */
    amount = amount.replace(/,/g, '');

    let numAmount = Number(amount);

    if (isNaN(numAmount)) {
        return [false, 'Amount is not a number!'];
    }

    /* Remove fractional component and convert to atomic */
    numAmount = Math.floor(toAtomic(numAmount));

    /* Must be above min send */
    if (numAmount < 1) {
        return [false, 'Amount is below minimum send!'];
    }

    if (numAmount > unlockedBalance) {
        return [false, 'Not enough funds available!'];
    }

    return [true, ''];
}

const hashCode = (str) => {
    let hash = Math.abs(str.hashCode())*0.007812499538;
return Math.floor(hash);

}
 export function get_avatar(hash) {
    // Displays a fixed identicon until user adds new contact address in the input field
    if (hash.length < 15) {
      hash = 'SEKReYanL2qEQF2HA8tu9wTpKBqoCA8TNb2mNRL5ZDyeFpxsoGNgBto3s3KJtt5PPrRH36tF7DBEJdjUn5v8eaESN2T5DPgRLVY';
    }
    // Get custom color scheme based on address
    let rgb = intToRGB(hashCode(hash));

    // Options for avatar
    var options = {
          foreground: [rgb.red, rgb.green, rgb.blue, 255],               // rgba black
          background: [parseInt(rgb.red/10), parseInt(rgb.green/10), parseInt(rgb.blue/10), 0],         // rgba white
          margin: 0.2,                              // 20% margin
          size: 50,                                // 420px square
          format: 'png'                           // use SVG instead of PNG
        };

    // create a base64 encoded SVG
    return 'data:image/png;base64,' + new Identicon(hash, options).toString();
  }