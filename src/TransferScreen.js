// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import {
    View, Text, Button, TextInput,
} from 'react-native';

import { Input } from 'react-native-elements';

import Config from './Config';

import { Styles } from './Styles';
import { Globals } from './Globals';

/**
 * Send a transaction
 */
export class TransferScreen extends React.Component {
    static navigationOptions = {
        title: 'Transfer',
    };

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <AmountScreen/>
        );
    }
}

export class AmountScreen extends React.Component {
    static navigationOptions = {
        title: 'Transfer',
    };

    constructor(props) {
        super(props);

        const [unlockedBalance, lockedBalance] = Globals.wallet.getBalance();

        this.state = {
            unlockedBalance,
            lockedBalance,
            sendAmountErrMsg : 'You do not have enough funds. Available: 100 TRTL',
            receiveAmountErrMsg: '',
        }
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Input
                    containerStyle={{
                        width: 330,
                        marginBottom: 50,
                    }}
                    inputContainerStyle={{
                        borderColor: 'lightgrey',
                        borderWidth: 1,
                        borderRadius: 2,
                    }}
                    label='You send'
                    labelStyle={{
                        marginBottom: 5,
                        marginRight: 2,
                    }}
                    rightIcon={
                        <Text style={{ fontSize: 30, marginRight: 10, color: Config.theme.primaryColour }}>
                            {Config.ticker}
                        </Text>
                    }
                    keyboardType={'number-pad'}
                    inputStyle={{
                        color: 'gray',
                        fontSize: 30,
                    }}
                    errorMessage={this.state.sendAmountErrMsg}
                />

                <Input
                    containerStyle={{
                        width: 330,
                        marginBottom: 30,
                    }}
                    inputContainerStyle={{
                        borderColor: 'lightgrey',
                        borderWidth: 1,
                        borderRadius: 2,
                    }}
                    label='Recipient gets'
                    labelStyle={{
                        marginBottom: 5,
                        marginRight: 2,
                    }}
                    rightIcon={
                        <Text style={{ fontSize: 30, marginRight: 10, color: Config.theme.primaryColour }}>
                            {Config.ticker}
                        </Text>
                    }
                    keyboardType={'number-pad'}
                    inputStyle={{
                        color: 'gray',
                        fontSize: 30,
                    }}
                    errorMessage={this.state.receiveAmountErrMsg}
                />

                <View style={[Styles.buttonContainer, Styles.alignBottom, {bottom: 40}]}>
                    <Button
                        title="Continue"
                        onPress={() => console.log('foo')}
                        color={Config.theme.primaryColour}
                    />
                </View>

            </View>
        );
    }
}
