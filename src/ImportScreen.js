// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import {
    View, Image, Text
} from 'react-native';

import Config from './Config';

import { Styles } from './Styles';

/**
 * Import a wallet from keys/seed
 */
export class ImportWalletScreen extends React.Component {
    static navigationOptions = {
        title: 'Import',
    };
    
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center'}}>
                <View style={{justifyContent: 'center', alignItems: 'center'}}>
                    <Image
                        source={require('../assets/img/logo.png')}
                        style={Styles.logo}
                    />
                </View>
                <Text>Import a wallet!</Text>
            </View>
        );
    }
}
