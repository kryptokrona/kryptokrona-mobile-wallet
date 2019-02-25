// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { Input } from 'react-native-elements';

import {
    View, Image, Text, Button, Platform, TextInput
} from 'react-native';

import {
    importWalletFromSeed, BlockchainCacheApi, WalletBackend, WalletError,
    isValidMnemonic, isValidMnemonicWord,
} from 'turtlecoin-wallet-backend';

import Config from './Config';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { saveToDatabase } from './Database';
import { BottomButton } from './SharedComponents';

/**
 * Import a wallet from keys/seed
 */
export class ImportWalletScreen extends React.Component {
    static navigationOptions = {
        title: '',
    };
    
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{ flex: 1 }}>
                <View style={{
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginTop: 60,
                    marginLeft: 30,
                    marginRight: 10,
                }}>
                    <Text style={{ color: Config.theme.primaryColour, fontSize: 25, marginBottom: 5 }}>
                        When did you create your wallet?
                    </Text>

                    <Text style={{ color: Config.theme.primaryColour, fontSize: 16, marginBottom: 60 }}>
                        This helps us scan your wallet faster.
                    </Text>
                </View>

                <View style={{
                    flex: 1,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                }}>
                    <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                        <Button
                            title="Pick a month"
                            onPress={() => this.props.navigation.navigate('PickMonth')}
                            color={Config.theme.primaryColour}
                        />
                    </View>

                    <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                        <Button
                            title="Pick an approximate block height"
                            onPress={() => this.props.navigation.navigate('PickBlockHeight')}
                            color={Config.theme.primaryColour}
                        />
                    </View>

                    <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                        <Button
                            title="Pick an exact block height"
                            onPress={() => this.props.navigation.navigate('PickExactBlockHeight')}
                            color={Config.theme.primaryColour}
                        />
                    </View>

                    <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                        <Button
                            title="I don't Know"
                            onPress={() => this.props.navigation.navigate('ImportKeysOrSeed', { scanHeight: 0 })}
                            color={Config.theme.primaryColour}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

/* Pick between keys and mnemonic seed */
export class ImportKeysOrSeedScreen extends React.Component {
    static navigationOptions = {
        title: '',
    };

    constructor(props) {
        super(props);

        this.scanHeight = this.props.navigation.state.params.scanHeight || 0;
    }

    render() {
        return(
            <View style={{ flex: 1 }}>
                <View style={{
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginTop: 60,
                    marginLeft: 30,
                    marginRight: 10,
                }}>
                    <Text style={{ color: Config.theme.primaryColour, fontSize: 25, marginBottom: 60 }}>
                        How would you like to import your wallet?
                    </Text>
                </View>

                <View style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
                    <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                        <Button
                            title="25 Word Mnemonic Seed"
                            onPress={() => this.props.navigation.navigate('ImportSeed', { scanHeight: this.scanHeight })}
                            color={Config.theme.primaryColour}
                        />
                    </View>

                    <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                        <Button
                            title="Private Spend + Private View Key"
                            onPress={() => this.props.navigation.navigate('ImportKeys', { scanHeight: this.scanHeight })}
                            color={Config.theme.primaryColour}
                        />
                    </View>
                </View>
            </View>
        );
    }
}

/* Pick between keys and mnemonic seed */
export class ImportSeedScreen extends React.Component {
    static navigationOptions = {
        title: '',
    };

    constructor(props) {
        super(props);

        this.state = {
            seedIsGood: false,
        }

        this.scanHeight = this.props.navigation.state.params.scanHeight || 0;
    }

    toggleButton(seed, seedIsGood) {
        this.setState({
            seedIsGood,
            seed,
        });
    }

    importWallet() {
        const [wallet, error] = WalletBackend.importWalletFromSeed(
            Config.defaultDaemon, this.scanHeight, this.state.seed.join(' '), Config
        );

        if (error) {
            /* TODO: Report to user */
            console.log('Failed to import wallet: ' + error.toString());
            this.props.navigation.navigate('Login');
        }

        Globals.wallet = wallet;

        /* Encrypt wallet with pincode in DB */
        saveToDatabase(Globals.wallet, Globals.pinCode);

        this.props.navigation.navigate('Home');
    }

    render() {
        return(
            <View style={{ flex: 1 }}>
                <View style={{
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginTop: 60,
                    marginLeft: 30,
                    marginRight: 10,
                }}>
                    <Text style={{ color: Config.theme.primaryColour, fontSize: 25, marginBottom: 5 }}>
                        Enter your mnemonic seed...
                    </Text>

                    <Text style={{ color: Config.theme.primaryColour, fontSize: 16, marginBottom: 60 }}>
                        This should be 25 english words.
                    </Text>
                </View>

                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                    extraScrollHeight={200}
                    containerContentStyle={{ flex: 1, justifyContent: 'center', alignItems: 'flex-start'}}
                >
                    <InputSeedComponent enableButton={(seed, enable) => this.toggleButton(seed, enable)}/>
                </KeyboardAwareScrollView>

                <BottomButton
                    title='Continue'
                    onPress={() => this.importWallet()}
                    disabled={!this.state.seedIsGood}
                />
            </View>
        );
    }
}

class InputSeedComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            words: [],
            invalidMessage: ''
        }
    }

    checkSeedIsValid(words) {
        const invalidWords = [];

        let emptyCount = 0;

        for (const word of words) {
            if (word === '' || word === undefined) {
                emptyCount++;
            } else if (!isValidMnemonicWord(word)) {
                invalidWords.push(word);
            }
        }

        if (invalidWords.length !== 0) {
            this.setState({
                invalidMessage: 'The following words are invalid: ' + invalidWords.join(', '),
            });

            return false;
        } else {
            this.setState({
                invalidMessage: '',
            });
        }

        if (words.length !== 25 || emptyCount !== 0) {
            return false;
        }

        const [valid, error] = isValidMnemonic(words.join(' '));

        if (!valid) {
            this.setState({
                invalidMessage: error,
            });
        } else {
            this.setState({
                invalidMessage: '',
            });
        }

        return valid;
    }

    storeWord(word, index) {
        let words = this.state.words;

        words[index] = word;

        /* Auto complete often suggests upper case words */
        words.map(x => x.toLowerCase());

        this.setState({
            words,
        });

        const isValid = this.checkSeedIsValid(this.state.words);

        /* Enable continue button if valid seed */
        this.props.enableButton(this.state.words, isValid);
    }

    render() {
        return(
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View style={{ 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    marginRight: 15, 
                    marginLeft: 15, 
                    borderWidth: 1, 
                    borderColor: Config.theme.primaryColour, 
                    height: 350
                }}>
                    {[1, 2, 3, 4, 5].map((row) => {
                        return(
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }} key={row}>
                                {[1, 2, 3, 4, 5].map((col) => {
                                    return(
                                        <SeedWord row={row} column={col} key={col} storeWord={(word, index) => this.storeWord(word, index)}/>
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>
                <Text style={{marginLeft: 10, marginRight: 10, color: 'red', marginTop: 10, alignItems: 'center', justifyContent: 'center'}}>
                    {this.state.invalidMessage}
                </Text>
            </View>
        );
    }
}

/* Jesus christ how horrifying */
class SeedWord extends React.Component {
    constructor(props) {
        super(props);

        let row = this.props.row;
        let column = this.props.column;

        let wordNumber = ((row - 1) * 5) + column;
        let wordIndex = wordNumber - 1;

        this.state = {
            wordNumber,
            wordIndex,
            badWord: false,
            word: '',
        }
    }

    checkWord() {
        this.props.storeWord(this.state.word, this.state.wordIndex);

        if (!isValidMnemonicWord(this.state.word) && this.state.word !== '') {
            this.setState({
                badWord: true,
            });
        }
    }

    render() {
        return(
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <TextInput
                    style={{ height: 40, width: 70, textAlign: 'center', color: 'gray' }}
                    underlineColorAndroid={this.state.badWord ? 'red' : 'lightgray'}
                    borderBottomWidth={Platform.OS === 'ios' ? 1 : 0}
                    borderBottomColor={this.state.badWord ? 'red' : 'lightgray'}
                    maxLength={20}
                    autoCapitalize={'none'}
                    onChangeText={(text) => this.setState({ word: text }) }
                    onBlur={() => this.checkWord()}
                    onFocus={() => this.setState({ badWord: false }) }
                />
                <Text style={{ color: Config.theme.primaryColour }}>
                    {this.state.wordNumber}
                </Text>
            </View>
        );
    }
}

/* Pick between keys and mnemonic seed */
export class ImportKeysScreen extends React.Component {
    static navigationOptions = {
        title: 'Import Keys',
    };

    constructor(props) {
        super(props);

        this.scanHeight = this.props.navigation.state.params.scanHeight || 0;

        this.state = {
            privateSpendKey: '',
            privateViewKey: '',
            continueEnabled: false,
            spendKeyError: '',
            viewKeyError: '',
        }
    }

    checkErrors() {
        const [spendKeyValid, spendKeyError] = this.checkKey(this.state.privateSpendKey);
        const [viewKeyValid, viewKeyError] = this.checkKey(this.state.privateViewKey);

        this.setState({
            continueEnabled: spendKeyValid && viewKeyValid,
            spendKeyError,
            viewKeyError
        });
    }

    checkKey(key) {
        let errorMessage = '';

        if (key === '' || key === undefined || key === null) {
            return [false, errorMessage];
        }

        const regex = new RegExp('^[0-9a-fA-F]{64}$');

        if (key.length !== 64) {
            errorMessage = 'Key is too short/long';
            return [false, errorMessage];
        }

        const isGood = regex.test(key);

        if (!isGood) {
            errorMessage = 'Key is not hex (a-f, 0-9)';
            return [false, errorMessage];
        }

        return [true, ''];
    }

    importWallet() {
        const [wallet, error] = WalletBackend.importWalletFromKeys(
            Config.defaultDaemon, this.scanHeight, this.state.privateViewKey,
            this.state.privateSpendKey, Config
        );

        if (error) {
            /* TODO: Report to user */
            console.log('Failed to import wallet: ' + error.toString());
            this.props.navigation.navigate('Login');
        }

        Globals.wallet = wallet;

        /* Encrypt wallet with pincode in DB */
        saveToDatabase(Globals.wallet, Globals.pinCode);

        this.props.navigation.navigate('Home');
    }

    render() {
        return(
            <View style={{ flex: 1 }}>
                <View style={{
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginTop: 60,
                    marginLeft: 30,
                    marginRight: 10,
                }}>
                    <Text style={{ color: Config.theme.primaryColour, fontSize: 25, marginBottom: 5 }}>
                        Enter your private spend and view key...
                    </Text>

                    <Text style={{ color: Config.theme.primaryColour, fontSize: 16, marginBottom: 60 }}>
                        These are both 64 character, hexadecimal strings.
                    </Text>
                </View>

                <View style={{
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    marginLeft: 20,
                    flex: 1,
                }}>
                    <Input
                        containerStyle={{
                            width: '90%',
                            marginBottom: 30,
                        }}
                        inputContainerStyle={{
                            borderColor: 'lightgrey',
                            borderWidth: 1,
                            borderRadius: 2,
                        }}
                        maxLength={64}
                        label={'Private spend key'}
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
                                privateSpendKey: text,
                            }, () => this.checkErrors());
                        }}
                        errorMessage={this.state.spendKeyError}
                    />

                    <Input
                        containerStyle={{
                            width: '90%',
                        }}
                        inputContainerStyle={{
                            borderColor: 'lightgrey',
                            borderWidth: 1,
                            borderRadius: 2,
                        }}
                        maxLength={64}
                        label={'Private view key'}
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
                                privateViewKey: text,
                            }, () => this.checkErrors());
                        }}
                        errorMessage={this.state.viewKeyError}
                    />

                </View>

                <BottomButton
                    title="Continue"
                    onPress={() => this.importWallet()}
                    disabled={!this.state.continueEnabled}
                />
            </View>
        );
    }
}
