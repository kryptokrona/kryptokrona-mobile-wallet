// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import moment from 'moment';

import { Text, Platform, ToastAndroid } from 'react-native';

import { StackActions, NavigationActions } from 'react-navigation';

import Config from './Config';

export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function toastPopUp(message) {
    /* IOS doesn't have toast support */
    /* TODO */
    if (Platform.OS === 'ios') {
        return;
    }

    ToastAndroid.show(message, ToastAndroid.SHORT);
}

export function TextFixedWidth({ children }) {
    const fontFamily = Platform.OS === 'ios' ? 'Courier' : 'monospace'

    return (
        <Text style={{fontFamily, fontSize: 12}}>{ children }</Text>
    )
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
    return prettyPrintDate(moment(timestamp * 1000));
}

export function prettyPrintDate(date) {
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

    let blockHeight = Math.floor(difference / Config.blockTargetTime);

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
        return Math.ceiling(Config.blockTargetTime / 60) + ' minutes!';
    } else {
        return Config.blockTargetTime + ' seconds!';
    }
}
