// Copyright (C) 2018-2019, Zpalmtree
//
// Please see the included LICENSE file for more information.

import './shim';

import { AppRegistry } from 'react-native';

import App from './src/App';

import { initSentry } from './src/Sentry';

import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
