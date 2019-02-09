// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import {
    View, Text, TextInput, TouchableWithoutFeedback,
} from 'react-native';

import { Input, Button } from 'react-native-elements';

import Config from './Config';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { removeFee, toAtomic, fromAtomic, addFee } from './Fee';

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
            errMsg: '',
            continueEnabled: false,
            unlockedBalanceHuman: fromAtomic(unlockedBalance),
            youSendAmount: '',
            recipientGetsAmount: '',
        }
    }

    tick() {
        const [unlockedBalance, lockedBalance] = Globals.wallet.getBalance();

        this.setState({
            unlockedBalance,
            lockedBalance,
            unlockedBalanceHuman: fromAtomic(unlockedBalance),
        });
    }

    checkErrors(amount) {
        const [valid, error] = this.validAmount(amount);

        this.setState({
            continueEnabled: valid,
            errMsg: error,
        });
    }

    validAmount(amount) {
        if (amount === '' || amount === undefined || amount === null) {
            return [false, ''];
        }

        /* Remove commas in input */
        amount = amount.replace(/,/g, '');

        let numAmount = Number(amount);

        if (isNaN(numAmount)) {
            return [false, 'Amount is not a number!'];
        }

        /* Remove fractional component and convert to atomic */
        numAmount = Math.floor(toAtomic(numAmount));

        /* Must be above min send */
        if (numAmount < 1) {
            return [false, 'Amount is below minimum send!'];
        }

        if (numAmount > this.state.unlockedBalance) {
            return [false, 'Not enough funds available!'];
        }

        return [true, ''];
    }

    convertSentToReceived(amount) {
        if (amount !== undefined && amount !== null) {
            amount = amount.replace(/,/g, '');
        }

        let numAmount = Number(amount);

        let result = '';

        if (!isNaN(numAmount) && numAmount > 0) {
            let feeInfo = removeFee(numAmount);

            result = feeInfo.remaining;
        }

        this.setState({
            recipientGetsAmount: result,
        });
    }

    convertReceivedToSent(amount) {
        if (amount !== undefined && amount !== null) {
            amount = amount.replace(/,/g, '');
        }

        let numAmount = Number(amount);

        let result = '';

        if (!isNaN(numAmount) && numAmount > 0) {
            let feeInfo = addFee(numAmount);

            result = feeInfo.original;
        }

        this.setState({
            youSendAmount: result,
        });
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Input
                    containerStyle={{
                        width: 330,
                        marginBottom: 20,
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
                        color: Config.theme.primaryColour,
                        fontSize: 30,
                        marginLeft: 5
                    }}
                    errorMessage={this.state.errMsg}
                    value={this.state.youSendAmount}
                    onChangeText={(text) => {
                        this.setState({
                            youSendAmount: text,
                        });

                        this.convertSentToReceived(text);

                        this.checkErrors(text);
                    }}
                />
                
                <Input
                    containerStyle={{
                        width: 330,
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
                        color: Config.theme.primaryColour,
                        fontSize: 30,
                        marginLeft: 5
                    }}
                    value={this.state.recipientGetsAmount}
                    onChangeText={(text) => {
                        this.setState({
                            recipientGetsAmount: text,
                        });

                        this.convertReceivedToSent(text);

                        this.checkErrors(text);
                    }}
                />

                <View style={[Styles.buttonContainer, {marginLeft: 235, marginBottom: 30}]}>
                    <Button
                        title="Send Max"
                        onPress={() => {
                            this.setState({
                                youSendAmount: this.state.unlockedBalanceHuman,
                            });

                            this.convertSentToReceived(this.state.unlockedBalanceHuman);

                            this.checkErrors(this.state.unlockedBalanceHuman);
                        }}
                        titleStyle={{
                            color: Config.theme.primaryColour,
                            textDecorationLine: 'underline',
                        }}
                        type="clear"
                    />
                </View>

                
                <View style={[Styles.buttonContainer, Styles.alignBottom, {bottom: 40}]}>
                    <Button
                        title="Continue"
                        onPress={() => console.log('foo')}
                        buttonStyle={{
                            backgroundColor: Config.theme.primaryColour,
                        }}
                        disabled={!this.state.continueEnabled}
                    />
                </View>

            </View>
        );
    }
}
