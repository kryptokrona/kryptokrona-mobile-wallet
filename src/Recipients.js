// Copyright (C) 2019, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';
import Identicon from 'identicon.js';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import {
    View, Text, ScrollView, FlatList, Platform, TouchableWithoutFeedback, Image
} from 'react-native';

import {
    validateAddresses, WalletErrorCode, validatePaymentID,
} from 'turtlecoin-wallet-backend';

import { Button as RNEButton, Alert } from 'react-native';

import { Button, Input } from 'react-native-elements';

import Config from './Config';
import ListItem from './ListItem';
import List from './ListContainer';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { Hr, BottomButton } from './SharedComponents';

const intToRGB = (int) => {

  if (typeof int !== 'number') throw new Error(errorMessage);
  if (Math.floor(int) !== int) throw new Error(errorMessage);
  if (int < 0 || int > 16777215) throw new Error(errorMessage);

  var red = int >> 16;
  var green = int - (red << 16) >> 8;
  var blue = int - (red << 16) - (green << 8);

  return {
    red: red,
    green: green,
    blue: blue
  }
}


String.prototype.hashCode = function() {
    var hash = 0;
    if (this.length == 0) {
        return hash;
    }
    for (var i = 0; i < this.length; i++) {
        var char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
}

const hashCode = (str) => {
		let hash = Math.abs(str.hashCode())*0.007812499538;
    return Math.floor(hash);

}


            function get_avatar(hash) {
              // Displays a fixed identicon until user adds new contact address in the input field
              if (hash.length < 15) {
                hash = 'SEKReYanL2qEQF2HA8tu9wTpKBqoCA8TNb2mNRL5ZDyeFpxsoGNgBto3s3KJtt5PPrRH36tF7DBEJdjUn5v8eaESN2T5DPgRLVY';
              }
              // Get custom color scheme based on address
              let rgb = intToRGB(hashCode(hash));

              // Options for avatar
              var options = {
                    foreground: [rgb.red, rgb.green, rgb.blue, 255],               // rgba black
                    background: [parseInt(rgb.red/10), parseInt(rgb.green/10), parseInt(rgb.blue/10), 0],         // rgba white
                    margin: 0.2,                              // 20% margin
                    size: 50,                                // 420px square
                    format: 'png'                           // use SVG instead of PNG
                  };

              // create a base64 encoded SVG
              return 'data:image/png;base64,' + new Identicon(hash, options).toString();
            }

export class RecipientsScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            payees: Globals.payees,
            index: 0,
        }

        Globals.updatePayeeFunctions.push(() => {
            this.setState(prevState => ({
                payees: Globals.payees,
                index: prevState.index + 1,
            }))
        });
    }

    render() {
        const noPayeesComponent =
            <View style={{
                width: '100%',
            }}>

                <Text style={{
                    color: this.props.screenProps.theme.primaryColour,
                    marginTop: 10,
                    fontSize: 16
                }}>
                    Your address book is empty! Add a new recipient above to populate it.
                </Text>
            </View>;


        const addressBookComponent =
            <List style={{
                width: '100%',
                height: '70%',
                marginBottom: 20,
                backgroundColor: this.props.screenProps.theme.backgroundColour,
                borderWidth: 0,
                borderColor: 'transparent'
            }}>
                    <FlatList
                        extraData={this.state.index}
                        data={this.state.payees}
                        keyExtractor={item => item.nickname}
                        renderItem={({item}) => (
                            <ListItem
                                title={item.nickname}
                                subtitle={item.address.substr(0, 15) + '...'}
                                subtitleStyle={{
                                    fontFamily: "Montserrat-Regular"
                                }}
                                leftIcon={
                                    <Image
                                      style={{width: 50, height: 50}}
                                      source={{uri: get_avatar(item.address)}}
                                    />
                                    // <View style={{
                                    //     width: 50,
                                    //     height: 50,
                                    //     alignItems: 'center',
                                    //     justifyContent: 'center',
                                    //     backgroundColor: this.props.screenProps.theme.iconColour,
                                    //     borderRadius: 45
                                    // }}>
                                    //     <Text style={[Styles.centeredText, {
                                    //         fontSize: 30,
                                    //         color: this.props.screenProps.theme.primaryColour,
                                    //     }]}>
                                    //         {item.nickname[0].toUpperCase()}
                                    //     </Text>
                                    //
                                    // </View>
                                }
                                titleStyle={{
                                    color: this.props.screenProps.theme.primaryColour,
                                    fontFamily: 'Montserrat-SemiBold'
                                }}
                                subtitleStyle={{
                                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                                    fontFamily: 'Montserrat-Regular'
                                }}
                                onPress={() => {
                                    this.props.navigation.navigate(
                                        'ModifyPayee', {
                                            payee: item,
                                        }
                                    );
                                }}
                            />
                        )}
                    />
            </List>;

        return(
            <View style={{
                backgroundColor: this.props.screenProps.theme.backgroundColour,
                flex: 1,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}>
                <View style={{
                    flex: 1,
                    marginLeft: 30,
                    marginTop: 60,
                    width: '85%'
                }}>
                    <TouchableWithoutFeedback
                        onPress={() => {
                            this.props.navigation.navigate('NewPayee', {
                                finishFunction: () => {
                                    this.props.navigation.navigate('Recipients');
                                }
                            })
                        }}
                    >
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            height: 40,
                        }}>
                            <View style={{
                                height: 37,
                                width: 37,
                                borderWidth: 1,
                                borderColor: this.props.screenProps.theme.notVeryVisibleColour,
                                borderRadius: 45,
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <SimpleLineIcons
                                    name={'user-follow'}
                                    size={24}
                                    color={this.props.screenProps.theme.slightlyMoreVisibleColour}
                                    padding={5}
                                />
                            </View>

                            <Text style={{
                                marginLeft: 15,
                                color: this.props.screenProps.theme.primaryColour,
                                fontSize: 24,
                                fontFamily: "Montserrat-SemiBold"
                            }}>
                                Add a new recipient
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>


                    <View style={{
                        backgroundColor: this.props.screenProps.theme.backgroundColour,
                        flex: 1,
                        marginRight: 15,
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                    }}>
                        <Text style={{
                            color: this.props.screenProps.theme.primaryColour,
                            fontSize: 24,
                            marginTop: 30,
                            fontFamily: "Montserrat-SemiBold"
                        }}>
                            Modify an existing recipient
                        </Text>

                        {this.state.payees.length > 0 ? addressBookComponent : noPayeesComponent}

                    </View>
                </View>
            </View>
        );
    }
}

function isPaymentIDValid(paymentID) {
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

class ModifyPaymentID extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Input
                containerStyle={{
                    width: '100%',
                }}
                inputContainerStyle={{
                    borderColor: this.props.screenProps.theme.notVeryVisibleColour,
                    borderWidth: this.props.disabled ? 0 : 1,
                    borderRadius: 2,
                    width: '100%',
                    height: 30,
                }}
                inputStyle={{
                    color: this.props.screenProps.theme.primaryColour,
                    fontSize: 14,
                    backgroundColor: this.props.disabled ?
                                     this.props.screenProps.theme.disabledColour :
                                     this.props.screenProps.theme.backgroundColor,
                }}
                maxLength={64}
                value={this.props.paymentID}
                onChangeText={(text) => {
                    if (this.props.onChange) {
                        this.props.onChange(text);
                    }
                }}
                errorMessage={this.props.error}
                editable={!this.props.disabled}
                placeholder={this.props.disabled ? 'Disabled when using an integrated address' : ''}
            />
        );
    }
}

function isAddressValid(address) {
    let errorMessage = '';

    if (address === '' || address === undefined || address === null) {
        errorMessage = 'Address cannot be blank.';
        return [false, errorMessage];
    }

    const addressError = validateAddresses([address], true, Config);

    if (addressError.errorCode !== WalletErrorCode.SUCCESS) {
        errorMessage = addressError.toString();
        return [false, errorMessage];
    }

    return [true, errorMessage];
}

class ModifyAddress extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Input
                containerStyle={{
                    width: '100%',
                }}
                inputContainerStyle={{
                    borderColor: this.props.screenProps.theme.notVeryVisibleColour,
                    borderWidth: 1,
                    borderRadius: 2,
                    width: '100%',
                    height: 30,
                }}
                inputStyle={{
                    color: this.props.screenProps.theme.primaryColour,
                    fontSize: 14,
                }}
                maxLength={Config.integratedAddressLength}
                value={this.props.address}
                onChangeText={(text) => {
                    if (this.props.onChange) {
                        this.props.onChange(text);
                    }
                }}
                errorMessage={this.props.error}
            />
        );
    }
}

function isNicknameValid(nickname, initialNickname) {
    let errorMessage = '';

    if (nickname === '' || nickname === undefined || nickname === null) {
        errorMessage = 'Name cannot be blank.';
        return [false, errorMessage];
    }

    if (Globals.payees.some((payee) => payee.nickname === nickname) && nickname != initialNickname) {
        errorMessage = `A payee with the name ${nickname} already exists.`;

        return [false, errorMessage];
    }

    return [true, errorMessage];
}

class ModifyNickname extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <Input
                containerStyle={{
                    width: '100%',
                }}
                inputContainerStyle={{
                    borderColor: this.props.screenProps.theme.notVeryVisibleColour,
                    borderWidth: 1,
                    borderRadius: 2,
                    width: '100%',
                    height: 30,
                }}
                inputStyle={{
                    color: this.props.screenProps.theme.primaryColour,
                    fontSize: 14,
                }}
                value={this.props.nickname}
                onChangeText={(text) => {
                    if (this.props.onChange) {
                        this.props.onChange(text);
                    }
                }}
                errorMessage={this.props.error}
            />
        );
    }
}

export class ModifyPayeeScreen extends React.Component {
    constructor(props) {
        super(props);

        const { address, nickname, paymentID } = this.props.navigation.state.params.payee;

        this.state = {
            address,
            nickname,
            paymentID,

            initialAddress: address,
            initialNickname: nickname,
            initialPaymentID: paymentID,

            modifyAddress: false,
            modifyNickname: false,
            modifyPaymentID: false,

            newAddress: address,
            newNickname: nickname,
            newPaymentID: paymentID,

            addressError: '',
            nicknameError: '',
            paymentIDError: '',

            paymentIDEnabled: address.length !== Config.integratedAddressLength,

            addressValid: true,
            nicknameValid: true,
            paymentIDValid: true,
        }
    }

    render() {
        return(
            <View style={{
                flex: 1,
                backgroundColor: this.props.screenProps.theme.backgroundColour,
                justifycontent: 'flex-start',
                alignItems: 'flex-start',
            }}>
                <View style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 60,
                    marginLeft: 30,
                    backgroundColor: this.props.screenProps.theme.backgroundColour,
                }}>
                    <Text style={{
                        color: this.props.screenProps.theme.primaryColour,
                        fontSize: 25,
                        marginBottom: 25,
                        fontWeight: 'bold',
                        fontFamily: 'Montserrat-SemiBold'
                    }}>
                        Modify Recipient
                    </Text>
                </View>

                <View style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginHorizontal: 30,
                }}>
                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 15,
                        width: '100%',
                        justifyContent: 'space-between'
                    }}>
                        <Image
                          style={{width: 50, height: 50}}
                          source={{uri: get_avatar(this.state.address)}}
                        />
                        <Text style={{ fontSize: 15, color: this.props.screenProps.theme.primaryColour, fontFamily: 'Montserrat-SemiBold' }}>
                            {this.state.nickname}'s details
                        </Text>
                    </View>
                </View>

                <View style={{
                    width: '100%',
                    alignItems: 'center',
                }}>

                </View>

                <ScrollView
                    style={{
                        marginRight: 30,
                        marginBottom: 130,
                        width: '100%',
                        height: '60%',
                    }}
                    contentContainerStyle={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                    }}
                >
                    <View style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginHorizontal: 30,
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 15,
                            width: '100%',
                            justifyContent: 'space-between'
                        }}>
                            <Text style={{
                                color: this.props.screenProps.theme.primaryColour,
                                fontFamily: 'Montserrat-SemiBold'
                            }}>
                                Name
                            </Text>

                            <Button
                                title='Change'
                                onPress={() => {
                                    this.setState({
                                        modifyNickname: !this.state.modifyNickname,
                                    });
                                }}
                                titleStyle={{
                                    color: this.props.screenProps.theme.primaryColour,
                                    fontSize: 13
                                }}
                                type="clear"
                            />
                        </View>
                    </View>

                    <View style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginHorizontal: this.state.modifyNickname ? 20 : 30,
                    }}>
                        {this.state.modifyNickname ?
                            <ModifyNickname
                                nickname={this.state.nickname}
                                error={this.state.nicknameError}
                                onChange={(text) => {
                                    const [valid, error] = isNicknameValid(text, this.state.initialNickname);

                                    const shared = {
                                        nickname: text,
                                        nicknameError: error,
                                        nicknameValid: valid,
                                    };

                                    if (valid) {
                                        this.setState({
                                            newNickname: text,
                                            ...shared,
                                        });
                                    } else {
                                        this.setState(shared);
                                    }
                                }}
                                {...this.props}
                            />
                            :
                            <Text style={{ fontFamily: 'Montserrat-Regular', color: this.props.screenProps.theme.slightlyMoreVisibleColour, fontSize: 16 }}>
                                {this.state.nickname}
                            </Text>
                        }
                    </View>

                    <View style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginHorizontal: 30,
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 15,
                            width: '100%',
                            justifyContent: 'space-between'
                        }}>
                            <Text style={{
                                color: this.props.screenProps.theme.primaryColour,
                                fontFamily: 'Montserrat-SemiBold'
                            }}>
                                Address
                            </Text>

                            <Button
                                title='Change'
                                onPress={() => {
                                    this.setState({
                                        modifyAddress: !this.state.modifyAddress,
                                    });
                                }}
                                titleStyle={{
                                    color: this.props.screenProps.theme.primaryColour,
                                    fontSize: 13
                                }}
                                type="clear"
                            />
                        </View>
                    </View>

                    <View style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginHorizontal: this.state.modifyAddress ? 20 : 30,
                    }}>
                        {this.state.modifyAddress ?
                            <ModifyAddress
                                address={this.state.address}
                                error={this.state.addressError}
                                onChange={(text) => {
                                    const [valid, error] = isAddressValid(text);

                                    const shared = {
                                        address: text,
                                        addressError: error,
                                        addressValid: valid,

                                        /* Disable and reset payment ID if integrated address */
                                        paymentID: text.length === Config.integratedAddressLength ? '' : this.state.paymentID,
                                        paymentIDError: text.length === Config.integratedAddressLength ? '' : this.state.paymentIDError,
                                        paymentIDValid: text.length === Config.integratedAddressLength ? true : this.state.paymentIDValid,
                                        paymentIDEnabled: text.length !== Config.integratedAddressLength,
                                    };

                                    if (valid) {
                                        this.setState({
                                            newAddress: text,
                                            ...shared,
                                        });
                                    } else {
                                        this.setState(shared);
                                    }
                                }}
                                {...this.props}
                            />
                            :
                            <Text style={{fontFamily: 'Montserrat-Regular',  color: this.props.screenProps.theme.slightlyMoreVisibleColour, fontSize: 16 }}>
                                {this.state.address}
                            </Text>
                        }
                    </View>

                    <View style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginHorizontal: 30,
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            marginTop: 15,
                            width: '100%',
                            justifyContent: 'space-between'
                        }}>
                            <Text style={{
                                color: this.props.screenProps.theme.primaryColour,
                                fontFamily: 'Montserrat-SemiBold'
                            }}>
                                Payment ID
                            </Text>

                            <Button
                                title='Change'
                                onPress={() => {
                                    this.setState({
                                        modifyPaymentID: !this.state.modifyPaymentID,
                                    });
                                }}
                                titleStyle={{
                                    color: this.props.screenProps.theme.primaryColour,
                                    fontSize: 13,
                                }}
                                type="clear"
                            />
                        </View>
                    </View>

                    <View style={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        marginHorizontal: this.state.modifyPaymentID ? 20 : 30,
                    }}>
                        {this.state.modifyPaymentID ?
                            <ModifyPaymentID
                                paymentID={this.state.paymentID}
                                error={this.state.paymentIDError}
                                onChange={(text) => {
                                    const [valid, error] = isPaymentIDValid(text);

                                    const shared = {
                                        paymentID: text,
                                        paymentIDError: error,
                                        paymentIDValid: valid,
                                    };

                                    if (valid) {
                                        this.setState({
                                            newPaymentID: text,
                                            ...shared,
                                        });
                                    } else {
                                        this.setState(shared);
                                    }
                                }}
                                disabled={!this.state.paymentIDEnabled}
                                {...this.props}
                            />
                            :
                            <Text style={{ fontFamily: 'Montserrat-Regular', color: this.props.screenProps.theme.slightlyMoreVisibleColour, fontSize: 16 }}>
                                {this.state.paymentID || 'None'}
                            </Text>
                        }
                    </View>
                </ScrollView>

                <View style={{
                    marginHorizontal: 30,
                    flex: 1,
                }}>
                    <View style={{
                        alignItems: 'stretch',
                        width: '100%',
                        bottom: 85,
                        position: 'absolute',
                        borderRadius: 10,
                    }}>
                        <RNEButton
                            title='Update'
                            onPress={() => {
                                Globals.removePayee(this.state.initialNickname);

                                Globals.addPayee({
                                    address: this.state.newAddress,
                                    nickname: this.state.newNickname,
                                    paymentID: this.state.newPaymentID,
                                });

                                this.props.navigation.goBack();
                            }}
                            color={this.props.screenProps.theme.primaryColour}
                            disabled={!this.state.addressValid || !this.state.nicknameValid || !this.state.paymentIDValid}
                        />
                    </View>
                </View>

                <View style={{
                    marginHorizontal: 30,
                    flex: 1,
                }}>
                    <View style={{
                        alignItems: 'stretch',
                        width: '100%',
                        bottom: 30,
                        position: 'absolute',
                        borderRadius: 10,
                    }}>
                        <RNEButton
                            title='Remove'
                            onPress={() => {
                                Alert.alert(
                                    'Delete Recipient?',
                                    'Are you sure you want to delete this recipient?',
                                    [
                                        { text: 'Delete', onPress: () => {
                                            Globals.removePayee(this.state.initialNickname);
                                            this.props.navigation.goBack();
                                        }},
                                        { text: 'Cancel', style: 'cancel'},
                                    ],
                                );
                            }}
                            color='#DD3344'
                        />
                    </View>
                </View>
            </View>
        );
    }
}
