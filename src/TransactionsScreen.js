// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';

import { List, ListItem } from 'react-native-elements';
import { View, Text, FlatList } from 'react-native';
import { prettyPrintAmount } from 'turtlecoin-wallet-backend';

import Config from './Config';
import Globals from './Globals';

import { Styles } from './Styles';
import { prettyPrintUnixTimestamp, prettyPrintDate } from './Utilities';

/**
 * List of transactions sent + received 
 */
export class TransactionsScreen extends React.Component {
    static navigationOptions = {
        title: 'Transactions',
    };

    constructor(props) {
        super(props);

        /* Don't display fusions */
        const transactions = Globals.wallet.getTransactions().filter((x) => x.totalAmount() !== 0);

        this.state = {
            numTransactions: transactions.length,
            transactions,
        };
    }

    tick() {
        /* Small optimization to prevent us fetching a ton of data constantly */
        const numTransactions = Globals.wallet.getNumTransactions();

        if (numTransactions !== this.state.numTransactions) {
            /* Don't display fusions */
            const transactions = Globals.wallet.getTransactions().filter((x) => x.totalAmount() !== 0);

            this.setState({
                numTransactions,
                transactions,
            });
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    getIconName(transaction) {
        if (transaction.totalAmount() >= 0) {
            return 'ios-arrow-dropleft';
        }

        return 'ios-arrow-dropright';
    }

    getIconColour(transaction) {
        if (transaction.totalAmount() >= 0) {
            /* Intentionally using the TurtleCoin green here, instead of the
               theme colour - we want green/red, not to change based on theme */
            return '#40C18E';
        }

        return 'red';
    }

    render() {

        return(
            <List>
                <FlatList
                    data={this.state.transactions}
                    keyExtractor={item => item.hash}
                    renderItem={({item}) => (
                        <ListItem
                            title={prettyPrintAmount(item.totalAmount())}
                            subtitle={item.timestamp === 0 ? 'Processing ' + prettyPrintDate(new Date()) : 'Completed ' + prettyPrintUnixTimestamp(item.timestamp)}
                            leftIcon={
                                <View style={{width: 30, alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
                                    <Ionicons name={this.getIconName(item)} size={30} color={this.getIconColour(item)}/>
                                </View>
                            }
                            onPress={() => {}}
                        />
                    )}
                />
            </List>
        );
    }
}
