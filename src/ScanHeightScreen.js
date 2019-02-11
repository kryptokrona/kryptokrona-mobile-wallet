// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import MonthSelectorCalendar from 'react-native-month-selector';

import moment from 'moment';

import { View, Text, Button } from 'react-native';

import Config from './Config';

import { Styles } from './Styles';
import { BottomButton } from './SharedComponents';
import { getApproximateBlockHeight, dateToScanHeight } from './Utilities';

export class PickMonthScreen extends React.Component {
    static navigationOptions = {
        title: '',
    };

    constructor(props) {
        super(props);

        this.state = {
            month: moment().startOf('month'),
        }
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
                        Which month did you create your wallet?
                    </Text>

                    <Text style={{ color: Config.theme.primaryColour, fontSize: 16, marginBottom: 60 }}>
                        This helps us scan your wallet faster.
                    </Text>
                </View>

                <View style={{ justifyContent: 'center', alignItems: 'stretch' }}>
                    <MonthSelectorCalendar
                        minDate={moment(Config.chainLaunchTimestamp)}
                        selectedBackgroundColor={Config.theme.primaryColour}
                        monthTextStyle={{
                            color: Config.theme.secondaryColour,
                        }}
                        monthDisabledStyle={{
                            color: 'lightgray',
                        }}
                        currentMonthTextStyle={{
                            color: Config.theme.secondaryColour,
                        }}
                        seperatorColor={Config.theme.primaryColour}
                        nextIcon={
                            <Text style={{
                                color: Config.theme.primaryColour,
                                fontSize: 16,
                                marginRight: 10,
                            }}>
                                Next
                            </Text>
                        }
                        prevIcon={
                            <Text style={{
                                color: Config.theme.primaryColour,
                                fontSize: 16,
                                marginLeft: 10,
                            }}>
                                Prev
                            </Text>
                        }
                        yearTextStyle={{
                            color: Config.theme.secondaryColour,
                            fontSize: 18
                        }}
                        selectedDate={this.state.month}
                        onMonthTapped={(date) => this.setState({ month: date})}
                    />
                </View>

                <BottomButton
                    title='Continue'
                    onPress={() => this.props.navigation.navigate('ImportKeysOrSeed', { scanHeight: 0 })}
                />

            </View>
        );
    }
}

export class PickBlockHeightScreen extends React.Component {
    static navigationOptions = {
        title: '',
    };

    constructor(props) {
        super(props);

        /* Guess the current height of the blockchain */
        const height = getApproximateBlockHeight(new Date());

        /* Divide that height into jumps */
        const jumps = Math.floor(height / 6);

        /* Get the nearest multiple to round up to for the jumps */
        const nearestMultiple = 10 ** (jumps.toString().length - 1)

        const remainder = jumps % nearestMultiple;

        /* Round the jump to the nearest multiple */
        const roundedJumps = jumps - remainder + nearestMultiple;

        const actualJumps = [];

        /* Put together the jump ranges */
        for (let i = 0; i < height; i += roundedJumps) {
            actualJumps.push([i, i + roundedJumps]);
        }

        this.state = {
            jumps: actualJumps,
        }
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
                        Between which block heights did you create your wallet?
                    </Text>

                    <Text style={{ color: Config.theme.primaryColour, fontSize: 16, marginBottom: 60 }}>
                        This helps us scan your wallet faster.
                    </Text>
                </View>

                <View style={{ justifyContent: 'center', alignItems: 'flex-start' }}>
                    {this.state.jumps.map(([startHeight, endHeight]) => {
                        return(
                            <View
                                key={startHeight}
                                style={[
                                    Styles.buttonContainer, {
                                        alignItems: 'stretch',
                                        width: '100%',
                                        marginTop: 5,
                                        marginBottom: 5,
                                    }
                                ]}
                            >
                                <Button
                                    title={startHeight + ' - ' + endHeight}
                                    onPress={() => this.props.navigation.navigate('ImportKeysOrSeed', { scanHeight: startHeight })}
                                    color={Config.theme.primaryColour}
                                />
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    }
}
