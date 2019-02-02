// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import {
    View, Image, Text, Button, TextInput,
} from 'react-native';

import Config from './Config';

import { Styles } from './Styles';

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
    }

    render() {
        return(
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'stretch', marginTop: 40}}>
                <Text style={{ fontSize: 20, color: Config.theme.primaryColour, justifyContent: 'flex-start', alignItems: 'center', textAlign: 'center', marginTop: 5, marginBottom: 20}}>
                    Enter your mnemonic seed:
                </Text>

                <InputSeedComponent/>

                <TextInput
                    maxLength={20}/>
            </View>
        );
    }
}

/* Jesus christ how horrifying */
class InputSeedComponent extends React.Component {
    constructor(props) {
        super(props);
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
                                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} key={col}>
                                        <TextInput
                                            style={{ height: 40, width: 70, textAlign: 'center' }}
                                            underlineColorAndroid={'lightgray'}
                                            maxLength={20}
                                            autoCapitalize={'none'}
                                            returnKeyType={'next'}/>
                                        <Text style={{ color: Config.theme.primaryColour }}>
                                            {((row - 1) * 5) + col}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    );
                })}
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
