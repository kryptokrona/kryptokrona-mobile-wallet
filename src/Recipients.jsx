// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';

import {
    View, Text, ScrollView, FlatList, Platform, TouchableWithoutFeedback
} from 'react-native';

import { Button as RNEButton } from 'react-native';

import { Button } from 'react-native-elements';

import ListItem from './ListItem';
import List from './ListContainer';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { Hr, BottomButton } from './SharedComponents';

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
        return(
            <View style={{
                backgroundColor: this.props.screenProps.theme.backgroundColour,
                flex: 1,
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
            }}>
                <ScrollView
                    style={{
                        flex: 1,
                        marginLeft: 30,
                        marginTop: 60,
                    }}
                    contentContainerStyle={{
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                    }}
                >
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
                            flex: 1,
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
                                fontSize: 24
                            }}>
                                Add a new recipient
                            </Text>
                        </View>
                    </TouchableWithoutFeedback>

                    <Hr width={'100%'}/>

                    <View style={{
                        backgroundColor: this.props.screenProps.theme.backgroundColour,
                        flex: 1,
                        marginRight: 15,
                    }}>
                        <Text style={{
                            color: this.props.screenProps.theme.primaryColour,
                            fontSize: 24,
                            marginTop: 30,
                        }}>
                            Modify an existing recipient
                        </Text>

                        <List style={{
                            height: '70%',
                            marginBottom: 20,
                            backgroundColor: this.props.screenProps.theme.backgroundColour
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
                                            fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
                                        }}
                                        leftIcon={
                                            <View style={{
                                                width: 50,
                                                height: 50,
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: this.props.screenProps.theme.iconColour,
                                                borderRadius: 45
                                            }}>
                                                <Text style={[Styles.centeredText, { 
                                                    fontSize: 30,
                                                    color: this.props.screenProps.theme.primaryColour,
                                                }]}>
                                                    {item.nickname[0].toUpperCase()}
                                                </Text>
                                            </View>
                                        }
                                        titleStyle={{
                                            color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                                        }}
                                        subtitleStyle={{
                                            color: this.props.screenProps.theme.slightlyMoreVisibleColour,
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
                        </List>
                    </View>
                </ScrollView>
            </View>
        );
    }
}

export class ModifyPayeeScreen extends React.Component {
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
                        <Text style={{ fontSize: 15, color: this.props.screenProps.theme.primaryColour, fontWeight: 'bold' }}>
                            {this.props.navigation.state.params.payee.nickname}'s details
                        </Text>
                    </View>
                </View>

                <View style={{
                    width: '100%',
                    alignItems: 'center',
                }}>
                    <Hr width={'85%'}/>
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
                            fontWeight: 'bold',
                        }}>
                            Name
                        </Text>

                        <Button
                            title='Change'
                            onPress={() => {
                            }}
                            titleStyle={{
                                color: this.props.screenProps.theme.primaryColour,
                                fontSize: 13
                            }}
                            type="clear"
                        />
                    </View>

                    <Text style={{ color: this.props.screenProps.theme.slightlyMoreVisibleColour, fontSize: 16 }}>
                        {this.props.navigation.state.params.payee.nickname}
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 15,
                        width: '100%',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{
                            color: this.props.screenProps.theme.primaryColour,
                            fontWeight: 'bold',
                        }}>
                            Address
                        </Text>

                        <Button
                            title='Change'
                            onPress={() => {
                            }}
                            titleStyle={{
                                color: this.props.screenProps.theme.primaryColour,
                                fontSize: 13
                            }}
                            type="clear"
                        />
                    </View>

                    <Text style={{ color: this.props.screenProps.theme.slightlyMoreVisibleColour, fontSize: 16 }}>
                        {this.props.navigation.state.params.payee.address}
                    </Text>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        marginTop: 15,
                        width: '100%',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{
                            color: this.props.screenProps.theme.primaryColour,
                            fontWeight: 'bold',
                        }}>
                            Payment ID
                        </Text>

                        <Button
                            title='Change'
                            onPress={() => {
                            }}
                            titleStyle={{
                                color: this.props.screenProps.theme.primaryColour,
                                fontSize: 13
                            }}
                            type="clear"
                        />
                    </View>

                    <Text style={{ color: this.props.screenProps.theme.slightlyMoreVisibleColour, fontSize: 16 }}>
                        {this.props.navigation.state.params.payee.paymentID || 'None'}
                    </Text>

                </View>

                <View
                    style={[
                        Styles.buttonContainer, {
                            alignItems: 'stretch',
                            width: '100%',
                            bottom: 20,
                            position: 'absolute',
                        }
                    ]}
                >
                    <RNEButton
                        title='Update'
                        onPress={() => {
                        }}
                        color={this.props.screenProps.theme.primaryColour}
                    />
                </View>
            </View>
        );
    }
}
