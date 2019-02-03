// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import { View, Text } from 'react-native';

import Config from './Config';

export class PickMonthScreen extends React.Component {
    static navigationOptions = {
        title: 'Pick Creation Month',
    };

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{ flex: 1, marginTop: 40, justifyContent: 'center', alignItems: 'stretch' }}>
                <Text style={{
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: Config.theme.primaryColour,
                    textAlign: 'center',
                    fontSize: 25
                }}>
                    What month did you create your wallet?
                </Text>
            </View>
        );
    }
}

export class PickBlockHeightScreen extends React.Component {
    static navigationOptions = {
        title: 'Pick Creation Block Height',
    };

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{ flex: 1, marginTop: 40, justifyContent: 'center', alignItems: 'stretch' }}>
                <Text style={{
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: Config.theme.primaryColour,
                    textAlign: 'center',
                    fontSize: 25
                }}>
                    Between which block range did you create your wallet?
                </Text>
            </View>
        );
    }
}
