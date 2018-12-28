// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';
import { StyleSheet, Text, View, Image, Button } from 'react-native';

import Realm from 'realm';

class DatabaseComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = { realm: null };
    }

    componentWillMount() {
        this.openWallet();
    }

    componentWillUnmount() {
        this.saveWallet();
    }

    saveWallet() {
        Realm.open({
            schema: [WalletSchema]
        }).then(realm => {
            realm.write(() => {
                const myWallet = realm.create('Wallet', {
                    balance: 9001,
                });
            });
        });
    }

    openWallet() {
        Realm.open({
            schema: [WalletSchema]
        }).then(realm => {
            const wallets = realm.objects('Wallet');
            console.log(wallets);
            this.setState({realm});
        });
    }

    render() {
        const info = this.state.realm 
            ? 'Wallets: ' + this.state.realm.objects('Wallet').length
            : 'Loading wallet...';

        return(
            <View style={{ flex: 1, justifyContent: 'flex-start'}}>
                <Text>{info}</Text>
            </View>
        );
    }
}

const WalletSchema = {
    name: 'Wallet',
    properties: {
        balance: {type: 'int', default: 0}
    }
};

module.exports = DatabaseComponent;
