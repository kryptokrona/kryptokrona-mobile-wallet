// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import AntDesign from 'react-native-vector-icons/AntDesign';

import {
    View, Text, TextInput, TouchableWithoutFeedback, FlatList, Platform,
} from 'react-native';

import { Input, Button } from 'react-native-elements';

import Config from './Config';
import ListItem from './ListItem';
import List from './ListContainer';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { Hr } from './SharedComponents';
import { removeFee, toAtomic, fromAtomic, addFee } from './Fee';

/**
 * Send a transaction
 */
export class TransferScreen extends React.Component {
    static navigationOptions = {
        title: 'Transfer',
        header: null,
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
                        marginBottom: 40,
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
                        onPress={() => this.props.navigation.navigate('ChoosePayee')} 
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

export class ExistingPayees extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{
                flex: 1,
                width: '90%',
            }}>
                <Text style={{ color: Config.theme.primaryColour, marginTop: 40 }}>
                    Address Book
                </Text>

                <List>
                    <FlatList
                        data={[
                            {
                                title: 'Exchange',
                                address: 'TRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW',
                            },
                            {
                                title: 'Tipjar',
                                address: 'TRTLuxtaj1Q9aGxQ4Tovu59ukhuCam5gE9EP492YrcMEA4vSDHLymoyCQhqNT9YwSRAQvxTAvdazc9QgjMJWf8XAAZsfrbCv4i22eeNaty9F3VXnU8GXwoVRvTvHaVVafpGKTfBJXYGySdQ5C7uwFkx7uSJpp4fwwkv3nUQ54MbFStQmjaC8yFnB5gi',
                            }
                        ]}
                        keyExtractor={item => item.address}
                        renderItem={({item}) => (
                            <ListItem
                                title={item.title}
                                subtitle={item.address.substr(0, 25) + '...'}
                                subtitleStyle={{
                                    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
                                }}
                                leftIcon={
                                    <View style={{
                                        width: 50,
                                        height: 50,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: 'ghostwhite',
                                        borderRadius: 45
                                    }}>
                                        <Text style={[Styles.centeredText, { fontSize: 30, color: Config.theme.primaryColour }]}>
                                            {item.title[0].toUpperCase()}
                                        </Text>
                                    </View>
                                }
                            />
                        )}
                    />
                </List>
            </View>
        );
    }
}

export class ChoosePayeeScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{ 
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                flex: 1,
                marginLeft: 30,
                marginTop: 60
            }}>
                <Text style={[Styles.centeredText, { color: Config.theme.primaryColour, fontSize: 25, marginBottom: 40 }]}>
                    Who are you sending to?
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>

                    <View style={{
                        height: 37,
                        width: 37,
                        borderWidth: 1,
                        borderColor: 'lightgrey',
                        borderRadius: 45,
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <AntDesign
                            name={'adduser'}
                            size={28}
                            color={'grey'}
                            padding={5}
                        />
                    </View>

                    <Text style={{ marginLeft: 15, color: Config.theme.primaryColour, fontSize: 16 }}>
                        Add a new recipient
                    </Text>
                </View>

                <Hr/>

                <ExistingPayees/>
            </View>
        );
    }
}
