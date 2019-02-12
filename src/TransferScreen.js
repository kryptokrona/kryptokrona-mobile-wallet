// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import AntDesign from 'react-native-vector-icons/AntDesign';

import QRCodeScanner from 'react-native-qrcode-scanner';

import { HeaderBackButton } from 'react-navigation';

import {
    validateAddresses, WalletErrorCode, validatePaymentID, prettyPrintAmount,
} from 'turtlecoin-wallet-backend';

import {
    View, Text, TextInput, TouchableWithoutFeedback, FlatList, Platform,
    ScrollView,
} from 'react-native';

import { Input, Button } from 'react-native-elements';

import Config from './Config';
import ListItem from './ListItem';
import List from './ListContainer';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { getArrivalTime } from './Utilities';
import { savePayeeToDatabase } from './Database';
import { Hr, BottomButton } from './SharedComponents';
import { removeFee, toAtomic, fromAtomic, addFee } from './Fee';

export class QrScannerScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{ flex: 1 }}>
                <QRCodeScanner
                    onRead={(code) => {
                        this.props.navigation.state.params.setAddress(code.data);
                        this.props.navigation.goBack();
                    }}
                    cameraProps={{captureAudio: false}}
                />
            </View>
        );
    }
}

class AmountInput extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Input
                containerStyle={{
                    width: '90%',
                    marginLeft: 20,
                    marginBottom: this.props.marginBottom || 0,
                }}
                inputContainerStyle={{
                    borderColor: 'lightgrey',
                    borderWidth: 1,
                    borderRadius: 2,
                }}
                label={this.props.label}
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
                errorMessage={this.props.errorMessage}
                value={this.props.value}
                onChangeText={(text) => this.props.onChangeText(text)}
            />
        );
    }
}

/**
 * Send a transaction
 */
export class TransferScreen extends React.Component {
    static navigationOptions = ({ navigation }) => {
        return {
            title: '',
            headerLeft: (
                <HeaderBackButton
                    tintColor={Config.theme.primaryColour}
                    onPress={() => { navigation.navigate('Main') }}
                />
            ),
        }
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
            feeInfo: {},
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
        let feeInfo = {};

        if (!isNaN(numAmount) && numAmount > 0) {
            feeInfo = removeFee(numAmount);
            result = feeInfo.remaining;
        }

        this.setState({
            recipientGetsAmount: result,
            feeInfo,
        });
    }

    convertReceivedToSent(amount) {
        if (amount !== undefined && amount !== null) {
            amount = amount.replace(/,/g, '');
        }

        let numAmount = Number(amount);

        let result = '';
        let feeInfo = {};

        if (!isNaN(numAmount) && numAmount > 0) {
            feeInfo = addFee(numAmount);
            result = feeInfo.original;
        }

        this.setState({
            youSendAmount: result,
            feeInfo
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
            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                flex: 1,
                marginTop: 60,
            }}>

                <Text style={{
                    color: Config.theme.primaryColour,
                    fontSize: 25,
                    marginBottom: 40,
                    marginLeft: 30
                }}>
                    How much {Config.coinName} do you want to send?
                </Text>

                <AmountInput
                    label={'You send'}
                    value={this.state.youSendAmount}
                    onChangeText={(text) => {
                        this.setState({
                            youSendAmount: text,
                        });

                        this.convertSentToReceived(text);

                        this.checkErrors(text);
                    }}
                    errorMessage={this.state.errMsg}
                    marginBottom={40}
                />

                <AmountInput
                    label={'Recipient gets'}
                    value={this.state.recipientGetsAmount}
                    onChangeText={(text) => {
                        this.setState({
                            recipientGetsAmount: text,
                        });

                        this.convertReceivedToSent(text);
                        this.checkErrors(text);
                    }}
                />

                <View style={{ marginLeft: '70%' }}>
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

                <Text style={{
                    color: Config.theme.primaryColour,
                    fontSize: 18,
                    marginLeft: 30,
                    marginTop: 20,
                }}>
                    Should arrive in {getArrivalTime()}
                </Text>

                <BottomButton
                    title="Continue"
                    onPress={() => {
                        this.props.navigation.navigate(
                            'ChoosePayee',
                            { amount: this.state.feeInfo }
                        );
                    }} 
                    disabled={!this.state.continueEnabled}
                />

            </View>
        );
    }
}

class AddressBook extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <List style={{ marginBottom: 20 }}>
                <FlatList
                    data={Globals.payees}
                    keyExtractor={item => item.nickname}
                    renderItem={({item}) => (
                        <ListItem
                            title={item.nickname}
                            subtitle={item.address.substr(0, 15) + '...'}
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
                                        {item.nickname[0].toUpperCase()}
                                    </Text>
                                </View>
                            }
                            onPress={() => {
                                this.props.navigation.navigate(
                                    'Confirm', {
                                        payee: item.nickname,
                                        amount: this.props.navigation.state.params.amount,
                                    }
                                );
                            }}
                        />
                    )}
                />
            </List>
        );
    }
}

class ExistingPayees extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const noPayeesComponent =
            <View>
                <Hr/>
                <Text style={{ color: Config.theme.primaryColour, marginTop: 10, fontSize: 16}}>
                    Your address book is empty! Add a new recipient above to populate it.
                </Text>
            </View>

        return(
            <View style={{
                flex: 1,
                width: '90%',
            }}>
                <Text style={{ color: Config.theme.primaryColour, marginTop: 40 }}>
                    Address Book
                </Text>

                {Globals.payees.length > 0 ? <AddressBook {...this.props}/> : noPayeesComponent}
            </View>
        );
    }
}

export class NewPayeeScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            nickname: '',
            address: '',
            paymentID: '',
            paymentIDEnabled: true,
            addressError: '',
            paymentIDError: '',
            nicknameError: '',
        };
    }

    setAddressFromQrCode(address) {
        this.setState({
            address,
        }, () => this.checkErrors());
    }

    async validAddress(address) {
        let errorMessage = '';

        if (address === '' || address === undefined || address === null) {
            return [false, errorMessage];
        }

        /* Disable payment ID and wipe input if integrated address */
        if (address.length === Config.integratedAddressLength) {
            await this.setState({
                paymentID: '',
                paymentIDEnabled: false,
            });
        } else {
            this.setState({
                paymentIDEnabled: true,
            });
        }

        const addressError = validateAddresses([address], true);

        if (addressError.errorCode !== WalletErrorCode.SUCCESS) {
            errorMessage = addressError.toString();

            return [false, errorMessage];
        }

        return [true, errorMessage];
    }

    validPaymentID(paymentID) {
        let errorMessage = '';

        if (paymentID === '') {
            return [true, errorMessage];
        }

        if (paymentID === undefined || paymentID === null) {
            return [false, errorMessage];
        }

        const paymentIDError = validatePaymentID(paymentID);

        if (paymentIDError.errorCode !== WalletErrorCode.SUCCESS) {
            errorMessage = paymentIDError.toString();

            return [false, errorMessage];
        }

        return [true, errorMessage];
    }

    validNickname(nickname) {
        let errorMessage = '';

        if (nickname === '' || nickname === undefined || nickname === null) {
            return [false, errorMessage];
        }

        if (Globals.payees.some((payee) => payee.nickname === nickname)) {
            errorMessage = `A payee with the name ${nickname} already exists.`;
            return [false, errorMessage];
        }

        return [true, errorMessage];
    }

    checkErrors() {
        (async() => {

            const [addressValid, addressError] = await this.validAddress(this.state.address);
            const [paymentIDValid, paymentIDError] = this.validPaymentID(this.state.paymentID);
            const [nicknameValid, nicknameError] = this.validNickname(this.state.nickname);

            this.setState({
                continueEnabled: addressValid && paymentIDValid && nicknameValid,
                addressError,
                paymentIDError,
                nicknameError,
            });

        })();
    }

    render() {
        return(
            <View style={{
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                flex: 1,
                marginTop: 60,
            }}>
                <Text style={{ color: Config.theme.primaryColour, fontSize: 25, marginBottom: 40, marginLeft: 30 }}>
                    New Payee
                </Text>

                <Input
                    containerStyle={{
                        width: '90%',
                        marginLeft: 20,
                        marginBottom: 30,
                    }}
                    inputContainerStyle={{
                        borderColor: 'lightgrey',
                        borderWidth: 1,
                        borderRadius: 2,
                    }}
                    label={'Name of recipient'}
                    labelStyle={{
                        marginBottom: 5,
                        marginRight: 2,
                    }}
                    inputStyle={{
                        color: Config.theme.primaryColour,
                        fontSize: 30,
                        marginLeft: 5
                    }}
                    value={this.state.nickname}
                    onChangeText={(text) => {
                        this.setState({
                            nickname: text,
                        }, () => this.checkErrors());
                    }}
                    errorMessage={this.state.nicknameError}
                />

                <Input
                    containerStyle={{
                        width: '90%',
                        marginLeft: 20,
                    }}
                    inputContainerStyle={{
                        borderColor: 'lightgrey',
                        borderWidth: 1,
                        borderRadius: 2,
                    }}
                    maxLength={Config.integratedAddressLength}
                    label={'Recipient\'s address'}
                    labelStyle={{
                        marginBottom: 5,
                        marginRight: 2,
                    }}
                    inputStyle={{
                        color: Config.theme.primaryColour,
                        fontSize: 15,
                        marginLeft: 5
                    }}
                    value={this.state.address}
                    onChangeText={(text) => {
                        this.setState({
                            address: text,
                        }, () => this.checkErrors());
                    }}
                    errorMessage={this.state.addressError}
                />

                <View style={{ marginLeft: '63%' }}>
                    <Button
                        title='Scan QR Code'
                        onPress={() => {
                            this.props.navigation.navigate('QrScanner', { setAddress: this.setAddressFromQrCode.bind(this) } );
                        }}
                        titleStyle={{
                            color: Config.theme.primaryColour,
                            textDecorationLine: 'underline',
                        }}
                        type="clear"
                    />
                </View>

                <Input
                    containerStyle={{
                        width: '90%',
                        marginLeft: 20,
                    }}
                    inputContainerStyle={{
                        borderColor: 'lightgrey',
                        borderWidth: 1,
                        borderRadius: 2,
                    }}
                    maxLength={64}
                    label={'Recipient\'s Payment ID (optional)'}
                    labelStyle={{
                        marginBottom: 5,
                        marginRight: 2,
                    }}
                    inputStyle={{
                        color: Config.theme.primaryColour,
                        fontSize: 15,
                        marginLeft: 5
                    }}
                    value={this.state.paymentID}
                    onChangeText={(text) => {
                        this.setState({
                            paymentID: text
                        }, () => this.checkErrors());
                    }}
                    editable={this.state.paymentIDEnabled}
                    errorMessage={this.state.paymentIDError}
                />

                <BottomButton
                    title="Continue"
                    onPress={() => {
                        const payee = {
                            nickname: this.state.nickname,
                            address: this.state.address,
                            paymentID: this.state.paymentID,
                        };

                        /* Add payee to global payee store */
                        Globals.payees.push(payee);
                        
                        /* Save payee to DB */
                        savePayeeToDatabase(payee);

                        this.props.navigation.navigate(
                            'Confirm', {
                                payee: this.state.nickname,
                                amount: this.props.navigation.state.params.amount,
                            }
                        );
                    }}
                    disabled={!this.state.continueEnabled}
                />

            </View>
        );
    }
}

export class ConfirmScreen extends React.Component {
    constructor(props) {
        super(props);

        const payee = Globals.payees.find((p) => p.nickname === this.props.navigation.state.params.payee);

        this.state = {
            payee,
            amount: this.props.navigation.state.params.amount,
        };
    }

    render() {
        return(
            <View style={{ flex: 1 }}>
                <View style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 60,
                    marginHorizontal: 30,
                }}>
                    <Text style={{ color: Config.theme.primaryColour, fontSize: 25, marginBottom: 25, fontWeight: 'bold' }}>
                        Review your transfer
                    </Text>
                </View>

                <ScrollView contentContainerStyle={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginHorizontal: 30,
                    paddingBottom: 70,
                }}>
                    <Text style={{ fontSize: 13 }}>
                        <Text style={{ color: Config.theme.primaryColour, fontWeight: 'bold' }}>
                            {prettyPrintAmount(this.state.amount.remainingAtomic)}{' '}
                        </Text>
                        will reach{' '}
                        <Text style={{ color: Config.theme.primaryColour, fontWeight: 'bold' }}>
                            {this.state.payee.nickname}'s{' '}
                        </Text>
                        account, in {getArrivalTime()}
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 15,
                        width: '100%',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{ fontSize: 15, color: Config.theme.primaryColour, fontWeight: 'bold' }}>
                            {this.state.payee.nickname}'s details
                        </Text>

                        <Button
                            title='Change'
                            onPress={() => {
                                /* TODO */
                            }}
                            titleStyle={{
                                color: Config.theme.primaryColour,
                                fontSize: 13
                            }}
                            type="clear"
                        />
                    </View>

                    <View style={{ borderWidth: 0.5, borderColor: 'lightgrey', width: '100%' }}/>

                    <Text style={{ marginBottom: 5, marginTop: 20 }}>
                        Address
                    </Text>

                    <Text style={{ color: Config.theme.primaryColour, fontSize: 16 }}>
                        {this.state.payee.address}
                    </Text>

                    {this.state.payee.paymentID !== '' &&
                    <View>
                        <Text style={{ marginBottom: 5, marginTop: 20 }}>
                            Payment ID
                        </Text>

                        <Text style={{ color: Config.theme.primaryColour, fontSize: 16 }}>
                            {this.state.payee.paymentID}
                        </Text>
                    </View>}

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 15,
                        width: '100%',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{ fontSize: 15, color: Config.theme.primaryColour, fontWeight: 'bold' }}>
                            Transfer details
                        </Text>

                        <Button
                            title='Change'
                            onPress={() => {
                                /* TODO */
                            }}
                            titleStyle={{
                                color: Config.theme.primaryColour,
                                fontSize: 13
                            }}
                            type="clear"
                        />
                    </View>

                    <View style={{ borderWidth: 0.5, borderColor: 'lightgrey', width: '100%' }}/>

                    <Text style={{ marginBottom: 5, marginTop: 20 }}>
                        You're sending
                    </Text>

                    <Text style={{ color: Config.theme.primaryColour, fontSize: 16 }}>
                        {prettyPrintAmount(this.state.amount.originalAtomic)}
                    </Text>

                    <Text style={{ marginBottom: 5, marginTop: 20 }}>
                        {this.state.payee.nickname} gets
                    </Text>

                    <Text style={{ color: Config.theme.primaryColour, fontSize: 16 }}>
                        {prettyPrintAmount(this.state.amount.remainingAtomic)}
                    </Text>

                    <Text style={{ marginBottom: 5, marginTop: 20 }}>
                        Network fee
                    </Text>

                    <Text style={{ color: Config.theme.primaryColour, fontSize: 16 }}>
                        {prettyPrintAmount(this.state.amount.networkFeeAtomic)}
                    </Text>

                    {this.state.amount.devFeeAtomic > 0 &&
                    <View>
                        <Text style={{ marginBottom: 5, marginTop: 20 }}>
                            Developer fee
                        </Text>

                        <Text style={{ color: Config.theme.primaryColour, fontSize: 16 }}>
                            {prettyPrintAmount(this.state.amount.devFeeAtomic)}
                        </Text>
                    </View>}

                    {this.state.amount.nodeFeeAtomic > 0 &&
                    <View>
                        <Text style={{ marginBottom: 5, marginTop: 20 }}>
                            Node fee
                        </Text>

                        <Text style={{ color: Config.theme.primaryColour, fontSize: 16 }}>
                            {prettyPrintAmount(this.state.amount.nodeFeeAtomic)}
                        </Text>
                    </View>}

                    {this.state.amount.totalFeeAtomic > this.state.amount.networkFeeAtomic &&
                    <View>
                        <Text style={{ marginBottom: 5, marginTop: 20 }}>
                            Total fee
                        </Text>

                        <Text style={{ color: Config.theme.primaryColour, fontSize: 16 }}>
                            {prettyPrintAmount(this.state.amount.totalFeeAtomic)}
                        </Text>
                    </View>}

                </ScrollView>

                <BottomButton
                    title="Send Transaction"
                    onPress={() => {
                        console.log('')
                    }}
                />
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
                marginTop: 60,
                marginRight: 10,
            }}>
                <Text style={{ color: Config.theme.primaryColour, fontSize: 25, marginBottom: 40 }}>
                    Who are you sending to?
                </Text>
                
                <TouchableWithoutFeedback
                    onPress={() => {
                        this.props.navigation.navigate(
                            'NewPayee', {
                                amount: this.props.navigation.state.params.amount
                            },
                        );
                    }}
                >
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
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
                </TouchableWithoutFeedback>

                <Hr/>

                <ExistingPayees {...this.props}/>

            </View>
        );
    }
}
