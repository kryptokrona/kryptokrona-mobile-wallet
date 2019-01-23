// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import { Text, Platform, ToastAndroid } from 'react-native';

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

export function TextFixedWidth ({ children }) {
    const fontFamily = Platform.OS === 'ios' ? 'Courier' : 'monospace'

    return (
        <Text style={{fontFamily}}>{ children }</Text>
    )
}
