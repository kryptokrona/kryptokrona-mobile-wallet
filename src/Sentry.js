// Copyright (C) 2019, Zpalmtree
//
// Please see the included LICENSE file for more information.

import { Sentry } from 'react-native-sentry';

import Config from './Config';

const sentryIsEnabled = !__DEV__ && Config.coinName === 'TurtleCoin';

export function reportCaughtException(err) {
    if (sentryIsEnabled) {
        try {
            Sentry.captureException(err);
        } catch (e) {
        }
    }
}

export function initSentry() {
    /* CHANGE THIS IF YOU ARE FORKING! */
    /* Manually comparing to TurtleCoin to try and prevent getting errors reported
       for forks... */
    if (sentryIsEnabled) {
        Sentry.config('https://8ecf138e1d1e4d558178be3f2b5e1925@sentry.io/1411753').install();
        Sentry.setVersion(Config.appVersion);
    }
}
