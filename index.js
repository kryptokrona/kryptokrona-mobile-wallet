// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import { AppRegistry } from 'react-native';

import { name as appName } from './app.json';

import './shim';

import App from './src/App';

import { initSentry } from './src/Sentry';

initSentry();

AppRegistry.registerComponent(appName, () => App);
