// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import PINCode from '@haskkor/react-native-pincode';

import * as LocalAuthentication from 'expo-local-authentication';

import * as Animatable from 'react-native-animatable';

import RNExitApp from 'react-native-exit-app';

import React from 'react';

import { View, Alert, Text, Platform, Image } from 'react-native';

import { Button } from 'react-native-elements';

import Config from './Config';

import { Styles } from './Styles';
import { FadeView } from './FadeView';
import { setHaveWallet } from './Database';
import { BottomButton } from './SharedComponents';
import { navigateWithDisabledBack } from './Utilities';

export class RequestHardwareAuthScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.auth();
    }

    async auth() {
        /* touchId === 1 = have touch ID, faceId === 2 = have face ID */
        const [ touchId, faceId ] = await LocalAuthentication.supportedAuthenticationTypesAsync();

        const authDetails = await LocalAuthentication.authenticateAsync({
            promptMessage: `Use ${faceId === 2 ? 'Face ID' : 'Touch ID'} ${this.props.navigation.state.params.subtitle}`,
        });

        if (authDetails.success) {
            this.props.navigation.state.params.finishFunction(this.props.navigation);
        } else {
            Alert.alert(
                'Failed ' + this.props.navigation.state.params.subtitle,
                `Please try again (Error: ${authDetails.error})`,
                [
                    {text: 'OK'},
                ]
            );

            this.auth();
        }
    }

    render() {
        return(
            <View style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: this.props.screenProps.theme.backgroundColour
            }}>
                {Platform.OS === 'android' &&
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            source={require('../assets/img/spinner.png')}
                            style={{
                                resizeMode: 'contain',
                                width: 170,
                                height: 170,
                                marginBottom: 10,
                                justifyContent: 'flex-start',
                            }}
                        />

                        <Text style={[Styles.centeredText, {
                            fontSize: 22,
                            color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                            marginHorizontal: 80,
                        }]}>
                            Touch the fingerprint sensor {this.props.navigation.state.params.subtitle}
                        </Text>

                        <Animatable.Image
                            source={require('../assets/img/fingerprint.png')}
                            style={{
                                resizeMode: 'contain',
                                width: 80,
                                height: 80,
                                marginTop: 40,
                                justifyContent: 'flex-end',
                            }}
                            animation='pulse'
                            easing='ease-out'
                            iterationCount='infinite'
                        />
                    </View>
                }
            </View>
        );
    }
}

/**
 * Enter a pin for the new wallet
 */
export class SetPinScreen extends React.Component {
    static navigationOptions = {
        title: '',
    }

    constructor(props) {
        super(props);
    }
    
    continue(pinCode) {
        /* Continue on to create or import a wallet */
        this.props.navigation.navigate(this.props.navigation.state.params.nextRoute);
    }

    render() {
        const subtitle = `to keep your ${Config.coinName} secure`;

        return(
            <View style={{
                flex: 1,
                backgroundColor: this.props.screenProps.theme.backgroundColour
            }}>
                <PINCode
                    status={'choose'}
                    finishProcess={(pinCode) => this.continue(pinCode)}
                    subtitleChoose={subtitle}
                    passwordLength={6}
                    touchIDDisabled={true}
                    colorPassword={this.props.screenProps.theme.primaryColour}
                    stylePinCodeColorSubtitle={this.props.screenProps.theme.primaryColour}
                    stylePinCodeColorTitle={this.props.screenProps.theme.primaryColour}
                    stylePinCodeButtonNumber={this.props.screenProps.theme.pinCodeForegroundColour}
                    numbersButtonOverlayColor={this.props.screenProps.theme.secondaryColour}
                    stylePinCodeDeleteButtonColorShowUnderlay={this.props.screenProps.theme.primaryColour}
                    stylePinCodeDeleteButtonColorHideUnderlay={this.props.screenProps.theme.primaryColour}
                    colorCircleButtons={this.props.screenProps.theme.pinCodeBackgroundColour}
                />
            </View>
        );
    }
}

export class ForgotPinScreen extends React.Component {
    static navigationOptions = {
        title: '',
    }

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{
                flex: 1,
                backgroundColor: this.props.screenProps.theme.backgroundColour,
            }}>
                <View style={{
                    flex: 1,
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    marginTop: 60,
                    backgroundColor: this.props.screenProps.theme.backgroundColour,
                }}>
                    <Text style={{
                        color: this.props.screenProps.theme.primaryColour,
                        fontSize: 25,
                        marginLeft: 30,
                        marginBottom: 20,
                    }}>
                        Your wallet is encrypted with your pin, so unfortunately, if you have forgotten your pin, it cannot be recovered.
                    </Text>
                    <Text style={{
                        color: this.props.screenProps.theme.primaryColour,
                        fontSize: 25,
                        marginLeft: 30
                    }}>
                        However, you can delete your wallet if you wish to create a new one.
                    </Text>
                </View>

                <BottomButton
                    title='Delete Wallet'
                    onPress={() => {
                        setHaveWallet(false);
                        this.props.navigation.navigate('Splash');
                        /* Can't use navigateWithDisabledBack between routes, but don't
                           want to be able to go back to previous screen...
                           Navigate to splash, then once on that route, reset the
                           stack. */
                        this.props.navigation.dispatch(navigateWithDisabledBack('Splash'));
                    }}
                    buttonStyle={{
                        backgroundColor: 'red',
                        height: 50,
                        borderRadius: 0,
                    }}
                    {...this.props}
                />
            </View>
        );
    }
}

/**
 * Prompt for the stored pin to unlock the wallet
 */
export class RequestPinScreen extends React.Component {
    static navigationOptions = {
        title: '',
    }

    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View
                style={{
                    flex: 1,
                    backgroundColor: this.props.screenProps.theme.backgroundColour
                }}
            >
                <PINCode
                    status={'enter'}
                    finishProcess={() => {
                        this.props.navigation.state.params.finishFunction(this.props.navigation);
                    }}
                    subtitleEnter={this.props.navigation.state.params.subtitle}
                    passwordLength={6}
                    touchIDDisabled={true}
                    colorPassword={this.props.screenProps.theme.primaryColour}
                    stylePinCodeColorSubtitle={this.props.screenProps.theme.primaryColour}
                    stylePinCodeColorTitle={this.props.screenProps.theme.primaryColour}
                    stylePinCodeButtonNumber={this.props.screenProps.theme.pinCodeForegroundColour}
                    numbersButtonOverlayColor={this.props.screenProps.theme.secondaryColour}
                    stylePinCodeDeleteButtonColorShowUnderlay={this.props.screenProps.theme.primaryColour}
                    stylePinCodeDeleteButtonColorHideUnderlay={this.props.screenProps.theme.primaryColour}
                    onClickButtonLockedPage={() => RNExitApp.exitApp()}
                    colorCircleButtons={this.props.screenProps.theme.pinCodeBackgroundColour}
                />

                <Button
                    title='Forgot PIN?'
                    onPress={() => {
                        this.props.navigation.navigate('ForgotPin');
                    }}
                    titleStyle={{
                        color: this.props.screenProps.theme.primaryColour,
                        textDecorationLine: 'underline',
                        marginBottom: 10,
                    }}
                    type='clear'
                />
            </View>
        );
    }
}
