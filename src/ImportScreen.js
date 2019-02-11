// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import {
    View, Image, Text, Button, TextInput, Platform,
} from 'react-native';

import {
    importWalletFromSeed, BlockchainCacheApi, WalletBackend, WalletError,
    isValidMnemonic, isValidMnemonicWord,
} from 'turtlecoin-wallet-backend';

import Config from './Config';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { saveToDatabase } from './Database';

/**
 * Import a wallet from keys/seed
 */
export class ImportWalletScreen extends React.Component {
    static navigationOptions = {
        title: 'Import',
    };
    
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch', marginTop: 40}}>
                <Text style={{
                    fontSize: 20,
                    color: Config.theme.primaryColour,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginTop: 5,
                    marginBottom: 5}}
                >
                    When did you create your wallet?
                </Text>

                <Text style={{
                    fontSize: 14,
                    color: Config.theme.primaryColour,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginTop: 5,
                    marginBottom: 20}}
                >
                    (This helps us scan your wallet faster)
                </Text>


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
                        title="I don't Know"
                        onPress={() => this.props.navigation.navigate('ImportKeysOrSeed', { scanHeight: 0 })}
                        color={Config.theme.primaryColour}
                    />
                </View>
            </View>
        );
    }
}

/* Pick between keys and mnemonic seed */
export class ImportKeysOrSeedScreen extends React.Component {
    static navigationOptions = {
        title: 'Import',
    };

    constructor(props) {
        super(props);

        this.scanHeight = this.props.navigation.state.params.scanHeight || 0;
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch', marginTop: 40}}>
                <Text style={{ fontSize: 20, color: Config.theme.primaryColour, justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center', marginTop: 5, marginBottom: 20}}>
                    What method do you want to import with?
                </Text>

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
        );
    }
}

/* Pick between keys and mnemonic seed */
export class ImportSeedScreen extends React.Component {
    static navigationOptions = {
        title: 'Import Seed',
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
        const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);

        const [wallet, error] = WalletBackend.importWalletFromSeed(
            daemon, this.scanHeight, this.state.seed.join(' '), Config
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
            <KeyboardAwareScrollView
                style={{ marginTop: 80 }}
                enableOnAndroid={true}
                extraScrollHeight={200}
                containerContentStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}
            >
                <Text style={{
                    fontSize: 20,
                    color: Config.theme.primaryColour,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginTop: 5,
                    marginBottom: 30
                }}>
                    Enter your mnemonic seed:
                </Text>

                <InputSeedComponent enableButton={(seed, enable) => this.toggleButton(seed, enable)}/>

                <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 40}]}>
                    <Button
                        title="Continue"
                        onPress={() => this.importWallet()}
                        color={Config.theme.primaryColour}
                        disabled={!this.state.seedIsGood}
                    />
                </View>
            </KeyboardAwareScrollView>
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
            badSpendKey: false,
            badViewKey: false,
            privateSpendKey: '',
            privateViewKey: '',
            bothKeysGood: false,
            privateSpendKeyMsg: '',
            privateViewKeyMsg: '',
        }
    }

    checkPrivateSpendKey(key) {
        const regex = new RegExp('^[0-9a-fA-F]{64}$');

        const isGood = regex.test(key);

        let privateSpendKeyMsg = '';

        if (!isGood && key.length !== 0 && key.length !== 64) {
            privateSpendKeyMsg = 'Private spend key is too short - should be 64 chars, but is ' + key.length + ' chars.';
        } else if (!isGood && key.length === 64) {
            privateSpendKeyMsg = 'Private spend key is not hex (a-f, 0-9).';
        }

        this.setState({
            badSpendKey: !isGood,
            bothKeysGood: !this.state.badViewKey && isGood,
            privateSpendKeyMsg,
        });
    }

    checkPrivateViewKey(key) {
        const regex = new RegExp('^[0-9a-fA-F]{64}$');

        const isGood = regex.test(key);

        let privateViewKeyMsg = '';

        if (!isGood && key.length !== 0 && key.length !== 64) {
            privateViewKeyMsg = 'Private view key is too short - should be 64 chars, but is ' + key.length + ' chars.';
        } else if (!isGood && key.length === 64) {
            privateViewKeyMsg = 'Private view key is not hex (a-f, 0-9).';
        }

        this.setState({
            badViewKey: !isGood,
            bothKeysGood: !this.state.badSpendKey && isGood,
            privateViewKeyMsg,
        });
    }

    importWallet() {
        const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);

        const [wallet, error] = WalletBackend.importWalletFromKeys(
            daemon, this.scanHeight, this.state.privateViewKey,
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
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40}}>
                <Text style={{
                    fontSize: 20,
                    color: Config.theme.primaryColour,
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    textAlign: 'center',
                    marginTop: 30,
                    marginBottom: 30
                }}>
                    Enter your private spend and view key:
                </Text>

                <TextInput
                    style={{
                        height: 40,
                        width: 400,
                        textAlign: 'center',
                        color: 'gray',
                        borderColor: this.state.badSpendKey ? 'red' : Config.theme.primaryColour,
                        borderWidth: 1,
                        marginBottom: 5,
                    }}
                    maxLength={64}
                    autoCapitalize={'none'}
                    onChangeText={(text) => this.setState({ privateSpendKey: text }) }
                    onBlur={() => this.checkPrivateSpendKey(this.state.privateSpendKey)}
                    onFocus={() => this.setState({ badSpendKey: false }) }
                />
                <Text style={{ color: Config.theme.primaryColour, marginBottom: 20 }}>
                    Private spend key
                </Text>

                <TextInput
                    style={{
                        height: 40,
                        width: 400,
                        textAlign: 'center',
                        color: 'gray',
                        borderColor: this.state.badViewKey ? 'red' : Config.theme.primaryColour,
                        borderWidth: 1,
                        marginBottom: 5,
                    }}
                    maxLength={64}
                    autoCapitalize={'none'}
                    onChangeText={(text) => this.setState({ privateViewKey: text }) }
                    onBlur={() => this.checkPrivateViewKey(this.state.privateViewKey)}
                    onFocus={() => this.setState({ badViewKey: false }) }
                />
                <Text style={{ color: Config.theme.primaryColour, marginBottom: 20 }}>
                    Private view key
                </Text>

                <Text style={[Styles.centeredText, { color: 'red', marginRight: 10, marginLeft: 10 }]}>
                    {this.state.privateSpendKeyMsg}
                </Text>

                <Text style={[Styles.centeredText, { color: 'red', marginRight: 10, marginLeft: 10 }]}>
                    {this.state.privateViewKeyMsg}
                </Text>

                <View style={[Styles.buttonContainer, Styles.alignBottom, {bottom: 40}]}>
                    <Button
                        title="Continue"
                        onPress={() => this.importWallet()}
                        color={Config.theme.primaryColour}
                        disabled={!this.state.bothKeysGood}
                    />
                </View>

            </View>

        );
    }
}
