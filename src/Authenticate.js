// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import PINCode, { hasUserSetPinCode, deleteUserPinCode } from '@haskkor/react-native-pincode';

import * as LocalAuthentication from 'expo-local-authentication';

import * as Animatable from 'react-native-animatable';

import RNExitApp from 'react-native-exit-app';

import React from 'react';

import { View, Alert, Text, Platform, Image, Switch } from 'react-native';

import { Button } from 'react-native-elements';

import Config from './Config';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { FadeView } from './FadeView';
import { setHaveWallet, savePreferencesToDatabase } from './Database';
import { BottomButton } from './SharedComponents';
import { navigateWithDisabledBack } from './Utilities';

/* Dummy component that redirects to pin auth or hardware auth as appropriate */
export async function Authenticate(navigation, subtitle, finishFunction, disableBack = false) {
    /* No auth, just go straight to the finish function */
    if (Globals.preferences.authenticationMethod === 'none') {
        finishFunction(navigation);
        return;
    }

    const haveHardwareAuth = await LocalAuthentication.hasHardwareAsync();
    const haveSetupHardwareAuth = await LocalAuthentication.isEnrolledAsync();

    const useHardwareAuth = haveHardwareAuth && haveSetupHardwareAuth;

    let route = 'RequestPin';

    /* User wants to use hardware authentication, and we have it available */
    if (useHardwareAuth && Globals.preferences.authenticationMethod === 'hardware-auth') {
        route = 'RequestHardwareAuth';
    }

    if (disableBack) {
        navigation.dispatch(
            navigateWithDisabledBack(route, {
                finishFunction,
                subtitle,
            }),
        );
    } else {
        navigation.navigate(route, {
            finishFunction,
            subtitle,
        });
    }
}

const authErrorToHumanError = new Map([
    ['authentication_failed', 'Fingerprint does not matched stored fingerprint'],
    ['insufficient', 'Could not get a full fingerprint reading'],
    ['lockout', 'Too many failed attempts. Please use PIN auth instead'],
    ['app_cancel', 'Authentication was cancelled by the system. Please use PIN auth instead'],
]);

export class RequestHardwareAuthScreen extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.auth();
    }

    async auth() {
        /* Cancel any previous attempts */
        await LocalAuthentication.cancelAuthenticate();

        /* touchId === 1 = have touch ID, faceId === 2 = have face ID */
        const [ touchId, faceId ] = await LocalAuthentication.supportedAuthenticationTypesAsync();

        const authDetails = await LocalAuthentication.authenticateAsync({
            promptMessage: `Use ${faceId === 2 ? 'Face ID' : 'Touch ID'} ${this.props.navigation.state.params.subtitle}`,
        });

        if (authDetails.success) {
            this.props.navigation.state.params.finishFunction(this.props.navigation);
        } else if (authDetails.error === 'lockout' || authDetails.error === 'app_cancel') {
            Alert.alert(
                'Failed ' + this.props.navigation.state.params.subtitle,
                authErrorToHumanError.get(authDetails.error),
                [
                    {text: 'OK', onPress: () => {
                        this.props.navigation.navigate('RequestPin', {
                            subtitle: this.props.navigation.state.params.subtitle,
                            finishFunction: this.props.navigation.state.params.finishFunction
                        })
                    }},
                ]
            );
        } else {
            const detailedError = authErrorToHumanError.get(authDetails.error) || authDetails.error;

            Alert.alert(
                'Failed ' + this.props.navigation.state.params.subtitle,
                `Please try again (Error: ${detailedError})`,
                [
                    {text: 'OK', onPress: () => {
                        this.auth();
                    }},
                ]
            );
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

                        <View style={{ width: '100%', bottom: 20, position: 'absolute' }}>
                            <Button
                                title='Or enter your PIN'
                                onPress={() => {
                                    this.props.navigation.navigate('RequestPin', {
                                        subtitle: this.props.navigation.state.params.subtitle,
                                        finishFunction: this.props.navigation.state.params.finishFunction
                                    })
                                }}
                                titleStyle={{
                                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                                    fontSize: 15,
                                    textDecorationLine: 'underline',
                                }}
                                type='clear'
                            />
                        </View>
                    </View>
                }
            </View>
        );
    }
}

export class ChooseAuthMethodScreen extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hardwareAuth: Globals.preferences.authenticationMethod === 'hardware-auth',
            pinCode: Globals.preferences.authenticationMethod === 'pincode',
            noAuth: Globals.preferences.authenticationMethod === 'none',
        }
    }

    render() {
        return(
            <View style={{ flex: 1, backgroundColor: this.props.screenProps.theme.backgroundColour }}>
                <View style={{
                    alignItems: 'flex-start',
                    justifyContent: 'flex-start',
                    flex: 1,
                    marginTop: 60,
                    backgroundColor: this.props.screenProps.theme.backgroundColour
                }}>
                    <Text style={{
                        color: this.props.screenProps.theme.primaryColour,
                        fontSize: 25,
                        marginBottom: 40,
                        marginLeft: 30,
                        marginRight: 20
                    }}>
                        How would you like to secure your wallet?
                    </Text>

                    <View style={{ flexDirection: 'row', marginRight: 20, marginLeft: 25, marginBottom: 20 }}>
                        <Switch
                            value={this.state.hardwareAuth}
                            onValueChange={(value) => {
                                this.setState({
                                    hardwareAuth: value,
                                    pinCode: value ? false : this.state.pinCode,
                                    noAuth: value ? false : this.state.noAuth,
                                });
                            }}
                            style={{ marginRight: 15 }}
                        />

                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 15,
                                color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                            }}>
                                Use Hardware Authentication where available (Fingerprint, FaceID, TouchID), and if not available, fallback to a PIN Code.
                            </Text>
                        </View>
                    </View>

                    <View style={{ flexDirection: 'row', marginRight: 20, marginLeft: 25, marginBottom: 20 }}>
                        <Switch
                            value={this.state.pinCode}
                            onValueChange={(value) => {
                                this.setState({
                                    hardwareAuth: value ? false : this.state.hardwareAuth,
                                    pinCode: value,
                                    noAuth: value ? false : this.state.noAuth,
                                });
                            }}
                            style={{ marginRight: 15 }}
                        />

                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 15,
                                color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                            }}>
                                Use a 6 digit PIN Code.
                            </Text>
                        </View>

                    </View>

                    <View style={{ flexDirection: 'row', marginRight: 20, marginLeft: 25, marginBottom: 20 }}>
                        <Switch
                            value={this.state.noAuth}
                            onValueChange={(value) => {
                                this.setState({
                                    hardwareAuth: value ? false : this.state.hardwareAuth,
                                    pinCode: value ? false : this.state.pinCode,
                                    noAuth: value
                                });
                            }}
                            style={{ marginRight: 15 }}
                        />

                        <View style={{ flex: 1 }}>
                            <Text style={{
                                fontSize: 15,
                                color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                            }}>
                                Use no authentication at all.
                            </Text>
                        </View>

                    </View>

                    <BottomButton
                        title="Continue"
                        onPress={() => {
                            (async() => {
                                let method = 'none';

                                if (this.state.hardwareAuth) {
                                    method = 'hardware-auth';
                                } else if (this.state.pinCode) {
                                    method = 'pincode';
                                }

                                Globals.preferences.authenticationMethod = method;

                                savePreferencesToDatabase(Globals.preferences);

                                const havePincode = await hasUserSetPinCode();

                                if (method === 'none' || havePincode) {
                                    this.props.navigation.navigate(this.props.navigation.state.params.nextRoute);
                                } else {
                                    this.props.navigation.navigate('SetPin', {
                                        nextRoute: this.props.navigation.state.params.nextRoute
                                    });
                                }
                            })();
                        }}
                        disabled={!(this.state.noAuth || this.state.pinCode || this.state.hardwareAuth)}
                        {...this.props}
                    />
                </View>
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
                        (async () => {
                            await setHaveWallet(false);

                            await deleteUserPinCode();

                            this.props.navigation.navigate('Splash');

                            /* Can't use navigateWithDisabledBack between routes, but don't
                               want to be able to go back to previous screen...
                               Navigate to splash, then once on that route, reset the
                               stack. */
                            this.props.navigation.dispatch(navigateWithDisabledBack('Splash'));
                        })();
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
