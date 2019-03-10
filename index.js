// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import { AppRegistry } from 'react-native';

import { Sentry } from 'react-native-sentry';

import { name as appName } from './app.json';

import './shim';

import App from './src/App';
import Config from './src/Config';

/* CHANGE THIS IF YOU ARE FORKING! */
/* Manually comparing to TurtleCoin to try and prevent getting errors reported
   for forks... */
if (!__DEV__ && Config.coinName === 'TurtleCoin') {
    Sentry.config('https://8ecf138e1d1e4d558178be3f2b5e1925@sentry.io/1411753').install();
    Sentry.setVersion(Config.appVersion);
}

AppRegistry.registerComponent(appName, () => App);
