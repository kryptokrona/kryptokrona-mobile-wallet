// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';

import TextTicker from 'react-native-text-ticker';

import { List, ListItem } from 'react-native-elements';
import { View, Text, FlatList } from 'react-native';
import { prettyPrintAmount } from 'turtlecoin-wallet-backend';

import Config from './Config';
import Globals from './Globals';

import { Styles } from './Styles';
import { prettyPrintUnixTimestamp, prettyPrintDate, coinsToFiat } from './Utilities';

class ItemDescription extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fontSize: this.props.fontSize || 20,
        }
    }

    render() {
        return(
            <View>
                <Text style={{ color: 'gray', fontSize: 15, marginTop: 10 }}>
                    {this.props.title}
                </Text>

                <TextTicker
                    style={{ color: Config.theme.primaryColour, fontSize: this.state.fontSize, marginBottom: 10 }}
                    marqueeDelay={1000}
                    duration={220 * this.props.item.length}
                >
                    {this.props.item}
                </TextTicker>
            </View>
        )
    }
}

export class TransactionDetailsScreen extends React.Component {
    static navigationOptions = {
        title: 'Transaction Details',
    };

    constructor(props) {
        super(props);

        this.state = {
            transaction: props.navigation.state.params.transaction,
            amount: props.navigation.state.params.transaction.totalAmount(),
            complete: props.navigation.state.params.transaction.timestamp !== 0,
        }
    }

    render() {
        return(
            <View style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'flex-start', marginLeft: 15, marginTop: 60 }}>
                <ItemDescription
                    title={this.state.amount > 0 ? 'Received' : 'Sent'}
                    item={this.state.complete ? prettyPrintDate(new Date()) : prettyPrintUnixTimestamp(this.state.transaction.timestamp)}/>

                <ItemDescription
                    title='Amount'
                    item={prettyPrintAmount(this.state.amount)}/>

                {this.state.amount < 0 && <ItemDescription
                    title='Fee'
                    item={prettyPrintAmount(this.state.transaction.fee)}/>}

                <ItemDescription
                    title='Value'
                    item={coinsToFiat(this.state.amount)}/>

                <ItemDescription
                    title='State'
                    item={this.state.complete ? 'Complete' : 'Processing'}/>

                {this.state.complete && <ItemDescription
                    title='Block Height'
                    item={this.state.transaction.blockHeight.toString()}/>}
                
                <ItemDescription
                    title='Hash'
                    item={this.state.transaction.hash}/>

                {this.state.transaction.paymentID !== '' && <ItemDescription
                    title='Payment ID'
                    item={this.state.transaction.paymentID}/>}
            </View>
        );
    }
}

/**
 * List of transactions sent + received 
 */
export class TransactionsScreen extends React.Component {
    static navigationOptions = {
        title: 'Transactions',
        header: null
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

        const [walletHeight, localHeight, networkHeight] = Globals.wallet.getSyncStatus();

        const syncedMsg = walletHeight + 10 >= networkHeight ? 
            '' 
          : "Your wallet isn't fully synced yet. If you're expecting some transactions, please wait.";

        const noTransactions = 
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 20, color: Config.theme.primaryColour, justifyContent: 'center', textAlign: 'center' }}>
                    Looks like you haven't sent{"\n"}or received any transactions yet!{"\n"}
                    {syncedMsg}
                </Text>
            </View>;

        const haveTransactions = 
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
                            onPress={() => this.props.navigation.navigate('TransactionDetails', { transaction: item })}
                        />
                    )}
                />
            </List>;

        return(
            this.state.numTransactions === 0 ? noTransactions : haveTransactions
        );
    }
}
