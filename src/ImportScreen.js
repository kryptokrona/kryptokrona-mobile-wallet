// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import {
    View, Image, Text, Button, TextInput,
} from 'react-native';

import { importWalletFromSeed, BlockchainCacheApi, WalletBackend, WalletError } from 'turtlecoin-wallet-backend';

import Config from './Config';
import Globals from './Globals';

import { Styles } from './Styles';
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
                <Text style={{ fontSize: 20, color: Config.theme.primaryColour, justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center', marginTop: 5, marginBottom: 20}}>
                    When did you create your wallet?
                </Text>

                <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                    <Button
                        title="Pick a month"
                        onPress={() => console.log('foo')}
                        color={Config.theme.primaryColour}
                    />
                </View>

                <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                    <Button
                        title="Pick an approximate block height"
                        onPress={() => console.log('foo')}
                        color={Config.theme.primaryColour}
                    />
                </View>

                <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                    <Button
                        title="I don't Know"
                        onPress={() => this.props.navigation.navigate('ImportKeysOrSeed')}
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
                        onPress={() => this.props.navigation.navigate('ImportSeed')}
                        color={Config.theme.primaryColour}
                    />
                </View>

                <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 5, marginBottom: 5}]}>
                    <Button
                        title="Private Spend + Private View Key"
                        onPress={() => this.props.navigation.navigate('ImportKeys')}
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
    }

    enableButton(seed) {
        this.setState({
            seedIsGood: true,
            seed: seed,
        });
    }

    importWallet() {
        const daemon = new BlockchainCacheApi('blockapi.turtlepay.io', true);

        const scanHeight = this.props.scanHeight || 0;

        /* TODO: this.state.seed.join(' ') */
        const words = 'owner eagle biggest reunion jeers cause pairing serving pierce cycling always jellyfish tapestry makeup pledge wonders unquoted efficient number gourmet answers cylinder light listen cylinder';

        const wallet = WalletBackend.importWalletFromSeed(
            daemon, scanHeight, words, Config
        );

        if (!wallet instanceof WalletBackend) {
            /* TODO: Report to user */
            console.log('Failed to import wallet: ' + wallet);
            this.props.navigation.navigate('Login');
        }

        Globals.wallet = wallet;

        /* Encrypt wallet with pincode in DB */
        saveToDatabase(Globals.wallet, Globals.pinCode);

        this.props.navigation.navigate('Home');
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
                    marginBottom: 20
                }}>
                    Enter your mnemonic seed:
                </Text>

                <InputSeedComponent enableButton={(seed) => this.enableButton(seed)}/>

                <View style={[Styles.buttonContainer, {alignItems: 'stretch', width: '100%', marginTop: 20}]}>
                    <Button
                        title="Continue"
                        onPress={() => this.importWallet()}
                        color={Config.theme.primaryColour}
                        disabled={!this.state.seedIsGood}
                    />
                </View>
            </View>
        );
    }
}

class InputSeedComponent extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            words: []
        }
    }

    /* TODO */
    checkSeedIsValid(words) {
        return undefined;
    }

    storeWord(word, index) {
        let words = this.state.words;

        words[index] = word;

        words = 'owner eagle biggest reunion jeers cause pairing serving pierce cycling always jellyfish tapestry makeup pledge wonders unquoted efficient number gourmet answers cylinder light listen cylinder'.split(' ');

        /* Auto complete often suggests upper case words */
        words.map(x => x.toLowerCase());

        this.setState({
            words,
        });

        /* Not enough words filled in yet */
        if (this.state.words.length !== 25) {
            return;
        }

        /* Check all words exist and are not blank */
        for (const word of this.state.words) {
            if (word === undefined || word === '') {
                return;
            }
        }

        const error = this.checkSeedIsValid(this.state.words);

        if (error) {
            /* TODO: Alert user */
            console.log('Invalid seed: ' + error);
            return;
        }

        /* Enable the continue button */
        this.props.enableButton(this.state.words);
    }

    render() {
        return(
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

        if (false) {
            /* Set text to red if input is invalid */
            /* TODO: This is broken. Text disappeares for some reason. */
            this.setState({
                badWord: true,
            });
        }
    }

    render() {
        return(
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <TextInput
                    style={{ height: 40, width: 70, textAlign: 'center', color: this.state.badWord ? 'red' : 'gray' }}
                    underlineColorAndroid={'lightgray'}
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
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch', marginTop: 40}}>
                <Text style={{ fontSize: 20, color: Config.theme.primaryColour, justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center', marginTop: 5, marginBottom: 20}}>
                    Enter your private spend key:
                </Text>
            </View>
        );
    }
}
